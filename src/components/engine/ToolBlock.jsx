import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import {
  collapseSpring,
  gentleSpring,
  spring,
  expoOut,
} from "../../utils/animations";

export function SalesforceLogo({ className, style }) {
  return (
    <svg
      height={14}
      viewBox="0 0 100 16"
      xmlns="http://www.w3.org/2000/svg"
      className={`tool-logo tool-logo--salesforce ${className || ""}`}
      aria-label="Salesforce"
      style={{ width: "auto", minWidth: "70px", ...style }}
    >
      <path
        d="M7.2 4.8C8.0 3.1 9.8 2 11.8 2c1.4 0 2.7 0.5 3.7 1.4C16.2 2.5 17.6 2 19.1 2c2.8 0 5.1 2 5.4 4.6C25.5 7 26 7.9 26 9c0 2.2-1.8 4-4 4H5.5C3.6 13 2 11.4 2 9.5 2 7.9 3.1 6.5 4.6 6.1 4.5 5.8 4.5 5.4 4.5 5 4.5 2.8 6.3 1 8.5 1c-.3.5-.1.9-.1 1.4.0.8.2 1.6.5 2.1z"
        fill="none"
        stroke="#00A1E0"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <text
        x="29"
        y="11.5"
        fontSize="11"
        fontWeight="700"
        fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
        fill="#00A1E0"
        letterSpacing="0.1"
      >
        Salesforce
      </text>
    </svg>
  );
}

export function MicrosoftLogo({ className, style }) {
  return (
    <svg
      height={14}
      viewBox="0 0 88 16"
      xmlns="http://www.w3.org/2000/svg"
      className={`tool-logo tool-logo--microsoft ${className || ""}`}
      aria-label="Microsoft"
      style={{ width: "auto", minWidth: "60px", ...style }}
    >
      <rect x="0" y="0" width="6.5" height="6.5" fill="#f25022" />
      <rect x="7.5" y="0" width="6.5" height="6.5" fill="#7fba00" />
      <rect x="0" y="7.5" width="6.5" height="6.5" fill="#00a4ef" />
      <rect x="7.5" y="7.5" width="6.5" height="6.5" fill="#ffb900" />
      <text
        x="18"
        y="11.5"
        fontSize="11"
        fontWeight="300"
        fontFamily="'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif"
        fill="#d4d4d8"
        letterSpacing="0.3"
      >
        Microsoft
      </text>
    </svg>
  );
}

export function Neo4jLogo({ className, style }) {
  return (
    <svg
      height={13}
      width={13}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="tool-logo tool-logo--neo4j"
      aria-label="Neo4j"
    >
      <line
        x1="5"
        y1="5"
        x2="15"
        y2="5"
        stroke="#7dd3fc"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="5"
        y1="5"
        x2="10"
        y2="15"
        stroke="#7dd3fc"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="15"
        y1="5"
        x2="10"
        y2="15"
        stroke="#7dd3fc"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="5" cy="5" r="2.5" fill="#7dd3fc" />
      <circle cx="15" cy="5" r="2.5" fill="#7dd3fc" />
      <circle cx="10" cy="15" r="2.5" fill="#7dd3fc" />
    </svg>
  );
}

export function PromethistLogo({ className, style }) {
  return (
    <span
      className={`tool-logo tool-logo--promethist ${className || ""}`}
      style={{
        color: "#f97316",
        fontWeight: 600,
        fontFamily: "sans-serif",
        letterSpacing: "-0.02em",
        fontSize: "11px",
        lineHeight: 1,
        ...style,
      }}
      aria-label="PromethistAI"
    >
      PromethistAI
    </span>
  );
}

export function getToolIcon(type) {
  if (Array.isArray(type)) {
    return (
      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        {type.map((t, index) => (
          <span key={index}>{getSingleToolIcon(t)}</span>
        ))}
      </span>
    );
  }
  return getSingleToolIcon(type);
}

function getSingleToolIcon(type) {
  if (type === "crm") return <SalesforceLogo />;
  if (type === "rag") return <MicrosoftLogo />;
  if (type === "graph") return <Neo4jLogo />;
  if (type === "promethist") return <PromethistLogo />;
  return null;
}

export function ToolOutputLine({ label, value, type = "normal" }) {
  const isWarning = type === "warning";
  const [flash, setFlash] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setFlash(false), 500);
    return () => clearTimeout(t);
  }, []);
  return (
    <motion.div
      className="tool-output-line"
      variants={{
        hidden: { opacity: 0, x: -6 },
        visible: { opacity: 1, x: 0, transition: gentleSpring },
      }}
    >
      <span
        className={
          isWarning
            ? "tool-warn"
            : `tool-check ${flash ? "tool-check-flash" : ""}`
        }
      >
        {isWarning ? "⚠" : "✔"}
      </span>
      <span className="tool-output-label">{label}</span>
      <span className={`tool-output-value ${isWarning ? "highlight" : ""}`}>
        {value}
      </span>
    </motion.div>
  );
}

export function ToolBlock({ name, args, outputs, status, duration, toolType }) {
  const isCollapsed = status === "collapsed";
  const isActive = status === "running";
  const isDone = status === "done";

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={collapseSpring}
    >
      <AnimatePresence mode="popLayout" initial={true}>
        {isCollapsed ? (
          <motion.div
            key="collapsed"
            className="tool-collapsed"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { duration: 0.35, ease: expoOut },
            }}
          >
            <Check
              size={11}
              style={{ color: "var(--success)", opacity: 0.6 }}
            />
            <span className="tool-collapsed-name">{name}</span>
            <span className="tool-collapsed-summary">
              — {outputs?.map((o) => o.value).join(", ")}
            </span>
            {duration && (
              <span className="tool-collapsed-time">{duration}</span>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            className={`tool-block ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.25, ease: expoOut } }}
            transition={collapseSpring}
          >
            <div className="tool-header">
              <div className="tool-name">
                {getToolIcon(toolType)}
                {name}
              </div>
              <span className="tool-args">{args}</span>
              <div className="tool-status">
                <AnimatePresence mode="wait">
                  {isActive && !isDone && (
                    <motion.span
                      key="spin"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={spring}
                    >
                      <Loader2 size={12} className="spinner" />
                    </motion.span>
                  )}
                  {isDone && (
                    <motion.span
                      key="done"
                      initial={{ opacity: 0, scale: 0.2 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={spring}
                    >
                      <Check
                        size={12}
                        style={{ color: "var(--success)", opacity: 0.8 }}
                      />
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
            {outputs && outputs.length > 0 && (
              <motion.div
                className="tool-output"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.12 } },
                }}
                initial="hidden"
                animate="visible"
              >
                {outputs.map((o, i) => (
                  <ToolOutputLine key={i} {...o} />
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
