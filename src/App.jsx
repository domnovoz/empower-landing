import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Globe,
  LayoutDashboard,
  Lock,
  Shield,
  Target,
  Zap,
} from "lucide-react";

import TerminalApp from "./TerminalApp";
import CoachIphone from "./components/ui/CoachIphone";
import RoleplayIphone from "./components/ui/RoleplayIphone";
import logo from "../logo.png";

import "./index.css";
import "./mobile.css";

const MetallicText = ({ children, className = "", as: Component = "span" }) => (
  <Component
    className={`bg-gradient-to-r from-zinc-300 via-zinc-100 to-zinc-400 text-transparent bg-clip-text ${className}`}
  >
    {children}
  </Component>
);

const FeatureBlock = ({ icon: Icon, title, description, className = "" }) => (
  <div
    className={`flex flex-col items-start p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] shadow-[0_18px_36px_-30px_rgba(0,0,0,0.85)] backdrop-blur-[2px] hover:border-white/[0.12] hover:bg-white/[0.03] transition-all duration-300 ${className}`}
  >
    <Icon className="w-5 h-5 text-zinc-400 mb-3" strokeWidth={1.5} />
    <h3 className="text-base font-medium text-zinc-200 mb-2 tracking-wide">{title}</h3>
    <p className="text-zinc-500 leading-relaxed text-sm font-light">{description}</p>
  </div>
);

const Slide = ({ children, tone = "", align = "center" }) => (
  <section className="relative overflow-hidden h-[calc(100vh-64px)] w-full shrink-0 px-6 md:px-12 lg:px-16 py-8">
    <div className="pointer-events-none absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_50%_8%,rgba(255,255,255,0.06)_0%,transparent_42%)]" />
    <div className="relative h-full max-w-6xl mx-auto">
      <div className={`h-full ${align === "center" ? "flex items-center" : ""}`}>{children}</div>
    </div>
  </section>
);

const LOADING_MESSAGE = "Preparing your experience";

export default function App() {
  const [isBootLoading, setIsBootLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(9);
  const [replayKey, setReplayKey] = useState(0);
  const [roleplayKey, setRoleplayKey] = useState(0);
  const [focusState, setFocusState] = useState("iphone");
  const [stepIndex, setStepIndex] = useState(0);
  const [showStepper, setShowStepper] = useState(false);
  const [stepperPulse, setStepperPulse] = useState(false);

  const totalSteps = 7;
  const shouldMountSimulation = Math.abs(stepIndex - 1) <= 1;
  const shouldMountRoleplay = Math.abs(stepIndex - 2) <= 1;

  const goToStep = (target) => {
    const next = Math.max(0, Math.min(totalSteps - 1, target));
    if (next === stepIndex) return;
    if (next === 1) setReplayKey((k) => k + 1);
    if (next === 2) setRoleplayKey((k) => k + 1);
    setStepIndex(next);
  };

  const startGuidedFlow = () => {
    setShowStepper(true);
    setStepperPulse(true);
    goToStep(1);
    window.setTimeout(() => setStepperPulse(false), 2200);
  };

  const iphoneStyle =
    focusState === "iphone"
      ? {
          transform: "scale(1)",
          filter: "brightness(1)",
          transition: "all 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
          position: "relative",
          zIndex: 10,
          transformOrigin: "top center",
        }
      : {
          transform: "scale(0.92)",
          filter: "brightness(0.55) blur(1.5px)",
          transition: "all 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
          position: "relative",
          zIndex: 5,
          transformOrigin: "top center",
        };

  const terminalStyle =
    focusState === "terminal"
      ? {
          transform: "scale(1)",
          filter: "brightness(1)",
          borderRadius: "12px",
          overflow: "hidden",
          transition: "all 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
          zIndex: 10,
        }
      : {
          transform: "scale(0.97)",
          filter: "brightness(0.62) blur(1px)",
          borderRadius: "12px",
          overflow: "hidden",
          transition: "all 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
          zIndex: 5,
        };

  React.useEffect(() => {
    if (stepIndex !== 1) return;
    const timers = [];
    timers.push(setTimeout(() => setFocusState("iphone"), 0));
    timers.push(setTimeout(() => setFocusState("terminal"), 8000));
    timers.push(setTimeout(() => setFocusState("iphone"), 18500));
    timers.push(setTimeout(() => setFocusState("terminal"), 27500));
    timers.push(setTimeout(() => setFocusState("iphone"), 44000));
    return () => timers.forEach(clearTimeout);
  }, [stepIndex, replayKey]);

  React.useEffect(() => {
    let isCancelled = false;
    let progressInterval;

    const preloadVideo = (src) =>
      new Promise((resolve) => {
        const video = document.createElement("video");
        const done = () => resolve();
        const fallback = window.setTimeout(done, 2200);

        video.preload = "auto";
        video.muted = true;
        video.playsInline = true;
        video.oncanplaythrough = () => {
          clearTimeout(fallback);
          done();
        };
        video.onerror = () => {
          clearTimeout(fallback);
          done();
        };
        video.src = src;
        video.load();
      });

    progressInterval = window.setInterval(() => {
      setLoadingProgress((value) => Math.min(value + Math.random() * 2.6, 84));
    }, 240);

    const preloadScript = fetch("/shader-orb.js", { cache: "force-cache" }).catch(() => null);
    const preloadAssets = Promise.allSettled([
      preloadVideo("/Packages_Empower_Loop_small.webm"),
      preloadVideo("/Packages_Engage_Loop_small.webm"),
      preloadScript,
      new Promise((resolve) => window.setTimeout(resolve, 1100)),
    ]);

    preloadAssets.then(() => {
      if (isCancelled) return;
      clearInterval(progressInterval);
      setLoadingProgress(100);
      window.setTimeout(() => {
        if (!isCancelled) setIsBootLoading(false);
      }, 420);
    });

    return () => {
      isCancelled = true;
      clearInterval(progressInterval);
    };
  }, []);

  if (isBootLoading) {
    return (
      <div className="h-screen bg-[#09090b] text-zinc-300 font-sans flex items-center justify-center px-5">
        <div className="w-full max-w-[480px] rounded-2xl border border-white/[0.08] bg-[#0f1014]/90 backdrop-blur-sm p-7 md:p-8 shadow-[0_28px_70px_-48px_rgba(0,0,0,0.95)]">
          <div className="flex items-center gap-3 mb-6">
            <img src={logo} alt="Promethist logo" className="h-7 w-auto object-contain opacity-90" />
            <div>
              <p className="text-[11px] tracking-[0.2em] uppercase text-zinc-500">PromethistAI</p>
              <p className="text-sm text-zinc-300">Relational Intelligence</p>
            </div>
          </div>

          <p className="text-sm text-zinc-400 mb-5">{LOADING_MESSAGE}</p>

          <div className="h-1.5 w-full rounded-full bg-white/[0.07] overflow-hidden">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,rgba(143,215,212,0.7),rgba(255,255,255,0.9))] transition-[width] duration-500 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="mt-3 text-[11px] tracking-[0.16em] uppercase text-zinc-600">
            Loading
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#09090b] text-zinc-400 font-sans overflow-hidden selection:bg-zinc-800 selection:text-zinc-100">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08)_0%,transparent_48%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,9,11,0.05)_0%,rgba(9,9,11,0.55)_100%)]" />
      </div>

      <div className="relative z-10 h-full">
        <nav className="w-full bg-[#09090b]/78 border-b border-white/[0.08] backdrop-blur-md fixed top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <img src={logo} alt="Promethist logo" className="h-7 w-auto object-contain" />
            <button className="text-xs font-medium tracking-widest uppercase text-zinc-400 hover:text-zinc-100 transition-colors">
              Book a Demo
            </button>
          </div>
        </nav>

        <main className="pt-16 h-full">
          <div className="h-[calc(100vh-64px)] overflow-hidden">
            <div
              className="h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transform: `translateY(-${stepIndex * 100}%)` }}
            >
              <Slide tone="bg-zinc-950/25" align="center">
                <div className="w-full px-4 md:px-10">
                  <div className="inline-flex items-center gap-3 mb-8">
                    <span className="h-[1px] w-8 bg-zinc-600"></span>
                    <span className="text-xs font-medium tracking-widest uppercase text-zinc-400">Enterprise Enablement</span>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-light tracking-tight text-zinc-100 mb-6 leading-[1.04] max-w-4xl">
                    Empower your teams with <br />
                    <MetallicText className="font-medium">Relational Intelligence</MetallicText>
                  </h1>
                  <p className="text-lg md:text-2xl text-zinc-500 font-light leading-relaxed mb-10 max-w-2xl">
                    Turn training into a direct driver of revenue with dynamic AI coaching and measurable conversational performance.
                  </p>
                  <button
                    className="group inline-flex items-center gap-3 px-6 py-3 rounded-full bg-zinc-100 text-zinc-950 text-sm font-medium transition-transform hover:scale-[1.02]"
                    onClick={startGuidedFlow}
                  >
                    Next Section
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </Slide>

              <Slide tone="bg-zinc-950/20">
                <div className="w-full px-4 md:px-8 h-full flex flex-col justify-center">
                  <h2 className="text-3xl md:text-4xl font-light tracking-tight text-zinc-100 max-w-4xl mx-auto leading-tight mb-3 text-center">
                    Progressive coaching at enterprise scale, powered by <br className="hidden md:block" />
                    <MetallicText>Relational Intelligence.</MetallicText>
                  </h2>
                  <p className="text-zinc-500 text-sm md:text-base font-light tracking-wide mb-5 text-center">
                    Asynchronous real-time agent steering
                  </p>

                  <div className="relative w-full flex flex-col md:flex-row items-start justify-start gap-6 mt-2">
                    <div className="flex-1 w-full max-w-[650px] text-left" style={terminalStyle}>
                      {shouldMountSimulation ? (
                        <TerminalApp key={replayKey} onReplay={() => setReplayKey((k) => k + 1)} />
                      ) : (
                        <div className="terminal min-h-[500px] animate-pulse bg-zinc-900/30" />
                      )}
                    </div>
                    <div className="w-full max-w-[290px] md:-ml-14 relative z-20" style={iphoneStyle}>
                      {shouldMountSimulation ? (
                        <CoachIphone replayKey={replayKey} />
                      ) : (
                        <div className="iphone-frame" style={{ transform: "scale(1)", transformOrigin: "top center" }} />
                      )}
                    </div>
                  </div>
                </div>
              </Slide>

              <Slide tone="bg-zinc-950/30">
                <div className="w-full px-4 md:px-8 h-full flex flex-col justify-center">
                  <div className="text-center mb-6">
                    <h2 className="text-3xl md:text-4xl font-light tracking-tight text-zinc-100 max-w-4xl mx-auto leading-tight mb-3">
                      Every interaction evaluated for individual growth and organizational observability—
                      <MetallicText>secure by design.</MetallicText>
                    </h2>
                    <p className="text-zinc-500 text-sm md:text-base font-light">
                      Roleplay simulation, coaching signal capture, and performance insights in one flow.
                    </p>
                  </div>

                  <div className="relative overflow-hidden rounded-[30px] border border-white/[0.08] bg-[linear-gradient(140deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015)_48%,rgba(6,9,12,0.88))] p-5 md:p-8">
                    <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl" />
                    <div className="grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] gap-8 md:gap-10 items-start relative">
                      <div>
                        <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-zinc-500 block mb-3">The AI Coach</span>
                        <h3 className="text-2xl md:text-[2rem] font-light tracking-tight text-zinc-100 leading-tight">
                          Make the <MetallicText>"last mile"</MetallicText> of high-stakes dialogue measurable.
                        </h3>
                        <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                          A live simulation surface with instant post-session feedback designed for behavior change, not vanity metrics.
                        </p>

                        <div className="mt-6 rounded-[26px] border border-white/[0.08] bg-black/40 backdrop-blur-sm p-3 w-full max-w-[320px]">
                          <div className="rounded-[20px] border border-white/[0.07] bg-zinc-950/70 p-3 flex justify-center">
                            {shouldMountRoleplay ? (
                              <RoleplayIphone key={roleplayKey} />
                            ) : (
                              <div className="iphone-frame" style={{ transform: "scale(1)", transformOrigin: "top center" }} />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <FeatureBlock
                          icon={Target}
                          title="Adaptive Scenarios"
                          description="Prompt variations and objections evolve in real time based on agent choices."
                          className="h-full"
                        />
                        <FeatureBlock
                          icon={Zap}
                          title="Reps Without Risk"
                          description="Stress-test messaging in simulation before customer-facing conversations."
                          className="h-full"
                        />
                        <FeatureBlock
                          icon={BarChart3}
                          title="Precision Feedback"
                          description="Immediately score pacing, confidence, and adherence to strategic narrative."
                          className="h-full"
                        />
                        <div className="h-full rounded-2xl border border-emerald-200/20 bg-emerald-100/[0.06] p-5 shadow-[0_20px_45px_-35px_rgba(16,185,129,0.65)]">
                          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-emerald-200/80 mb-2">Outcome</p>
                          <p className="text-zinc-200 text-sm leading-relaxed">
                            Fewer inconsistent calls and faster onboarding ramps, with one repeatable coaching loop.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Slide>

              <Slide tone="bg-zinc-950/15" align="center">
                <div className="w-full px-4 md:px-8 grid md:grid-cols-2 gap-14 items-center">
                  <div>
                    <span className="text-xs font-medium tracking-widest uppercase text-zinc-500 block mb-4">The Platform</span>
                    <h2 className="text-3xl md:text-4xl font-light tracking-tight text-zinc-100 mb-5">
                      Deploy new behaviors <MetallicText>overnight.</MetallicText>
                    </h2>
                    <p className="text-zinc-400 font-light leading-relaxed mb-8">
                      Move from manager-dependent bottlenecks to automated enablement across global teams.
                    </p>
                    <div className="space-y-5">
                      <div className="flex gap-4 items-start">
                        <div className="mt-1 p-1.5 rounded-full bg-zinc-900 border border-zinc-800">
                          <LayoutDashboard className="w-4 h-4 text-zinc-300" />
                        </div>
                        <div>
                          <h4 className="text-zinc-200 font-medium mb-1">Rapid Scenario Authoring</h4>
                          <p className="text-sm text-zinc-500 font-light">Describe a use-case and generate a complete course instantly.</p>
                        </div>
                      </div>
                      <div className="flex gap-4 items-start">
                        <div className="mt-1 p-1.5 rounded-full bg-zinc-900 border border-zinc-800">
                          <Globe className="w-4 h-4 text-zinc-300" />
                        </div>
                        <div>
                          <h4 className="text-zinc-200 font-medium mb-1">Scale Without Limits</h4>
                          <p className="text-sm text-zinc-500 font-light">Roll out updates to thousands without scheduling manual sessions.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative rounded-2xl border border-white/[0.08] bg-[#0c0c0f] p-8 aspect-square flex flex-col justify-center gap-4 shadow-[0_24px_56px_-38px_rgba(0,0,0,0.9)]">
                    <div className="h-8 w-1/3 bg-white/[0.08] rounded-md mb-4"></div>
                    <div className="flex gap-4 mb-4">
                      <div className="h-24 flex-1 bg-white/[0.035] rounded-lg border border-white/[0.08]"></div>
                      <div className="h-24 flex-1 bg-white/[0.035] rounded-lg border border-white/[0.08]"></div>
                      <div className="h-24 flex-1 bg-white/[0.035] rounded-lg border border-white/[0.08]"></div>
                    </div>
                    <div className="h-40 w-full bg-white/[0.03] rounded-lg border border-white/[0.07]"></div>
                  </div>
                </div>
              </Slide>

              <Slide tone="bg-zinc-950/30" align="center">
                <div className="w-full px-4 md:px-8 text-center">
                  <Shield className="w-10 h-10 text-zinc-500 mx-auto mb-5 stroke-[1]" />
                  <h2 className="text-3xl md:text-4xl font-light tracking-tight text-zinc-100 mb-4">
                    Enterprise Security & <MetallicText>Control</MetallicText>
                  </h2>
                  <p className="text-zinc-400 font-light leading-relaxed mb-10 max-w-3xl mx-auto">
                    Generative flexibility with strict, auditable control for regulated environments.
                  </p>

                  <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
                    <div className="p-5 border border-white/[0.08] rounded-xl bg-white/[0.02] shadow-[0_20px_36px_-30px_rgba(0,0,0,0.85)]">
                      <Lock className="w-5 h-5 text-zinc-400 mb-3" />
                      <h4 className="text-zinc-200 font-medium mb-2">SOC2 & GDPR</h4>
                      <p className="text-xs text-zinc-500">Enterprise-grade data protection and privacy controls.</p>
                    </div>
                    <div className="p-5 border border-white/[0.08] rounded-xl bg-white/[0.02] shadow-[0_20px_36px_-30px_rgba(0,0,0,0.85)]">
                      <CheckCircle2 className="w-5 h-5 text-zinc-400 mb-3" />
                      <h4 className="text-zinc-200 font-medium mb-2">Hallucination-Free</h4>
                      <p className="text-xs text-zinc-500">Strict separation of generative output and factual systems.</p>
                    </div>
                    <div className="p-5 border border-white/[0.08] rounded-xl bg-white/[0.02] shadow-[0_20px_36px_-30px_rgba(0,0,0,0.85)]">
                      <Shield className="w-5 h-5 text-zinc-400 mb-3" />
                      <h4 className="text-zinc-200 font-medium mb-2">Brand Safety</h4>
                      <p className="text-xs text-zinc-500">AI remains anchored to approved corporate messaging.</p>
                    </div>
                  </div>
                </div>
              </Slide>

              <Slide tone="bg-zinc-950/20" align="center">
                <div className="w-full px-4 md:px-8 text-center">
                  <h2 className="text-3xl md:text-4xl font-light tracking-tight text-zinc-100 mb-10">
                    The <MetallicText>Business Impact</MetallicText>
                  </h2>

                  <div className="grid md:grid-cols-3 gap-10 max-w-4xl mx-auto mb-14">
                    <div>
                      <div className="text-3xl font-light text-zinc-200 mb-2">Ramp</div>
                      <div className="text-sm font-medium tracking-widest uppercase text-zinc-600 mb-2">Time to Value</div>
                      <p className="text-sm text-zinc-500 font-light">Accelerate onboarding and reach productivity sooner.</p>
                    </div>
                    <div>
                      <div className="text-3xl font-light text-zinc-200 mb-2">Consistency</div>
                      <div className="text-sm font-medium tracking-widest uppercase text-zinc-600 mb-2">Message Adherence</div>
                      <p className="text-sm text-zinc-500 font-light">Reduce execution drift and dependency on hero reps.</p>
                    </div>
                    <div>
                      <div className="text-3xl font-light text-zinc-200 mb-2">Conversion</div>
                      <div className="text-sm font-medium tracking-widest uppercase text-zinc-600 mb-2">Revenue Driving</div>
                      <p className="text-sm text-zinc-500 font-light">Turn training into measurable behavior change.</p>
                    </div>
                  </div>

                  <div className="max-w-4xl mx-auto pt-8 border-t border-white/[0.07]">
                    <p className="text-xs tracking-widest text-zinc-600 uppercase mb-8">A proven partner for long-term growth</p>
                    <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-40 hover:opacity-70 transition-opacity">
                      <span className="text-xl font-bold tracking-tight">T-Mobile</span>
                      <span className="text-xl font-bold tracking-tight">Erste Group</span>
                      <span className="text-xl font-bold tracking-tight">Kyndryl</span>
                      <span className="text-xl font-bold tracking-tight">Adastra</span>
                    </div>
                  </div>
                </div>
              </Slide>

              <Slide tone="bg-zinc-950/25" align="center">
                <div className="w-full px-4 md:px-8 text-center">
                  <h2 className="text-3xl md:text-4xl font-light tracking-tight text-zinc-100 mb-5">
                    Ready to transform your <MetallicText>enterprise execution?</MetallicText>
                  </h2>
                  <p className="text-lg text-zinc-500 font-light mb-9 max-w-xl mx-auto">
                    Stop testing memory. Start ensuring readiness. Join industry leaders using Promethist Empower.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-zinc-100 text-zinc-950 font-medium transition-transform hover:scale-[1.02] hover:bg-white">
                      Request a Demo
                    </button>
                    <button className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/[0.14] bg-white/[0.03] text-zinc-200 font-medium hover:border-white/[0.22] hover:bg-white/[0.06] transition-colors">
                      Contact Sales
                    </button>
                  </div>
                </div>
              </Slide>
            </div>
          </div>
        </main>

        {showStepper && (
          <div
            className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-2 rounded-full border border-white/[0.14] bg-[#0f0f12]/86 backdrop-blur-md p-1.5 shadow-2xl ${
              stepperPulse ? "animate-pulse" : ""
            }`}
          >
            <button
              className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-white/[0.14] text-zinc-300 hover:text-zinc-100 hover:border-white/[0.24] transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
              onClick={() => goToStep(stepIndex - 1)}
              disabled={stepIndex === 0}
              aria-label="Previous section"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-[11px] tracking-widest uppercase text-zinc-500">
              {stepIndex + 1}/{totalSteps}
            </span>
            <button
              className="h-10 px-4 inline-flex items-center gap-2 rounded-full bg-zinc-100 text-zinc-950 text-xs font-semibold tracking-wide hover:bg-white transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
              onClick={() => goToStep(stepIndex + 1)}
              disabled={stepIndex === totalSteps - 1}
            >
              Next
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
