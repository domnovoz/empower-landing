import React, { useEffect, useRef } from "react";

export default function RoleplayIphone() {
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

      setAnim([roleplayVideoScreen, orbContainer], { opacity: 0 });

      if (engageVideo) {
        engageVideo.currentTime = 0;
        engageVideo
          .play()
          .catch((e) => console.warn("Video auto-play prevented:", e));
      }

      animateTo(roleplayVideoScreen, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
      });
      animateTo(orbContainer, {
        opacity: 1,
        duration: 1.5,
        delay: 0.3,
        ease: "power2.inOut",
      });

      schedule(() => {
        if (isUnmounted || roleplayVideoScreen.style.display === "none") return;

        const roleplayEndStatus = roleplayVideoScreen.querySelector(
          ".roleplay-end-status",
        );
        if (roleplayEndStatus) {
          roleplayEndStatus.style.display = "block";
          animateTo(roleplayEndStatus, {
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
          });

          schedule(() => {
            if (isUnmounted || roleplayVideoScreen.style.display === "none")
              return;

            animateTo(roleplayEndStatus, {
              opacity: 0,
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
          }, 3500);
        }
      }, 5000);
    };

    // Start flow automatically
    schedule(startRoleplayFlow, 800);

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
      style={{ transform: "scale(1)", transformOrigin: "top center" }}
    >
      <div className="dynamic-island"></div>

      <div className="agent-silhouette" ref={orbContainerRef}></div>

      {/* Roleplay Video Screen */}
      <div
        className="roleplay-video-screen roleplay-fullscreen"
        ref={roleplayVideoScreenRef}
        style={{ display: "none" }}
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
          <h3>Role play simulation has ended</h3>
        </div>
      </div>

      {/* Roleplay Results Popup Drawer */}
      <div
        className="roleplay-popup"
        ref={roleplayResultsPopupRef}
        style={{ display: "none" }}
      >
        <div className="popup-handle"></div>
        <div className="popup-graph">
          <div className="graph-bar" style={{ height: "30%" }}></div>
          <div className="graph-bar" style={{ height: "50%" }}></div>
          <div className="graph-bar" style={{ height: "40%" }}></div>
          <div className="graph-bar" style={{ height: "70%" }}></div>
          <div className="graph-bar" style={{ height: "60%" }}></div>
        </div>
        <div
          className="popup-content"
          style={{ textAlign: "center", marginTop: "0px" }}
        >
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "14px",
              marginBottom: "20px",
            }}
          >
            Role play simulation has ended – see results
          </p>
          <button
            className="popup-cta results-cta"
            ref={seeResultsBtnRef}
            style={{ width: "100%", justifyContent: "center" }}
          >
            See Results
          </button>
        </div>
      </div>

      {/* Evaluation Insights Screen (simplified version for demo flow) */}
      <div
        className="evaluation-insights-screen"
        ref={evaluationInsightsScreenRef}
        style={{ display: "none" }}
      >
        <div className="insights-header">
          <h2>Insights</h2>
        </div>
        <div className="insights-content">
          <div className="insights-section">
            <h3 className="section-title">INSIGHTS</h3>
            <p className="section-subtitle">General Insights & Trends</p>

            <div className="insight-card engagement-card">
              <div className="card-header">
                <div className="card-title">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                    <polyline points="16 7 22 7 22 13"></polyline>
                  </svg>
                  <span>Engagement Trend</span>
                </div>
                <span className="trend-value">+18%</span>
              </div>
              <div className="trend-chart">
                <div className="bar bar-1"></div>
                <div className="bar bar-2"></div>
                <div className="bar bar-3"></div>
                <div className="bar bar-4"></div>
                <div className="bar bar-5 active"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
