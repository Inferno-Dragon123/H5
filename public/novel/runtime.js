/* Monogatari 2.8.0 adapter. The host Vue app owns quizzes, rewards and all audio. */
(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const chapterId = params.get('chapter') || 'wuyi';
  const mode = ['quick', 'city', 'deep'].includes(params.get('mode')) ? params.get('mode') : 'city';
  const session = params.get('session') || '';
  const channel = 'star-city-novel-v2';
  const hostOrigin = location.origin;
  const state = { pending: null, settings: { name: '探索者', soundEnabled: false }, scene: '', cast: new Map(), overlay: '', music: '', loaded: false, passed: false, nextPlace: null, lastBeat: null };
  const stage = document.getElementById('evidence-stage');
  const effects = document.getElementById('scene-effects');
  const labels = new Map();
  const assetCache = new Map();
  let novel, data;
  const emit = (type, detail = {}) => parent.postMessage({ channel, session, type, ...detail }, hostOrigin);
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const accepted = beat => !beat.whenModes || beat.whenModes.includes(mode);
  const relativeAsset = src => String(src).replace(/^\/assets\//, '');
  const delay = time => new Promise(resolve => setTimeout(resolve, time));
  const motionClass = { 'enter-left': 'fadeInLeft', 'enter-right': 'fadeInRight', 'lean-in': 'novel-lean', bow: 'novel-bow', nod: 'novel-nod', bounce: 'novel-bounce', offer: 'novel-offer', salute: 'novel-salute', dissolve: 'novel-dissolve' };
  const sounds = { warning: 'villain', glitch: 'villain', clue: 'transition', 'coin-rain': 'points', 'incoming-call': 'call-connect', purify: 'unlock', 'mirror-shatter': 'popup-break', 'city-restore': 'city-restore', pursuit: 'bike-bell' };

  function fail(error) {
    const message = error instanceof Error ? error.message : String(error);
    document.getElementById('novel-error-message').textContent = message;
    document.getElementById('novel-error').hidden = false;
    emit('error', { message, chapter: chapterId });
  }
  window.addEventListener('error', event => fail(event.error || event.message));
  window.addEventListener('unhandledrejection', event => fail(event.reason));
  document.getElementById('novel-retry').addEventListener('click', () => location.reload());
  window.addEventListener('message', event => {
    if (event.origin !== hostOrigin || event.source !== parent || event.data?.channel !== channel || event.data?.session !== session) return;
    const message = event.data;
    if (message.type === 'settings') {
      state.settings = { ...state.settings, ...message };
      if (novel) novel.characters({ player: { name: state.settings.name, color: '#e5cb8c' } });
    } else if (message.type === 'quiz-result' && state.pending) {
      const pending = state.pending;
      state.pending = null;
      state.passed = message.passed === true;
      novel.storage({ quizPassed: state.passed, quizScore: Number(message.score) || 0 });
      document.body.classList.remove('quiz-pending');
      pending.resolve(true);
    } else if (message.type === 'pause' && novel) {
      novel.autoPlay(false);
    }
  });
  // Pending external quiz promises cannot be serialized into a save. Block both menu and shortcuts.
  document.addEventListener('keydown', event => {
    if (state.pending && (event.key === 'Escape' || (event.shiftKey && /[sl]/i.test(event.key)))) {
      event.preventDefault(); event.stopImmediatePropagation();
    }
  }, true);
  document.addEventListener('click', event => {
    const control = event.target.closest('[data-action]');
    if (state.pending && control) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);

  async function checkedAsset(src, fallback) {
    if (!src) throw new Error('剧本缺少场景素材路径。');
    if (!assetCache.has(src)) assetCache.set(src, new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(src);
      image.onerror = () => fallback && fallback !== src ? checkedAsset(fallback).then(resolve, reject) : reject(new Error(`场景素材未能载入：${src}`));
      image.src = src;
    }));
    return assetCache.get(src);
  }

  function evidenceTemplate(type) {
    const cards = {
      flyer: { label: '文创礼品传单', title: '免费礼物，真的免费吗？', tag: '进群返现 · 限时任务', lines: ['领取长沙文创礼品', '完成三单任务，垫付越多返现越多'], clues: [['返佣条件', '先垫资、连续做单，是需要立即停下的风险信号。'], ['收益截图', '截图与群聊好评也可能是提前安排的。']] },
      'investment-invitation': { label: '财富邀请函', title: '内部名额 · 每日固定 3%', tag: '来源未核验', lines: ['“收益稳定，今天最后开放”', '陌生群聊二维码与安装包'], clues: [['收益承诺', '高收益和零风险的承诺，不能代替资质与风险核实。'], ['邀请来源', '独立查证机构及产品；不要沿陌生链接完成投资。']] },
      contract: { label: '老长沙契约', title: '一纸契约，一诺千金', tag: '检查被遮住的条款', lines: ['“零利息” · “每月最低”', '完整费用与还款条款被遮挡'], clues: [['揭开费用明细', '除了利息，还要核对服务费、总费用和实际年化成本。'], ['揭开还款条件', '看清期限、违约责任与还款能力；不签空白合同。']] },
      'credit-alert': { label: '陌生页面 · 模拟', title: '征信异常 · 立即修复', tag: '官方身份未核验', lines: ['要求上传隐私证明照', '“支付修复费，否则影响信用”'], clues: [['核对来电身份', '独立打开已知官方渠道核实；对方提供的链接不能验证对方。'], ['检查收费要求', '不要相信付费洗白，不向陌生人提供密码或验证码。']] },
      'bike-warning': { label: '共享单车开锁页面 · 模拟', title: '免费骑行？先做验证', tag: '额外安装与验证码要求', lines: ['“安装验证程序，即可免费骑行”', '要求提供账户验证码'], clues: [['检查安装要求', '退出仿冒页面，回到正规应用确认订单。'], ['保护账户信息', '不把验证码、账户密码交给不明页面。']] },
      sms: { label: '陌生积分短信', title: 'i豆即将清零？', tag: '发件人身份未核验', lines: ['“立即点击链接兑换”', '要求账户信息与短信验证码'], clues: [['检查兑换入口', '自主打开官方应用核对活动，不通过短信里的链接登录。'], ['检查验证码要求', '验证码应由你保管，不应发送给陌生客服。']] },
      'redemption-card': { label: '桌边兑换卡', title: '“立即领取”的另一面', tag: '兑换入口未核验', lines: ['打开陌生链接领取奖励', '把短信验证码交给客服'], clues: [['核对活动', '在官方应用里核对活动名称、规则和兑换对象。'], ['确认兑换对象', '不沿陌生客服提供的路径核验活动。']] },
      'travel-pack': { label: '剧情权益 · 模拟', title: '工银青绿出行专享券包', tag: '绿色出行 · 城市动线', lines: ['骑行券与出行体验券', '沿城市路线继续长沙探索'], success: true },
      receipt: { label: '剧情核销 · 模拟', title: '青绿限定咖啡已确认', tag: '官方入口 · 核对完成', lines: ['兑换对象与活动信息一致', '新的探索印章已点亮'], success: true },
      'credit-alert-cleared': { label: '官方核验已完成', title: '征信修复骗局已识别', tag: '停止转账 · 拒绝泄露', lines: ['冒充身份的异常代码正在崩解', 'i豆光雨写入探索记录'], success: true },
      'verification-confirmed': { label: '独立联系本人', title: '押金要求未获本人确认', tag: '身份与资金请求已核验', lines: ['通过已知联系方式核实身份', '停止向陌生账户转账'], success: true },
      'ending-passport': { label: '智游镜界 · 深度探索', title: '数智潇湘，因你点亮', tag: '城市安全网络已恢复', lines: ['文化的真实，生活的美好', '都值得被认真守护'], success: true },
    };
    if (type === 'video-call') return `<section class="evidence-card evidence-card--call" data-action="inspect-evidence"><div class="evidence-meta"><span class="live-dot"></span> 视频来电 · 剧情模拟</div><div class="call-grid"><img src="${escapeHtml(data.characters.teacher.sprites.urgent)}" alt="辅导员影像"><div><span class="call-label">熟悉的面容</span><h3>大学辅导员</h3><p>紧急文创押金</p><strong>¥ 5,000</strong></div></div><div class="call-wave"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><p class="call-caution">脸与声音，不等于身份已核实</p></section>`;
    if (type === 'verification') return `<section class="evidence-card verification-card" data-action="inspect-evidence"><div class="evidence-meta">独立核验 · 点击检查线索</div><h3>把判断交还给自己</h3><div class="evidence-hotspots">${[['known-contact', '已知联系方式', '通过自己通讯录中的联系方式独立联系本人。'], ['funds', '活动与资金要求', '核对活动是否真实，以及押金、账户、用途是否一致。'], ['identity', '身份信息', '视频画面与声音只能作为线索，不能保证身份。']].map(([id,label,hint]) => `<button data-action="inspect-evidence" data-evidence="${id}" data-hint="${hint}"><span class="inspect-dot"></span>${label}<small>点击核验</small></button>`).join('')}</div><p class="evidence-feedback" aria-live="polite">点击项目，逐项核查。</p></section>`;
    const card = cards[type];
    if (!card) throw new Error(`尚未定义的剧情调查卡：${type}`);
    return `<section class="evidence-card ${card.success ? 'evidence-card--success' : ''} ${type === 'contract' ? 'evidence-card--contract' : ''}" data-action="inspect-evidence"><div class="evidence-meta">${card.label}</div><h3>${card.title}</h3><span class="evidence-tag">${card.tag}</span><div class="evidence-lines">${card.lines.map(line => `<p>${line}</p>`).join('')}</div>${card.clues ? `<div class="evidence-hotspots">${card.clues.map(([label,hint],i) => `<button data-action="inspect-evidence" data-evidence="${i}" data-hint="${escapeHtml(hint)}"><span class="inspect-dot"></span>${label}<small>点击调查</small></button>`).join('')}</div><p class="evidence-feedback" aria-live="polite">点亮线索，再作出判断。</p>` : '<div class="verified-mark">✓ 已确认</div>'}</section>`;
  }
  stage.addEventListener('click', event => {
    const toggle = event.target.closest('[data-evidence-toggle]');
    if (toggle) {
      event.stopPropagation();
      stage.dataset.expanded = stage.dataset.expanded === 'true' ? 'false' : 'true';
      toggle.textContent = stage.dataset.expanded === 'true' ? '收起线索 ⌃' : '查看线索 ⌄';
      toggle.setAttribute('aria-expanded', stage.dataset.expanded);
      return;
    }
    const target = event.target.closest('[data-evidence]');
    if (!target) return;
    event.stopPropagation();
    target.classList.add('inspected');
    target.querySelector('small').textContent = '已查看';
    stage.querySelector('.evidence-feedback').textContent = target.dataset.hint;
    emit('audio', { sfx: 'click' });
  });

  function renderEffect(effect) {
    document.body.dataset.effect = effect || '';
    effects.replaceChildren();
    if (!effect) return;
    if (['coin-rain', 'fireflies', 'gold-stream', 'purify', 'city-restore'].includes(effect)) {
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < (effect === 'coin-rain' ? 34 : 20); i++) {
        const particle = document.createElement('span');
        particle.className = effect === 'coin-rain' ? 'coin-particle' : 'light-particle';
        particle.style.setProperty('--x', `${(i * 37 + 11) % 100}%`);
        particle.style.setProperty('--delay', `${(i % 7) * -.47}s`);
        particle.style.setProperty('--drift', `${(i % 2 ? 1 : -1) * (16 + i * 2)}px`);
        particle.textContent = effect === 'coin-rain' ? 'i' : '';
        fragment.appendChild(particle);
      }
      effects.appendChild(fragment);
    } else if (effect === 'mirror-shatter') {
      const source = document.querySelector('[data-character="teacher"]')?.src || data.characters.teacher.sprites.urgent;
      for (let row = 0; row < 4; row++) for (let column = 0; column < 4; column++) {
        const shard = document.createElement('span');
        shard.className = 'mirror-shard';
        shard.style.cssText = `--col:${column};--row:${row};--spin:${(row - column) * 13}deg;--tx:${(column - 1.5) * 70}px;--ty:${(row - 1.5) * 70}px;--delay:${(row + column) * .07}s;background-image:url("${source}")`;
        effects.appendChild(shard);
      }
    } else if (effect === 'route-arrow') effects.innerHTML = '<div class="route-light">↑<span>沿城市动线，继续追踪</span></div>';
    else if (['scan', 'radar', 'clue'].includes(effect)) effects.innerHTML = '<div class="scan-line"></div><div class="radar-ring"></div>';
    if (sounds[effect]) emit('audio', { sfx: sounds[effect] });
  }

  async function setCast(cast, speaker) {
    const nextIds = new Set(cast.map(character => character.id));
    for (const id of state.cast.keys()) if (!nextIds.has(id)) { await novel.run(`hide character ${id} with fadeOut duration 0.35s`, false); state.cast.delete(id); }
    for (const character of cast) {
      const definition = data.characters[character.id];
      if (!definition) throw new Error(`剧本未定义人物：${character.id}`);
      const expression = character.expression || 'neutral';
      const requested = definition.sprites[expression] || definition.sprites.neutral;
      const src = await checkedAsset(requested, definition.fallback);
      const key = expression.replace(/[^a-z0-9_]/gi, '_');
      novel.characters({ [character.id]: { sprites: { [key]: relativeAsset(src) } } });
      const previous = state.cast.get(character.id);
      const position = character.position || previous?.position || definition.defaultPosition || 'right';
      const motion = character.motion || 'idle';
      const animation = motionClass[motion] || 'fadeIn';
      if (!previous || previous.expression !== expression) {
        // Leave the old sprite's end-fadeOut class in place to obtain a true crossfade.
        await novel.run(`show character ${character.id} ${key} at ${position} with ${animation} end-fadeOut duration 0.5s`, false);
      } else if (position !== previous.position) {
        await novel.run(`show character ${character.id} ${key} at ${position} with move transition 0.7s end-fadeOut`, false);
      } else if (motion !== 'idle' && motion !== previous.motion) {
        const image = document.querySelector(`[data-character="${character.id}"]:not([data-visibility="invisible"])`);
        if (image) { image.classList.remove(animation); void image.offsetWidth; image.classList.add(animation); }
      }
      state.cast.set(character.id, { expression, position, motion });
    }
    document.querySelectorAll('[data-character]').forEach(image => {
      image.classList.toggle('is-speaking', data.characters[image.dataset.character]?.name === speaker);
      image.classList.toggle('is-listening', !!speaker && data.characters[image.dataset.character]?.name !== speaker);
    });
  }

  async function applyBeat(beat, index, total) {
    document.body.dataset.decision = beat.type === 'choice' ? 'active' : '';
    state.lastBeat = beat;
    state.nextPlace = beat.nextPlace || state.nextPlace;
    const newScene = beat.sceneId && state.scene !== beat.sceneId;
    if (newScene) {
      state.scene = beat.sceneId;
      const background = data.backgrounds[beat.background];
      if (!background) throw new Error(`剧本未定义背景：${beat.background}`);
      const src = await checkedAsset(background.src, background.fallback);
      novel.assets('scenes', { [beat.background]: relativeAsset(src) });
      document.body.dataset.transition = beat.transition || 'crossfade';
      await novel.run(`show scene ${beat.background} with fadeIn duration 0.75s`, false);
      state.cast.clear();
      document.body.dataset.scene = beat.background;
      document.getElementById('scene-caption').innerHTML = `<span>CHANGSHA / MIRROR WORLD</span><strong>${escapeHtml(beat.setting || beat.sceneTitle || '')}</strong>`;
      document.getElementById('scene-caption').classList.remove('caption-enter');
      void document.getElementById('scene-caption').offsetWidth;
      document.getElementById('scene-caption').classList.add('caption-enter');
      const ambience = ['juzizhou', 'dufu', 'riverside'].includes(beat.background) ? 'river' : ['wuyi', 'taiping', 'jiefangxi', 'chaozong', 'pozi'].includes(beat.background) ? 'street' : null;
      emit('audio', { ambience });
    }
    const cast = Array.isArray(beat.cast) ? beat.cast : [];
    await setCast(cast, beat.speaker);
    if (beat.overlay !== state.overlay) {
      state.overlay = beat.overlay || '';
      stage.innerHTML = state.overlay ? evidenceTemplate(state.overlay) : '';
      stage.dataset.expanded = 'false';
      if (state.overlay) {
        const toggle = document.createElement('button');
        toggle.className = 'evidence-toggle';
        toggle.dataset.evidenceToggle = '';
        toggle.dataset.action = 'inspect-evidence';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '查看线索 ⌄';
        stage.querySelector('.evidence-card').appendChild(toggle);
      }
      stage.dataset.kind = state.overlay;
      stage.classList.toggle('has-evidence', !!state.overlay);
    }
    renderEffect(beat.effect);
    const clue = document.getElementById('clue-caption');
    clue.textContent = beat.clue || '';
    clue.classList.toggle('visible', !!beat.clue);
    const scene = beat.music === 'finale' ? 'story-finale' : beat.background === 'riverside' ? 'story-chase' : beat.music === 'tension' ? 'story-tension' : beat.background === 'jiefangxi' ? 'story-night' : ['taiping', 'dufu', 'chaozong', 'pozi'].includes(beat.background) ? 'story-heritage' : 'story';
    if (scene !== state.music) { state.music = scene; emit('audio', { scene }); }
    emit('progress', { title: data.chapters[chapterId].chapter, setting: beat.setting || state.scene, index, total, chapter: chapterId, phase: beat.phase, scene: beat.sceneId, nextPlace: state.nextPlace });
  }

  function quizCheckpoint() {
    if (state.pending) return state.pending.promise;
    novel.autoPlay(false);
    document.body.classList.add('quiz-pending');
    const promise = new Promise(resolve => {
      state.pending = { resolve };
      emit('quiz', { chapter: chapterId, place: chapterId });
    });
    state.pending.promise = promise;
    return promise;
  }

  function compile() {
    const chapter = data.chapters[chapterId];
    if (!chapter) throw new Error(`未找到章节：${chapterId}`);
    const script = {};
    const phases = ['beforeQuiz', 'afterPass', 'afterFail'];
    const filtered = Object.fromEntries(phases.map(phase => [phase, (chapter[phase] || []).filter(accepted).map(beat => ({ ...beat, phase }))]));
    const total = filtered.beforeQuiz.length + Math.max(filtered.afterPass.length, filtered.afterFail.length);
    const phaseStarts = {};
    for (const phase of phases) {
      const beats = filtered[phase];
      phaseStarts[phase] = `${phase}_0`;
      beats.forEach((beat, i) => {
        const label = `${phase}_${i}`;
        const nextLabel = i + 1 < beats.length ? `${phase}_${i + 1}` : `${phase}_end`;
        const index = phase === 'beforeQuiz' ? i + 1 : filtered.beforeQuiz.length + i + 1;
        labels.set(label, { beat, index, total });
        script[label] = [function () { return applyBeat(beat, index, total).then(() => true); }];
        const dialog = `${speakerId(beat.speaker)} ${beat.text || ''}`.trim();
        if (beat.type === 'choice') {
          const choices = { Dialog: dialog };
          if (!beat.options?.length) throw new Error(`场景 ${beat.sceneId} 的选择没有选项。`);
          beat.options.forEach((option, optionIndex) => {
            const feedbackLabel = `${label}_feedback_${optionIndex}`;
            choices[option.id || `option${optionIndex}`] = { Text: option.label, Do: `jump ${feedbackLabel}`, Class: 'novel-choice' };
            script[feedbackLabel] = [function () { document.body.dataset.decision = ''; emit('audio', { sfx: option.safe ? 'correct' : 'wrong' }); document.body.dataset.choiceResult = option.safe ? 'safe' : 'risk'; return true; }, `gx ${option.feedback}`, `jump ${option.safe ? nextLabel : label}`];
          });
          script[label].push({ Choice: choices });
        } else if (beat.type === 'quiz' || beat.type === 'retry') {
          script[label].push(dialog, quizCheckpoint, { Conditional: { Condition: function () { return this.storage('quizPassed') === true; }, True: 'jump afterPass_0', False: 'jump afterFail_0' } });
        } else script[label].push(dialog, `jump ${nextLabel}`);
      });
      script[`${phase}_end`] = phase === 'beforeQuiz' ? [quizCheckpoint, { Conditional: { Condition: function () { return this.storage('quizPassed') === true; }, True: 'jump afterPass_0', False: 'jump afterFail_0' } }] : phase === 'afterFail' ? ['jump beforeQuiz_end'] : [function () { novel.autoPlay(false); emit('end', { passed: true, chapter: chapterId, nextPlace: state.nextPlace }); return false; }];
      if (!beats.length) script[`${phase}_0`] = [`jump ${phase}_end`];
    }
    script.Start = [`jump ${phaseStarts.beforeQuiz}`];
    return script;
  }
  function speakerId(speaker) {
    if (!speaker || speaker === '镜界记述') return '';
    const match = Object.entries(data.characters).find(([, definition]) => definition.name === speaker);
    if (match) return match[0];
    const id = 'speaker_' + Array.from(speaker).map(character => character.codePointAt(0).toString(16)).join('_');
    novel.characters({ [id]: { name: speaker, color: '#e4cc91' } });
    return id;
  }

  async function start() {
    const response = await fetch('./story.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error('剧情脚本未能载入，请重新打开这一章。');
    data = await response.json();
    novel = window.monogatari;
    if (!novel) throw new Error('Monogatari 引擎未能载入。');
    novel.settings({ Name: `StarCityNovel_${chapterId}_${mode}`, Version: '2.0.0', Label: 'Start', ShowMainScreen: false, Preload: false, ServiceWorkers: false, AutoSave: 0, Slots: 6, SaveLabel: 'StarCitySave', AutoSaveLabel: 'StarCityAuto', Screenshots: false, Orientation: 'any', ForceAspectRatio: 'None', TypeAnimation: true, InstantText: true, AllowRollback: false, Skip: 0, Storage: { Adapter: 'LocalStorage', Store: 'NovelData', Endpoint: '' }, AssetsPath: { root: '/assets', scenes: '.', characters: '.', images: '.', music: 'audio', sounds: 'audio', voices: 'audio' } });
    novel.preferences({ Language: '简体中文', TextSpeed: 23, AutoPlaySpeed: 4, Volume: { Music: 0, Voice: 0, Sound: 0, Video: 0 } });
    novel.translation('简体中文', { Log: '回看', Load: '读档', Save: '存档', AutoPlay: '自动', Hide: '隐藏' });
    novel.storage({ quizPassed: false, quizScore: 0 });
    // Legacy neutral PNGs include a large painted halo. Use the supplied transparent variants on this stage.
    for (const id of ['hanfu', 'owner', 'teacher']) {
      const character = data.characters[id];
      if (character) character.sprites.neutral = character.sprites[id === 'teacher' ? 'calm' : 'happy'] || character.sprites.neutral;
    }
    for (const [id, character] of Object.entries(data.characters)) novel.characters({ [id]: { name: character.name, color: ['gx', 'gongxiaozhi'].includes(id) ? '#89e6d7' : '#e5ca91', sprites: Object.fromEntries(Object.entries(character.sprites).map(([expression, src]) => [expression, relativeAsset(src)])) } });
    if (!data.characters.gx) novel.characters({ gx: { name: '工小智', color: '#89e6d7' } });
    novel.characters({ player: { name: state.settings.name, color: '#e5ca91' } });
    // Menu components receive their engine reference during init; configure beforehand through the engine.
    const menu = novel.configuration('quick-menu');
    menu.buttons = menu.buttons.filter(button => !['Quit', 'Settings'].includes(button.string));
    for (const method of ['saveTo', 'loadFromSlot']) {
      const original = novel[method].bind(novel);
      novel[method] = (...args) => state.pending ? Promise.resolve(false) : original(...args);
    }
    novel.script(compile());
    novel.on('didLoadGame', () => {
      state.cast.clear(); state.scene = ''; state.overlay = ''; state.nextPlace = null;
      const meta = labels.get(novel.state('label'));
      if (meta) applyBeat(meta.beat, meta.index, meta.total).catch(fail);
    });
    await novel.init('#monogatari');
    state.loaded = true;
    emit('ready', { chapter: chapterId, engine: 'Monogatari', version: '2.8.0' });
  }
  start().catch(fail);
})();
