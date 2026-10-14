/* Local interactive example. Replies are deterministic; no service is contacted. */
(() => {
  const $ = (id) => document.getElementById(id);
  const storageKey = "prototype-chat-demo.v1";
  const mobile = matchMedia("(max-width: 760px)");
  const systemAppearance = matchMedia("(prefers-color-scheme: dark)");
  const seeds = [
    { id: "weekend", title: "A slower weekend", messages: [
      { id: "weekend-you", role: "user", text: "Help me plan a weekend that feels slower, without overplanning it." },
      { id: "weekend-reply", role: "assistant", text: "A good weekend needs a little shape and plenty of room. Pick one thing to look forward to each day, and leave the rest open.\n\n### Saturday · get outside\n- Start with breakfast somewhere you can linger.\n- Take a walk without turning it into a workout.\n- Leave the afternoon unplanned. A book, a nap, or neither.\n\n### Sunday · make space\n- Do one small thing that makes your home feel calmer.\n- Cook something simple and put your phone away.\n- Give Monday ten minutes of preparation, then call it a day.\n\nThe idea is to come back rested, not with another list completed." },
    ] },
    { id: "words", title: "Finding the right words", messages: [
      { id: "words-you", role: "user", text: "Write a friendly note asking a teammate for feedback on an early idea." },
      { id: "words-reply", role: "assistant", text: "Here’s a note that leaves room for an honest answer:\n\nHi! I’ve been thinking about a small change to our workflow and would love your perspective. It’s still an early idea, so I’m especially interested in what feels useful and what I might be missing.\n\nWould you have a few minutes to take a look this week? No need for a polished review — a first reaction would help a lot." },
    ] },
    { id: "workspace", title: "A more focused workspace", messages: [
      { id: "workspace-you", role: "user", text: "How can I make my workspace less distracting?" },
      { id: "workspace-reply", role: "assistant", text: "Start by making the next task easier to see than everything else.\n\n- Keep only the tools for your current task within reach.\n- Put your phone somewhere that requires a deliberate choice to pick it up.\n- Keep a small note for things you remember, so they don’t become new tabs.\n\nTry one change for an afternoon. Keep it if it helps; remove it if it adds friction." },
    ] },
    { id: "learning", title: "Learning without the overwhelm", messages: [
      { id: "learning-you", role: "user", text: "Help me find a manageable way to learn something new." },
      { id: "learning-reply", role: "assistant", text: "Give curiosity a small, repeatable place in your day.\n\n### A simple starting point\n- Choose one question you genuinely want answered.\n- Spend a short session on a single explanation or example.\n- Close it and explain the idea in your own words.\n- Try one small thing before collecting more material.\n\nYou don’t need the complete map before taking the first step." },
    ] },
  ];
  let state = { chats: structuredClone(seeds), active: "weekend", style: "everyday", appearance: "system" };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && Array.isArray(saved.chats) && saved.chats.length && saved.chats.length <= 40 &&
        saved.chats.every(chat => typeof chat.id === "string" && typeof chat.title === "string" && Array.isArray(chat.messages) && chat.messages.every(message => ["user", "assistant"].includes(message.role) && typeof message.id === "string" && typeof message.text === "string")) &&
        saved.chats.some(chat => chat.id === saved.active)) {
      state = { ...state, ...saved };
      if (!["system", "light", "dark"].includes(state.appearance)) state.appearance = "system";
      if (!["everyday", "thoughtful"].includes(state.style)) state.style = "everyday";
    }
  } catch { /* Sandboxed frames keep the same functionality in memory. */ }
  let attachments = [], editing = null, generation = null, sidebarOpen = false, desktopCollapsed = false;
  let autoScroll = true, toastTimer;
  const uid = () => "item-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  const activeChat = () => state.chats.find(chat => chat.id === state.active);
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch { /* Storage is optional. */ }
  }
  function rememberDraft() {
    activeChat().draft = $("message-input").value;
    activeChat().draftFiles = attachments;
  }
  function element(tag, className, text) {
    const result = document.createElement(tag);
    if (className) result.className = className;
    if (text !== undefined) result.textContent = text;
    return result;
  }
  function icon(name) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "icon"); svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", "#i-" + name); svg.append(use); return svg;
  }
  function iconButton(name, label, callback) {
    const button = element("button", "icon-button");
    button.type = "button"; button.setAttribute("aria-label", label); button.title = label;
    button.append(icon(name)); button.addEventListener("click", callback); return button;
  }
  function announce(text) { $("announcer").textContent = text; }
  function notify(text) {
    clearTimeout(toastTimer); $("toast").textContent = text; $("toast").hidden = false; announce(text);
    toastTimer = setTimeout(() => { $("toast").hidden = true; }, 2400);
  }
  function applyAppearance() {
    const theme = state.appearance === "system" ? (systemAppearance.matches ? "dark" : "light") : state.appearance;
    document.documentElement.dataset.dsTheme = theme;
    const label = state.appearance[0].toUpperCase() + state.appearance.slice(1) + " appearance";
    $("appearance-label").textContent = label;
    $("appearance").setAttribute("aria-label", label + ". Change appearance");
    if (parent !== window) parent.postMessage({ type: "preview:appearance", theme }, "*");
  }
  const query = new URLSearchParams(location.search);
  for (const name of ["safeTop", "safeBottom"]) {
    const value = Number(query.get(name) || 0);
    if (Number.isInteger(value) && value >= 0 && value < innerHeight) {
      document.documentElement.style.setProperty(name === "safeTop" ? "--preview-safe-top" : "--preview-safe-bottom", value + "px");
    }
  }
  function setSidebar(open, restoreFocus = false) {
    if (mobile.matches) sidebarOpen = open;
    else desktopCollapsed = !open;
    const visible = mobile.matches ? sidebarOpen : !desktopCollapsed;
    $("app").classList.toggle("sidebar-open", mobile.matches && sidebarOpen);
    $("app").classList.toggle("sidebar-collapsed", !mobile.matches && desktopCollapsed);
    $("sidebar-scrim").hidden = !(mobile.matches && sidebarOpen);
    $("sidebar").inert = !visible;
    $("sidebar").setAttribute("aria-hidden", String(!visible));
    $("toggle-sidebar").setAttribute("aria-expanded", String(visible));
    $("main-panel").inert = mobile.matches && sidebarOpen;
    if (mobile.matches && sidebarOpen) {
      $("sidebar").setAttribute("role", "dialog"); $("sidebar").setAttribute("aria-modal", "true");
      $("close-sidebar").focus();
    } else {
      $("sidebar").removeAttribute("role"); $("sidebar").removeAttribute("aria-modal");
      if (restoreFocus) $("toggle-sidebar").focus();
    }
  }
  function renderNavigation() {
    const filter = $("chat-search").value.trim().toLowerCase();
    const list = $("conversation-list"); list.replaceChildren();
    const chats = state.chats.filter(chat => (chat.title + " " + chat.messages.map(message => message.text).join(" ")).toLowerCase().includes(filter));
    for (const chat of chats) {
      const button = element("button", "conversation-row", chat.title); button.type = "button";
      if (chat.id === state.active) button.setAttribute("aria-current", "page");
      button.onclick = () => switchChat(chat.id); list.append(button);
    }
    $("search-empty").hidden = chats.length !== 0;
  }
  function renderBody(container, text) {
    container.replaceChildren();
    let paragraph = [], list = null, code = null;
    function flush() {
      if (paragraph.length) container.append(element("p", "", paragraph.join("\n")));
      paragraph = []; list = null;
    }
    for (const line of text.split("\n")) {
      if (line.startsWith("```")) {
        flush();
        if (code) code = null;
        else { const pre = element("pre"); code = element("code"); pre.append(code); container.append(pre); }
      } else if (code) code.textContent += line + "\n";
      else if (line.startsWith("### ")) { flush(); container.append(element("h3", "", line.slice(4))); }
      else if (line.startsWith("- ")) {
        if (!list) { flush(); list = element("ul"); container.append(list); }
        list.append(element("li", "", line.slice(2)));
      } else if (!line.trim()) flush();
      else { if (list) list = null; paragraph.push(line); }
    }
    flush();
  }
  function scrollToEnd() { if (autoScroll) $("message-stage").scrollTop = $("message-stage").scrollHeight; }
  function renderMessages() {
    const chat = activeChat(); const empty = chat.messages.length === 0;
    $("empty-state").hidden = !empty; $("conversation").hidden = empty;
    $("conversation-title").textContent = chat.title;
    $("messages").replaceChildren();
    for (const [index, message] of chat.messages.entries()) {
      const article = element("article", "message " + message.role); article.dataset.messageId = message.id;
      if (editing === message.id) article.append(editForm(chat, message, index));
      else {
        if (message.role === "assistant") {
          const label = element("div", "assistant-label"); label.append(icon("mark"), element("span", "", "Clarity")); article.append(label);
        } else article.append(element("span", "visually-hidden", "You"));
        if (Array.isArray(message.files) && message.files.length) {
          const files = element("div", "message-files");
          for (const file of message.files) { const chip = element("div", "file-chip"); chip.append(icon("file"), element("span", "", file.name)); files.append(chip); }
          article.append(files);
        }
        const body = element("div", "message-body");
        if (generation?.message === message) { body.classList.add("streaming"); body.textContent = message.text; }
        else renderBody(body, message.text);
        article.append(body);
        if (generation?.message !== message) {
          const actions = element("div", "message-actions");
          if (message.role === "user") actions.append(iconButton("write", "Edit message", () => { stopGeneration(); editing = message.id; renderMessages(); articleFor(message.id)?.querySelector("textarea")?.focus(); }));
          else {
            actions.append(iconButton("copy", "Copy reply", () => copyReply(message.text)));
            if (index === chat.messages.length - 1) actions.append(iconButton("retry", "Try again", () => regenerate(chat, index)));
          }
          article.append(actions);
        }
      }
      $("messages").append(article);
    }
    if (empty) { autoScroll = false; $("message-stage").scrollTop = 0; }
    else requestAnimationFrame(scrollToEnd);
  }
  function articleFor(id) { return [...$("messages").children].find(article => article.dataset.messageId === id); }
  function editForm(chat, message, index) {
    const form = element("form", "edit-form"); const input = element("textarea");
    input.value = message.text; input.maxLength = 4000; input.setAttribute("aria-label", "Edit your message");
    const actions = element("div", "edit-actions");
    const cancel = element("button", "ds-button secondary", "Cancel"); cancel.type = "button";
    cancel.onclick = () => { editing = null; renderMessages(); };
    const submit = element("button", "ds-button", "Save & send"); submit.type = "submit";
    actions.append(cancel, submit); form.append(input, actions);
    form.onsubmit = event => {
      event.preventDefault(); const text = input.value.trim(); if (!text) { input.focus(); return; }
      message.text = text; chat.messages.splice(index + 1); editing = null; autoScroll = true;
      save(); startReply(chat, message, 0);
    };
    return form;
  }
  async function copyReply(text) {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const previous = document.activeElement; const input = element("textarea", "visually-hidden");
      input.value = text; document.body.append(input); input.select();
      const copied = document.execCommand("copy"); input.remove(); previous?.focus();
      if (!copied) { notify("Copy is unavailable in this preview. Open the page directly."); return; }
    }
    notify("Reply copied");
  }
  function replyFor(user, variant) {
    const text = user.text.toLowerCase();
    let reply;
    if (/weekend|plan|slower|simpler/.test(text)) reply = variant % 2 ?
      "Try giving each day just one anchor.\n\n- Saturday: a long walk and an easy meal.\n- Sunday: a little time at home and something you enjoy.\n\nKeep the space between those things free. If the plan starts feeling like work, make it smaller." :
      "Let’s make it lighter. Pick one thing for each day, then leave room around it.\n\n### Your starting point\n- Saturday: get outside for a walk, followed by a meal you don’t have to rush.\n- Sunday: make one corner of home feel calmer, then spend time on something you enjoy.\n\nYou can change either plan on the day. A good plan supports you; it doesn’t become another assignment.";
    else if (/write|note|feedback|words/.test(text)) reply = variant % 2 ?
      "Here’s a shorter version:\n\nHi! I’m exploring an idea and would value your honest first impression. Could I send it over this week? I’m especially curious about what feels useful and what’s missing.\n\nKeeping the request specific makes it easier to answer." :
      "Here’s a simple starting point:\n\nHi! I’ve been working through an early idea and would love your perspective. It’s still rough, so an honest first reaction would be more useful than a polished review.\n\nWould you have a few minutes this week? I’m especially interested in what feels useful, and what I might be overlooking.\n\nAdjust the opening so it sounds like you.";
    else if (/learn|explain|subject/.test(text)) reply = "Start with one question instead of a complete curriculum.\n\n- Read one explanation or work through one small example.\n- Describe what you understood without looking at your notes.\n- Try something small enough to finish in a single session.\n\nLet the next question come from that attempt. Progress is easier to notice when you make something, not just collect material.";
    else if (/idea|product|design|prototype/.test(text)) reply = "Bring the idea down to one useful moment.\n\n### A first step\n- Name the person you’re helping and what they’re trying to do.\n- Choose the smallest task your idea can make easier.\n- Build a working example of that moment.\n- Try it, notice the friction, and change one thing.\n\nYou don’t need the complete product to learn whether the core idea helps.";
    else reply = "Let’s give this a little shape.\n\n- What would a useful outcome look like for you?\n- Which part can we make concrete first?\n- What can stay simple while you try it?\n\nChoose one small next step and we can work from there. This example shows the conversation flow; its replies are simulated.";
    if (user.files?.length) reply = "I have your attached text in this local demo:\n" + user.files.map(file => "- " + file.name + " · " + file.text.trim().split(/\s+/).filter(Boolean).length + " words").join("\n") + "\n\n" + reply;
    if (state.style === "thoughtful") reply += "\n\n### Why start here\nA small, reversible step gives you something real to react to. Keep what helps and adjust what doesn’t before adding more.";
    return reply;
  }
  function updateComposer() {
    const button = $("send-message"); button.replaceChildren();
    button.disabled = !generation && !$("message-input").value.trim() && !attachments.length;
    button.setAttribute("aria-label", generation ? "Stop reply" : "Send message");
    button.append(generation ? element("span", "stop-icon") : icon("arrow"));
    $("attach-file").disabled = Boolean(generation);
  }
  function stopGeneration() {
    if (!generation) return;
    cancelAnimationFrame(generation.frame); const stopped = generation;
    generation = null;
    if (!stopped.message.text) stopped.chat.messages = stopped.chat.messages.filter(message => message !== stopped.message);
    save(); renderMessages(); updateComposer(); announce("Reply stopped.");
  }
  function startReply(chat, user, variant) {
    stopGeneration(); editing = null;
    const message = { id: uid(), role: "assistant", text: "", variant };
    const full = replyFor(user, variant); chat.messages.push(message);
    const stream = { chat, message, full, started: null, frame: null }; generation = stream;
    renderNavigation(); renderMessages(); updateComposer(); announce("Writing a simulated reply.");
    function frame(time) {
      if (generation !== stream) return;
      if (stream.started === null) stream.started = time;
      const length = Math.min(full.length, Math.max(1, Math.floor((time - stream.started) * 0.22)));
      message.text = full.slice(0, length);
      const body = articleFor(message.id)?.querySelector(".message-body");
      if (body) body.textContent = message.text;
      scrollToEnd();
      if (length < full.length) stream.frame = requestAnimationFrame(frame);
      else { generation = null; save(); renderMessages(); updateComposer(); announce("Reply ready. Replies in this demo are simulated."); }
    }
    stream.frame = requestAnimationFrame(frame);
  }
  function regenerate(chat, index) {
    stopGeneration(); const previous = chat.messages[index];
    const user = [...chat.messages.slice(0, index)].reverse().find(message => message.role === "user");
    if (!user) return; chat.messages.splice(index); autoScroll = true;
    startReply(chat, user, (previous.variant || 0) + 1);
  }
  function resizeInput() {
    $("message-input").style.height = "auto";
    $("message-input").style.height = Math.min($("message-input").scrollHeight, parseFloat(getComputedStyle(document.documentElement).fontSize) * 10) + "px";
  }
  function renderAttachments() {
    const list = $("attachment-list"); list.replaceChildren(); list.hidden = !attachments.length;
    for (const file of attachments) {
      const chip = element("div", "file-chip"); chip.append(icon("file"), element("span", "", file.name), iconButton("close", "Remove " + file.name, () => { attachments = attachments.filter(item => item !== file); renderAttachments(); updateComposer(); }));
      list.append(chip);
    }
  }
  function submitMessage(text = $("message-input").value) {
    if (generation) { stopGeneration(); return; }
    text = text.trim(); if (!text && !attachments.length) return;
    const chat = activeChat(); const message = { id: uid(), role: "user", text: text || "Help me think through the attached text.", files: attachments };
    if (!chat.messages.length) chat.title = (text || attachments[0].name).slice(0, 38) + ((text || attachments[0].name).length > 38 ? "…" : "");
    chat.messages.push(message); chat.draft = ""; chat.draftFiles = [];
    attachments = []; $("message-input").value = ""; editing = null; autoScroll = true;
    renderAttachments(); resizeInput(); save(); startReply(chat, message, 0);
  }
  function switchChat(id) {
    rememberDraft(); stopGeneration(); state.active = id; editing = null; autoScroll = true;
    attachments = Array.isArray(activeChat().draftFiles) ? activeChat().draftFiles : [];
    $("message-input").value = typeof activeChat().draft === "string" ? activeChat().draft : "";
    renderAttachments(); resizeInput(); setSidebar(!mobile.matches && !desktopCollapsed);
    renderNavigation(); renderMessages(); updateComposer(); save();
    if (mobile.matches) $("toggle-sidebar").focus();
  }
  function newChat() {
    stopGeneration();
    const empty = state.chats.find(chat => !chat.messages.length);
    if (empty) switchChat(empty.id);
    else {
      if (state.chats.length >= 40) { notify("This demo supports up to 40 conversations. Continue an existing chat."); return; }
      rememberDraft(); const chat = { id: uid(), title: "New conversation", messages: [] };
      state.chats.unshift(chat); switchChat(chat.id);
    }
    $("chat-search").value = ""; renderNavigation(); $("message-input").focus(); announce("New conversation.");
  }
  $("composer").onsubmit = event => { event.preventDefault(); submitMessage(); };
  $("message-input").oninput = () => { resizeInput(); updateComposer(); };
  $("message-input").onkeydown = event => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing && !generation) { event.preventDefault(); submitMessage(); }
  };
  $("chat-search").oninput = renderNavigation;
  $("new-chat").onclick = newChat; $("header-new-chat").onclick = newChat;
  $("toggle-sidebar").onclick = () => setSidebar(mobile.matches ? !sidebarOpen : desktopCollapsed);
  $("close-sidebar").onclick = () => setSidebar(false, true);
  $("sidebar-scrim").onclick = () => setSidebar(false, true);
  $("sidebar").onkeydown = event => {
    if (!mobile.matches || !sidebarOpen) return;
    if (event.key === "Escape") { event.preventDefault(); setSidebar(false, true); }
    if (event.key === "Tab") {
      const controls = [...$("sidebar").querySelectorAll("button,input")].filter(control => !control.disabled && control.getClientRects().length);
      if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls.at(-1).focus(); }
      else if (!event.shiftKey && document.activeElement === controls.at(-1)) { event.preventDefault(); controls[0].focus(); }
    }
  };
  mobile.addEventListener("change", () => { sidebarOpen = false; setSidebar(!mobile.matches && !desktopCollapsed); });
  $("appearance").onclick = () => {
    const values = ["system", "light", "dark"]; state.appearance = values[(values.indexOf(state.appearance) + 1) % values.length];
    applyAppearance(); save(); announce($("appearance-label").textContent);
  };
  systemAppearance.addEventListener("change", applyAppearance);
  $("response-style").value = state.style;
  $("response-style").onchange = () => { state.style = $("response-style").value; save(); announce("Response style changed."); };
  $("attach-file").onclick = () => $("file-input").click();
  $("file-input").onchange = async () => {
    const target = activeChat();
    for (const file of $("file-input").files) {
      if (file.size > 100_000 || !/\.(txt|md)$/i.test(file.name)) { notify("Choose a .txt or .md file smaller than 100 KB."); continue; }
      if (attachments.length >= 3) { notify("You can attach up to three text files."); break; }
      try {
        const text = await file.text();
        if (activeChat() !== target) { notify("Conversation changed. Please attach the file again."); break; }
        attachments.push({ name: file.name, text });
      } catch { notify("This file could not be read. Try another text file."); }
    }
    $("file-input").value = ""; renderAttachments(); updateComposer();
    if (attachments.length) notify("Text attached. It stays in this local demo.");
  };
  for (const button of document.querySelectorAll("[data-prompt]")) button.onclick = () => submitMessage(button.dataset.prompt);
  $("message-stage").onscroll = () => { const stage = $("message-stage"); autoScroll = stage.scrollHeight - stage.scrollTop - stage.clientHeight < 100; };
  window.addEventListener("pagehide", () => { rememberDraft(); save(); });
  attachments = Array.isArray(activeChat().draftFiles) ? activeChat().draftFiles : [];
  $("message-input").value = typeof activeChat().draft === "string" ? activeChat().draft : "";
  applyAppearance(); setSidebar(!mobile.matches); renderNavigation(); renderMessages(); renderAttachments(); updateComposer(); resizeInput();
})();
