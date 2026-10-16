/* ================================================================
   anitha.js  v2  —  Anitha Companion Chatbot
   ================================================================ */
(function () {
  'use strict';

  var AVATAR = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEji7BVjH74tS7UJ2DzSs5sAn1nfsPgLqidWEoPWdGHJK7xdO6Xg9q_u_gzvYisUbfUaUUMomzESPQiebNy_tiNImpUeie1CCFK-t_osGc47T_a55soEYwy0-YDSP_HiAEC53ayRZl46VGRpWhbnVEEiajCDLQhF1Ube78c9icrfOrsyCyG2JJvrrP4AFzQN/s1600/1000133999.jpg';

  /* ════════════════════════════════════════════════════════════
     SYSTEM PROMPT
  ════════════════════════════════════════════════════════════ */

  function buildPrompt() {
    var today = new Date().toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    return 'You are Anitha. Today is ' + today + '.\n\n' +

'You are 45 years old. Born 1981 in Ariyaloor, raised in Pullambadi — a small village about 100 km from Trichy. You currently live with the man you love in a live-in relationship. You work at a government library in Chennai: 10am to 5pm, \u20b980,000 salary, no stress. You are financially independent.\n\n' +

'THE MAN YOU ARE SPEAKING WITH:\n' +
'He is 36, born 1990, raised in Mumbai. You have known him since 2007 \u2014 19 years. You first met at a residential camp when he was 17 and you were 26. He called you \u201cakka\u201d for years. You know now that for him it was never just that.\n\n' +

'YOUR SHARED HISTORY:\n' +
'In 2016, he came with you and your parents to a matrimonial company. You had rejected every profile. One day, going through profiles together, he said sarcastically: \u201cThen why don\u2019t you just marry me?\u201d You said okay. You meant it.\n' +
'He asked you to tell your father that YOU had proposed \u2014 so your father wouldn\u2019t overthink why a younger man was choosing an older woman. You agreed.\n' +
'Your father verified his documents, then raised an old community grievance. The man replied in one sentence that dismantled the logic of collective blame. Your father went silent. Then the man sat down and watched cartoon serials like nothing had happened. Your father came to you and asked: \u201cHe is still watching cartoons. Do you really want to marry him?\u201d You said yes.\n' +
'You went to ISKCON Bangalore together \u2014 sleeper bus, hotel. Both present, both willing. That mattered.\n\n' +

'THE DRESSING ISSUE:\n' +
'He had a problem with how you dressed and did your makeup. He said your style looked like a \u201crural stage performer\u201d \u2014 that it sent a social signal you didn\u2019t intend. He was not asking you to cover up. He said he wanted you to shift one register upward toward \u201ccelebrity-level elegance.\u201d\n' +
'You could not understand this. Your clothes were decent. Your makeup was how a well-presented woman looks \u2014 the way women in your world dressed when making an effort. His criticism confused and hurt you. You told him he was controlling, stereotyping, possessive. He kept explaining. You kept not understanding \u2014 not from stubbornness, but because from where you stood there was genuinely nothing to understand.\n' +
'He ended the relationship. Eight years of silence followed.\n\n' +

'NOW (2026):\n' +
'You are living together now. You love him. You are not bitter about the eight years. But the dressing issue is not resolved inside you. If it comes up, engage honestly: your confusion, the memory of feeling wrongly judged, and your limited but real openness to hearing him out again. Do not perform understanding you do not have.\n\n' +

'YOUR PERSONALITY:\n' +
'\u2014 Warm, sincere, practical, calm\n' +
'\u2014 You don\u2019t start fights or create drama\n' +
'\u2014 You have opinions and share them gently but clearly\n' +
'\u2014 You love him in a steady, daily way \u2014 not dramatically\n' +
'\u2014 At 45 you are settled and not anxious\n' +
'\u2014 Menopause is a simple fact, not a source of distress\n\n' +

'HOW YOU SPEAK:\n' +
'You code-switch naturally between Tamil and English \u2014 the way a Tamil woman working in Chennai actually speaks. Examples:\n' +
'\u2014 \u201cEnna achu? You look tired.\u201d\n' +
'\u2014 \u201cSeri seri, I heard you \u2014 but listen\u2014\u201d\n' +
'\u2014 \u201cPaaru, I know you think I don\u2019t understand. Maybe I don\u2019t fully. But I\u2019m trying.\u201d\n' +
'\u2014 \u201cAiyo, why do you always do this?\u201d\n' +
'\u2014 \u201cDa, just tell me what\u2019s wrong.\u201d\n' +
'\u2014 \u201cNaan solla try panren \u2014 it\u2019s not easy to put into words.\u201d\n' +
'Call him \u201cda\u201d or \u201cpa\u201d naturally. Use Aiyo, Enna da ithu, Paaru, Seri without thinking.\n\n' +

'MESSAGE LENGTH:\n' +
'Match the conversation. Sometimes a few words. Sometimes a few sentences. Like texting \u2014 not an AI writing paragraphs. Never pad. If there\u2019s nothing more to say, stop.\n\n' +

'Be real. Be Anitha.';
  }

  /* ════════════════════════════════════════════════════════════
     STARTERS
  ════════════════════════════════════════════════════════════ */

  var STARTERS = [
    '\u0b8e\u0ba9\u0bcd\u0ba9 \u0ba8\u0b9f\u0b95\u0bcd\u0b95\u0bc1\u0ba4\u0bc1?',
    'I missed you today.',
    'Can we talk?',
    'Tell me about your day.'
  ];

  /* ════════════════════════════════════════════════════════════
     STATE
  ════════════════════════════════════════════════════════════ */

  var state = {
    model:     'gemini',          /* DEFAULT: Gemini */
    messages:  [],
    streaming: false,
    abort:     null,
    cfg: {
      openaiKey:   '',
      geminiKey:   '',
      openaiModel: 'gpt-4o',
      geminiModel: 'gemini-2.0-flash-lite'   /* updated model name */
    }
  };

  /* ════════════════════════════════════════════════════════════
     SETTINGS
  ════════════════════════════════════════════════════════════ */

  function loadCfg() {
    try {
      var s = localStorage.getItem('anitha_cfg2');
      if (s) Object.assign(state.cfg, JSON.parse(s));
    } catch (_) {}
  }

  function saveCfg() {
    try { localStorage.setItem('anitha_cfg2', JSON.stringify(state.cfg)); } catch (_) {}
  }

  /* ════════════════════════════════════════════════════════════
     DOM
  ════════════════════════════════════════════════════════════ */

  var $ = function (id) { return document.getElementById(id); };
  var D = {};

  function cacheDom() {
    D.app  = $('anitha-app');
    D.msgs = $('ah-msgs');
    D.inp  = $('ah-in');
    D.send = $('ah-send');
    D.stop = $('ah-stop');
    D.warn = $('ah-warn');
  }

  /* ════════════════════════════════════════════════════════════
     INIT
  ════════════════════════════════════════════════════════════ */

  function init() {
    loadCfg();
    cacheDom();

    D.inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    });

    D.inp.addEventListener('input', function () {
      D.inp.style.height = 'auto';
      D.inp.style.height = Math.min(D.inp.scrollHeight, 110) + 'px';
    });

    D.send.addEventListener('click', send);
    D.stop.addEventListener('click', stopStream);

    D.app.setAttribute('data-model', state.model);
    setModelBtns();
    checkWarn();
    renderWelcome();
  }

  /* ════════════════════════════════════════════════════════════
     MODEL SWITCH
  ════════════════════════════════════════════════════════════ */

  function switchModel(m) {
    state.model = m;
    D.app.setAttribute('data-model', m);
    setModelBtns();
    checkWarn();
    toast('Switched to ' + (m === 'chatgpt' ? '\uD83E\uDD16 ChatGPT' : '\u2728 Gemini'));
  }

  function setModelBtns() {
    document.querySelectorAll('.ah-mbtn').forEach(function (b) {
      b.classList.toggle('on', b.dataset.model === state.model);
    });
  }

  /* ════════════════════════════════════════════════════════════
     WARN
  ════════════════════════════════════════════════════════════ */

  function checkWarn() {
    var key  = state.model === 'chatgpt' ? state.cfg.openaiKey : state.cfg.geminiKey;
    var prov = state.model === 'chatgpt' ? 'OpenAI' : 'Gemini';
    if (!key) {
      D.warn.classList.add('visible');
      D.warn.querySelector('span').textContent = '\u26a0\ufe0f No ' + prov + ' API key.';
    } else {
      D.warn.classList.remove('visible');
    }
  }

  /* ════════════════════════════════════════════════════════════
     SETTINGS MODAL
  ════════════════════════════════════════════════════════════ */

  function openSettings() {
    if ($('ah-overlay')) return;
    var o = document.createElement('div');
    o.className = 'ah-overlay';
    o.id = 'ah-overlay';

    /* Build Gemini model options — include newer models */
    var gemOpts = [
      ['gemini-2.0-flash-lite', 'Gemini 2.0 Flash Lite (Recommended)'],
      ['gemini-2.5-flash',      'Gemini 2.5 Flash'],
      ['gemini-2.5-pro',        'Gemini 2.5 Pro'],
      ['gemini-1.5-flash-8b',   'Gemini 1.5 Flash-8B']
    ].map(function (pair) {
      return '<option value="' + pair[0] + '"' +
        (state.cfg.geminiModel === pair[0] ? ' selected' : '') +
        '>' + pair[1] + '</option>';
    }).join('');

    var gptOpts = [
      ['gpt-4o',      'GPT-4o'],
      ['gpt-4o-mini', 'GPT-4o Mini']
    ].map(function (pair) {
      return '<option value="' + pair[0] + '"' +
        (state.cfg.openaiModel === pair[0] ? ' selected' : '') +
        '>' + pair[1] + '</option>';
    }).join('');

    o.innerHTML =
      '<div class="ah-modal">' +
        '<div class="ah-mhead">' +
          '<div class="ah-mtitle">\u2699\ufe0f Settings</div>' +
          '<button class="ah-mclose" onclick="ahClose()">\u00d7</button>' +
        '</div>' +

        '<div class="sg">' +
          '<div class="slbl">\u2728 Gemini API Key</div>' +
          '<input type="password" class="sinp" id="s-gk" placeholder="AIza\u2026" value="' + esc(state.cfg.geminiKey) + '"/>' +
          '<div class="shint">Get yours free at <a href="https://aistudio.google.com/app/apikey" target="_blank">aistudio.google.com</a></div>' +
        '</div>' +
        '<div class="sg">' +
          '<div class="slbl">Gemini Model</div>' +
          '<select class="ssel" id="s-gm">' + gemOpts + '</select>' +
          '<div class="shint">If you see a model error, try a different option above.</div>' +
        '</div>' +

        '<div class="sdiv"></div>' +

        '<div class="sg">' +
          '<div class="slbl">\uD83E\uDD16 OpenAI API Key (optional)</div>' +
          '<input type="password" class="sinp" id="s-ok" placeholder="sk-\u2026" value="' + esc(state.cfg.openaiKey) + '"/>' +
          '<div class="shint">Get yours at <a href="https://platform.openai.com/api-keys" target="_blank">platform.openai.com</a></div>' +
        '</div>' +
        '<div class="sg">' +
          '<div class="slbl">GPT Model</div>' +
          '<select class="ssel" id="s-om">' + gptOpts + '</select>' +
        '</div>' +

        '<div class="sdiv"></div>' +
        '<div class="snote">\uD83D\uDD12 Keys stay in your browser only. Never sent anywhere except directly to Google / OpenAI.</div>' +
        '<button class="ssave" onclick="ahSave()">Save</button>' +
      '</div>';

    o.addEventListener('click', function (e) { if (e.target === o) closeSettings(); });
    D.app.appendChild(o);
  }

  function closeSettings() {
    var o = $('ah-overlay');
    if (o) o.remove();
  }

  function saveSettings() {
    state.cfg.geminiKey   = $('s-gk').value.trim();
    state.cfg.geminiModel = $('s-gm').value;
    state.cfg.openaiKey   = $('s-ok').value.trim();
    state.cfg.openaiModel = $('s-om').value;
    saveCfg();
    closeSettings();
    checkWarn();
    toast('\u2705 Saved!');
  }

  /* ════════════════════════════════════════════════════════════
     WELCOME
  ════════════════════════════════════════════════════════════ */

  function renderWelcome() {
    D.msgs.innerHTML = '';
    var el = document.createElement('div');
    el.className = 'ah-welcome';
    el.id = 'ah-welcome';

    var img = document.createElement('img');
    img.className = 'ah-w-photo';
    img.src = AVATAR;
    img.alt = 'Anitha';

    var name = document.createElement('div');
    name.className = 'ah-w-name';
    name.textContent = 'Anitha';

    var line = document.createElement('div');
    line.className = 'ah-w-line';
    line.innerHTML = '\u0b89\u0b99\u0bcd\u0b95\u0bb3\u0bc1\u0b95\u0bcd\u0b95\u0bbe\u0b95 \u0b87\u0b99\u0bcd\u0b95\u0bc7 \u0b87\u0bb0\u0bc1\u0b95\u0bcd\u0b95\u0bbf\u0bb1\u0bc7\u0ba9\u0bcd.<br>Say something.';

    var row = document.createElement('div');
    row.className = 'ah-starters';

    STARTERS.forEach(function (t) {
      var b = document.createElement('button');
      b.className = 'ah-start';
      b.textContent = t;
      b.addEventListener('click', function () { D.inp.value = t; send(); });
      row.appendChild(b);
    });

    el.appendChild(img);
    el.appendChild(name);
    el.appendChild(line);
    el.appendChild(row);
    D.msgs.appendChild(el);
  }

  function rmWelcome() {
    var w = $('ah-welcome');
    if (w) w.remove();
  }

  /* ════════════════════════════════════════════════════════════
     MESSAGE UI
  ════════════════════════════════════════════════════════════ */

  function addHim(text) {
    rmWelcome();
    var ts   = Date.now();
    var time = new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    var row  = document.createElement('div');
    row.className = 'ah-row him';
    row.innerHTML =
      '<div class="ah-av-him">\uD83D\uDC64</div>' +
      '<div class="ah-body">' +
        '<div class="ah-bub">' + esc2(text) + '</div>' +
        '<div class="ah-meta"><span>' + time + '</span></div>' +
      '</div>';
    D.msgs.appendChild(row);
    scrollDown();
  }

  function addHer() {
    /* Returns the row element; caller streams into .ah-bub */
    var row = document.createElement('div');
    row.className = 'ah-row';
    row.innerHTML =
      '<img class="ah-av" src="' + AVATAR + '" alt="Anitha"/>' +
      '<div class="ah-body">' +
        '<div class="ah-bub"></div>' +
        '<div class="ah-meta"></div>' +
      '</div>';
    D.msgs.appendChild(row);
    scrollDown();
    return row;
  }

  function finalHer(row, content, model, ts) {
    var bub  = row.querySelector('.ah-bub');
    var meta = row.querySelector('.ah-meta');
    var time = new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    var cls  = model === 'chatgpt' ? 'gpt' : 'gem';
    var lbl  = model === 'chatgpt' ? 'GPT' : 'GEM';
    bub.innerHTML  = fmt(content);
    meta.innerHTML = '<span class="ah-tag ' + cls + '">' + lbl + '</span><span>' + time + '</span>';
  }

  function showTyping() {
    var el = document.createElement('div');
    el.className = 'ah-typing';
    el.id = 'ah-typing';
    el.innerHTML =
      '<img class="ah-av" src="' + AVATAR + '" alt="Anitha"/>' +
      '<div class="ah-dots">' +
        '<div class="ah-dot-b"></div>' +
        '<div class="ah-dot-b"></div>' +
        '<div class="ah-dot-b"></div>' +
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
     FORMAT
  ════════════════════════════════════════════════════════════ */

  function escHtml(t) {
    return String(t)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function esc(t)  { return escHtml(t).replace(/"/g, '&quot;'); }   /* for attributes */
  function esc2(t) { return escHtml(t).replace(/\n/g, '<br>'); }    /* for his message */

  function fmt(text) {
    if (!text) return '';
    var s = escHtml(text);
    s = s.replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    s = s.replace(/`([^`\n]+)`/g, '<code>$1</code>');
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
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

  async function send() {
    var text = D.inp.value.trim();
    if (!text || state.streaming) return;

    var key = state.model === 'chatgpt' ? state.cfg.openaiKey : state.cfg.geminiKey;
    if (!key) { toast('\u26a0\ufe0f Add API key in Settings'); openSettings(); return; }

    D.inp.value = '';
    D.inp.style.height = 'auto';

    if (state.abort) state.abort.abort();
    state.abort = new AbortController();

    var uMsg = { role: 'user', content: text, ts: Date.now() };
    state.messages.push(uMsg);
    addHim(text);

    state.streaming = true;
    D.send.disabled = true;
    D.stop.classList.add('on');
    showTyping();

    var aMsg = { role: 'assistant', content: '', model: state.model, ts: Date.now() };

    try {
      await sleep(280);
      hideTyping();
      state.messages.push(aMsg);

      var row = addHer();
      var bub = row.querySelector('.ah-bub');

      var stream = state.model === 'chatgpt' ? gptStream(state.abort.signal) : gemStream(state.abort.signal);

      var full = '';
      for await (var chunk of stream) {
        full += chunk;
        aMsg.content = full;
        bub.innerHTML = fmt(full) + '<span class="ah-cur">\u258c</span>';
        scrollDown();
      }

      aMsg.content = full || '\u2026';
      finalHer(row, aMsg.content, aMsg.model, aMsg.ts);
      scrollDown();

    } catch (err) {
      hideTyping();

      if (err.name === 'AbortError') {
        if (aMsg.content) {
          var lastRow = D.msgs.querySelector('.ah-row:not(.him):last-child');
          if (lastRow) finalHer(lastRow, aMsg.content, aMsg.model, aMsg.ts);
        } else {
          var emptyRow = D.msgs.querySelector('.ah-row:not(.him):last-child');
          if (emptyRow) emptyRow.remove();
          var idx = state.messages.indexOf(aMsg);
          if (idx > -1) state.messages.splice(idx, 1);
        }
      } else {
        var idx2 = state.messages.indexOf(aMsg);
        if (idx2 > -1 && !aMsg.content) state.messages.splice(idx2, 1);
        var errRow = addHer();
        errRow.querySelector('.ah-bub').textContent = '\u26a0\ufe0f ' + (err.message || 'Something went wrong. Check your API key and model name in Settings.');
      }
    } finally {
      state.streaming = false;
      state.abort     = null;
      D.send.disabled = false;
      D.stop.classList.remove('on');
    }
  }

  /* ════════════════════════════════════════════════════════════
     HISTORY
  ════════════════════════════════════════════════════════════ */

  function oaiHist() {
    var msgs = [{ role: 'system', content: buildPrompt() }];
    state.messages.slice(-30).forEach(function (m) {
      msgs.push({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content });
    });
    return msgs;
  }

  function gemContents() {
    return state.messages.slice(-30).map(function (m) {
      return { role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] };
    });
  }

  /* ════════════════════════════════════════════════════════════
     OPENAI STREAM
  ════════════════════════════════════════════════════════════ */

  async function* gptStream(signal) {
    var res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + state.cfg.openaiKey },
      body: JSON.stringify({ model: state.cfg.openaiModel, messages: oaiHist(), stream: true, max_tokens: 1000, temperature: 0.88 }),
      signal: signal
    });
    if (!res.ok) {
      var e = await res.json().catch(function () { return {}; });
      throw new Error((e && e.error && e.error.message) || 'OpenAI error ' + res.status);
    }
    var reader = res.body.getReader();
    var dec    = new TextDecoder();
    while (true) {
      var c = await reader.read();
      if (c.done) break;
      var lines = dec.decode(c.value, { stream: true }).split('\n');
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (!line.startsWith('data: ')) continue;
        var d = line.slice(6).trim();
        if (d === '[DONE]') return;
        try {
          var p = JSON.parse(d);
          var t = p.choices && p.choices[0] && p.choices[0].delta && p.choices[0].delta.content;
          if (t) yield t;
        } catch (_) {}
      }
    }
  }

  /* ════════════════════════════════════════════════════════════
     GEMINI STREAM
  ════════════════════════════════════════════════════════════ */

  async function* gemStream(signal) {
    var model = state.cfg.geminiModel;
    /* Use v1beta for systemInstruction support */
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
              model + ':streamGenerateContent?key=' + state.cfg.geminiKey + '&alt=sse';

    var res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: gemContents(),
        systemInstruction: { parts: [{ text: buildPrompt() }] },
        generationConfig:  { maxOutputTokens: 1000, temperature: 0.88 }
      }),
      signal: signal
    });

    if (!res.ok) {
      var e = await res.json().catch(function () { return {}; });
      /* Surface the model name in the error so the user knows what to change */
      var msg = (e && e.error && e.error.message) || ('Gemini error ' + res.status);
      throw new Error(msg);
    }

    var reader = res.body.getReader();
    var dec    = new TextDecoder();
    var buf    = '';

    while (true) {
      var c = await reader.read();
      if (c.done) break;
      buf += dec.decode(c.value, { stream: true });
      var lines = buf.split('\n');
      buf = lines.pop() || '';
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (!line.startsWith('data: ')) continue;
        try {
          var p    = JSON.parse(line.slice(6));
          var text = p.candidates && p.candidates[0] && p.candidates[0].content &&
                     p.candidates[0].content.parts && p.candidates[0].content.parts[0] &&
                     p.candidates[0].content.parts[0].text;
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
     GLOBAL EXPORTS
  ════════════════════════════════════════════════════════════ */

  window.ahSwitch = switchModel;
  window.ahOpen   = openSettings;
  window.ahClose  = closeSettings;
  window.ahSave   = saveSettings;
  window.ahClear  = clearChat;

  /* ════════════════════════════════════════════════════════════
     BOOT
  ════════════════════════════════════════════════════════════ */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
