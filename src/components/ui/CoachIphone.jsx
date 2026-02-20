import React, { useEffect, useRef } from "react";
import { COACH_MESSAGES } from "../../data/simulationData";

export default function CoachIphone({ replayKey = 0 }) {
  const orbContainerRef = useRef(null);
  const transcriptRef = useRef(null);
  const shaderOrbRef = useRef(null);
  const roleplayPopupRef = useRef(null);
  const fullscreenRef = useRef(null);

  useEffect(() => {
    let isUnmounted = false;
    const timers = [];
    const gsap = window.gsap;
    const schedule = (fn, delay) => {
      const timer = window.setTimeout(() => {
        if (!isUnmounted) fn();
      }, delay);
      timers.push(timer);
      return timer;
    };
    const animateTo = (target, vars) => {
      if (!gsap) return;
      gsap.to(target, vars);
    };
    const animateFromTo = (target, fromVars, toVars) => {
      if (!gsap) return;
      gsap.fromTo(target, fromVars, toVars);
    };

    // Cleanup existing orbital canvas if Vite hot reloads
    if (orbContainerRef.current) {
      orbContainerRef.current.innerHTML = "";
    }

    // Clean transcript DOM on replay
    if (transcriptRef.current) {
      transcriptRef.current.innerHTML = "";
    }

    // Initialize Shader Orb
    if (orbContainerRef.current && typeof window.ShaderOrb !== "undefined") {
      shaderOrbRef.current = new window.ShaderOrb({
        dom: orbContainerRef.current,
      });
    }

    function typeSmoothLine(container, text, role, onComplete) {
      if (isUnmounted) return;
      const line = document.createElement("div");
      line.className = `ambient-line ${role} active`;

      // Add speaker label
      const label = document.createElement("span");
      label.className = `ambient-label ${role}`;
      label.textContent = role === "user" ? "User" : "agent";
      line.appendChild(label);

      const words = text.split(" ");
      words.forEach((word, wordIndex) => {
        const wordSpan = document.createElement("span");
        wordSpan.style.display = "inline-block";
        wordSpan.style.whiteSpace = "nowrap";

        const chars = word.split("");
        chars.forEach((char) => {
          const charSpan = document.createElement("span");
          charSpan.textContent = char;
          charSpan.style.opacity = "0";
          charSpan.style.transform = "translateY(10px)";
          charSpan.style.filter = "blur(4px)";
          charSpan.style.display = "inline-block";
          wordSpan.appendChild(charSpan);
        });

        line.appendChild(wordSpan);
        if (wordIndex < words.length - 1) {
          line.appendChild(document.createTextNode(" "));
        }
      });

      container.appendChild(line);
      animateTo(line, { opacity: 1, duration: 0.1 });

      const charElements = line.querySelectorAll("span > span");
      if (!gsap) {
        charElements.forEach((charEl) => {
          charEl.style.opacity = "1";
          charEl.style.transform = "translateY(0)";
          charEl.style.filter = "blur(0px)";
        });
        if (onComplete) schedule(onComplete, 400);
        return;
      }

      animateTo(charElements, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.65,
        stagger: 0.02,
        ease: "power3.out",
        onComplete: () => {
          if (!isUnmounted && onComplete) schedule(onComplete, 650);
        },
      });
    }

    function triggerFullscreenTransition() {
      if (isUnmounted) return;

      const popup = roleplayPopupRef.current;
      const fullscreen = fullscreenRef.current;
      const orbContainer = orbContainerRef.current;
      const transcript = transcriptRef.current;

      if (!popup || !fullscreen || !orbContainer) return;

      const popupAvatar = popup.querySelector(".popup-avatar");
      const fullscreenVideoContainer = fullscreen.querySelector(
        ".fullscreen-video-container",
      );

      if (!popupAvatar || !fullscreenVideoContainer) return;

      const popupContentElements = popup.querySelectorAll(
        ".popup-content, .popup-cta, .popup-handle",
      );

      // 1. Fold Animation
      animateTo([...popupContentElements, transcript], {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: "power2.in",
      });

      // 2. Wait for fold, then transform avatar and background
      schedule(() => {
        if (isUnmounted) return;

        orbContainer.classList.add("blurred-bg");

        const videoEl = popupAvatar.querySelector("video");
        if (videoEl) {
          fullscreenVideoContainer.appendChild(videoEl);
          videoEl.style.width = "100%";
          videoEl.style.height = "100%";
          videoEl.style.objectFit = "cover";

          fullscreenVideoContainer.style.opacity = "0";
          animateTo(fullscreenVideoContainer, {
            opacity: 1,
            duration: 1.0,
            ease: "power2.inOut",
          });

          videoEl.play().catch((e) => console.log("Autoplay prevented", e));
        }

        popup.style.display = "none";

        fullscreen.style.pointerEvents = "auto";

        animateFromTo(
          fullscreen,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power2.out",
            delay: 0.2,
          },
        );
      }, 600);
    }

    // showMessage: dims previous lines, types new one
    function showMessage(text, role) {
      if (isUnmounted || !transcriptRef.current) return;

      const existingLines = transcriptRef.current.querySelectorAll(".ambient-line");
      existingLines.forEach((l) => {
        l.classList.remove("active");
        l.classList.add("historical");
      });

      const appendNewMessage = () => {
        if (isUnmounted || !transcriptRef.current) return;
        typeSmoothLine(transcriptRef.current, text, role, () => {
          if (isUnmounted) return;
          requestAnimationFrame(() => {
            const overlay = transcriptRef.current?.parentElement;
            if (overlay) overlay.scrollTo({ top: overlay.scrollHeight, behavior: "smooth" });
          });
        });
      };

      if (transcriptRef.current.children.length >= 10) {
        const oldest = transcriptRef.current.firstChild;
        if (gsap) {
          animateTo(oldest, {
            opacity: 0, y: -20, duration: 0.5, ease: "power2.inOut",
            onComplete: () => { if (!isUnmounted) { oldest.remove(); appendNewMessage(); } },
          });
          return;
        }
        oldest.remove();
        appendNewMessage();
      } else {
        appendNewMessage();
      }
    }

    // Schedule all messages at absolute wall-clock times (synced with terminal)
    COACH_MESSAGES.forEach((msg) => {
      schedule(() => { showMessage(msg.text, msg.role); }, msg.t);
    });

    // Orb state timeline — expanded for digestion
    const orbSchedule = [
      [300, () => shaderOrbRef.current?.setListening?.(true)],  // USER_MSG user1
      [2500, () => shaderOrbRef.current?.setThinking?.(true)],   // AGENT_THINKING
      [4700, () => shaderOrbRef.current?.setSpeaking?.(true)],   // AGENT_MSG ack
      [8200, () => shaderOrbRef.current?.setThinking?.(true)],   // ENGINE_OPEN
      [20200, () => shaderOrbRef.current?.setListening?.(true)],  // USER_MSG user2
      [21700, () => shaderOrbRef.current?.setListening?.(true)],  // USER_MSG user3
      [24200, () => shaderOrbRef.current?.setSpeaking?.(true)],   // AGENT_MSG dots
      [27500, () => shaderOrbRef.current?.setThinking?.(true)],   // back to deep work
      [45200, () => shaderOrbRef.current?.setSpeaking?.(true)],   // AGENT_FINAL
      [47700, () => shaderOrbRef.current?.setListening?.(true)],  // USER_MSG user_sure
      [49500, () => shaderOrbRef.current?.setState?.('idle')],    // drawer open
    ];
    orbSchedule.forEach(([delay, fn]) => {
      schedule(fn, delay);
    });

    // DRAWER at t:49500ms — 2s after USER_SURE
    schedule(() => {
      if (!roleplayPopupRef.current) return;

      const popup = roleplayPopupRef.current;
      popup.style.display = "flex";

      if (transcriptRef.current) {
        animateTo(transcriptRef.current, {
          y: -100, opacity: 0.2, duration: 1.0, ease: "power3.inOut",
        });
      }

      animateTo(popup, {
        y: 0, opacity: 1, duration: 1.0, ease: "power4.out", delay: 0.2,
      });

      shaderOrbRef.current?.setState?.('idle');

      // Auto-transition to fullscreen after 4 seconds
      schedule(triggerFullscreenTransition, 4000);
    }, 49500);

    if (shaderOrbRef.current?.setListening) {
      shaderOrbRef.current.setListening(true);
    }

    return () => {
      isUnmounted = true;
      timers.forEach((timer) => clearTimeout(timer));
      if (shaderOrbRef.current?.stop) {
        shaderOrbRef.current.stop();
      }
      const video = fullscreenRef.current?.querySelector("video");
      if (video) video.pause();
    };
  }, [replayKey]);

  return (
    <div
      className="iphone-frame"
      style={{ transform: "scale(1)", transformOrigin: "top center" }}
    >
      <div className="dynamic-island"></div>

      {/* Fixed Orb Background */}
      <div
        className="agent-silhouette"
        ref={orbContainerRef}
        style={{ opacity: 1 }}
      >
        {/* Shader Orb will be injected here */}
      </div>

      {/* Ambient Conversation Overlay */}
      <div className="ambient-conversation-overlay" style={{ opacity: 1 }}>
        <div
          className="ambient-transcript"
          ref={transcriptRef}
          style={{ transition: "opacity 0.4s ease, transform 0.4s ease" }}
        ></div>
      </div>

      {/* Roleplay Hook Drawer */}
      <div
        className="roleplay-popup"
        id="roleplayPopup"
        ref={roleplayPopupRef}
        style={{ display: "none", transform: "translateY(100%)" }}
      >
        <div className="popup-handle"></div>

        <div className="popup-avatar">
          <video
            loop
            muted
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          >
            <source src="/Packages_Empower_Loop_small.webm" type="video/webm" />
          </video>
        </div>

        <div className="popup-content">
          <h3 className="popup-title">Practice Live</h3>
          <p className="popup-subtitle">
            Try a 2-minute mock negotiation with the agent to test your hook.
          </p>
        </div>

        <button className="popup-cta">
          Start Roleplay
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginLeft: "8px" }}
          >
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>

      {/* Fullscreen Roleplay State */}
      <div
        className="roleplay-fullscreen"
        ref={fullscreenRef}
        style={{ opacity: 0 }}
      >
        <div className="fullscreen-video-container"></div>

        <div className="fullscreen-gradient"></div>

        <div className="fullscreen-topbar">
          <button className="icon-btn back-btn">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <div className="online-indicator">
            <div className="dot"></div>
            <span>Live Session</span>
          </div>
          <button className="icon-btn mute-btn">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            </svg>
          </button>
        </div>

        <div className="roleplay-controls">
          <button className="control-main-btn end-call-btn">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path>
              <line x1="23" y1="1" x2="1" y2="23"></line>
            </svg>
          </button>
          <button className="control-main-btn mic-btn active">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
