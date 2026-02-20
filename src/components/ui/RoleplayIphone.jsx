import React, { useEffect, useRef } from "react";

export default function RoleplayIphone({ frameScale = 0.94 }) {
  const roleplayVideoScreenRef = useRef(null);
  const engageVideoRef = useRef(null);
  const roleplayResultsPopupRef = useRef(null);
  const seeResultsBtnRef = useRef(null);
  const evaluationInsightsScreenRef = useRef(null);
  const orbContainerRef = useRef(null);

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
    const setAnim = (target, vars) => {
      if (!gsap) return;
      gsap.set(target, vars);
    };

    // Cleanup existing orbital canvas if Vite hot reloads
    if (orbContainerRef.current) {
      orbContainerRef.current.innerHTML = "";
    }

    const startRoleplayFlow = () => {
      if (isUnmounted) return;

      const roleplayVideoScreen = roleplayVideoScreenRef.current;
      const engageVideo = engageVideoRef.current;
      const roleplayResultsPopup = roleplayResultsPopupRef.current;
      const seeResultsBtn = seeResultsBtnRef.current;
      const evaluationInsightsScreen = evaluationInsightsScreenRef.current;
      const orbContainer = orbContainerRef.current;

      if (!roleplayVideoScreen || !orbContainer) return;

      roleplayVideoScreen.style.display = "flex";
      orbContainer.classList.add("blurred-bg");
      setAnim([roleplayVideoScreen, orbContainer], { opacity: 1 });

      if (engageVideo) {
        engageVideo.currentTime = 0;
        engageVideo
          .play()
          .catch((e) => console.warn("Video auto-play prevented:", e));
      }

      schedule(() => {
        if (isUnmounted || roleplayVideoScreen.style.display === "none") return;

        const roleplayEndStatus = roleplayVideoScreen.querySelector(
          ".roleplay-end-status",
        );
        if (roleplayEndStatus) {
          roleplayVideoScreen.classList.add("session-ended");
          roleplayEndStatus.style.display = "block";
          setAnim(roleplayEndStatus, { opacity: 0, y: 22 });
          animateTo(roleplayEndStatus, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
          });

          schedule(() => {
            if (isUnmounted || roleplayVideoScreen.style.display === "none")
              return;

            animateTo(roleplayEndStatus, {
              opacity: 0,
              y: -6,
              duration: 0.5,
              ease: "power2.in",
              onComplete: () => {
                if (roleplayEndStatus) roleplayEndStatus.style.display = "none";
              },
            });

            if (roleplayResultsPopup) {
              roleplayResultsPopup.style.display = "flex";
              animateFromTo(
                roleplayResultsPopup,
                { y: "100%", opacity: 0 },
                { y: 0, opacity: 1, duration: 1.2, ease: "power4.out" },
              );

              schedule(() => {
                if (
                  isUnmounted ||
                  roleplayResultsPopup.style.display === "none"
                )
                  return;

                if (seeResultsBtn) seeResultsBtn.classList.add("clicked-state");

                schedule(() => {
                  if (isUnmounted) return;
                  if (seeResultsBtn)
                    seeResultsBtn.classList.remove("clicked-state");

                  animateTo(
                    [roleplayResultsPopup, roleplayVideoScreen, orbContainer],
                    {
                      opacity: 0,
                      y: 40,
                      duration: 0.8,
                      stagger: 0.1,
                      ease: "power2.inOut",
                      onComplete: () => {
                        if (isUnmounted) return;
                        if (roleplayResultsPopup)
                          roleplayResultsPopup.style.display = "none";
                        if (roleplayVideoScreen)
                          roleplayVideoScreen.style.display = "none";
                        if (roleplayVideoScreen) {
                          roleplayVideoScreen.classList.remove("session-ended");
                        }
                        setAnim(
                          [roleplayResultsPopup, roleplayVideoScreen],
                          { y: 0 },
                        );
                        if (engageVideo) engageVideo.pause();

                        if (evaluationInsightsScreen) {
                          evaluationInsightsScreen.style.display = "flex";
                          animateFromTo(
                            evaluationInsightsScreen,
                            { opacity: 0, scale: 0.98 },
                            {
                              opacity: 1,
                              scale: 1,
                              duration: 1.0,
                              ease: "power3.out",
                            },
                          );
                        }
                      },
                    },
                  );
                }, 300);
              }, 3000);
            }
          }, 2200);
        }
      }, 2800);
    };

    // Start flow immediately on mount so the phone never appears as an empty shell.
    startRoleplayFlow();

    return () => {
      isUnmounted = true;
      timers.forEach((timer) => clearTimeout(timer));
      if (engageVideoRef.current) {
        engageVideoRef.current.pause();
      }
    };
  }, []);

  return (
    <div
      className="iphone-frame"
      style={{ transform: `scale(${frameScale})`, transformOrigin: "top center" }}
    >
      <div className="dynamic-island"></div>

      <div className="agent-silhouette" ref={orbContainerRef}></div>

      {/* Roleplay Video Screen */}
      <div
        className="roleplay-video-screen roleplay-fullscreen"
        ref={roleplayVideoScreenRef}
        style={{ display: "flex" }}
      >
        <div className="fullscreen-video-container">
          <video
            ref={engageVideoRef}
            loop
            muted
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          >
            <source src="/Packages_Engage_Loop_small.webm" type="video/webm" />
          </video>
        </div>

        <div className="fullscreen-gradient"></div>

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

        <div className="roleplay-end-status" style={{ display: "none" }}>
          <h3>Simulation complete</h3>
          <p>Generating your evaluation overview...</p>
        </div>
      </div>

      {/* Roleplay Results Popup Drawer */}
      <div
        className="roleplay-popup"
        ref={roleplayResultsPopupRef}
        style={{ display: "none" }}
      >
        <div className="popup-handle"></div>
        <div className="popup-content">
          <div className="evaluation-empty-state">
            <div className="empty-state-dot" />
            <div>
              <p className="empty-state-title">Evaluation queued</p>
              <p className="empty-state-subtitle">
                No report loaded yet. Open evaluation to review insights.
              </p>
            </div>
          </div>
          <button
            className="popup-cta results-cta"
            ref={seeResultsBtnRef}
          >
            Open Evaluation
          </button>
        </div>
      </div>

      {/* Evaluation Insights Screen (simplified version for demo flow) */}
      <div
        className="evaluation-insights-screen"
        ref={evaluationInsightsScreenRef}
        style={{ display: "none" }}
      >
        <div className="insights-header ri-header">
          <button className="ri-back-btn" aria-label="Back">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <h2>Insights</h2>
          <span className="ri-header-spacer" />
        </div>
        <div className="insights-content ri-content">
          <div className="ri-section-label">INSIGHTS</div>
          <div className="ri-section-subtitle">General Insights & Trends</div>

          <div className="ri-stack">
            <div className="ri-rail" />

            <div className="ri-card ri-engagement-card">
              <div className="ri-card-header">
                <div className="ri-card-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                    <polyline points="17 6 23 6 23 12"></polyline>
                  </svg>
                  <span>Engagement Trend</span>
                </div>
                <span className="ri-value positive">+18%</span>
              </div>
              <div className="ri-bars">
                <div className="ri-bar h1" />
                <div className="ri-bar h2" />
                <div className="ri-bar h3" />
                <div className="ri-bar h4" />
                <div className="ri-bar h5 active" />
              </div>
              <p className="ri-copy">
                Measures how quickly the banker moved the client from cold to interested.
              </p>
            </div>

            <div className="ri-card ri-gaps-card">
              <div className="ri-card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>Knowledge Gaps</span>
              </div>
              <div className="ri-chips">
                <span className="ri-chip">Tax Diversification</span>
                <span className="ri-chip">Expense Ratios</span>
              </div>
              <p className="ri-copy">
                Topics where answers became hesitant or less precise during the role-play.
              </p>
            </div>

            <div className="ri-card ri-feedback-card">
              <div className="ri-card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3l-8.47-14.14a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <span>Critical Feedback</span>
              </div>
              <p className="ri-quote">
                “High-frequency jargon at 04:20 caused a visible drop in client confidence.”
              </p>
              <p className="ri-copy">Coach recommendation: simplify fee language and pause for confirmation.</p>
            </div>

            <div className="ri-history-label">SESSION HISTORY</div>
            <div className="ri-history-card">
              <div className="ri-history-top">
                <span className="ri-history-date">Today, 9:41 AM</span>
                <span className="ri-live-badge">Live</span>
              </div>
              <div className="ri-history-bottom">
                <div>
                  <p className="ri-history-title">Engagement Velocity</p>
                  <p className="ri-history-sub">72/100</p>
                </div>
                <div className="ri-score-circle">72</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
