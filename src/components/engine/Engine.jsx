import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { fadeIn, fadeUp, expoOut, gentleSpring } from "../../utils/animations";
import { TypedText } from "../ui/TypedText";

export function EngineStatusLine({
  status,
  toolsDone,
  totalTools,
  contextNote,
}) {
  const isComplete = status === "complete";
  const isPaused = status === "paused";
  const isResumed = status === "resumed";
  const isStandby = status === "standby";

  const dotClass = [
    "engine-status-dot",
    isComplete ? "complete" : isPaused || isStandby ? "paused" : "active",
  ].join(" ");

  return (
    <motion.div
      className="engine-status-line"
      layout="position"
      {...fadeIn}
      exit={{ opacity: 0, transition: { duration: 0.3, ease: expoOut } }}
    >
      <span className="engine-status-label">
        <span className={dotClass} />
        Relational Intelligence Engine
      </span>

      {isPaused && <span className="engine-status-word">paused</span>}
      {isResumed && (
        <span className="engine-status-word resumed-label">resumed</span>
      )}

      <span className="line" />

      {contextNote && (
        <span className="engine-context-note">↳ {contextNote}</span>
      )}

      {!contextNote && (
        <span className="engine-status-counter">
          {isComplete ? (
            <>
              <Check
                size={9}
                style={{ color: "var(--success)", opacity: 0.6 }}
              />{" "}
              complete
            </>
          ) : isStandby ? (
            <span style={{ opacity: 0.4, fontStyle: "italic" }}>standby</span>
          ) : (
            <>
              {toolsDone}/{totalTools}
            </>
          )}
        </span>
      )}
    </motion.div>
  );
}

export function EngineSection({ children, aged, active, complete }) {
  const cls = [
    "engine-section",
    active ? "active" : "",
    complete ? "complete" : "",
    aged ? "aged" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.div
      className={cls}
      layout="position"
      initial={{ opacity: 0 }}
      animate={{ opacity: aged ? 0.15 : complete ? 0.35 : 1 }}
      transition={{ duration: 0.8, ease: expoOut }}
    >
      {children}
    </motion.div>
  );
}

export function ThoughtLine({ content, phase }) {
  const nums = ["①", "②", "③"];
  return (
    <motion.div
      className="thought-line"
      layout="position"
      {...fadeUp}
      exit={{ opacity: 0, transition: { duration: 0.25, ease: expoOut } }}
    >
      <span className="phase-num">{nums[phase - 1] || "·"}</span>
      <TypedText text={content} speed={18} />
    </motion.div>
  );
}

export function PhaseDot() {
  return (
    <motion.div
      className="phase-dot"
      layout="position"
      {...fadeIn}
      exit={{ opacity: 0, transition: { duration: 0.2, ease: expoOut } }}
    >
      ·
    </motion.div>
  );
}

export function SignalLine({ content }) {
  return (
    <motion.div
      layout="position"
      exit={{ opacity: 0, transition: { duration: 0.3, ease: expoOut } }}
    >
      <motion.div className="signal-rule" layout="position" {...fadeIn} />
      <motion.div
        className="signal-line signal-glow"
        layout="position"
        initial={{ opacity: 0, x: -4 }}
        animate={{ opacity: 1, x: 0 }}
        transition={gentleSpring}
      >
        <span className="signal-icon">◆</span>
        <div style={{ lineHeight: 1.7 }}>
          <div
            style={{
              fontWeight: 500,
              marginBottom: 2,
              fontSize: 10,
              opacity: 0.6,
              letterSpacing: "0.1em",
              textTransform: "lowercase",
            }}
          >
            inject signal
          </div>
          <div style={{ whiteSpace: "pre-wrap" }}>{content}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}
