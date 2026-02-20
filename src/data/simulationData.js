export const USER_TEXT_1 = "My client just left, just can't find common ground on explaining why she should invest the crazy sum just lying on her account.";
export const AGENT_ACK = "Let me check. While I do that — when do you see her next?";
export const USER_TEXT_2 = "Hm, actually...";
export const USER_TEXT_3 = "Oh yes, it's tomorrow at 2.";
export const AGENT_DOTS = "...";
export const SIGNAL_CONTENT = `✕ Block Premium Portfolio — client rejected similar products\n→ Recommend Capital Protected Notes (97% fit)\n→ Suggest pitch role-play — advisor over-explains math`;
export const FINAL_TEXT = "Capital Protected Notes — 100% principal, simple story.\n\nSkip the math, she won't stay with you. Want to role-play the pitch before you go in?";
export const USER_SURE = "Sure!";

export const SIM = [
  // Opening conversation
  { t: 300, action: "USER_MSG", id: "user1" },
  { t: 1500, action: "AGENT_LISTENING" },
  { t: 2500, action: "AGENT_THINKING" },
  { t: 4500, action: "AGENT_MSG", id: "ack" },
  { t: 8200, action: "ENGINE_OPEN" }, // Opens after focus switch to terminal

  // Phase 1 engine
  {
    t: 9200,
    action: "THOUGHT",
    content: "Cross-referencing advisor profile with client risk tolerance",
    phase: 1,
  },
  {
    t: 10700,
    action: "TOOL_START",
    id: "ug",
    name: "Adaptive Memory",
    args: "advisor_profile",
    toolType: ["graph", "promethist"],
  },
  {
    t: 12200,
    action: "TOOL_OUTPUT",
    id: "ug",
    outputs: [
      { label: "Skill Level", value: "Novice — derivatives", type: "normal" },
      {
        label: "Pattern",
        value: "Over-explains math, loses clients",
        type: "normal",
      },
    ],
  },
  { t: 13700, action: "TOOL_DONE", id: "ug" },
  { t: 14700, action: "TOOL_COLLAPSE", id: "ug", duration: "0.8s" },
  { t: 15200, action: "PHASE_DOT" },

  // Phase 2 begins, user interrupts
  {
    t: 16500,
    action: "THOUGHT",
    content: "Advisor weak on derivatives — pulling client interaction history",
    phase: 2,
  },
  {
    t: 17500,
    action: "TOOL_START",
    id: "crm",
    name: "QueryCRM",
    args: 'client: "Novak, Jan"',
    toolType: "crm",
  },
  { t: 20000, action: "USER_MSG", id: "user2" },
  { t: 20100, action: "AGENT_LISTENING" },
  { t: 21500, action: "USER_MSG", id: "user3" },
  { t: 21600, action: "AGENT_LISTENING" },
  { t: 24000, action: "AGENT_MSG", id: "dots" },

  {
    t: 25500,
    action: "ENGINE_ABSORB",
    content: "follow-up tomorrow 2pm — updating strategy",
  },
  {
    t: 29000,
    action: "TOOL_OUTPUT",
    id: "crm",
    outputs: [
      { label: "Risk Profile", value: "Conservative", type: "normal" },
      {
        label: "History",
        value: 'Rejected Growth Funds Q3 \'24 — "too volatile"',
        type: "warning",
      },
    ],
  },
  { t: 30500, action: "TOOL_DONE", id: "crm" },
  { t: 31500, action: "TOOL_COLLAPSE", id: "crm", duration: "0.9s" },
  { t: 32000, action: "PHASE_DOT" },

  // Phase 3
  {
    t: 33000,
    action: "THOUGHT",
    content: "Client rejected volatility — filtering for principal-protected products",
    phase: 3,
  },
  {
    t: 34000,
    action: "TOOL_START",
    id: "rag",
    name: "ProductRAG",
    args: '"principal protection, low complexity"',
    toolType: "rag",
  },
  {
    t: 35500,
    action: "TOOL_OUTPUT",
    id: "rag",
    outputs: [
      {
        label: "Match",
        value: "Capital Protected Notes — 100% principal guarantee",
        type: "normal",
      },
      { label: "Fit", value: "97%", type: "normal" },
    ],
  },
  { t: 37000, action: "TOOL_DONE", id: "rag" },
  { t: 38000, action: "TOOL_COLLAPSE", id: "rag", duration: "0.6s" },

  // Promethist
  {
    t: 39000,
    action: "TOOL_START",
    id: "promethist",
    name: "Generating Role Play simulation",
    args: 'persona: "Risk-Averse Client (Novak)"',
    toolType: "promethist",
  },
  {
    t: 40500,
    action: "TOOL_OUTPUT",
    id: "promethist",
    outputs: [
      { label: "Status", value: "Simulation Ready", type: "normal" },
      { label: "Profile", value: "Novak (Loaded)", type: "normal" },
    ],
  },
  { t: 41500, action: "TOOL_DONE", id: "promethist" },
  { t: 42500, action: "TOOL_COLLAPSE", id: "promethist", duration: "1.2s" },

  // Complete
  { t: 43000, action: "SIGNAL", content: SIGNAL_CONTENT },
  { t: 43500, action: "ENGINE_COMPLETE" },
  { t: 44500, action: "COMPOSING" },
  { t: 45000, action: "AGENT_FINAL" },
  { t: 47500, action: "USER_MSG", id: "user_sure" },
  { t: 49000, action: "AGENT_LISTENING" },
  { t: 49500, action: "ENGINE_COMPACT" },
];

export const COACH_MESSAGES = [
  { t: 300, role: "user", text: USER_TEXT_1 },
  { t: 4500, role: "agent", text: AGENT_ACK },
  { t: 20000, role: "user", text: USER_TEXT_2 },
  { t: 21500, role: "user", text: USER_TEXT_3 },
  { t: 24000, role: "agent", text: AGENT_DOTS },
  { t: 45000, role: "agent", text: FINAL_TEXT },
  { t: 47500, role: "user", text: USER_SURE },
];

export const getAgentText = (id) => {
  if (id === "ack") return AGENT_ACK;
  if (id === "dots") return AGENT_DOTS;
  return "";
};

export const getUserText = (id) => {
  if (id === "user1") return USER_TEXT_1;
  if (id === "user2") return USER_TEXT_2;
  if (id === "user3") return USER_TEXT_3;
  if (id === "user_sure") return USER_SURE;
  return "";
};
