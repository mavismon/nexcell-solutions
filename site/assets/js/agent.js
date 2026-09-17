/* ==========================================================================
   Ask NexCell — site assistant
   Demo mode: scripted answers from the knowledge base below, no API calls.
   To go live, replace route() with a call to a serverless endpoint that sends
   the conversation to Claude, using this same knowledge as the system prompt.
   ========================================================================== */
(() => {
  "use strict";

  const STORE_KEY = "nexcell-agent-v1";

  /* ---------- Knowledge ---------- */
  const SERVICES = {
    audit: {
      name: "AI Strategy & Audit", id: "ai-strategy-audit",
      text: "A written, costed plan showing exactly where AI saves you time and money. We audit your processes across the team, rank opportunities by return, and you're under no obligation to build with us afterwards.",
    },
    agents: {
      name: "Automation & AI Agents", id: "automation-ai-agents",
      text: "Agents that take over repetitive work, like qualifying and triaging leads or internal ops tasks. Usually built on Claude, and yours to keep.",
    },
    custom: {
      name: "Custom AI Builds", id: "custom-ai-builds",
      text: "Bespoke systems for when off-the-shelf software won't do. Production code from week one, weekly demos, and it plugs into what you already run.",
    },
    data: {
      name: "Data & CRM", id: "data-crm",
      text: "Customer data organised and working, Salesforce included. Configuration and clean-up, data migration without the drama, and one source of truth for your team.",
    },
    training: {
      name: "Training & Enablement", id: "training-enablement",
      text: "Your team trained to run AI confidently without us. Hands-on sessions rather than manuals, documented for future hires.",
    },
    claude: {
      name: "NexCell for Claude", id: "nexcell-for-claude",
      text: "Claude configured to know your business before anyone types a word. Context loaded from your own data, so your team gets consistent answers. Set up in days, not months.",
    },
  };

  const serviceLink = (key) => `[${SERVICES[key].name}](services.html#${SERVICES[key].id})`;

  const START_CHIPS = ["What do you do?", "Where should I start?", "How much does it cost?", "Tell me about ConneX", "Talk to a person"];

  const INTENTS = [
    {
      id: "human", keys: ["human", "person", "someone", "call", "speak", "talk to", "contact", "phone", "book", "meeting", "audit call", "get in touch"],
      run: () => startLead(),
    },
    {
      id: "recommend", keys: ["start", "recommend", "which service", "not sure", "where do i", "help me choose", "what should", "suggest"],
      run: () => startRecommend(),
    },
    {
      id: "services", keys: ["what do you do", "services", "offer", "what you do", "sell", "help with"],
      run: () => reply(
        `We help UK businesses find, build and run AI that saves time and cuts cost. Six services:\n\n• ${Object.keys(SERVICES).map(serviceLink).join("\n• ")}`,
        ["Where should I start?", "How do you work?", "How much does it cost?"]
      ),
    },
    {
      id: "price", keys: ["cost", "price", "pricing", "how much", "budget", "expensive", "fee", "quote", "£"],
      run: () => reply(
        "We don't publish fixed prices, because a lead-triage agent and a CRM migration are very different jobs. What we do instead: the AI Strategy & Audit gives you a written, costed plan before you commit to any build. It starts with a free conversation about what's slow.",
        ["Book a free AI audit", "What's in the audit?", "How long does it take?"]
      ),
    },
    {
      id: "timeline", keys: ["how long", "timeline", "results", "weeks", "months", "quickly", "fast", "when"],
      run: () => reply(
        "You see working software early. Builds run against your real systems from week one, with a demo every week. How long a full build takes depends on the job, and the audit tells you that in writing before you commit.",
        ["How do you work?", "Book a free AI audit"]
      ),
    },
    {
      id: "process", keys: ["process", "how do you work", "how you work", "steps", "approach", "method"],
      run: () => reply(
        "Four steps:\n\n1. Audit & Strategy: map your workflows and cost every opportunity.\n2. Build & Integrate: production code against your real systems from week one.\n3. Test & Refine: stress-test with your team on real data.\n4. Launch & Enable: ship it, train your team, and leave when you don't need us.\n\n[See the full process](how-we-work.html)",
        ["How much does it cost?", "Book a free AI audit"]
      ),
    },
    {
      id: "data", keys: ["data safe", "security", "gdpr", "privacy", "secure", "confidential", "safe"],
      run: () => reply(
        "We build inside the systems you already use wherever we can, and handle personal data in line with UK GDPR. Specific security questions for your setup are best answered by the team directly, so they can be precise rather than general.",
        ["Talk to a person", "What do you do?"]
      ),
    },
    {
      id: "connex", keys: ["connex", "crm for estate", "product", "estate agency software"],
      run: () => reply(
        "ConneX is our own product: an AI-powered CRM and operating system for UK residential estate agencies. One record per property, per tenancy, per person, plus an AI receptionist that never misses a lead.\n\n[Explore ConneX](https://connexecosystem.com)",
        ["Do you only work with estate agencies?", "What do you do?"]
      ),
    },
    {
      id: "estate", keys: ["estate agen", "only work", "industries", "sectors", "who do you work", "property"],
      run: () => reply(
        "No. Estate agencies are a big part of what we do (it's why we built ConneX), but we work with UK businesses in professional services, healthcare, logistics, retail, manufacturing, education and more. If your team loses hours to repetitive work, we're worth a conversation.",
        ["Where should I start?", "Book a free AI audit"]
      ),
    },
    {
      id: "why-claude", keys: ["claude", "anthropic", "chatgpt", "openai", "which ai", "model", "llm"],
      run: () => reply(
        `Most of what we build runs on Claude. That means no lock-in to opaque black-box tools, and it's why we offer ${serviceLink("claude")}: Claude set up to know your business from day one.`,
        ["What do you do?", "Where should I start?"]
      ),
    },
    {
      id: "consultancy", keys: ["different", "consultancy", "slide", "deck", "why you", "why nexcell"],
      run: () => reply(
        "Most consultancies hand you a strategy deck. We hand you a written, costed plan, then build the thing in production code with weekly demos. We'll also tell you when AI isn't the answer.",
        ["How do you work?", "Book a free AI audit"]
      ),
    },
    {
      id: "location", keys: ["where are you", "location", "based", "london", "office", "address"],
      run: () => reply("We're based at 66 Paul Street, London EC2A 4NA, and work with businesses across the UK.", ["Talk to a person"]),
    },
    { id: "svc-audit", keys: ["audit", "strategy", "roadmap", "what's in the audit"], run: () => serviceReply("audit") },
    { id: "svc-agents", keys: ["agent", "automation", "automate", "repetitive", "lead qualification", "triage"], run: () => serviceReply("agents") },
    { id: "svc-custom", keys: ["custom", "bespoke", "build something", "software"], run: () => serviceReply("custom") },
    { id: "svc-data", keys: ["salesforce", "crm", "data migration", "customer data", "database"], run: () => serviceReply("data") },
    { id: "svc-training", keys: ["training", "train", "enablement", "upskill", "workshop"], run: () => serviceReply("training") },
    { id: "svc-claude", keys: ["nexcell for claude", "configure claude", "set up claude"], run: () => serviceReply("claude") },
    {
      id: "greet", keys: ["hi", "hello", "hey", "morning", "afternoon"],
      exact: true,
      run: () => reply("Hello. What would you like to know?", START_CHIPS),
    },
    {
      id: "thanks", keys: ["thanks", "thank you", "cheers", "great", "perfect"],
      run: () => reply("Any time. Anything else?", ["Book a free AI audit", "What do you do?"]),
    },
  ];

  function serviceReply(key) {
    const s = SERVICES[key];
    reply(`${s.name}: ${s.text}\n\n[Read more](services.html#${s.id})`, ["Book a free AI audit", "How much does it cost?", "What else do you do?"]);
  }

  /* ---------- Guided flows ---------- */
  let flow = null; // { type, step, data }

  const PAINS = [
    { label: "Admin and data entry", service: "agents", why: "repetitive admin is exactly what agents are for" },
    { label: "Missing or slow enquiries", service: "agents", why: "a lead-triage agent can answer and qualify enquiries around the clock" },
    { label: "Messy customer data", service: "data", why: "everything else works better once there's one clean source of truth" },
    { label: "Team doesn't use AI well", service: "training", why: "tools only save time if people are confident using them" },
    { label: "Not sure where AI fits", service: "audit", why: "you'll get a costed list of where AI actually pays off before spending on a build" },
  ];

  function startRecommend() {
    flow = { type: "recommend", step: "pain", data: {} };
    reply("Two quick questions. What's costing your team the most time right now?", PAINS.map((p) => p.label));
  }

  function startLead() {
    flow = { type: "lead", step: "name", data: {} };
    reply("I can pass your details to the team, who reply within one business day. What's your name?", []);
  }

  function handleFlow(text) {
    const t = text.trim();
    const { data } = flow;

    if (/^(cancel|stop|never ?mind|exit)$/i.test(t)) {
      flow = null;
      return reply("No problem. What else can I help with?", START_CHIPS), true;
    }

    if (flow.type === "recommend") {
      if (flow.step === "pain") {
        const pain = PAINS.find((p) => p.label.toLowerCase() === t.toLowerCase())
          || PAINS.find((p) => t.toLowerCase().split(/\s+/).some((w) => w.length > 3 && p.label.toLowerCase().includes(w)))
          || PAINS[4];
        data.pain = pain;
        flow.step = "size";
        reply("And roughly how many people are in the team?", ["1–10", "11–50", "51–250", "250+"]);
        return true;
      }
      if (flow.step === "size") {
        const { pain } = data;
        const bigTeam = /51|250/.test(t);
        flow = null;
        let extra = "";
        if (pain.service !== "audit") {
          extra = bigTeam
            ? `\n\nWith a team that size, it's worth starting with the ${serviceLink("audit")} so the build goes where the return is highest.`
            : `\n\nIf you'd like the full picture first, the ${serviceLink("audit")} ranks every opportunity by return.`;
        }
        reply(
          `Based on that, I'd start with ${serviceLink(pain.service)}, because ${pain.why}.${extra}\n\nThis is a starting point, not a quote. The team will confirm on a free call.`,
          ["Book a free AI audit", "How much does it cost?", "How do you work?"]
        );
        return true;
      }
    }

    if (flow.type === "lead") {
      if (flow.step === "name") {
        data.name = t.slice(0, 80);
        flow.step = "email";
        reply(`Thanks, ${data.name.split(" ")[0]}. What's the best email to reach you on?`, []);
        return true;
      }
      if (flow.step === "email") {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) {
          reply("That doesn't look like an email address. Could you check it?", ["Cancel"]);
          return true;
        }
        data.email = t;
        flow.step = "company";
        reply("Which company are you with?", ["Skip"]);
        return true;
      }
      if (flow.step === "company") {
        data.company = /^skip$/i.test(t) ? "" : t.slice(0, 120);
        flow.step = "message";
        reply("Last one: in a sentence or two, what's slow or costing you time?", []);
        return true;
      }
      if (flow.step === "message") {
        data.message = t.slice(0, 1000);
        flow = null;
        lead = data;
        reply(
          `Here's what I've got:\n\nName: ${data.name}\nEmail: ${data.email}${data.company ? `\nCompany: ${data.company}` : ""}\nWhat's slow: ${data.message}\n\nThis is a demo assistant, so it can't send messages itself. I can fill in the contact form on this page for you to review and send.`,
          ["Fill in the contact form", "Start again"]
        );
        return true;
      }
    }
    return false;
  }

  let lead = null;

  /* ---------- Matching ---------- */
  const norm = (s) => s.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ").trim();

  function matchIntent(text) {
    const t = norm(text);
    let best = null;
    let bestScore = 0;
    for (const intent of INTENTS) {
      let score = 0;
      for (const k of intent.keys) {
        if (intent.exact ? new RegExp(`^${k}\\b`).test(t) : t.includes(k)) score += k.length;
      }
      if (score > bestScore) { best = intent; bestScore = score; }
    }
    return best;
  }

  function route(text) {
    const t = norm(text);

    if (t === "fill in the contact form" && lead) {
      const ok = window.NexCell?.prefillContact?.(lead);
      if (ok) {
        close();
        return;
      }
      return reply(`Email the team at [contact@nexcellsolutions.com](mailto:contact@nexcellsolutions.com?subject=${encodeURIComponent("Enquiry from " + lead.name)}&body=${encodeURIComponent(lead.message)}).`, START_CHIPS);
    }
    if (t === "start again") { flow = null; lead = null; return reply("Sure. What would you like to know?", START_CHIPS); }
    if (t === "book a free ai audit") return startLead();
    if (t === "what else do you do?") return matchIntent("services").run();

    if (flow && handleFlow(text)) return;

    const intent = matchIntent(text);
    if (intent) return intent.run();

    reply(
      "I'm running in demo mode with scripted answers, so I didn't catch that one. Try one of these, or leave your details and a person will answer properly.",
      START_CHIPS
    );
  }

  /* ---------- UI ---------- */
  let root, log, chipsEl, input, launcher;
  let history = [];

  function build() {
    launcher = document.createElement("button");
    launcher.type = "button";
    launcher.className = "agent-launcher";
    launcher.setAttribute("aria-haspopup", "dialog");
    launcher.setAttribute("aria-controls", "agent");
    launcher.innerHTML = '<span class="agent-launcher__icon"><img src="assets/icons/bot.svg" alt="" width="20" height="20"></span>Ask NexCell';

    root = document.createElement("section");
    root.className = "agent";
    root.id = "agent";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-label", "Ask NexCell assistant");
    root.setAttribute("aria-hidden", "true");
    root.innerHTML = `
      <header class="agent__head">
        <span class="agent__avatar"><img src="assets/icons/logo-mark.svg" alt="" width="20" height="20"></span>
        <span class="agent__title"><strong>Ask NexCell</strong><span>Usually answers instantly</span></span>
        <button type="button" class="agent__close" aria-label="Close assistant"><span></span><span></span></button>
      </header>
      <p class="agent__notice">Demo mode: scripted answers, no live AI. Nothing you type is sent anywhere.</p>
      <div class="agent__log" role="log" aria-live="polite" aria-relevant="additions"></div>
      <div class="agent__chips" aria-label="Suggested questions"></div>
      <form class="agent__form" autocomplete="off">
        <label for="agent-input" class="sr-only">Your question</label>
        <input id="agent-input" name="q" type="text" placeholder="Ask about services, cost, process…" maxlength="500">
        <button type="submit" class="btn btn--dark">Send</button>
      </form>`;

    document.body.append(launcher, root);
    log = root.querySelector(".agent__log");
    chipsEl = root.querySelector(".agent__chips");
    input = root.querySelector("input");

    launcher.addEventListener("click", open);
    root.querySelector(".agent__close").addEventListener("click", close);
    root.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault();
      send(input.value);
    });
    chipsEl.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (b) send(b.textContent);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.body.classList.contains("agent-open")) close();
    });
    document.querySelectorAll("[data-open-agent]").forEach((el) =>
      el.addEventListener("click", (e) => { e.preventDefault(); open(); })
    );

    restore();
  }

  function open() {
    document.body.classList.add("agent-open");
    root.setAttribute("aria-hidden", "false");
    launcher.setAttribute("aria-expanded", "true");
    if (!history.length) {
      reply("Hi, I'm the NexCell assistant. I can explain what we do, suggest where to start, or pass your details to the team.", START_CHIPS, 0);
    }
    setTimeout(() => input.focus({ preventScroll: true }), 200);
  }

  function close() {
    document.body.classList.remove("agent-open");
    root.setAttribute("aria-hidden", "true");
    launcher.setAttribute("aria-expanded", "false");
    launcher.focus({ preventScroll: true });
  }

  function send(raw) {
    const text = String(raw || "").trim();
    if (!text) return;
    input.value = "";
    addMessage("user", text);
    setChips([]);
    route(text);
  }

  // Renders [label](href) as links; everything else as plain text.
  function renderRich(el, text) {
    const re = /\[([^\]]+)\]\(([^)\s]+)\)/g;
    let last = 0;
    let m;
    while ((m = re.exec(text))) {
      el.append(document.createTextNode(text.slice(last, m.index)));
      const a = document.createElement("a");
      a.textContent = m[1];
      a.href = m[2];
      if (/^https?:/.test(m[2])) { a.target = "_blank"; a.rel = "noopener"; }
      el.append(a);
      last = re.lastIndex;
    }
    el.append(document.createTextNode(text.slice(last)));
  }

  function addMessage(role, text, save = true) {
    const div = document.createElement("div");
    div.className = `msg msg--${role}`;
    if (role === "bot") renderRich(div, text); else div.textContent = text;
    log.append(div);
    log.scrollTop = log.scrollHeight;
    if (save) { history.push({ role, text }); persist(); }
  }

  function setChips(chips) {
    chipsEl.replaceChildren(...chips.map((c) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = c;
      return b;
    }));
  }

  function reply(text, chips = [], delay = 450) {
    const typing = document.createElement("div");
    typing.className = "msg msg--bot msg--typing";
    typing.setAttribute("aria-label", "Assistant is typing");
    typing.innerHTML = "<i></i><i></i><i></i>";
    if (delay) { log.append(typing); log.scrollTop = log.scrollHeight; }

    setTimeout(() => {
      typing.remove();
      addMessage("bot", text);
      setChips(chips);
      lastChips = chips;
      persist();
    }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : delay);
  }

  /* ---------- Persist across pages (per tab) ---------- */
  let lastChips = [];

  function persist() {
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify({ history: history.slice(-40), chips: lastChips, lead }));
    } catch { /* storage unavailable: conversation just won't carry over */ }
  }

  function restore() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORE_KEY) || "null");
      if (!saved?.history?.length) return;
      history = saved.history;
      lead = saved.lead || null;
      history.forEach((m) => addMessage(m.role, m.text, false));
      lastChips = saved.chips || [];
      setChips(lastChips);
    } catch { /* ignore */ }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
