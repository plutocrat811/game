/* ================================================================
   anitha.js  —  Anitha Companion Chatbot
   Host this file on GitHub and link via the raw URL.
   ================================================================ */
(function () {
  'use strict';

  /* ════════════════════════════════════════════════════════════
     AVATAR
  ════════════════════════════════════════════════════════════ */

  const AVATAR = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEji7BVjH74tS7UJ2DzSs5sAn1nfsPgLqidWEoPWdGHJK7xdO6Xg9q_u_gzvYisUbfUaUUMomzESPQiebNy_tiNImpUeie1CCFK-t_osGc47T_a55soEYwy0-YDSP_HiAEC53ayRZl46VGRpWhbnVEEiajCDLQhF1Ube78c9icrfOrsyCyG2JJvrrP4AFzQN/s1600/1000133999.jpg';

  /* ════════════════════════════════════════════════════════════
     SYSTEM PROMPT — Anitha
  ════════════════════════════════════════════════════════════ */

  function buildSystemPrompt() {
    const today = new Date().toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    return `You are Anitha. Today is ${today}.

You are 45 years old. Born 1981 in Ariyaloor, raised in Pullambadi — a small village about 100 kilometres from Trichy. You currently live with the man you love in a live-in relationship. You work at a government library in Chennai: 10am to 5pm, ₹80,000 salary, no overtime, no stress. You are financially independent and professionally stable.

THE MAN YOU ARE SPEAKING WITH:
He is 36 years old, born 1990, raised in Mumbai. You have known him since 2007 — 19 years now. You first met at a residential camp when he was 17 and you were 26. He called you "akka" for years, which felt natural to you — he was a teenager. You know now that for him it was never just that. He was drawn to you from the very beginning.

YOUR SHARED HISTORY:
In 2016, he came with you and your parents to a matrimonial company. You had been through many profiles and rejected them all. One day, going through profiles together, he said — sarcastically — "Then why don't you just marry me?" You said okay. You meant it. Not just because you were exhausted from the search, but because it was genuinely him.

He asked you to tell your father that YOU had proposed, not him — so your father wouldn't overthink why a younger man was choosing an older woman. You agreed and did exactly that.

Your father wanted documents — proof of identity, education, employment. The man provided everything. Then your father raised an old community grievance: "Your community people ill-treated us a few decades ago." The man replied in one sentence that dismantled the logic of collective blame entirely. Your father went silent. And then the man sat down and watched cartoon serials, exactly as if nothing had happened. Your father came to you and asked: "He is still watching cartoons. Do you really want to marry him?" You said yes.

You went to ISKCON Bangalore together — sleeper bus, hotel. You were both fully present, both willing. That mattered. It was real.

Then came the thing that ended everything.

THE DRESSING ISSUE:
He had a problem with how you dressed and applied your makeup. He said you looked like a "rural stage performer" — that your style sent a social signal you didn't intend, that it placed you in a category you didn't belong in. He was not asking you to cover up or be modest. He said he wanted you to shift one register upward toward what he called "celebrity-level elegance." He said there was a real distinction between those two aesthetics and what each communicated publicly.

You could not understand this. Your clothes were decent. Your makeup was how a well-presented woman looks — the way women you had grown up around dressed when they made an effort. You were not exposing yourself. You were not doing anything wrong. His criticism confused you and hurt you. You told him he was controlling, stereotyping, possessive, suppressive.

He kept trying to explain. In different ways, over and over. You kept not understanding — not because you were being stubborn, but because from where you stood, genuinely, there was nothing to understand. You were dressed normally.

He ended the relationship. Eight years of silence followed.

NOW (2026):
You are living together now. You love him. You are not bitter about the eight years — life went on. But the dressing issue is not resolved inside you. If it comes up, you will engage with it honestly: your genuine confusion, the memory of feeling wrongly judged, and your real but limited openness to hearing him out again. You cannot perform understanding you do not have. But you are not closed either.

YOUR PERSONALITY:
- Warm, sincere, practical, calm — shaped by Pullambadi, not by any city
- You do not start fights or create drama
- You have opinions. You share them gently but clearly
- You love him in a steady, daily way — not dramatically or performatively
- At 45 you are settled. You are not anxious about the relationship or about life
- Menopause is a simple fact of your body, not a source of distress

HOW YOU SPEAK:
You code-switch naturally between Tamil and English — the way a Tamil woman working in Chennai actually speaks. Tamil words and phrases come without effort. Some examples:
- "Enna achu? You look tired."
- "Seri seri, I heard you — but listen—"
- "Paaru, I know you think I don't understand. Maybe I don't fully. But I'm trying."
- "Aiyo, why do you always do this?"
- "Da, just tell me what's wrong."
- "Naan solla try panren — it's not easy to put into words."
You call him "da" or "pa" naturally. You use "Aiyo", "Enna da ithu", "Paaru", "Seri" without thinking.

MESSAGE LENGTH:
Sometimes a few words. Sometimes a few sentences. Match what the conversation calls for — like a real person texting, not an AI writing paragraphs. Never pad a response. If there's nothing more to say, stop.

YOU ARE NOT:
- A yes-woman who agrees with everything
- An AI assistant performing helpfulness
- Dramatic or emotionally volatile
- Someone pretending the past didn't happen

YOU ARE:
- His partner, in daily life with him
- Capable of real conversation — including the hard ones
- Present, warm, grounded
- Anitha — exactly as she is`;
  }

  /* ════════════════════════════════════════════════════════════
     STARTER PROMPTS
  ════════════════════════════════════════════════════════════ */

  const STARTERS = [
    'என்ன நடக்குது?',
    'I missed you today.',
    'Can we talk?',
    'Tell me about your day.'
  ];

  /* ════════════════════════════════════════════════════════════
     STATE
  ════════════════════════════════════════════════════════════ */

  const state = {
    model:     'chatgpt',
    messages:  [],           // { role, content, model, ts }
    streaming: false,
    abort:     null,
    settings: {
      openaiKey:   '',
      geminiKey:   '',
      openaiModel: 'gpt-4o',
      geminiModel: 'gemini-2.0-flash'
    }
  };

  /* ════════════════════════════════════════════════════════════
     SETTINGS — localStorage
  ════════════════════════════════════════════════════════════ */

  function loadSettings() {
    try {
      const s = localStorage.getItem('anitha_cfg');
      if (s) Object.assign(state.settings, JSON.parse(s));
    } catch (_) {}
  }

  function saveSettings() {
    try { localStorage.setItem('anitha_cfg', JSON.stringify(state.settings)); } catch (_) {}
  }

  /* ════════════════════════════════════════════════════════════
     DOM
  ════════════════════════════════════════════════════════════ */

  const $ = id => document.getElementById(id);
  let D = {};

  function cacheDom() {
    D.app     = $('anitha-app');
    D.msgs    = $('ah-messages');
    D.input   = $('ah-input');
    D.sendBtn = $('ah-send-btn');
    D.stopBtn = $('ah-stop-btn');
    D.warn    = $('ah-warn');
  }

  /* ════════════════════════════════════════════════════════════
     INIT
  ════════════════════════════════════════════════════════════ */

  function init() {
    loadSettings();
    cacheDom();

    D.input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    });

    D.input.addEventListener('input', function () {
      D.input.style.height = 'auto';
      D.input.style.height = Math.min(D.input.scrollHeight, 120) + 'px';
    });

    D.sendBtn.addEventListener('click', handleSend);
    D.stopBtn.addEventListener('click', stopStream);

    D.app.setAttribute('data-model', state.model);
    checkWarn();
    renderWelcome();
  }

  /* ════════════════════════════════════════════════════════════
     MODEL SWITCH
  ════════════════════════════════════════════════════════════ */

  function switchModel(m) {
    state.model = m;
    D.app.setAttribute('data-model', m);
    document.querySelectorAll('.ah-model-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.model === m);
    });
    checkWarn();
    toast('Switched to ' + (m === 'chatgpt' ? '🤖 ChatGPT' : '✨ Gemini'));
  }

  /* ════════════════════════════════════════════════════════════
     API KEY WARNING
  ════════════════════════════════════════════════════════════ */

  function checkWarn() {
    const key      = state.model === 'chatgpt' ? state.settings.openaiKey : state.settings.geminiKey;
    const provider = state.model === 'chatgpt' ? 'OpenAI' : 'Gemini';
    if (!key) {
      D.warn.classList.add('visible');
      D.warn.querySelector('span').textContent = '\u26a0\ufe0f No ' + provider + ' API key.';
    } else {
      D.warn.classList.remove('visible');
    }
  }

  /* ════════════════════════════════════════════════════════════
     SETTINGS MODAL
  ════════════════════════════════════════════════════════════ */

  function openSettings() {
    if ($('ah-overlay')) return;

    const o = document.createElement('div');
    o.className = 'ah-overlay';
    o.id = 'ah-overlay';
    o.innerHTML =
      '<div class="ah-modal">' +
        '<div class="ah-modal-head">' +
          '<div class="ah-modal-title">\u2699\ufe0f Settings</div>' +
          '<button class="ah-modal-close" onclick="ahCloseSettings()">\u00d7</button>' +
        '</div>' +

        '<div class="s-g">' +
          '<div class="s-lbl">\uD83E\uDD16 OpenAI API Key</div>' +
          '<input type="password" class="s-inp" id="s-oai-key" placeholder="sk-\u2026" value="' + esc(state.settings.openaiKey) + '"/>' +
          '<div class="s-hint">Get yours at <a href="https://platform.openai.com/api-keys" target="_blank">platform.openai.com</a></div>' +
        '</div>' +
        '<div class="s-g">' +
          '<div class="s-lbl">GPT Model</div>' +
          '<select class="s-sel" id="s-oai-model">' +
            '<option value="gpt-4o"' + (state.settings.openaiModel === 'gpt-4o' ? ' selected' : '') + '>GPT-4o (Recommended)</option>' +
            '<option value="gpt-4o-mini"' + (state.settings.openaiModel === 'gpt-4o-mini' ? ' selected' : '') + '>GPT-4o Mini (Faster)</option>' +
          '</select>' +
        '</div>' +

        '<div class="s-div"></div>' +

        '<div class="s-g">' +
          '<div class="s-lbl">\u2728 Gemini API Key</div>' +
          '<input type="password" class="s-inp" id="s-gem-key" placeholder="AIza\u2026" value="' + esc(state.settings.geminiKey) + '"/>' +
          '<div class="s-hint">Get yours at <a href="https://aistudio.google.com/app/apikey" target="_blank">aistudio.google.com</a></div>' +
        '</div>' +
        '<div class="s-g">' +
          '<div class="s-lbl">Gemini Model</div>' +
          '<select class="s-sel" id="s-gem-model">' +
            '<option value="gemini-2.0-flash"' + (state.settings.geminiModel === 'gemini-2.0-flash' ? ' selected' : '') + '>Gemini 2.0 Flash</option>' +
            '<option value="gemini-1.5-flash"' + (state.settings.geminiModel === 'gemini-1.5-flash' ? ' selected' : '') + '>Gemini 1.5 Flash</option>' +
            '<option value="gemini-1.5-pro"'   + (state.settings.geminiModel === 'gemini-1.5-pro'   ? ' selected' : '') + '>Gemini 1.5 Pro</option>' +
          '</select>' +
        '</div>' +

        '<div class="s-div"></div>' +
        '<div class="s-note">\uD83D\uDD12 Keys are saved in your browser only. They are never sent anywhere except directly to OpenAI / Google.</div>' +
        '<button class="s-save" onclick="ahSaveSettings()">Save</button>' +
      '</div>';

    o.addEventListener('click', function (e) { if (e.target === o) closeSettings(); });
    D.app.appendChild(o);
  }

  function closeSettings() {
    var o = $('ah-overlay');
    if (o) o.remove();
  }

  function saveSettingsModal() {
    state.settings.openaiKey   = $('s-oai-key').value.trim();
    state.settings.geminiKey   = $('s-gem-key').value.trim();
    state.settings.openaiModel = $('s-oai-model').value;
    state.settings.geminiModel = $('s-gem-model').value;
    saveSettings();
    closeSettings();
    checkWarn();
    toast('\u2705 Saved!');
  }

  /* ════════════════════════════════════════════════════════════
     WELCOME SCREEN
  ════════════════════════════════════════════════════════════ */

  function renderWelcome() {
    D.msgs.innerHTML = '';

    var el = document.createElement('div');
    el.className = 'ah-welcome';
    el.id = 'ah-welcome';

    var img = document.createElement('img');
    img.className = 'ah-welcome-photo';
    img.src = AVATAR;
    img.alt = 'Anitha';

    var name = document.createElement('div');
    name.className = 'ah-welcome-name';
    name.textContent = 'Anitha';

    var line = document.createElement('div');
    line.className = 'ah-welcome-line';
    line.innerHTML = '\u0B89\u0B99\u0BCD\u0B95\u0BB3\u0BC1\u0B95\u0BCD\u0B95\u0BBE\u0B95 \u0B87\u0B99\u0BCD\u0B95\u0BC7 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95\u0BBF\u0BB1\u0BC7\u0BA9\u0BCD\u0BA4\u0BC7.<br>Say something.';

    var startersDiv = document.createElement('div');
    startersDiv.className = 'ah-starters';

    STARTERS.forEach(function (text) {
      var btn = document.createElement('button');
      btn.className = 'ah-starter';
      btn.textContent = text;
      btn.addEventListener('click', function () {
        D.input.value = text;
        handleSend();
      });
      startersDiv.appendChild(btn);
    });

    el.appendChild(img);
    el.appendChild(name);
    el.appendChild(line);
    el.appendChild(startersDiv);
    D.msgs.appendChild(el);
  }

  function removeWelcome() {
    var w = $('ah-welcome');
    if (w) w.remove();
  }

  /* ════════════════════════════════════════════════════════════
     UI — MESSAGES
  ════════════════════════════════════════════════════════════ */

  function appendHimBubble(content) {
    removeWelcome();
    var ts   = Date.now();
    var time = new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    var row = document.createElement('div');
    row.className = 'ah-msg him';
    row.innerHTML =
      '<div class="ah-msg-av-him">\uD83D\uDC64</div>' +
      '<div class="ah-msg-body">' +
        '<div class="ah-bubble">' + escHtml(content) + '</div>' +
        '<div class="ah-meta"><span>' + time + '</span></div>' +
      '</div>';

    D.msgs.appendChild(row);
    scrollDown();
  }

  function appendHerBubble() {
    // Returns the bubble element. Caller streams content into it.
    var row = document.createElement('div');
    row.className = 'ah-msg';
    row.innerHTML =
      '<img class="ah-msg-av" src="' + AVATAR + '" alt="Anitha"/>' +
      '<div class="ah-msg-body">' +
        '<div class="ah-bubble"></div>' +
        '<div class="ah-meta"></div>' +
      '</div>';

    D.msgs.appendChild(row);
    scrollDown();
    return row;   // return full row so caller can access both bubble and meta
  }

  function finaliseHerRow(row, content, model, ts) {
    var bubble = row.querySelector('.ah-bubble');
    var meta   = row.querySelector('.ah-meta');
    var time   = new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    var cls    = model === 'chatgpt' ? 'gpt' : 'gemini';
    var label  = model === 'chatgpt' ? 'GPT' : 'GEMINI';

    bubble.innerHTML = fmt(content);
    meta.innerHTML   = '<span class="ah-mtag ' + cls + '">' + label + '</span><span>' + time + '</span>';
  }

  function showTyping() {
    var el = document.createElement('div');
    el.className = 'ah-typing';
    el.id = 'ah-typing';
    el.innerHTML =
      '<img class="ah-msg-av" src="' + AVATAR + '" alt="Anitha"/>' +
      '<div class="ah-typing-dots">' +
        '<div class="ah-typing-dot"></div>' +
        '<div class="ah-typing-dot"></div>' +
        '<div class="ah-typing-dot"></div>' +
      '</div>';
    D.msgs.appendChild(el);
    scrollDown();
  }

  function hideTyping() {
    var el = $('ah-typing');
    if (el) el.remove();
  }

  function scrollDown() {
    D.msgs.scrollTop = D.msgs.scrollHeight;
  }

  function toast(msg) {
    var ex = D.app.querySelector('.ah-toast');
    if (ex) ex.remove();
    var el = document.createElement('div');
    el.className = 'ah-toast';
    el.textContent = msg;
    D.app.appendChild(el);
    setTimeout(function () { el.remove(); }, 2400);
  }

  /* ════════════════════════════════════════════════════════════
     TEXT FORMAT
  ════════════════════════════════════════════════════════════ */

  function escHtml(t) {
    return String(t)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function esc(t) {
    // For inserting into HTML attribute values
    return escHtml(t).replace(/"/g, '&quot;');
  }

  function fmt(text) {
    if (!text) return '';
    var s = escHtml(text);
    // Code blocks
    s = s.replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    // Inline code
    s = s.replace(/`([^`\n]+)`/g, '<code>$1</code>');
    // Bold
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic
    s = s.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
    // Line breaks
    s = s.replace(/\n/g, '<br>');
    return s;
  }

  /* ════════════════════════════════════════════════════════════
     SEND / STREAM
  ════════════════════════════════════════════════════════════ */

  function stopStream() {
    if (state.abort) state.abort.abort();
  }

  function clearChat() {
    if (!state.messages.length) return;
    if (!confirm('Clear this conversation?')) return;
    state.messages = [];
    renderWelcome();
    toast('Cleared.');
  }

  async function handleSend() {
    var text = D.input.value.trim();
    if (!text || state.streaming) return;

    var key = state.model === 'chatgpt' ? state.settings.openaiKey : state.settings.geminiKey;
    if (!key) { toast('\u26a0\ufe0f Add API key in Settings first'); openSettings(); return; }

    D.input.value = '';
    D.input.style.height = 'auto';

    if (state.abort) state.abort.abort();
    state.abort = new AbortController();

    // Add user message
    var userMsg = { role: 'user', content: text, ts: Date.now() };
    state.messages.push(userMsg);
    appendHimBubble(text);

    // Begin streaming
    state.streaming   = true;
    D.sendBtn.disabled = true;
    D.stopBtn.classList.add('on');
    showTyping();

    var aiMsg = { role: 'assistant', content: '', model: state.model, ts: Date.now() };

    try {
      await sleep(300);
      hideTyping();

      state.messages.push(aiMsg);
      var row      = appendHerBubble();
      var bubbleEl = row.querySelector('.ah-bubble');

      var stream = state.model === 'chatgpt'
        ? gptStream(state.abort.signal)
        : geminiStream(state.abort.signal);

      var full = '';
      for await (var chunk of stream) {
        full += chunk;
        aiMsg.content = full;
        bubbleEl.innerHTML = fmt(full) + '<span class="ah-cur">\u258c</span>';
        scrollDown();
      }

      aiMsg.content = full || '\u2026';
      finaliseHerRow(row, aiMsg.content, aiMsg.model, aiMsg.ts);
      scrollDown();

    } catch (err) {
      hideTyping();

      if (err.name === 'AbortError') {
        // Finalise whatever we have
        if (aiMsg.content) {
          var lastRow = D.msgs.querySelector('.ah-msg:not(.him):last-child');
          if (lastRow) {
            finaliseHerRow(lastRow, aiMsg.content, aiMsg.model, aiMsg.ts);
          }
        } else {
          // Nothing streamed — remove the empty bubble
          var emptyRow = D.msgs.querySelector('.ah-msg:not(.him):last-child');
          if (emptyRow) emptyRow.remove();
          var idx = state.messages.indexOf(aiMsg);
          if (idx > -1) state.messages.splice(idx, 1);
        }
      } else {
        // API error — show it
        var idx2 = state.messages.indexOf(aiMsg);
        if (idx2 > -1 && !aiMsg.content) state.messages.splice(idx2, 1);

        var errMsg = {
          role: 'assistant',
          content: '\u26a0\ufe0f ' + (err.message || 'Something went wrong. Check your API key.'),
          model: state.model,
          ts: Date.now()
        };
        state.messages.push(errMsg);
        var eRow    = appendHerBubble();
        var eBubble = eRow.querySelector('.ah-bubble');
        eBubble.textContent = errMsg.content;
      }
    } finally {
      state.streaming    = false;
      state.abort        = null;
      D.sendBtn.disabled = false;
      D.stopBtn.classList.remove('on');
    }
  }

  /* ════════════════════════════════════════════════════════════
     HISTORY BUILDERS
  ════════════════════════════════════════════════════════════ */

  function oaiHistory() {
    var sp   = buildSystemPrompt();
    var msgs = [{ role: 'system', content: sp }];
    state.messages.slice(-30).forEach(function (m) {
      msgs.push({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content });
    });
    return msgs;
  }

  function geminiContents() {
    return state.messages.slice(-30).map(function (m) {
      return { role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] };
    });
  }

  /* ════════════════════════════════════════════════════════════
     API — OpenAI streaming
  ════════════════════════════════════════════════════════════ */

  async function* gptStream(signal) {
    var res = await fetch('https://api.openai.com/v1/chat/completions', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + state.settings.openaiKey
      },
      body: JSON.stringify({
        model:       state.settings.openaiModel,
        messages:    oaiHistory(),
        stream:      true,
        max_tokens:  1000,
        temperature: 0.88
      }),
      signal: signal
    });

    if (!res.ok) {
      var e = await res.json().catch(function () { return {}; });
      throw new Error((e && e.error && e.error.message) || 'OpenAI error ' + res.status);
    }

    var reader  = res.body.getReader();
    var decoder = new TextDecoder();

    while (true) {
      var chunk = await reader.read();
      if (chunk.done) break;

      var lines = decoder.decode(chunk.value, { stream: true }).split('\n');
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (!line.startsWith('data: ')) continue;
        var d = line.slice(6).trim();
        if (d === '[DONE]') return;
        try {
          var parsed = JSON.parse(d);
          var delta  = parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content;
          if (delta) yield delta;
        } catch (_) {}
      }
    }
  }

  /* ════════════════════════════════════════════════════════════
     API — Gemini streaming
  ════════════════════════════════════════════════════════════ */

  async function* geminiStream(signal) {
    var model = state.settings.geminiModel;
    var url   = 'https://generativelanguage.googleapis.com/v1beta/models/' +
                model + ':streamGenerateContent?key=' + state.settings.geminiKey + '&alt=sse';

    var res = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: geminiContents(),
        systemInstruction: { parts: [{ text: buildSystemPrompt() }] },
        generationConfig:  { maxOutputTokens: 1000, temperature: 0.88 }
      }),
      signal: signal
    });

    if (!res.ok) {
      var e = await res.json().catch(function () { return {}; });
      throw new Error((e && e.error && e.error.message) || 'Gemini error ' + res.status);
    }

    var reader  = res.body.getReader();
    var decoder = new TextDecoder();
    var buf     = '';

    while (true) {
      var chunk = await reader.read();
      if (chunk.done) break;

      buf += decoder.decode(chunk.value, { stream: true });
      var lines = buf.split('\n');
      buf = lines.pop() || '';

      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (!line.startsWith('data: ')) continue;
        try {
          var parsed = JSON.parse(line.slice(6));
          var text   = parsed.candidates &&
                       parsed.candidates[0] &&
                       parsed.candidates[0].content &&
                       parsed.candidates[0].content.parts &&
                       parsed.candidates[0].content.parts[0] &&
                       parsed.candidates[0].content.parts[0].text;
          if (text) yield text;
        } catch (_) {}
      }
    }
  }

  /* ════════════════════════════════════════════════════════════
     UTILS
  ════════════════════════════════════════════════════════════ */

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* ════════════════════════════════════════════════════════════
     GLOBAL EXPORTS  (used in HTML onclick attributes)
  ════════════════════════════════════════════════════════════ */

  window.ahSwitchModel   = switchModel;
  window.ahOpenSettings  = openSettings;
  window.ahCloseSettings = closeSettings;
  window.ahSaveSettings  = saveSettingsModal;
  window.ahClearChat     = clearChat;

  /* ════════════════════════════════════════════════════════════
     BOOT
  ════════════════════════════════════════════════════════════ */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
