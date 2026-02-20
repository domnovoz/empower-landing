import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

import {
  SIM,
  getAgentText,
  getUserText,
  FINAL_TEXT,
} from "./data/simulationData";
import { expoOut } from "./utils/animations";

import {
  TerminalHeader,
  UserMessage,
  AgentMessage,
  AgentStatus,
  ComposingDots,
  Connector,
  PromptIdle,
} from "./components/conversation/Conversation";
import {
  EngineStatusLine,
  EngineSection,
  ThoughtLine,
  PhaseDot,
  SignalLine,
} from "./components/engine/Engine";
import "./index.css";

import {
  ToolBlock,
  ToolOutputLine,
  PromethistLogo,
  Neo4jLogo,
  SalesforceLogo,
  MicrosoftLogo,
} from "./components/engine/ToolBlock";

export default function App({ onReplay = null }) {
  const [conversationStream, setConversationStream] = useState([]);
  const [engineStream, setEngineStream] = useState([]);
  const [tools, setTools] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [engineMeta, setEngineMeta] = useState({
    toolsDone: 0,
    totalTools: 4,
    contextNote: null,
    isCompact: false,
    isOpen: false,
    isComplete: false,
    isStandby: false,
  });

  const scrollRef = useRef(null);
  const scrollRAF = useRef(null);
  const timersRef = useRef([]);

  const scroll = useCallback(() => {
    if (scrollRAF.current) cancelAnimationFrame(scrollRAF.current);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = scrollRef.current;
        if (!el) return;
        const target = el.scrollHeight;
        const start = el.scrollTop;
        const distance = target - start;
        if (distance <= 0) return;
        const duration = Math.min(400, Math.max(150, distance * 0.8));
        const startTime = performance.now();
        const step = (now) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.scrollTop = start + distance * eased;
          if (progress < 1) scrollRAF.current = requestAnimationFrame(step);
        };
        scrollRAF.current = requestAnimationFrame(step);
      });
    });
  }, []);

  useEffect(() => {
    scroll();
  }, [conversationStream, engineStream, scroll]);

  const reset = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (scrollRAF.current) cancelAnimationFrame(scrollRAF.current);
    setConversationStream([]);
    setEngineStream([]);
    setTools({});
    setIsProcessing(false);
    setEngineMeta({
      toolsDone: 0,
      totalTools: 4,
      contextNote: null,
      isCompact: false,
      isOpen: false,
      isComplete: false,
      isStandby: false,
    });
  }, []);

  const run = useCallback(() => {
    reset();
    SIM.forEach((s) => {
      const timer = setTimeout(() => {
        switch (s.action) {
          case "USER_MSG":
            setConversationStream((p) => [
              ...p,
              { type: "user_msg", id: s.id },
            ]);
            break;
          case "AGENT_LISTENING":
            setConversationStream((p) => [
              ...p.filter((i) => i.type !== "agent_status"),
              { type: "agent_status", isThinking: false },
            ]);
            break;
          case "AGENT_THINKING":
            setConversationStream((p) => [
              ...p.filter((i) => i.type !== "agent_status"),
              { type: "agent_status", isThinking: true },
            ]);
            break;
          case "AGENT_MSG":
            setConversationStream((p) => [
              ...p.filter((i) => i.type !== "agent_status"),
              { type: "agent_msg", id: s.id },
            ]);
            break;

          case "ENGINE_OPEN":
            setIsProcessing(true);
            setEngineMeta((m) => ({ ...m, isOpen: true, isStandby: false }));
            break;

          case "THOUGHT":
            setEngineStream((p) => [
              ...p,
              { type: "thought", content: s.content, phase: s.phase },
            ]);
            break;
          case "PHASE_DOT":
            setEngineStream((p) => [...p, { type: "phase_dot" }]);
            break;
          case "TOOL_START":
            setTools((p) => ({
              ...p,
              [s.id]: {
                name: s.name,
                args: s.args,
                toolType: s.toolType,
                status: "running",
                outputs: [],
              },
            }));
            setEngineStream((p) => [...p, { type: "tool", id: s.id }]);
            break;
          case "TOOL_OUTPUT":
            setTools((p) => ({
              ...p,
              [s.id]: { ...p[s.id], outputs: s.outputs },
            }));
            break;
          case "TOOL_DONE":
            setTools((p) => ({ ...p, [s.id]: { ...p[s.id], status: "done" } }));
            setEngineMeta((m) => ({ ...m, toolsDone: m.toolsDone + 1 }));
            break;
          case "TOOL_COLLAPSE":
            setTools((p) => ({
              ...p,
              [s.id]: { ...p[s.id], status: "collapsed", duration: s.duration },
            }));
            break;

          case "ENGINE_ABSORB": {
            setEngineMeta((m) => ({ ...m, contextNote: s.content }));
            const absorbTimer = setTimeout(() => {
              setEngineMeta((m) => ({ ...m, contextNote: null }));
            }, 4000);
            timersRef.current.push(absorbTimer);
            break;
          }

          case "SIGNAL":
            setEngineStream((p) => [
              ...p,
              { type: "signal", content: s.content },
            ]);
            break;

          case "ENGINE_COMPLETE":
            setIsProcessing(false);
            setEngineMeta((m) => ({ ...m, isComplete: true }));
            break;

          case "COMPOSING":
            setConversationStream((p) => [...p, { type: "composing" }]);
            break;
          case "AGENT_FINAL": {
            setConversationStream((p) =>
              p.filter((item) => item.type !== "composing"),
            );
            const finalTimer = setTimeout(() => {
              setConversationStream((p) => [
                ...p,
                { type: "connector" },
                { type: "agent_final" },
              ]);
            }, 300);
            timersRef.current.push(finalTimer);
            break;
          }
          case "ENGINE_COMPACT":
            setEngineMeta((m) => ({ ...m, isCompact: true }));
            break;
        }
      }, s.t);
      timersRef.current.push(timer);
    });
  }, [reset]);

  useEffect(() => {
    run();
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const renderConversationItem = (item) => {
    switch (item.type) {
      case "user_msg":
        return (
          <UserMessage key={`u-${item.id}`} content={getUserText(item.id)} />
        );
      case "agent_status":
        return <AgentStatus key="as" isThinking={item.isThinking} />;
      case "agent_msg":
        return (
          <AgentMessage key={`a-${item.id}`} content={getAgentText(item.id)} />
        );
      case "composing":
        return <ComposingDots key="comp" />;
      case "connector":
        return <Connector key="conn" />;
      case "agent_final":
        return <AgentMessage key="af" content={FINAL_TEXT} isFinal />;
      case "idle":
        return <PromptIdle key="idle" />;
      default:
        return null;
    }
  };

  const renderEngineItem = (item, i) => {
    if (engineMeta.isCompact) return null;

    switch (item.type) {
      case "thought":
        return (
          <ThoughtLine
            key={`t-${i}`}
            content={item.content}
            phase={item.phase}
          />
        );
      case "tool": {
        const tool = tools[item.id];
        if (tool) return <ToolBlock key={`tb-${item.id}`} {...tool} />;
        return null;
      }
      case "phase_dot":
        return <PhaseDot key={`pd-${i}`} />;
      case "signal":
        return <SignalLine key={`s-${i}`} content={item.content} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="terminal">
        <TerminalHeader />
        <div ref={scrollRef} className="terminal-body">
          <AnimatePresence mode="popLayout">
            {conversationStream
              .filter(
                (item) =>
                  item.type !== "connector" && item.type !== "agent_final",
              )
              .map(renderConversationItem)}
          </AnimatePresence>

          <AnimatePresence mode="popLayout">
            {engineMeta.isOpen && (
              <motion.div
                key="engine-container"
                layout="position"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.4, ease: expoOut },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.3, ease: expoOut },
                }}
                className={engineMeta.isCompact ? "tool-block done" : ""}
                style={
                  engineMeta.isCompact
                    ? {
                      marginTop: "2px",
                      marginLeft: "36px",
                      width: "calc(100% - 36px)",
                      maxWidth: "440px",
                    }
                    : {}
                }
              >
                {(() => {
                  if (engineMeta.isOpen && !engineMeta.isCompact) {
                    return (
                      <motion.div
                        className="engine-block-wrapper"
                        layout="position"
                      >
                        <EngineStatusLine
                          status={engineMeta.isComplete ? "complete" : "active"}
                          toolsDone={engineMeta.toolsDone}
                          totalTools={engineMeta.totalTools}
                          contextNote={engineMeta.contextNote}
                        />
                        <EngineSection
                          active={!engineMeta.isComplete}
                          complete={engineMeta.isComplete}
                        >
                          <AnimatePresence mode="sync">
                            {engineStream.map(renderEngineItem)}
                          </AnimatePresence>
                        </EngineSection>
                      </motion.div>
                    );
                  }

                  if (engineMeta.isOpen && engineMeta.isCompact) {
                    return (
                      <motion.div
                        className="engine-block-wrapper"
                        layout="position"
                      >
                        <div
                          className="tool-header"
                          style={{
                            padding: "8px 12px",
                            borderBottom:
                              "1px solid var(--engine-glass-border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div
                            className="tool-name"
                            style={{
                              fontSize: "11px",
                              fontWeight: 500,
                              letterSpacing: "0.06em",
                              color: "var(--fg-dim)",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <span
                              className="engine-status-dot complete"
                              style={{ marginRight: "8px" }}
                            ></span>
                            Engine Summary
                          </div>
                          <div
                            className="tool-status"
                            style={{
                              width: "auto",
                              flexShrink: 0,
                              fontSize: "10px",
                              color: "var(--engine-metal)",
                              opacity: 0.6,
                              textTransform: "lowercase",
                              letterSpacing: "0.12em",
                            }}
                          >
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                              }}
                            >
                              <Check
                                size={10}
                                style={{
                                  color: "var(--success)",
                                  opacity: 0.6,
                                }}
                              />{" "}
                              processed
                            </span>
                          </div>
                        </div>
                        <div
                          className="tool-output"
                          style={{ paddingTop: "10px", paddingBottom: "12px" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "nowrap",
                              alignItems: "center",
                              gap: "10px",
                              marginBottom: "10px",
                              paddingLeft: "2px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "9px",
                                color: "var(--fg-dim)",
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                                opacity: 0.7,
                                flexShrink: 0,
                              }}
                            >
                              Contextualized:
                            </span>
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "14px",
                                opacity: 0.9,
                              }}
                            >
                              <PromethistLogo />
                              <Neo4jLogo />
                              <SalesforceLogo />
                              <MicrosoftLogo />
                            </span>
                          </div>
                          <ToolOutputLine
                            label="Conclusion"
                            value="Strategy finalized for Role Play"
                          />
                        </div>
                      </motion.div>
                    );
                  }

                  return null;
                })()}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="sync">
            {conversationStream
              .filter(
                (item) =>
                  item.type === "connector" || item.type === "agent_final",
              )
              .map(renderConversationItem)}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
