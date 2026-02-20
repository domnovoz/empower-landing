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

const LOADING_MESSAGE = "Loading the website";

export default function App() {
  const [isBootLoading, setIsBootLoading] = useState(true);
  const [replayKey, setReplayKey] = useState(0);
  const [roleplayKey, setRoleplayKey] = useState(0);
  const [focusState, setFocusState] = useState("iphone");
  const [stepIndex, setStepIndex] = useState(0);
  const [showStepper] = useState(true);
  const [stepperPulse] = useState(false);

  const totalSteps = 6;
  const shouldMountSimulation = stepIndex === 1;
  const shouldMountRoleplay = stepIndex === 2;

  const goToStep = (target) => {
    const next = Math.max(0, Math.min(totalSteps - 1, target));
    if (next === stepIndex) return;
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
                </div>
              </Slide>

              <Slide tone="bg-zinc-950/20">
                <div className="w-full px-4 md:px-8 h-full flex flex-col justify-center">
                  <h2 className="text-3xl md:text-4xl font-light tracking-tight text-zinc-100 max-w-4xl mx-auto leading-tight mb-3 text-center">
                    Progressive coaching at enterprise scale, powered by <br className="hidden md:block" />
                    <MetallicText>Relational Intelligence.</MetallicText>
                  </h2>
                  <p className="text-zinc-500 text-sm md:text-base font-light tracking-wide mb-5 text-center max-w-3xl mx-auto">
                    Relational Intelligence powers every coaching moment across your enterprise ecosystem, turning scattered
                    conversations into measurable behavior change, faster ramp times, and repeatable revenue execution.
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
                  <div className="max-w-6xl mx-auto grid lg:grid-cols-[300px_minmax(0,1fr)] gap-6 md:gap-8 items-center">
                    <div className="w-full max-w-[290px] mx-auto lg:mx-0">
                      {shouldMountRoleplay ? (
                        <RoleplayIphone key={roleplayKey} />
                      ) : (
                        <div className="iphone-frame" style={{ transform: "scale(0.94)", transformOrigin: "top center" }} />
                      )}
                    </div>

                    <div>
                      <span className="text-xs font-medium tracking-widest uppercase text-zinc-500 block mb-3">The AI Coach</span>
                      <h3 className="text-2xl md:text-3xl font-light tracking-tight text-zinc-100 leading-tight mb-3">
                        Master the <MetallicText>"last mile"</MetallicText> of high-stakes conversations, with observability built in.
                      </h3>
                      <p className="text-sm md:text-base text-zinc-400 font-light leading-relaxed mb-5 max-w-2xl">
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

                  <div className="relative overflow-hidden rounded-2xl border border-[#1a2539] bg-[#050912] aspect-square shadow-[0_28px_64px_-40px_rgba(0,0,0,0.95)]">
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

              <Slide tone="bg-zinc-950/25" align="center">
                <div className="w-full px-4 md:px-8 text-center">
                  <h2 className="text-3xl md:text-4xl font-light tracking-tight text-zinc-100 mb-4">
                    Ready to transform your <MetallicText>enterprise execution?</MetallicText>
                  </h2>
                  <p className="text-lg text-zinc-500 font-light mb-8 max-w-2xl mx-auto">
                    Stop testing memory and start driving measurable outcomes: faster ramp, higher message consistency, and stronger conversion behavior.
                  </p>

                  <div className="grid md:grid-cols-3 gap-7 max-w-4xl mx-auto mb-10 text-left">
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

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-zinc-100 text-zinc-950 font-medium transition-transform hover:scale-[1.02] hover:bg-white">
                      Request a Demo
                    </button>
                    <button className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/[0.14] bg-white/[0.03] text-zinc-200 font-medium hover:border-white/[0.22] hover:bg-white/[0.06] transition-colors">
                      Contact Sales
                    </button>
                  </div>

                  <div className="max-w-4xl mx-auto pt-8 mt-9 border-t border-white/[0.07]">
                    <p className="text-xs tracking-widest text-zinc-600 uppercase mb-7">A proven partner for long-term growth</p>
                    <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-40 hover:opacity-70 transition-opacity">
                      <span className="text-xl font-bold tracking-tight">T-Mobile</span>
                      <span className="text-xl font-bold tracking-tight">Erste Group</span>
                      <span className="text-xl font-bold tracking-tight">Kyndryl</span>
                      <span className="text-xl font-bold tracking-tight">Adastra</span>
                    </div>
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
