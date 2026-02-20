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
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button className="cta-primary w-full sm:w-auto">Request a Demo</button>
                    <button className="cta-ghost w-full sm:w-auto">Watch Product Tour</button>
                  </div>
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

                  <div className="relative aspect-square overflow-hidden rounded-2xl border border-[#1a2539] bg-[#050912] shadow-[0_28px_64px_-40px_rgba(0,0,0,0.95)]">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_4%,rgba(68,90,160,0.24),transparent_42%)]" />
                    <div className="h-full grid grid-cols-[92px_minmax(0,1fr)] relative">
                      <aside className="border-r border-[#141d2e] bg-[#070d18] p-3.5 flex flex-col">
                        <div className="flex items-center gap-2 mb-6">
                          <img src={logo} alt="Promethist" className="h-4 w-auto opacity-95" />
                          <span className="text-[10px] text-zinc-200 font-medium">AI</span>
                        </div>
                        <div className="text-[9px] uppercase tracking-[0.12em] text-[#53617a] mb-2">Project</div>
                        <div className="space-y-1.5 text-[9px]">
                          <div className="text-[#5d6f8d]">Relational Agents</div>
                          <div className="text-[#5d6f8d]">Knowledge Bases</div>
                          <div className="text-[#88a5ff] bg-[#101a2d] border border-[#253551] rounded px-1.5 py-1">Analytics Suite</div>
                          <div className="text-[#5d6f8d]">Members</div>
                          <div className="text-[#5d6f8d]">Settings</div>
                        </div>
                        <div className="mt-auto pt-3 border-t border-[#131c2b] text-[8px] text-[#5c6a84]">
                          domnik.novozamsky
                        </div>
                      </aside>

                      <div className="p-3.5 flex flex-col gap-2.5">
                        <div className="h-8 rounded-md border border-[#1a263b] bg-[#070d19] px-3 flex items-center justify-between">
                          <div className="text-[9px] text-[#7383a0]">Home  ›  PromethistAI Inc  ›  Convert  ›  <span className="text-zinc-200">Analytics</span></div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[8px] text-zinc-300 border border-[#283752] rounded px-1.5 py-0.5">AI Assistant</span>
                            <span className="text-[8px] text-white bg-[#5568ff] rounded px-1.5 py-0.5">Studio</span>
                          </div>
                        </div>

                        <div className="rounded-md border border-[#1a263b] bg-[#0a1120] p-2.5">
                          <div className="grid grid-cols-6 gap-1.5">
                            <div className="rounded border border-[#24324c] bg-[#070d18] px-1.5 py-1.5">
                              <div className="text-[7px] uppercase text-[#5f6f8b] mb-0.5">From</div>
                              <div className="text-[8px] text-[#a9b7ce]">18.01.2026</div>
                            </div>
                            <div className="rounded border border-[#24324c] bg-[#070d18] px-1.5 py-1.5">
                              <div className="text-[7px] uppercase text-[#5f6f8b] mb-0.5">To</div>
                              <div className="text-[8px] text-[#a9b7ce]">17.02.2026</div>
                            </div>
                            <div className="rounded border border-[#24324c] bg-[#070d18] px-1.5 py-1.5">
                              <div className="text-[7px] uppercase text-[#5f6f8b] mb-0.5">Period</div>
                              <div className="text-[8px] text-[#a9b7ce]">Last 30 days</div>
                            </div>
                            <div className="rounded border border-[#24324c] bg-[#070d18] px-1.5 py-1.5">
                              <div className="text-[7px] uppercase text-[#5f6f8b] mb-0.5">Agent</div>
                              <div className="text-[8px] text-[#a9b7ce]">All Agents</div>
                            </div>
                            <div className="rounded border border-[#24324c] bg-[#070d18] px-1.5 py-1.5">
                              <div className="text-[7px] uppercase text-[#5f6f8b] mb-0.5">User</div>
                              <div className="text-[8px] text-[#a9b7ce]">All Users</div>
                            </div>
                            <div className="rounded border border-[#24324c] bg-[#070d18] px-1.5 py-1.5">
                              <div className="text-[7px] uppercase text-[#5f6f8b] mb-0.5">Group</div>
                              <div className="text-[8px] text-[#a9b7ce]">All Groups</div>
                            </div>
                          </div>
                        </div>

                        <div className="pb-1 border-b border-[#151f31]">
                          <h3 className="text-[13px] text-zinc-100 font-semibold">Evaluation Results</h3>
                          <p className="text-[9px] text-[#6a7892] mt-0.5">Modular evaluation analytics drawn from configured blocks.</p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 flex-1">
                          <div className="rounded-md border border-[#25344f] bg-[#0f1727] p-2 flex flex-col">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[7px] uppercase tracking-wide text-emerald-300 bg-emerald-300/10 px-1.5 py-0.5 rounded">Pass/Fail</span>
                              <span className="text-[9px] text-zinc-300">Level 1</span>
                            </div>
                            <p className="text-[8px] text-[#6f7d96] mb-1.5">Junior Associate</p>
                            <div className="rounded bg-[#070c16] border border-[#1a2539] p-1.5">
                              <div className="text-[12px] text-zinc-100 font-semibold">78%</div>
                              <div className="h-1 rounded-full bg-[#19263d] mt-1"><div className="h-1 rounded-full bg-emerald-400 w-[78%]" /></div>
                            </div>
                            <div className="mt-auto pt-1.5 text-[8px] text-[#5f6e88]">● Active</div>
                          </div>

                          <div className="rounded-md border border-[#25344f] bg-[#0f1727] p-2 flex flex-col">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[7px] uppercase tracking-wide text-emerald-300 bg-emerald-300/10 px-1.5 py-0.5 rounded">Pass/Fail</span>
                              <span className="text-[9px] text-zinc-300">Level 2</span>
                            </div>
                            <p className="text-[8px] text-[#6f7d96] mb-1.5">Sales Proficiency</p>
                            <div className="rounded bg-[#070c16] border border-[#1a2539] p-1.5">
                              <div className="text-[12px] text-zinc-100 font-semibold">62%</div>
                              <div className="h-1 rounded-full bg-[#19263d] mt-1"><div className="h-1 rounded-full bg-emerald-400 w-[62%]" /></div>
                            </div>
                            <div className="mt-auto pt-1.5 text-[8px] text-[#5f6e88]">● Active</div>
                          </div>

                          <div className="rounded-md border border-[#25344f] bg-[#0f1727] p-2 flex flex-col">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[7px] uppercase tracking-wide text-sky-300 bg-sky-300/10 px-1.5 py-0.5 rounded">Score</span>
                              <span className="text-[9px] text-zinc-300">Risk</span>
                            </div>
                            <p className="text-[8px] text-[#6f7d96] mb-1.5">Regulatory Risk</p>
                            <div className="rounded bg-[#070c16] border border-[#1a2539] p-1.5">
                              <div className="text-[12px] text-zinc-100 font-semibold">73</div>
                              <svg viewBox="0 0 120 24" className="w-full h-4 mt-1">
                                <path d="M1 18 L20 15 L40 16 L60 13 L80 14 L100 11 L119 12" fill="none" stroke="rgba(59,130,246,0.9)" strokeWidth="1.6" />
                              </svg>
                            </div>
                            <div className="mt-auto pt-1.5 text-[8px] text-[#5f6e88]">● Active</div>
                          </div>

                          <div className="rounded-md border border-[#25344f] bg-[#0f1727] p-2 flex flex-col">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[7px] uppercase tracking-wide text-amber-300 bg-amber-300/10 px-1.5 py-0.5 rounded">Text</span>
                              <span className="text-[9px] text-zinc-300">Analysis</span>
                            </div>
                            <p className="text-[8px] text-[#6f7d96] mb-1">Objection Handling</p>
                            <div className="rounded bg-[#1b140a] border border-amber-500/25 p-1.5 text-[8px] text-amber-100/80">“Lost engagement at fee objection.”</div>
                            <div className="mt-auto pt-1.5 text-[8px] text-[#5f6e88]">Last run: 2m ago</div>
                          </div>

                          <div className="rounded-md border border-[#25344f] bg-[#0f1727] p-2 flex flex-col">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[7px] uppercase tracking-wide text-purple-300 bg-purple-300/10 px-1.5 py-0.5 rounded">List</span>
                              <span className="text-[9px] text-zinc-300">Opportunities</span>
                            </div>
                            <p className="text-[8px] text-[#6f7d96] mb-1">Missed Products</p>
                            <div className="flex flex-wrap gap-1">
                              <span className="text-[7px] px-1.5 py-0.5 rounded bg-purple-400/10 border border-purple-400/20 text-purple-200">ETFs</span>
                              <span className="text-[7px] px-1.5 py-0.5 rounded bg-purple-400/10 border border-purple-400/20 text-purple-200">Savings</span>
                              <span className="text-[7px] px-1.5 py-0.5 rounded bg-purple-400/10 border border-purple-400/20 text-purple-200">Travel</span>
                            </div>
                            <div className="mt-auto pt-1.5 text-[8px] text-[#5f6e88]">Frequency: 68%</div>
                          </div>

                          <div className="rounded-md border border-[#25344f] bg-[#0f1727] p-2 flex flex-col">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[7px] uppercase tracking-wide text-emerald-300 bg-emerald-300/10 px-1.5 py-0.5 rounded">Pass/Fail</span>
                              <span className="text-[9px] text-zinc-300">Level 3</span>
                            </div>
                            <p className="text-[8px] text-[#6f7d96] mb-1.5">Senior Wealth Advisory</p>
                            <div className="rounded bg-[#070c16] border border-[#1a2539] p-1.5">
                              <div className="text-[12px] text-zinc-100 font-semibold">44%</div>
                              <div className="h-1 rounded-full bg-[#19263d] mt-1"><div className="h-1 rounded-full bg-amber-400 w-[44%]" /></div>
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
                <div className="w-full px-1 text-center sm:px-3">
                  <h2 className="mb-4 text-3xl font-light tracking-tight text-zinc-100 md:text-4xl">
                    Ready to transform your <MetallicText>enterprise execution?</MetallicText>
                  </h2>
                  <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
                    Stop testing memory and start driving measurable outcomes: faster ramp, higher message consistency, and stronger conversion behavior.
                  </p>

                  <div className="mx-auto mb-10 grid max-w-4xl gap-5 text-left md:grid-cols-3">
                    <div className="metric-card">
                      <div className="mb-2 text-3xl font-light text-zinc-100">Ramp</div>
                      <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">Time to Value</div>
                      <p className="text-sm leading-relaxed text-zinc-400">Accelerate onboarding and reach productivity sooner.</p>
                    </div>
                    <div className="metric-card">
                      <div className="mb-2 text-3xl font-light text-zinc-100">Consistency</div>
                      <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">Message Adherence</div>
                      <p className="text-sm leading-relaxed text-zinc-400">Reduce execution drift and dependency on hero reps.</p>
                    </div>
                    <div className="metric-card">
                      <div className="mb-2 text-3xl font-light text-zinc-100">Conversion</div>
                      <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">Revenue Driving</div>
                      <p className="text-sm leading-relaxed text-zinc-400">Turn training into measurable behavior change.</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button className="cta-primary w-full sm:w-auto">
                      Request a Demo
                    </button>
                    <button className="cta-ghost w-full sm:w-auto">
                      Contact Sales
                    </button>
                  </div>

                  <div className="mx-auto mt-9 max-w-4xl border-t border-white/[0.07] pt-8">
                    <p className="mb-7 text-[11px] uppercase tracking-[0.16em] text-zinc-600">A proven partner for long-term growth</p>
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
            className={`floating-stepper fixed bottom-5 left-1/2 z-[9999] flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/[0.14] bg-[#0f0f12]/86 p-1.5 shadow-2xl backdrop-blur-md md:bottom-6 md:left-auto md:right-6 md:translate-x-0 ${
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
