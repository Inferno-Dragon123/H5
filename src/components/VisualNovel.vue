<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import I from './AppIcon.vue'
import { getStory } from '../data/story'
import { setScene, sfx } from '../audio'

const props = defineProps({ place: { type: Object, required: true } })
const emit = defineEmits(['complete'])
const index = ref(0)
const displayText = ref('')
const typing = ref(false)
let typeTimer

const script = computed(() => getStory(props.place))
const current = computed(() => script.value.beats[index.value])
const isLast = computed(() => index.value >= script.value.beats.length - 1)
const sceneSet = {
  investment: ['/assets/maps/changsha.png', '/assets/maps/route-deep.png'],
  wuyi: ['/assets/hero.webp', '/assets/maps/route-quick.png'],
  taiping: ['/assets/maps/route-quick.png', '/assets/hero.webp'],
  dufu: ['/assets/maps/route-city.png', '/assets/hero.webp'],
  chaozong: ['/assets/maps/route-city.png', '/assets/hero.webp'],
  museum: ['/assets/maps/route-deep.png', '/assets/maps/changsha.png'],
  pozi: ['/assets/maps/route-quick.png', '/assets/hero.webp'],
}
const sceneIndex = computed(() => Math.min(1, Math.floor(index.value / 2)))
const sceneAsset = computed(() => (sceneSet[script.value.theme] || ['/assets/hero.webp'])[sceneIndex.value])
const sceneKey = computed(() => `${props.place.id}-${sceneIndex.value}`)
const effect = computed(() => current.value?.avatar === 'villain.png' ? 'glitch' : current.value?.clue ? 'scan' : 'particles')
const motion = computed(() => current.value?.avatar === 'villain.png' ? 'vn-motion-glitch' : index.value % 3 === 1 ? 'vn-motion-left' : index.value % 3 === 2 ? 'vn-motion-right' : 'vn-motion-breathe')
const musicScene = computed(() => props.place?.id === 'museum' && index.value >= 2 ? 'story-finale' : current.value?.clue || current.value?.avatar === 'villain.png' ? 'story-tension' : 'story')

function typeCurrent() {
  clearInterval(typeTimer)
  const text = current.value?.text || ''
  displayText.value = ''
  typing.value = true
  let cursor = 0
  typeTimer = setInterval(() => {
    displayText.value = text.slice(0, cursor += 1)
    if (cursor >= text.length) { clearInterval(typeTimer); typing.value = false }
  }, 24)
}

watch(() => props.place?.id, () => { index.value = 0; typeCurrent() })
watch(current, beat => {
  if (!beat) return
  typeCurrent()
  setScene(musicScene.value)
  if (beat.avatar === 'villain.png') sfx('villain')
  else if (beat.clue) sfx('transition')
  else sfx('click')
}, { immediate: true })
onBeforeUnmount(() => clearInterval(typeTimer))

function advance() {
  if (typing.value) { clearInterval(typeTimer); displayText.value = current.value.text; typing.value = false; return }
  if (isLast.value) emit('complete')
  else index.value += 1
}
</script>

<template>
  <section class="visual-novel" :class="`visual-novel--${script.theme}`" aria-label="剧情视觉小说">
    <Transition name="vn-scene" mode="out-in">
      <div :key="sceneKey" class="vn-stage" :style="{ '--scene-image': `url('${sceneAsset}')` }">
        <div class="vn-stage-shade" />
        <div class="vn-cyber-grid" />
        <div class="vn-chapter"><span>{{ script.chapter }}</span><b>{{ script.setting }}</b></div>
        <div class="vn-case">CASE 0{{ index + 1 }} <i /> 0{{ script.beats.length }}</div>
        <div class="vn-stage-caption"><small>智游镜界 · 城市调查档案</small><strong>{{ place.title }}</strong><span>发现风险 · 独立核验 · 守护城市</span></div>
        <div class="vn-location-chip"><I name="MapPin" :size="13" />{{ script.setting.split(' · ')[0] }}</div>
        <Transition name="vn-sprite" mode="out-in">
          <div :key="`${current.avatar}-${index}`" class="vn-sprite" :class="motion">
            <span class="vn-aura" />
            <img :src="`/assets/${current.avatar}`" :alt="current.speaker" :class="{villain: current.avatar === 'villain.png'}" />
            <span class="vn-emotion">{{ current.speaker }}</span>
          </div>
        </Transition>
        <div class="vn-focus" :class="`vn-focus--${effect}`" />
        <div v-if="effect === 'glitch'" class="vn-glitch-lines" />
        <div v-if="effect === 'particles'" class="vn-particles"><i v-for="n in 9" :key="n" /></div>
      </div>
    </Transition>
    <div class="vn-dialogue" :class="{ 'vn-dialogue--danger': effect === 'glitch' }">
      <div class="vn-dialogue-head"><span class="vn-speaker"><i />{{ current.speaker }}</span><span class="vn-step">{{ index + 1 }} / {{ script.beats.length }}</span></div>
      <p :class="{typing}">“{{ displayText }}<b v-if="typing" class="vn-caret">▌</b>”</p>
      <div v-if="current.clue" class="vn-clue"><I name="ShieldCheck" :size="18" /><span><small>风险线索已锁定</small><b>{{ current.clue }}</b></span></div>
      <button class="primary vn-next" @click="advance">{{ typing ? '显示完整对白' : (current.cta || '继续') }} <I :name="typing ? 'ChevronRight' : 'ArrowRight'" :size="18" /></button>
    </div>
    <div class="vn-progress" aria-hidden="true"><i v-for="(_, step) in script.beats" :key="step" :class="{active: step <= index}" /></div>
  </section>
</template>

<style scoped>
.visual-novel{--vn-ink:#173650;display:grid;overflow:hidden;border:1px solid #dbe9ef;border-radius:20px;background:#f7fbfc;box-shadow:0 18px 48px #1b52601c}
.vn-stage{min-height:520px;position:relative;overflow:hidden;isolation:isolate;background:#132e4b center/cover var(--scene-image)}
.vn-stage-shade{position:absolute;inset:0;z-index:-2;background:linear-gradient(120deg,#08243bd9 0%,#14526bb0 48%,#1f7d78a3 100%),linear-gradient(0deg,#061525d9,transparent 65%)}
.vn-stage:after{content:'';position:absolute;inset:0;z-index:-1;background:radial-gradient(circle at 70% 22%,#b6fff733,transparent 25%),linear-gradient(90deg,transparent 55%,#6fe2d112 100%)}
.vn-cyber-grid{position:absolute;inset:0;opacity:.18;background-image:linear-gradient(#b8ffff 1px,transparent 1px),linear-gradient(90deg,#b8ffff 1px,transparent 1px);background-size:44px 44px;transform:perspective(560px) rotateX(60deg) translateY(38%);transform-origin:center bottom}
.vn-chapter{position:absolute;left:32px;top:28px;display:grid;gap:7px;color:#fff;z-index:3}.vn-chapter span{font:600 10px/1.4 Arial,sans-serif;letter-spacing:1.8px;color:#a5f6eb}.vn-chapter b{font-size:22px}.vn-case{position:absolute;top:33px;right:32px;z-index:3;color:#bce9e5;font:600 10px/1 Arial,sans-serif;letter-spacing:1px}.vn-case i{display:inline-block;width:5px;height:5px;border-radius:50%;margin:0 7px;background:#5cf0cc;box-shadow:0 0 10px #5cf0cc}
.vn-stage-caption{position:absolute;left:32px;bottom:33px;z-index:3;display:grid;gap:7px;color:#ecffff}.vn-stage-caption small{font:600 9px/1.3 Arial,sans-serif;letter-spacing:1.2px;opacity:.78}.vn-stage-caption strong{font-size:28px;line-height:1.2}.vn-stage-caption span{font-size:11px;color:#b8d9dc}.vn-location-chip{position:absolute;left:32px;bottom:112px;display:flex;align-items:center;gap:5px;padding:6px 9px;border:1px solid #b4eee866;border-radius:999px;color:#c6f1ed;background:#0e394c99;font-size:10px;z-index:3}
.vn-sprite{position:absolute;right:11%;bottom:0;width:min(34%,300px);height:86%;z-index:4;display:grid;place-items:end center;transform-origin:center bottom}.vn-sprite img{width:100%;height:100%;object-fit:contain;object-position:center bottom;filter:drop-shadow(0 18px 22px #06141f66)}.vn-sprite img.villain{filter:drop-shadow(0 18px 22px #03050eaa) saturate(.7)}.vn-aura{position:absolute;right:9%;bottom:9%;width:95%;aspect-ratio:1;border:1px solid #a7fff080;border-radius:50%;box-shadow:0 0 0 18px #a7fff01a,0 0 0 38px #a7fff00b;animation:vn-pulse 2.8s ease-in-out infinite}.vn-emotion{position:absolute;right:8%;top:14%;padding:6px 10px;border:1px solid #d6fff055;border-radius:8px;color:#e8ffff;background:#0d3246b8;font-size:10px;white-space:nowrap;backdrop-filter:blur(10px)}
.vn-motion-breathe{animation:vn-breathe 3.2s ease-in-out infinite}.vn-motion-left{animation:vn-enter-left .45s ease both, vn-breathe 3.2s .45s ease-in-out infinite}.vn-motion-right{animation:vn-enter-right .45s ease both, vn-breathe 3.2s .45s ease-in-out infinite}.vn-motion-glitch{animation:vn-glitch .52s steps(2,end) both}.vn-focus{position:absolute;inset:0;z-index:5;pointer-events:none}.vn-focus--scan{background:linear-gradient(180deg,transparent 0%,#52fff00f 47%,#a8fff044 50%,#52fff00f 53%,transparent 100%);background-size:100% 220%;animation:vn-scan 2.6s linear infinite}.vn-focus--glitch{background:repeating-linear-gradient(0deg,#fb54740b 0 2px,transparent 2px 9px);mix-blend-mode:screen}.vn-glitch-lines{position:absolute;inset:0;z-index:6;pointer-events:none;opacity:.55;background:repeating-linear-gradient(0deg,transparent 0 18px,#ff66883b 19px 21px,transparent 22px 36px);animation:vn-lines .32s steps(2,end) infinite}.vn-particles{position:absolute;inset:0;z-index:2;pointer-events:none}.vn-particles i{position:absolute;width:4px;height:4px;border-radius:50%;background:#b1fff0;box-shadow:0 0 12px #b1fff0;animation:vn-drift 4s ease-in-out infinite}.vn-particles i:nth-child(1){left:15%;top:28%}.vn-particles i:nth-child(2){left:28%;top:54%;animation-delay:.8s}.vn-particles i:nth-child(3){left:45%;top:17%;animation-delay:1.2s}.vn-particles i:nth-child(4){left:61%;top:42%;animation-delay:1.7s}.vn-particles i:nth-child(5){left:77%;top:18%;animation-delay:.4s}.vn-particles i:nth-child(6){left:84%;top:67%;animation-delay:2.1s}.vn-particles i:nth-child(7){left:37%;top:75%;animation-delay:1.5s}.vn-particles i:nth-child(8){left:68%;top:79%;animation-delay:2.8s}.vn-particles i:nth-child(9){left:9%;top:70%;animation-delay:2.4s}
.vn-dialogue{position:relative;margin:-1px 30px 18px;padding:23px 28px 21px;border:1px solid #dcecef;border-radius:16px;background:#fff;box-shadow:0 13px 32px #204f5d14;z-index:8}.vn-dialogue--danger{border-color:#f2cdd1;background:#fffafb}.vn-dialogue-head{display:flex;justify-content:space-between;align-items:center;gap:16px}.vn-speaker{display:flex;align-items:center;gap:8px;color:#1d6573;font-size:13px;font-weight:700}.vn-speaker i{width:8px;height:8px;border-radius:50%;background:#42beb8;box-shadow:0 0 0 5px #42beb81c}.vn-dialogue--danger .vn-speaker{color:#9a3e56}.vn-dialogue--danger .vn-speaker i{background:#df5f79;box-shadow:0 0 0 5px #df5f791c}.vn-step{color:#9aacb5;font:600 11px/1 Arial,sans-serif;letter-spacing:1px}.vn-dialogue p{margin:15px 0 17px;min-height:65px;color:#2e4657;font-size:15px;line-height:1.95}.vn-dialogue p.typing{color:#38566a}.vn-caret{color:#4bc7bc;animation:vn-caret .8s steps(1) infinite}.vn-clue{display:flex;align-items:center;gap:10px;padding:11px 13px;border:1px solid #d7eeeb;border-radius:10px;background:#effaf8;color:#277f7a}.vn-clue span{display:grid;gap:3px}.vn-clue small{color:#6d9b9b;font-size:10px}.vn-clue b{color:#216b6a;font-size:12px}.vn-next{display:flex;align-items:center;justify-content:center;width:100%;margin-top:16px;min-height:46px;gap:8px}.vn-progress{display:flex;gap:5px;padding:0 30px 17px}.vn-progress i{height:3px;flex:1;border-radius:4px;background:#d6e6ea;transition:.25s}.vn-progress i.active{background:#43bcb7}
.vn-scene-enter-active,.vn-scene-leave-active{transition:opacity .35s ease,filter .35s ease}.vn-scene-enter-from,.vn-scene-leave-to{opacity:0;filter:blur(8px)}.vn-sprite-enter-active,.vn-sprite-leave-active{transition:opacity .28s ease,transform .28s ease}.vn-sprite-enter-from{opacity:0;transform:translateX(26px) scale(.97)}.vn-sprite-leave-to{opacity:0;transform:translateX(-20px) scale(.99)}
@keyframes vn-breathe{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}@keyframes vn-enter-left{from{opacity:0;transform:translateX(-80px) scale(.95)}to{opacity:1;transform:none}}@keyframes vn-enter-right{from{opacity:0;transform:translateX(80px) scale(.95)}to{opacity:1;transform:none}}@keyframes vn-glitch{0%{transform:translateX(0);filter:contrast(1)}25%{transform:translateX(-7px);filter:contrast(1.4) hue-rotate(12deg)}50%{transform:translateX(8px);filter:contrast(1.2) hue-rotate(-10deg)}100%{transform:none}}@keyframes vn-pulse{0%,100%{transform:scale(.96);opacity:.44}50%{transform:scale(1.03);opacity:.9}}@keyframes vn-scan{from{background-position:0 -100%}to{background-position:0 100%}}@keyframes vn-lines{0%{transform:translateY(-5px)}100%{transform:translateY(5px)}}@keyframes vn-drift{0%,100%{transform:translateY(8px);opacity:.2}50%{transform:translateY(-16px);opacity:.85}}@keyframes vn-caret{50%{opacity:0}}
@media(max-width:640px){.vn-stage{min-height:430px}.vn-chapter{left:19px;top:21px}.vn-chapter span{font-size:8px;letter-spacing:1.2px}.vn-chapter b{font-size:17px}.vn-case{top:24px;right:19px;font-size:8px}.vn-stage-caption{left:19px;bottom:24px}.vn-stage-caption strong{font-size:22px}.vn-location-chip{left:19px;bottom:98px;font-size:8px}.vn-sprite{right:0;width:49%;height:78%}.vn-aura{right:0;width:112%}.vn-emotion{right:3%;top:8%;font-size:8px}.vn-dialogue{margin:-1px 12px 13px;padding:18px 16px 15px}.vn-dialogue p{font-size:13px;line-height:1.9;min-height:84px}.vn-clue b{font-size:11px}.vn-progress{padding:0 12px 12px}}
</style>
