<script setup>
import { computed, ref } from 'vue'
import AvatarFigure from './AvatarFigure.vue'
import { DEFAULT_AVATAR, HAIR_COLORS, HAIR_NAMES, normalizeAvatar, SUIT_NAMES } from './avatarRenderer'

const props = defineProps({ modelValue: { type: Object, default: () => ({ ...DEFAULT_AVATAR }) } })
const emit = defineEmits(['update:modelValue', 'save', 'close'])
const avatar = computed(() => normalizeAvatar(props.modelValue))
const activeTab = ref('hair')
const figure = ref(null)
const exportStatus = ref('')
const spinning = ref(false)
const assetBase = `${import.meta.env.BASE_URL}assets/avatar/`
const tabs = [{ id:'hair', label:'发型', icon:'✂' }, { id:'color', label:'发色', icon:'◐' }, { id:'suit', label:'穿搭', icon:'♧' }]
const colorName = computed(() => HAIR_COLORS.find((color) => color.value.toLowerCase() === avatar.value.color.toLowerCase())?.name || '自选发色')
const selectedName = computed(() => activeTab.value === 'hair' ? HAIR_NAMES[avatar.value.gender][avatar.value.hair] : activeTab.value === 'color' ? colorName.value : SUIT_NAMES[avatar.value.suit])

function change(patch) { emit('update:modelValue', { ...avatar.value, ...patch }) }
function randomize() {
  const random = (length) => Math.floor(Math.random() * length)
  change({ hair:random(5), suit:random(5), color:HAIR_COLORS[random(HAIR_COLORS.length)].value })
  spinning.value = true; window.setTimeout(() => { spinning.value = false }, 450)
}
async function exportPng() {
  exportStatus.value = '正在生成…'
  try { await figure.value.exportPng(); exportStatus.value = '形象卡已导出' }
  catch { exportStatus.value = '导出失败，请重试' }
  window.setTimeout(() => { exportStatus.value = '' }, 2600)
}
</script>

<template>
  <section class="avatar-studio" aria-label="我的虚拟形象工作室">
    <header class="studio-heading">
      <div><span class="studio-eyebrow">MAKE IT YOURS</span><h2>让探索，自有风格<span>✦</span></h2><p>换上喜欢的模样，出发去长沙。</p></div>
      <button type="button" class="studio-close" aria-label="关闭形象工作室" @click="emit('close')">×</button>
    </header>

    <div class="studio-body">
      <div class="studio-stage">
        <div class="studio-gender" role="group" aria-label="角色性别">
          <button type="button" :class="{selected:avatar.gender === 'female'}" :aria-pressed="avatar.gender === 'female'" @click="change({gender:'female'})">女生</button>
          <button type="button" :class="{selected:avatar.gender === 'male'}" :aria-pressed="avatar.gender === 'male'" @click="change({gender:'male'})">男生</button>
        </div>
        <span class="stage-star stage-star--one">✦</span><span class="stage-star stage-star--two">+</span>
        <span class="stage-orbit" aria-hidden="true"></span>
        <span class="stage-floor" aria-hidden="true"></span>
        <div class="studio-character" :class="{'is-changing':spinning}"><AvatarFigure ref="figure" :model-value="avatar" /></div>
        <div class="stage-caption"><span class="stage-live-dot"></span>我的星启探索者 <span>NO. 001</span></div>
        <button type="button" class="studio-random" @click="randomize"><span>⤨</span> 随机搭配</button>
      </div>

      <div class="studio-controls">
        <div class="studio-tabs" role="tablist" aria-label="形象设置">
          <button v-for="tab in tabs" :key="tab.id" type="button" role="tab" :id="`avatar-tab-${tab.id}`" :aria-selected="activeTab === tab.id" :aria-controls="`avatar-panel-${tab.id}`" :class="{selected:activeTab === tab.id}" @click="activeTab = tab.id"><span>{{ tab.icon }}</span>{{ tab.label }}</button>
        </div>
        <div class="studio-selection-label"><span>{{ activeTab === 'hair' ? '挑一个心动发型' : activeTab === 'color' ? '今天，染一点不一样' : '把长沙穿在身上' }}</span><b>{{ selectedName }}</b></div>

        <div v-if="activeTab === 'hair'" id="avatar-panel-hair" role="tabpanel" aria-labelledby="avatar-tab-hair" class="studio-hair-grid">
          <button v-for="(name, index) in HAIR_NAMES[avatar.gender]" :key="`${avatar.gender}-${index}`" type="button" :class="{selected:avatar.hair === index}" :aria-pressed="avatar.hair === index" @click="change({hair:index})">
            <span class="studio-hair-image"><AvatarFigure :model-value="{...avatar,hair:index}" compact /></span><span>{{ name }}</span><b v-if="avatar.hair === index" class="studio-tick">✓</b>
          </button>
        </div>

        <div v-else-if="activeTab === 'color'" id="avatar-panel-color" role="tabpanel" aria-labelledby="avatar-tab-color" class="studio-color-panel">
          <div class="studio-colors"><button v-for="color in HAIR_COLORS" :key="color.value" type="button" :class="{selected:avatar.color === color.value}" :aria-label="color.name" :aria-pressed="avatar.color === color.value" @click="change({color:color.value})"><span :style="{'--hair-color':color.value}">{{ avatar.color === color.value ? '✓' : '' }}</span><small>{{ color.name }}</small></button></div>
          <label class="studio-custom-color"><span>调出你的专属色<span>每一缕高光，都保留个性</span></span><input type="color" :value="avatar.color" aria-label="自定义发色" @input="change({color:$event.target.value})" /></label>
        </div>

        <div v-else id="avatar-panel-suit" role="tabpanel" aria-labelledby="avatar-tab-suit" class="studio-suit-list">
          <button v-for="(name,index) in SUIT_NAMES" :key="index" type="button" :class="{selected:avatar.suit === index}" :aria-pressed="avatar.suit === index" @click="change({suit:index})"><span class="studio-suit-image"><img :src="`${assetBase}${avatar.gender}-suit-${index}.png`" alt="" /></span><span><b>{{ name }}</b><small>{{ ['轻装上阵，即刻出发','烟火长沙 · 国潮新生','千年诗意 · 一袭江风','复古街巷 · 自由出色','守护安心 · 专业有型'][index] }}</small></span><i>{{ avatar.suit === index ? '✓' : '+' }}</i></button>
        </div>

        <div class="studio-tip"><span>✧</span> 每一种风格，都能开启同样精彩的旅程。</div>
        <footer class="studio-actions"><button type="button" class="studio-export" @click="exportPng" :disabled="exportStatus === '正在生成…'">↧ <span>{{ exportStatus || '导出形象卡' }}</span></button><button type="button" class="studio-save" @click="emit('save',{...avatar})">保存形象 <span>→</span></button></footer>
        <span v-if="exportStatus" class="studio-export-status" role="status">{{ exportStatus }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.avatar-studio { width:100%; color:#16354e; font-family:inherit; }
.avatar-studio button { font:inherit; cursor:pointer; -webkit-tap-highlight-color:transparent; }
.avatar-studio button:focus-visible,.avatar-studio input:focus-visible { outline:3px solid #22bacc; outline-offset:3px; }
.studio-heading { display:flex; justify-content:space-between; gap:20px; align-items:flex-start; margin-bottom:25px; }
.studio-eyebrow { color:#58a5b9; letter-spacing:3px; font-size:10px; font-weight:700; }
.studio-heading h2 { font-size:26px; letter-spacing:-.8px; margin:9px 0 8px; line-height:1.3; font-weight:800; }
.studio-heading h2 span { color:#41c5c6; padding-left:12px; }
.studio-heading p { color:#7890a1; font-size:13px; margin:0; }
.studio-close { border:1px solid #dde9ee; border-radius:50%; background:#fff; color:#567487; width:34px; height:34px; font-size:25px!important; line-height:1; }
.studio-body { display:grid; grid-template-columns:minmax(220px,.92fr) minmax(300px,1.08fr); gap:26px; }
.studio-stage { position:relative; border-radius:24px; overflow:hidden; min-height:494px; background:radial-gradient(ellipse at 50% 35%,#fff 0%,#eefbfc 39%,#d8f0f4 75%,#d9e7f5 100%); border:1px solid #d7eaed; }
.studio-gender { display:flex; padding:4px; position:relative; width:140px; margin:20px auto 0; z-index:2; border-radius:30px; background:#fff9; box-shadow:0 4px 15px #25577805; }
.studio-gender button { border:0; color:#849eae; background:transparent; border-radius:20px; width:66px; padding:7px; font-size:12px; transition:.2s; }
.studio-gender button.selected { background:#193c52; color:white; box-shadow:0 3px 7px #193c5220; }
.studio-character { position:absolute; top:65px; bottom:63px; left:10%; width:80%; z-index:1; filter:drop-shadow(0 11px 11px #2b718718); transition:transform .3s; }
.studio-character.is-changing { animation:studio-change .45s ease; }
.stage-floor { position:absolute; width:67%; height:40px; border-radius:50%; background:linear-gradient(180deg,#ffffffcc,#d5ecf380); left:16.5%; bottom:70px; box-shadow:0 8px 0 #a7c6d419,0 10px 32px #7aadbf26; }
.stage-orbit { position:absolute; border:1px solid #ffffffba; width:285px; height:285px; border-radius:50%; left:calc(50% - 142px); top:120px; transform:rotate(-20deg); }
.stage-star { position:absolute; color:#63bfc7; }
.stage-star--one { font-size:26px; top:120px; left:17%; }
.stage-star--two { font-size:24px; bottom:135px; right:12%; color:#83b7cc; }
.stage-caption { position:absolute; bottom:42px; left:0; width:100%; display:flex; align-items:center; justify-content:center; gap:6px; color:#496f83; font-size:11px; }
.stage-caption>span:last-child { margin-left:6px; color:#8aa5b4; font-size:8px; letter-spacing:1px; }
.stage-live-dot { width:5px; height:5px; border-radius:50%; background:#37bda6; }
.studio-random { position:absolute; bottom:10px; left:50%; transform:translateX(-50%); border:0; background:transparent; color:#698999; font-size:10px!important; padding:5px 12px; white-space:nowrap; }
.studio-random span { font-size:18px; vertical-align:-1px; }
.studio-controls { display:flex; flex-direction:column; min-width:0; }
.studio-tabs { display:flex; border-bottom:1px solid #e2edf1; gap:24px; }
.studio-tabs button { position:relative; border:0; background:transparent; color:#98aaba; padding:9px 3px 17px; font-size:14px; font-weight:600; display:flex; align-items:center; gap:7px; }
.studio-tabs button>span { font-size:17px; }
.studio-tabs button.selected { color:#123d59; }
.studio-tabs button.selected::after { content:''; position:absolute; height:3px; width:24px; border-radius:3px; background:#40c2c4; bottom:-1px; left:calc(50% - 12px); }
.studio-selection-label { display:flex; justify-content:space-between; align-items:center; margin:21px 0 14px; gap:8px; font-size:10px; color:#93a8b8; }
.studio-selection-label b { font-size:10px; color:#54788c; font-weight:500; }
.studio-hair-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; }
.studio-hair-grid>button { position:relative; background:#f4f8fa; border:1.5px solid transparent; border-radius:13px; padding:4px 4px 11px; display:flex; flex-direction:column; align-items:center; color:#718896; font-size:10px; transition:.2s; min-width:0; }
.studio-hair-grid>button.selected { background:#e9fafa; border-color:#49babc; color:#26556a; }
.studio-hair-grid>button:hover { background:#eaf4f7; }
.studio-hair-image { display:block; width:100%; aspect-ratio:1; max-width:106px; }
.studio-tick { position:absolute; right:5px; top:5px; width:15px; height:15px; line-height:15px; background:#3bb9b6; color:#fff; border-radius:50%; font-size:9px; }
.studio-colors { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:20px 10px; margin:13px 0 24px; }
.studio-colors button { display:flex; flex-direction:column; align-items:center; border:0; background:transparent; padding:0; color:#8c9eac; gap:8px; }
.studio-colors button>span { display:flex; align-items:center; justify-content:center; border-radius:50%; width:34px; height:34px; color:white; background:var(--hair-color); box-shadow:inset 0 2px 4px #fff5,inset 0 -3px 4px #0002; position:relative; font-size:15px; }
.studio-colors button.selected>span::after { content:''; position:absolute; inset:-5px; border-radius:50%; border:1.5px solid #52babc; }
.studio-colors button small { font-size:10px; }
.studio-custom-color { display:flex; justify-content:space-between; align-items:center; border:1px solid #e4edf1; border-radius:13px; padding:15px; font-size:12px; color:#507185; }
.studio-custom-color>span>span { display:block; font-size:9px; margin-top:5px; color:#9aadb8; }
.studio-custom-color input { width:35px; height:35px; padding:0; background:none; border:0; cursor:pointer; border-radius:10px; }
.studio-suit-list { display:flex; flex-direction:column; gap:7px; }
.studio-suit-list>button { display:flex; align-items:center; gap:10px; border:1px solid #edf2f5; background:#f8fafb; padding:5px 12px 5px 5px; border-radius:12px; text-align:left; color:#55778a; }
.studio-suit-list>button.selected { background:#eaf9f8; border-color:#54bebe; }
.studio-suit-image { width:38px; height:43px; background:#e9f0f3; border-radius:8px; overflow:hidden; flex-shrink:0; }
.studio-suit-image img { width:100%; height:100%; object-fit:cover; object-position:center 62%; transform:scale(1.4); }
.studio-suit-list b { font-size:11px; font-weight:600; }
.studio-suit-list small { display:block; font-size:9px; margin-top:4px; color:#91a4af; }
.studio-suit-list i { margin-left:auto; font-size:14px; font-style:normal; color:#4dbab7; }
.studio-tip { display:flex; gap:6px; align-items:center; color:#98abb8; font-size:9px; line-height:1.7; padding:20px 0 17px; margin-top:auto; }
.studio-tip>span { font-size:15px; color:#74b6c3; }
.studio-actions { display:flex; gap:10px; }
.studio-actions>button { border-radius:12px; display:flex; align-items:center; justify-content:center; gap:6px; padding:13px 10px; font-size:11px; min-height:44px; }
.studio-export { flex:.9; border:1px solid #dce8ed; background:white; color:#57798b; }
.studio-save { flex:1.1; border:0; color:white; background:#173d54; box-shadow:0 5px 13px #173d5416; font-weight:600!important; }
.studio-save>span { margin-left:10px; }
.studio-export:disabled { opacity:.6; }
.studio-export-status { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); }
@keyframes studio-change { 0%,100%{transform:translateY(0)} 45%{transform:translateY(-10px)} }
@media(max-width:640px) {
  .studio-heading { margin-bottom:16px; }
  .studio-heading h2 { font-size:22px; }
  .studio-body { grid-template-columns:1fr; gap:18px; }
  .studio-stage { min-height:337px; }
  .studio-gender { margin-top:12px; }
  .studio-character { top:49px; bottom:50px; left:16%; width:68%; }
  .stage-floor { width:45%; left:27.5%; bottom:56px; height:28px; }
  .stage-orbit { top:60px; width:240px; height:240px; left:calc(50% - 120px); }
  .stage-caption { bottom:31px; }
  .studio-random { bottom:3px; }
  .studio-tabs { justify-content:space-around; }
  .studio-tabs button { padding-bottom:12px; }
  .studio-selection-label { margin-top:14px; }
  .studio-hair-grid { grid-template-columns:repeat(5,minmax(0,1fr)); gap:5px; }
  .studio-hair-grid>button { font-size:8px; border-radius:10px; padding:2px 0 9px; }
  .studio-hair-image { aspect-ratio:.88; }
  .studio-tip { padding:15px 0; }
  .studio-actions>button { font-size:12px; }
  .studio-colors { gap:17px 12px; margin-top:8px; }
}
@media(prefers-reduced-motion:reduce) { .studio-character.is-changing { animation:none; } .avatar-studio * { transition:none!important; } }
</style>
