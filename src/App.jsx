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
    className={`bg-gradient-to-r from-zinc-300 via-white to-zinc-400 text-transparent bg-clip-text ${className}`}
  >
    {children}
  </Component>
);

const FeatureBlock = ({ icon: Icon, title, description, className = "" }) => (
  <div
    className={`surface-card flex h-full flex-col items-start gap-2 rounded-3xl p-5 md:p-6 ${className}`}
  >
    <Icon className="mb-2 h-5 w-5 text-zinc-300" strokeWidth={1.5} />
    <h3 className="text-base font-medium tracking-tight text-zinc-100">{title}</h3>
    <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
  </div>
);

const Slide = ({ children, tone = "", align = "center", index, activeStep, direction }) => {
  let stateClass = "slide-state-idle";
  if (index === activeStep) stateClass = "slide-state-active";
  if (direction === 1 && index === activeStep - 1) stateClass = "slide-state-exit-up";
  if (direction === -1 && index === activeStep + 1) stateClass = "slide-state-exit-down";

  return (
    <section
      className={`slide-shell relative h-[calc(100vh-64px)] w-full shrink-0 overflow-hidden px-4 py-6 sm:px-6 md:px-10 md:py-8 lg:px-16 ${tone} ${stateClass}`}
    >
    <div className="pointer-events-none absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_50%_8%,rgba(255,255,255,0.06)_0%,transparent_42%)]" />
    <div className="relative mx-auto h-full w-full max-w-6xl">
        <div className={`slide-reveal h-full ${align === "center" ? "flex items-center" : ""}`}>{children}</div>
    </div>
    </section>
  );
};

const LOADING_MESSAGE = "Loading the website";

export default function App() {
  const [isBootLoading, setIsBootLoading] = useState(true);
  const [replayKey, setReplayKey] = useState(0);
  const [roleplayKey, setRoleplayKey] = useState(0);
  const [focusState, setFocusState] = useState("iphone");
  const [stepIndex, setStepIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);
  const [showStepper] = useState(true);
  const [stepperPulse] = useState(false);

  const totalSteps = 6;
  const shouldMountSimulation = stepIndex === 1;
  const shouldMountRoleplay = stepIndex === 2;

  const goToStep = (target) => {
    const next = Math.max(0, Math.min(totalSteps - 1, target));
    if (next === stepIndex) return;
    setSlideDirection(next > stepIndex ? 1 : -1);
    if (next === 1) setReplayKey((k) => k + 1);
    if (next === 2) setRoleplayKey((k) => k + 1);
    setStepIndex(next);
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

    const preloadScript = fetch("/shader-orb.js", { cache: "force-cache" }).catch(() => null);
    const preloadAssets = Promise.allSettled([
      preloadVideo("/Packages_Empower_Loop_small.webm"),
      preloadVideo("/Packages_Engage_Loop_small.webm"),
      preloadScript,
      new Promise((resolve) => window.setTimeout(resolve, 900)),
    ]);

    preloadAssets.then(() => {
      if (isCancelled) return;
      window.setTimeout(() => {
        if (!isCancelled) setIsBootLoading(false);
      }, 220);
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  if (isBootLoading) {
    return (
      <div className="h-screen bg-[#09090b] text-zinc-300 font-sans flex items-center justify-center px-5">
        <div className="w-full max-w-[360px] flex flex-col items-center">
          <img src={logo} alt="Promethist logo" className="h-8 w-auto object-contain opacity-90 mb-7" />
          <p className="text-[12px] tracking-[0.18em] uppercase text-zinc-500 mb-3">
            {LOADING_MESSAGE}
          </p>
          <div className="h-[2px] w-full rounded-full bg-white/[0.08] overflow-hidden">
            <div className="h-full w-full bg-[linear-gradient(90deg,rgba(255,255,255,0.22),rgba(255,255,255,0.7),rgba(255,255,255,0.22))] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell h-screen overflow-hidden bg-[#09090b] font-sans text-zinc-300 selection:bg-zinc-800 selection:text-zinc-100">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08)_0%,transparent_48%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,9,11,0.05)_0%,rgba(9,9,11,0.55)_100%)]" />
      </div>

      <div className="relative z-10 h-full">
        <nav className="glass-nav fixed top-0 z-50 w-full">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <img src={logo} alt="Promethist logo" className="h-7 w-auto object-contain" />
            <button className="inline-flex h-9 items-center rounded-full border border-white/[0.14] bg-white/[0.02] px-4 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-300 transition-colors hover:border-white/[0.26] hover:text-zinc-100">
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
              <Slide tone="bg-zinc-950/25" align="center" index={0} activeStep={stepIndex} direction={slideDirection}>
                <div className="mx-auto w-full max-w-5xl px-1 sm:px-3 md:px-6">
                  <div className="mb-6 inline-flex items-center gap-3 md:mb-8">
                    <span className="h-[1px] w-8 bg-zinc-600"></span>
                    <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">Enterprise Enablement</span>
                  </div>
                  <h1 className="mb-5 max-w-4xl text-4xl font-light leading-[1.03] tracking-tight text-zinc-100 sm:text-5xl md:mb-6 md:text-6xl lg:text-7xl">
                    Empower your teams with <br />
                    <MetallicText className="font-medium">Relational Intelligence</MetallicText>
                  </h1>
                  <p className="mb-8 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg md:mb-10 md:text-xl">
                    Turn training into a direct driver of revenue with dynamic AI coaching and measurable conversational performance.
                  </p>
                </div>
              </Slide>

              <Slide tone="bg-zinc-950/20" index={1} activeStep={stepIndex} direction={slideDirection}>
                <div className="flex h-full w-full flex-col justify-center px-1 sm:px-3">
                  <h2 className="mx-auto mb-3 max-w-4xl text-center text-2xl font-light leading-tight tracking-tight text-zinc-100 sm:text-3xl md:text-4xl">
                    Progressive coaching at enterprise scale, powered by <br className="hidden md:block" />
                    <MetallicText>Relational Intelligence.</MetallicText>
                  </h2>
                  <p className="mx-auto mb-6 max-w-3xl text-center text-sm leading-relaxed tracking-[0.01em] text-zinc-400 md:text-base">
                    Relational Intelligence powers every coaching moment across your enterprise ecosystem, turning scattered
                    conversations into measurable behavior change, faster ramp times, and repeatable revenue execution.
                  </p>

                  <div className="relative mt-2 flex w-full flex-col items-start justify-start gap-5 lg:flex-row lg:items-center">
                    <div className="flex-1 w-full max-w-[650px] text-left" style={terminalStyle}>
                      {shouldMountSimulation ? (
                        <TerminalApp key={replayKey} onReplay={() => setReplayKey((k) => k + 1)} />
                      ) : (
                        <div className="terminal min-h-[500px] animate-pulse bg-zinc-900/30" />
                      )}
                    </div>
                    <div className="relative z-20 w-full max-w-[290px] self-center lg:-ml-12 lg:self-auto" style={iphoneStyle}>
                      {shouldMountSimulation ? (
                        <CoachIphone replayKey={replayKey} />
                      ) : (
                        <div className="iphone-frame" style={{ transform: "scale(1)", transformOrigin: "top center" }} />
                      )}
                    </div>
                  </div>
                </div>
              </Slide>

              <Slide tone="bg-zinc-950/30" index={2} activeStep={stepIndex} direction={slideDirection}>
                <div className="flex h-full w-full flex-col justify-center px-1 sm:px-3">
                  <div className="mx-auto grid max-w-6xl items-center gap-6 md:gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
                    <div className="w-full max-w-[290px] mx-auto lg:mx-0">
                      {shouldMountRoleplay ? (
                        <RoleplayIphone key={roleplayKey} />
                      ) : (
                        <div className="iphone-frame" style={{ transform: "scale(0.94)", transformOrigin: "top center" }} />
                      )}
                    </div>

                    <div className="lg:pr-2">
                      <span className="mb-3 block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">The AI Coach</span>
                      <h3 className="mb-3 text-2xl font-light leading-tight tracking-tight text-zinc-100 md:text-3xl">
                        Master the <MetallicText>"last mile"</MetallicText> of high-stakes conversations, with observability built in.
                      </h3>
                      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base">
                        Roleplay simulation, coaching signal capture, and secure performance insights in one compact workflow.
                      </p>

                      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        <FeatureBlock
                          icon={Target}
                          title="Dynamic Role-Play"
                          description="The AI generates scenario variations and pushes back in real time."
                          className="h-full"
                        />
                        <FeatureBlock
                          icon={Zap}
                          title="Safe Simulation"
                          description="Teams can fail safely in practice before live customer conversations."
                          className="h-full"
                        />
                        <FeatureBlock
                          icon={BarChart3}
                          title="Instant Correction"
                          description="Objective feedback on pacing, confidence, and message adherence."
                          className="h-full sm:col-span-2 xl:col-span-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Slide>

              <Slide tone="bg-zinc-950/15" align="center" index={3} activeStep={stepIndex} direction={slideDirection}>
                <div className="grid w-full items-center gap-10 px-1 sm:px-3 md:grid-cols-2 md:gap-14">
                  <div className="md:pr-4">
                    <span className="mb-4 block text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">The Platform</span>
                    <h2 className="mb-5 text-3xl font-light tracking-tight text-zinc-100 md:text-4xl">
                      Deploy new behaviors <MetallicText>overnight.</MetallicText>
                    </h2>
                    <p className="mb-8 text-zinc-400 leading-relaxed">
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

                  <div className="relative aspect-[5/6] overflow-hidden rounded-2xl border border-[#1a2335] bg-[#03070f] shadow-[0_28px_64px_-40px_rgba(0,0,0,0.98)] sm:aspect-square">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_4%,rgba(66,104,176,0.24),transparent_45%)]" />
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,10,18,0.08)_0%,rgba(2,4,10,0.74)_100%)]" />
                    <div className="relative grid h-full grid-cols-[74px_minmax(0,1fr)] sm:grid-cols-[94px_minmax(0,1fr)]">
                      <aside className="flex min-h-0 flex-col border-r border-[#111a2b] bg-[#040912] p-2 sm:p-3.5">
                        <div className="mb-4 flex items-center gap-1.5 sm:mb-6 sm:gap-2">
                          <img src={logo} alt="Promethist" className="h-4 w-auto opacity-95" />
                          <span className="text-[9px] font-medium text-zinc-200 sm:text-[10px]">AI</span>
                        </div>
                        <div className="mb-2 text-[8px] uppercase tracking-[0.12em] text-[#53617a] sm:text-[9px]">Project</div>
                        <div className="space-y-1.5 text-[8px] sm:text-[9px]">
                          <div className="text-[#5d6f8d]">Relational Agents</div>
                          <div className="text-[#5d6f8d]">Knowledge Bases</div>
                          <div className="rounded border border-[#253551] bg-[#0d1628] px-1.5 py-1 text-[#97b5ff]">Analytics Suite</div>
                          <div className="text-[#5d6f8d]">Evaluation Runs</div>
                          <div className="text-[#5d6f8d]">Settings</div>
                        </div>
                        <div className="mt-auto border-t border-[#111a2b] pt-2 text-[7px] text-[#5c6a84] sm:pt-3 sm:text-[8px]">domnik.novozamsky</div>
                      </aside>

                      <div className="flex min-h-0 flex-col gap-2 p-2 sm:gap-2.5 sm:p-3.5">
                        <div className="flex min-h-8 flex-wrap items-center justify-between gap-1.5 rounded-md border border-[#162239] bg-[#060d1a] px-2 py-1 sm:h-8 sm:flex-nowrap sm:px-3">
                          <div className="truncate text-[8px] text-[#7285a7] sm:text-[9px]">Home  ›  Convert  ›  Intelligence  ›  <span className="text-zinc-200">Analytics</span></div>
                          <div className="flex items-center gap-1.5">
                            <span className="rounded border border-[#2b3a58] px-1.5 py-0.5 text-[8px] text-zinc-300">AI Assistant</span>
                            <span className="rounded bg-[#5a72ff] px-1.5 py-0.5 text-[8px] text-white">Studio</span>
                          </div>
                        </div>

                        <div className="border-b border-[#141f31] pb-1.5">
                          <h3 className="text-[13px] font-semibold text-zinc-100">Evaluation Results</h3>
                          <p className="mt-0.5 text-[9px] text-[#6a7892]">
                            Modular evaluation analytics drawn from configured evaluations. Each block reveals where conversations break and where coaching lifts performance.
                          </p>
                        </div>

                        <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
                          <div className="flex flex-col rounded-md border border-[#22324f] bg-[#0b1425] p-2">
                            <div className="mb-1 flex items-center gap-1">
                              <span className="rounded bg-emerald-300/10 px-1.5 py-0.5 text-[7px] uppercase tracking-wide text-emerald-300">Pass/Fail</span>
                              <span className="text-[9px] text-zinc-200">Level 1: Junior Associate</span>
                            </div>
                            <p className="mb-1.5 text-[8px] text-[#7283a1]">Baseline competency check: greeting, identity verification, and polite closing compliance.</p>
                            <div className="rounded border border-[#1a2539] bg-[#050a14] p-1.5 text-[8px] text-[#aebddb]">
                              <div className="text-[12px] font-semibold text-zinc-100">78%</div>
                              <div className="mt-1 flex justify-between"><span className="text-emerald-300">✓ Passed 32</span><span>Failed 9</span></div>
                            </div>
                            <div className="mt-auto pt-1.5 text-[8px] text-[#5f6e88]">● Active</div>
                          </div>

                          <div className="flex flex-col rounded-md border border-[#22324f] bg-[#0b1425] p-2">
                            <div className="mb-1 flex items-center gap-1">
                              <span className="rounded bg-emerald-300/10 px-1.5 py-0.5 text-[7px] uppercase tracking-wide text-emerald-300">Pass/Fail</span>
                              <span className="text-[9px] text-zinc-200">Level 2: Sales Proficiency</span>
                            </div>
                            <p className="mb-1.5 text-[8px] text-[#7283a1]">Evaluates ability to pivot from service to sales and identify at least one cross-sell opportunity.</p>
                            <div className="rounded border border-[#1a2539] bg-[#050a14] p-1.5 text-[8px] text-[#aebddb]">
                              <div className="text-[12px] font-semibold text-zinc-100">62%</div>
                              <div className="mt-1 flex justify-between"><span className="text-emerald-300">✓ Passed 25</span><span>Failed 16</span></div>
                            </div>
                            <div className="mt-auto pt-1.5 text-[8px] text-[#5f6e88]">● Active</div>
                          </div>

                          <div className="flex flex-col rounded-md border border-[#22324f] bg-[#0b1425] p-2">
                            <div className="mb-1 flex items-center gap-1">
                              <span className="rounded bg-sky-300/10 px-1.5 py-0.5 text-[7px] uppercase tracking-wide text-sky-300">Score</span>
                              <span className="text-[9px] text-zinc-200">Regulatory Risk Score</span>
                            </div>
                            <p className="mb-1.5 text-[8px] text-[#7283a1]">Granular scoring of AML protocol adherence, disclosures, and risk disclaimer accuracy.</p>
                            <div className="rounded border border-[#1a2539] bg-[#050a14] p-1.5">
                              <div className="text-[12px] font-semibold text-zinc-100">73 / 100</div>
                              <div className="mt-1 h-1 rounded bg-[#1a2740]"><div className="h-1 w-[73%] rounded bg-sky-400" /></div>
                              <div className="mt-1 flex justify-between text-[7px] text-[#6f7f9b]"><span>Min: 42</span><span>Avg: 73</span><span>Max: 95</span></div>
                            </div>
                            <div className="mt-auto pt-1.5 text-[8px] text-[#5f6e88]">● Active</div>
                          </div>

                          <div className="flex flex-col rounded-md border border-[#22324f] bg-[#0b1425] p-2">
                            <div className="mb-1 flex items-center gap-1">
                              <span className="rounded bg-amber-300/10 px-1.5 py-0.5 text-[7px] uppercase tracking-wide text-amber-300">Text</span>
                              <span className="text-[9px] text-zinc-200">Objection Handling Analysis</span>
                            </div>
                            <p className="mb-1 text-[8px] text-[#7283a1]">Qualitative analysis of how the banker handled the fee objection and emotional resistance.</p>
                            <div className="rounded border border-amber-500/25 bg-[#1a130a] p-1.5 text-[8px] text-amber-100/85">“Lost engagement when explaining fees using jargon. Recommend simpler vocabulary within first 20 seconds.”</div>
                            <div className="mt-auto pt-1.5 text-[8px] text-[#5f6e88]">Last run: 30m ago</div>
                          </div>

                          <div className="flex flex-col rounded-md border border-[#22324f] bg-[#0b1425] p-2">
                            <div className="mb-1 flex items-center gap-1">
                              <span className="rounded bg-violet-300/10 px-1.5 py-0.5 text-[7px] uppercase tracking-wide text-violet-300">List</span>
                              <span className="text-[9px] text-zinc-200">Missed Opportunities</span>
                            </div>
                            <p className="mb-1 text-[8px] text-[#7283a1]">Extracts specific financial products matched to client profile but not introduced during the call.</p>
                            <div className="flex flex-wrap gap-1">
                              <span className="rounded border border-violet-400/20 bg-violet-400/10 px-1.5 py-0.5 text-[7px] text-violet-200">ETFs</span>
                              <span className="rounded border border-violet-400/20 bg-violet-400/10 px-1.5 py-0.5 text-[7px] text-violet-200">Savings Account</span>
                              <span className="rounded border border-violet-400/20 bg-violet-400/10 px-1.5 py-0.5 text-[7px] text-violet-200">Travel Insurance</span>
                            </div>
                            <div className="mt-auto pt-1.5 text-[8px] text-[#5f6e88]">Frequency across sessions: 68%</div>
                          </div>

                          <div className="flex flex-col rounded-md border border-[#22324f] bg-[#0b1425] p-2">
                            <div className="mb-1 flex items-center gap-1">
                              <span className="rounded bg-emerald-300/10 px-1.5 py-0.5 text-[7px] uppercase tracking-wide text-emerald-300">Pass/Fail</span>
                              <span className="text-[9px] text-zinc-200">Level 3: Senior Wealth Advisory</span>
                            </div>
                            <p className="mb-1.5 text-[8px] text-[#7283a1]">Complex needs analysis, tax-efficient framing, and estate planning cue detection.</p>
                            <div className="rounded border border-[#1a2539] bg-[#050a14] p-1.5 text-[8px] text-[#aebddb]">
                              <div className="text-[12px] font-semibold text-zinc-100">44%</div>
                              <div className="mt-1 flex justify-between"><span className="text-emerald-300">✓ Passed 18</span><span>Failed 23</span></div>
                            </div>
                            <div className="mt-auto pt-1.5 text-[8px] text-[#5f6e88]">● Active</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Slide>

              <Slide tone="bg-zinc-950/30" align="center" index={4} activeStep={stepIndex} direction={slideDirection}>
                <div className="w-full px-1 text-center sm:px-3">
                  <Shield className="mx-auto mb-5 h-10 w-10 stroke-[1] text-zinc-500" />
                  <h2 className="mb-4 text-3xl font-light tracking-tight text-zinc-100 md:text-4xl">
                    Enterprise Security & <MetallicText>Control</MetallicText>
                  </h2>
                  <p className="mx-auto mb-10 max-w-3xl leading-relaxed text-zinc-400">
                    Generative flexibility with strict, auditable control for regulated environments.
                  </p>

                  <div className="mx-auto grid max-w-4xl gap-5 text-left sm:grid-cols-3">
                    <div className="surface-card rounded-2xl p-5">
                      <Lock className="w-5 h-5 text-zinc-400 mb-3" />
                      <h4 className="text-zinc-200 font-medium mb-2">SOC2 & GDPR</h4>
                      <p className="text-sm leading-relaxed text-zinc-400">Enterprise-grade data protection and privacy controls.</p>
                    </div>
                    <div className="surface-card rounded-2xl p-5">
                      <CheckCircle2 className="w-5 h-5 text-zinc-400 mb-3" />
                      <h4 className="text-zinc-200 font-medium mb-2">Hallucination-Free</h4>
                      <p className="text-sm leading-relaxed text-zinc-400">Strict separation of generative output and factual systems.</p>
                    </div>
                    <div className="surface-card rounded-2xl p-5">
                      <Shield className="w-5 h-5 text-zinc-400 mb-3" />
                      <h4 className="text-zinc-200 font-medium mb-2">Brand Safety</h4>
                      <p className="text-sm leading-relaxed text-zinc-400">AI remains anchored to approved corporate messaging.</p>
                    </div>
                  </div>
                </div>
              </Slide>

              <Slide tone="bg-zinc-950/25" align="center" index={5} activeStep={stepIndex} direction={slideDirection}>
                <div className="mx-auto flex w-full max-w-5xl flex-col justify-center px-1 py-4 text-center sm:px-3 md:py-6">
                  <h2 className="mb-5 text-3xl font-light tracking-tight text-zinc-100 md:text-4xl">
                    Ready to transform your <MetallicText>enterprise execution?</MetallicText>
                  </h2>
                  <p className="mx-auto mb-11 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
                    Stop testing memory and start driving measurable outcomes: faster ramp, higher message consistency, and stronger conversion behavior.
                  </p>

                  <div className="mx-auto mb-11 grid max-w-4xl gap-6 text-left md:grid-cols-3">
                    <div className="metric-card">
                      <div className="mb-2.5 text-3xl font-light text-zinc-100">Ramp</div>
                      <div className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">Time to Value</div>
                      <p className="text-sm leading-relaxed text-zinc-400">Accelerate onboarding and reach productivity sooner.</p>
                    </div>
                    <div className="metric-card">
                      <div className="mb-2.5 text-3xl font-light text-zinc-100">Consistency</div>
                      <div className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">Message Adherence</div>
                      <p className="text-sm leading-relaxed text-zinc-400">Reduce execution drift and dependency on hero reps.</p>
                    </div>
                    <div className="metric-card">
                      <div className="mb-2.5 text-3xl font-light text-zinc-100">Conversion</div>
                      <div className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">Revenue Driving</div>
                      <p className="text-sm leading-relaxed text-zinc-400">Turn training into measurable behavior change.</p>
                    </div>
                  </div>

                  <div className="mb-11 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <button className="cta-primary w-full sm:w-auto">
                      Request a Demo
                    </button>
                    <button className="cta-ghost w-full sm:w-auto">
                      Contact Sales
                    </button>
                  </div>

                  <div className="mx-auto max-w-4xl border-t border-white/[0.07] pt-9">
                    <p className="mb-8 text-[11px] uppercase tracking-[0.16em] text-zinc-600">A proven partner for long-term growth</p>
                    <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 opacity-45 transition-opacity hover:opacity-70 md:gap-x-16">
                      <span className="text-lg font-semibold tracking-tight text-zinc-300">T-Mobile</span>
                      <span className="text-lg font-semibold tracking-tight text-zinc-300">Erste Group</span>
                      <span className="text-lg font-semibold tracking-tight text-zinc-300">Kyndryl</span>
                      <span className="text-lg font-semibold tracking-tight text-zinc-300">Adastra</span>
                    </div>
                  </div>
                </div>
              </Slide>
            </div>
          </div>
        </main>

        {showStepper && (
          <div
            className={`floating-stepper fixed bottom-5 left-1/2 z-[9999] flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/[0.14] bg-[#0f0f12]/86 p-1.5 shadow-2xl backdrop-blur-md ${
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
