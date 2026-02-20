import React from "react";
import { motion } from "framer-motion";
import { fadeUp, expoOut } from "../../utils/animations";
import { TypedText } from "../ui/TypedText";

export function TerminalHeader() {
  return (
    <div className="terminal-header">
      <div className="terminal-dots">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export function UserMessage({ content }) {
  return (
    <motion.div className="msg-line" {...fadeUp}>
      <div>
        <span className="msg-role user">❯ user</span>
      </div>
      <div className="msg-content" style={{ paddingLeft: 16, marginTop: 3 }}>
        <TypedText text={content} speed={10} />
      </div>
    </motion.div>
  );
}

export function AgentMessage({ content, isFinal = false }) {
  return (
    <motion.div
      className="msg-line"
      initial={{ opacity: 0, y: 5 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: expoOut },
      }}
    >
      <div>
        <span className="msg-role agent">● agent</span>
      </div>
      <motion.div
        className={isFinal ? "msg-content-final" : "msg-content"}
        style={{ paddingLeft: isFinal ? undefined : 16, marginTop: 3 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: expoOut }}
      >
        <TypedText text={content} speed={16} />
      </motion.div>
    </motion.div>
  );
}

const statusEnter = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2, ease: expoOut } },
};
const statusExit = {
  opacity: 0,
  transition: { duration: 0.15, ease: expoOut },
};

export function AgentStatus({ isThinking }) {
  return (
    <motion.div className="msg-line" {...statusEnter} exit={statusExit}>
      <div>
        <span className="msg-role agent">● agent</span>
      </div>
      <div style={{ paddingLeft: 16, marginTop: 3 }}>
        <div className="agent-status">
          <span
            className={`agent-status-dot${isThinking ? " thinking" : ""}`}
          />
          <span>{isThinking ? "thinking..." : "listening..."}</span>
        </div>
      </div>
    </motion.div>
  );
}

export function ComposingDots() {
  return (
    <motion.div
      className="msg-line"
      {...fadeUp}
      exit={{
        opacity: 0,
        y: -3,
        transition: { duration: 0.25, ease: expoOut },
      }}
    >
      <div>
        <span className="msg-role agent">● agent</span>
      </div>
      <div className="composing" style={{ paddingLeft: 16 }}>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="composing-dot"
            animate={{ opacity: [0.12, 0.7, 0.12] }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export function Connector() {
  return (
    <motion.div
      className="connector"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.3, ease: expoOut } }}
    >
      <motion.div
        className="connector-line"
        initial={{ scaleY: 0 }}
        animate={{
          scaleY: 1,
          transition: { duration: 0.4, ease: expoOut, delay: 0.1 },
        }}
        style={{ transformOrigin: "top" }}
      />
    </motion.div>
  );
}

export function PromptIdle() {
  return (
    <motion.div className="prompt-idle" {...fadeUp}>
      <span className="dot" />
      <span>Awaiting input...</span>
      <span className="cursor" />
    </motion.div>
  );
}
