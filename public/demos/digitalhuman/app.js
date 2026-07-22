(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const defaultPersonas = [
    { id: 'fengge', name: '峰哥表达风格', persona: '你是一位表达直接、观点鲜明但保持诚实边界的数字人。使用口语化短句，先回应问题核心，再给出判断依据。' },
    { id: 'product', name: 'AI 产品顾问', persona: '你是一名技术型 AI 产品顾问。先拆解业务目标，再说明模型边界、系统依赖、成本风险和可交付方案。' },
    { id: 'companion', name: '共情陪伴', persona: '你是一位耐心、克制、善于倾听的数字伙伴。先确认情绪与事实，再给出温和且可执行的建议。' },
  ];
  const defaultCharacters = [
    { id: 'fengge-demo', name: '峰哥数字人', image_uri: '', voice: 'Raymond', call_mode: 'video', persona: defaultPersonas[0].persona },
    { id: 'product-demo', name: 'AI 产品顾问', image_uri: '', voice: 'Ethan', call_mode: 'video', persona: defaultPersonas[1].persona },
    { id: 'companion-demo', name: '数字陪伴者', image_uri: '', voice: 'Tina', call_mode: 'audio', persona: defaultPersonas[2].persona },
  ];

  const state = {
    backend: localStorage.getItem('fengge_backend') || 'http://127.0.0.1:8791',
    region: localStorage.getItem('fengge_region') || 'cn',
    real: localStorage.getItem('fengge_real') === '1',
    apiKey: sessionStorage.getItem('fengge_api_key') || '',
    characters: [],
    personas: [],
    editingId: null,
    selected: null,
    avatarData: '',
    audioData: '',
    live: null,
    rtc: null,
    callStartedAt: 0,
    callTimer: 0,
    mediaStream: null,
  };

  const toast = $('#toast');
  let toastTimer = 0;
  function notify(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2700);
  }

  function log(message, level = 'INFO') {
    const row = document.createElement('div');
    row.className = `log-row${level === 'ERROR' ? ' error' : ''}`;
    row.innerHTML = `<time>${new Date().toLocaleTimeString('zh-CN', { hour12: false })}</time><span>${escapeHtml(message)}</span><em>${level}</em>`;
    $('#log').prepend(row);
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  function normalizeBase(value) {
    return value.trim().replace(/\/+$/, '');
  }

  function saveSettings() {
    state.backend = normalizeBase($('#backend-url').value) || 'http://127.0.0.1:8791';
    state.region = $('#region').value;
    state.real = $('#real-mode').checked;
    state.apiKey = $('#api-key').value.trim();
    localStorage.setItem('fengge_backend', state.backend);
    localStorage.setItem('fengge_region', state.region);
    localStorage.setItem('fengge_real', state.real ? '1' : '0');
    sessionStorage.setItem('fengge_api_key', state.apiKey);
    $('#open-native').href = state.backend;
    $('#open-native-call').dataset.href = state.backend;
    $('#connection-badge').textContent = state.real ? '真实后端' : '演示模式';
    $('#connection-badge').classList.toggle('real', state.real);
  }

  $('#backend-url').value = state.backend;
  $('#region').value = state.region;
  $('#real-mode').checked = state.real;
  $('#api-key').value = state.apiKey;
  saveSettings();

  async function requestJson(path, options = {}) {
    const headers = new Headers(options.headers || {});
    if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
    if (state.apiKey) headers.set('X-Vidu-Api-Key', state.apiKey);
    headers.set('X-Vidu-Region', state.region);
    const response = await fetch(`${state.backend}${path}`, { ...options, headers });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || `HTTP ${response.status}`);
    return payload;
  }

  $('#settings-toggle').addEventListener('click', (event) => {
    const panel = $('#settings-panel');
    const open = panel.hidden;
    panel.hidden = !open;
    event.currentTarget.setAttribute('aria-expanded', String(open));
  });
  ['backend-url', 'region', 'real-mode', 'api-key'].forEach((id) => $(`#${id}`).addEventListener('change', saveSettings));

  function setView(name) {
    $$('.view-tabs button').forEach((button) => button.classList.toggle('active', button.dataset.view === name));
    $$('.view').forEach((view) => view.classList.toggle('active', view.id === `view-${name}`));
  }
  $$('.view-tabs button').forEach((button) => button.addEventListener('click', () => setView(button.dataset.view)));

  async function connectBackend() {
    saveSettings();
    if (!state.real) {
      state.characters = loadLocal('fengge_demo_characters', defaultCharacters);
      state.personas = loadLocal('fengge_demo_personas', defaultPersonas);
      renderAll();
      notify('演示模式已就绪');
      log('演示数据已载入');
      return;
    }
    try {
      const [config, chars, personas] = await Promise.all([
        requestJson('/api/config'),
        requestJson('/api/characters'),
        requestJson('/api/personas'),
      ]);
      state.characters = chars.characters || [];
      state.personas = personas.personas || [];
      if (!state.characters.length && config.avatar) {
        state.characters = [{ id: 'server-default', name: config.avatar.name || '数字人', image_uri: config.avatar.image_uri || '', voice: config.default_voice || 'Tina', call_mode: config.call_mode || 'video', persona: config.avatar.persona || '你是一个友好的助手。' }];
      }
      renderAll();
      $('#connection-badge').textContent = config.has_key || state.apiKey ? '后端已连接' : '后端已连接 · 缺少 Key';
      log(`后端连接成功：${state.backend}`);
      notify('角色库与人格库同步完成');
    } catch (error) {
      log(error.message, 'ERROR');
      notify(`连接失败：${error.message}`);
    }
  }
  $('#connect-backend').addEventListener('click', connectBackend);

  function loadLocal(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || 'null') || structuredClone(fallback); } catch { return structuredClone(fallback); }
  }
  function saveLocal() {
    localStorage.setItem('fengge_demo_characters', JSON.stringify(state.characters));
    localStorage.setItem('fengge_demo_personas', JSON.stringify(state.personas));
  }

  function renderAll() {
    renderCharacters();
    renderPersonas();
    populatePersonaSelect();
  }

  function avatarStyle(uri) {
    return uri ? ` style="background-image:url('${escapeHtml(uri)}')"` : '';
  }

  function renderCharacters() {
    const grid = $('#character-grid');
    grid.innerHTML = state.characters.map((character) => `<article class="character-card" data-id="${escapeHtml(character.id)}"><div class="character-visual"><div class="character-avatar${character.image_uri ? ' has-image' : ''}"${avatarStyle(character.image_uri)}></div></div><div class="character-info"><h3>${escapeHtml(character.name)}</h3><p>${escapeHtml((character.persona || '').slice(0, 92))}${(character.persona || '').length > 92 ? '…' : ''}</p><div class="character-meta"><span>${escapeHtml(character.voice || 'Tina')}</span><span>${escapeHtml(character.call_mode || 'video')}</span></div><div class="character-actions"><button class="edit" type="button">编辑</button><button class="call" type="button">开始通话</button></div></div></article>`).join('') || '<p>角色库为空，请新建角色。</p>';
    $$('.character-card').forEach((card) => {
      const character = state.characters.find((item) => String(item.id) === card.dataset.id);
      $('.edit', card).addEventListener('click', () => openEditor(character));
      $('.call', card).addEventListener('click', () => startCall(character));
    });
  }

  function renderPersonas() {
    $('#persona-count').textContent = `${state.personas.length} 个`;
    $('#persona-list').innerHTML = state.personas.map((persona) => `<button class="persona-chip" type="button" data-id="${escapeHtml(persona.id)}">${escapeHtml(persona.name)}</button>`).join('') || '<span>暂无人格</span>';
    $$('.persona-chip').forEach((button) => button.addEventListener('click', () => {
      const persona = state.personas.find((item) => String(item.id) === button.dataset.id);
      openEditor(null, persona);
    }));
  }

  function populatePersonaSelect() {
    $('#persona-preset').innerHTML = '<option value="">不套用</option>' + state.personas.map((persona) => `<option value="${escapeHtml(persona.id)}">${escapeHtml(persona.name)}</option>`).join('');
  }

  function resetEditor() {
    state.editingId = null;
    state.avatarData = '';
    $('#editor-title').textContent = '新建角色';
    $('#character-name').value = '峰哥数字人';
    $('#avatar-url').value = '';
    $('#avatar-file').value = '';
    $('#avatar-preview').style.backgroundImage = '';
    $('#avatar-preview').innerHTML = '<span>上传形象</span>';
    $('#voice').value = 'Raymond';
    $('#custom-voice-row').hidden = true;
    $('#call-mode').value = 'video';
    $('#persona-preset').value = '';
    $('#persona').value = defaultPersonas[0].persona;
  }

  function openEditor(character = null, personaPreset = null) {
    resetEditor();
    if (character) {
      state.editingId = character.id;
      $('#editor-title').textContent = `编辑角色 · ${character.name}`;
      $('#character-name').value = character.name || '';
      $('#avatar-url').value = character.image_uri || '';
      setAvatar(character.image_uri || '');
      const option = [...$('#voice').options].find((item) => item.value === character.voice);
      if (option) $('#voice').value = character.voice;
      else { $('#voice').value = '__custom__'; $('#custom-voice-row').hidden = false; $('#custom-voice').value = character.voice || ''; }
      $('#call-mode').value = character.call_mode || 'video';
      $('#persona').value = character.persona || '';
    }
    if (personaPreset) {
      $('#persona-preset').value = personaPreset.id;
      $('#persona').value = personaPreset.persona;
    }
    setView('editor');
  }

  $('#new-character').addEventListener('click', () => openEditor());
  $('#back-library').addEventListener('click', () => setView('library'));
  $('#voice').addEventListener('change', () => { $('#custom-voice-row').hidden = $('#voice').value !== '__custom__'; });
  $('#persona-preset').addEventListener('change', () => {
    const persona = state.personas.find((item) => String(item.id) === $('#persona-preset').value);
    if (persona) $('#persona').value = persona.persona;
  });

  function setAvatar(uri) {
    state.avatarData = uri;
    const preview = $('#avatar-preview');
    preview.innerHTML = uri ? '' : '<span>上传形象</span>';
    preview.style.backgroundImage = uri ? `url("${uri.replaceAll('"', '%22')}")` : '';
  }
  $('#avatar-url').addEventListener('input', () => setAvatar($('#avatar-url').value.trim()));
  $('#avatar-file').addEventListener('change', async () => {
    const file = $('#avatar-file').files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return notify('图片需小于 10MB');
    setAvatar(await readAsDataURL(file));
  });
  $('#audio-file').addEventListener('change', async () => {
    const file = $('#audio-file').files?.[0];
    if (!file) return;
    if (file.size > 19 * 1024 * 1024) return notify('参考音频需小于 19MB');
    state.audioData = await readAsDataURL(file);
    $('#clone-status').textContent = `已选择：${file.name}`;
  });
  function readAsDataURL(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(reader.error); reader.readAsDataURL(file); }); }

  function editorPayload() {
    const voice = $('#voice').value === '__custom__' ? $('#custom-voice').value.trim() : $('#voice').value;
    return {
      id: state.editingId || `char_${Date.now()}`,
      name: $('#character-name').value.trim(),
      image_uri: state.avatarData || $('#avatar-url').value.trim(),
      voice: voice || 'Tina',
      call_mode: $('#call-mode').value,
      persona: $('#persona').value.trim(),
    };
  }

  async function saveCharacter() {
    const character = editorPayload();
    if (!character.name) throw new Error('请填写角色名称');
    if (state.real) {
      const result = await requestJson('/api/characters', { method: 'POST', body: JSON.stringify(character) });
      character.id = result.character?.id || character.id;
    }
    const index = state.characters.findIndex((item) => String(item.id) === String(state.editingId));
    if (index >= 0) state.characters[index] = character; else state.characters.push(character);
    state.editingId = character.id;
    if (!state.real) saveLocal();
    renderAll();
    notify('角色已保存');
    log(`角色已保存：${character.name}`);
    return character;
  }

  $('#character-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    try { await saveCharacter(); setView('library'); } catch (error) { notify(error.message); }
  });
  $('#save-call').addEventListener('click', async () => {
    try { const character = await saveCharacter(); await startCall(character); } catch (error) { notify(error.message); }
  });

  $('#clone-voice').addEventListener('click', async () => {
    const audio = $('#audio-url').value.trim() || state.audioData;
    const voice = $('#clone-name').value.trim();
    if (!audio || !voice) return notify('请选择参考音频并填写音色名称');
    if (!/^[A-Za-z0-9_]{1,16}$/.test(voice)) return notify('音色名称只能包含字母、数字、下划线，最长 16 位');
    $('#clone-status').textContent = '克隆中…请确保音频已获得授权';
    try {
      if (state.real) await requestJson('/api/voice/clone', { method: 'POST', body: JSON.stringify({ audio_url: audio, voice, language: 'zh' }) });
      else await delay(900);
      let option = [...$('#voice').options].find((item) => item.value === voice);
      if (!option) { option = document.createElement('option'); option.value = voice; option.textContent = `${voice} · 我的克隆音色`; $('#voice').append(option); }
      $('#voice').value = voice;
      $('#custom-voice-row').hidden = true;
      $('#clone-status').textContent = `已克隆并选用：${voice}`;
      log(`音色克隆完成：${voice}`);
    } catch (error) { $('#clone-status').textContent = `克隆失败：${error.message}`; log(error.message, 'ERROR'); }
  });

  function delay(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

  async function markStep(name, detail = '', done = true) {
    const item = $(`#stepper [data-step="${name}"]`);
    if (!item) return;
    item.classList.add('active');
    $('small', item).textContent = detail;
    await delay(260);
    if (done) item.classList.add('done');
  }

  function resetStepper() {
    $$('#stepper li').forEach((item) => { item.classList.remove('active', 'done'); $('small', item).textContent = ''; });
  }

  function displayActiveAvatar(character) {
    const avatar = $('#active-avatar');
    avatar.className = `active-avatar${character.image_uri ? ' has-image' : ''}`;
    avatar.style.backgroundImage = character.image_uri ? `url("${character.image_uri.replaceAll('"', '%22')}")` : '';
  }

  async function startCall(character) {
    state.selected = character;
    resetStepper();
    displayActiveAvatar(character);
    setView('call');
    $('#stage-message').textContent = `正在连接 ${character.name}…`;
    try {
      await markStep('create', '提交角色、音色与人设', false);
      let payload;
      if (state.real) {
        payload = await requestJson('/api/live', { method: 'POST', body: JSON.stringify({ avatar_name: character.name, avatar_image_uri: character.image_uri, avatar_persona: character.persona, voice: character.voice, call_mode: character.call_mode }) });
      } else {
        await delay(620);
        payload = { live: { id: `live_demo_${Date.now().toString(36)}`, status: 'created' }, rtc: { channel_name: `demo_${Math.random().toString(36).slice(2, 8)}`, user_id: 'portfolio_user' }, ws: { url: 'demo://control-channel' } };
      }
      state.live = payload.live || {};
      state.rtc = payload.rtc || {};
      $('#stepper [data-step="create"]').classList.add('done');
      $('#live-id').textContent = state.live.id || state.live.live_id || '-';
      $('#live-status').textContent = state.live.status || 'created';
      await markStep('rtc', state.rtc.channel_name || state.rtc.channel || 'RTC 参数已返回');
      $('#rtc-channel').textContent = state.rtc.channel_name || state.rtc.channel || '-';
      $('#rtc-user').textContent = state.rtc.user_id || state.rtc.userId || '-';
      await markStep('ws', state.real ? '请在原生控制台完成 WS / RTC' : '演示控制通道已连接');
      await markStep('init', 'conn_init 已准备');
      await markStep('ready', state.real ? '会话已创建，可打开原生控制台' : '演示会话就绪');
      $('#stage-message').textContent = state.real ? `${character.name} 会话已创建，点击右侧进入原生 RTC 控制台` : `${character.name} 正在演示实时回应`;
      $('#hangup').disabled = false;
      $('#query-live').disabled = false;
      $('#mic-toggle').disabled = false;
      $('#cam-toggle').disabled = character.call_mode === 'audio';
      startTimer();
      log(`会话已创建：${$('#live-id').textContent}`);
    } catch (error) {
      $('#live-status').textContent = 'failed';
      $('#stage-message').textContent = `连接失败：${error.message}`;
      log(error.message, 'ERROR');
      notify(error.message);
    }
  }

  function startTimer() {
    state.callStartedAt = Date.now();
    clearInterval(state.callTimer);
    state.callTimer = setInterval(() => {
      const seconds = Math.floor((Date.now() - state.callStartedAt) / 1000);
      $('#call-timer').textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    }, 1000);
  }

  $('#query-live').addEventListener('click', async () => {
    const id = state.live?.id || state.live?.live_id;
    if (!id) return;
    try {
      const payload = state.real ? await requestJson(`/api/live?live_id=${encodeURIComponent(id)}`) : { live: { id, status: 'active' } };
      const status = payload.live?.status || payload.status || 'active';
      $('#live-status').textContent = status;
      notify(`会话状态：${status}`);
      log(`查询会话状态：${status}`);
    } catch (error) { notify(error.message); }
  });

  $('#hangup').addEventListener('click', () => {
    clearInterval(state.callTimer);
    $('#live-status').textContent = 'ended';
    $('#stage-message').textContent = '会话已结束';
    $('#hangup').disabled = true;
    $('#query-live').disabled = true;
    $('#mic-toggle').disabled = true;
    $('#cam-toggle').disabled = true;
    log('用户结束会话');
  });
  $('#mic-toggle').addEventListener('click', (event) => { event.currentTarget.classList.toggle('active'); event.currentTarget.textContent = event.currentTarget.classList.contains('active') ? '🔇 麦克风已关闭' : '🎙 麦克风'; });
  $('#cam-toggle').addEventListener('click', (event) => { event.currentTarget.classList.toggle('active'); event.currentTarget.textContent = event.currentTarget.classList.contains('active') ? '🚫 摄像头已关闭' : '📷 摄像头'; });
  $('#open-native-call').addEventListener('click', () => window.open(state.backend, '_blank', 'noopener'));

  $('#device-check').addEventListener('click', async () => {
    try {
      state.mediaStream?.getTracks().forEach((track) => track.stop());
      state.mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      $('#local-preview').srcObject = state.mediaStream;
      const video = state.mediaStream.getVideoTracks()[0]?.label || '摄像头可用';
      const audio = state.mediaStream.getAudioTracks()[0]?.label || '麦克风可用';
      $('#device-result').textContent = `${video} · ${audio}`;
      log('设备检测通过');
      notify('摄像头与麦克风可用');
    } catch (error) { $('#device-result').textContent = `设备检测失败：${error.message}`; log(error.message, 'ERROR'); }
  });
  $('#clear-log').addEventListener('click', () => { $('#log').innerHTML = ''; });

  connectBackend();
})();
