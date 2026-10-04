<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const emit = defineEmits(['complete'])
const finished = ref(false)
let timer
function finish() {
  if (finished.value) return
  finished.value = true
  clearTimeout(timer)
  emit('complete')
}
onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  timer = window.setTimeout(finish, reduced ? 700 : 3400)
})
onUnmounted(() => clearTimeout(timer))
</script>

<template>
  <section class="bank-launch" aria-label="工商银行 App 场景开屏">
    <div class="bank-launch-screen">
      <h1 class="launch-sr">中国工商银行，在您身边，值得信赖</h1>
      <div class="launch-art launch-copy" aria-hidden="true"><img src="/assets/bank/splash-reference.jpg" alt="" fetchpriority="high" /></div>
      <div class="launch-art launch-city" aria-hidden="true"><img src="/assets/bank/splash-reference.jpg" alt="" /></div>
      <div class="launch-art launch-signature" aria-hidden="true"><img src="/assets/bank/splash-reference.jpg" alt="" /></div>
      <div class="launch-glow" aria-hidden="true" />
      <span class="launch-demo">参赛场景演示</span>
      <button class="launch-skip" @click="finish">跳过 <span aria-hidden="true">›</span></button>
      <div class="launch-progress" aria-hidden="true"><span /></div>
    </div>
  </section>
</template>

<style scoped>
.bank-launch{position:fixed;inset:0;z-index:1000;display:flex;justify-content:center;background:#eaf1f8;overflow:hidden;color:#222}
.bank-launch-screen{position:relative;width:100%;max-width:480px;height:100%;isolation:isolate;background:linear-gradient(145deg,#fcfefe,#f1f9ff 70%,#edf5ff);overflow:hidden;box-shadow:0 0 90px #345d8220}
.launch-art{position:absolute;inset:0;pointer-events:none;will-change:opacity,transform}
.launch-art img{width:100%;height:100%;max-width:none;object-fit:cover;object-position:center}
.launch-copy{clip-path:inset(0 0 64% 0);animation:launch-writing 1.2s .15s cubic-bezier(.2,.65,.3,1) both}
.launch-city{clip-path:inset(36% 0 19% 0);animation:launch-city-in 1.7s .1s ease-out both}
.launch-signature{clip-path:inset(81% 0 0 0);animation:launch-brand-in .8s .8s ease both}
.launch-glow{position:absolute;inset:37% -50% 10%;background:linear-gradient(110deg,transparent 35%,#ffffff80 48%,transparent 60%);transform:translateX(-50%);animation:launch-light 2.3s .6s ease-in-out both;pointer-events:none}
.launch-demo{position:absolute;top:calc(20px + env(safe-area-inset-top,0px));left:22px;color:#788697;font-size:10px;letter-spacing:1.5px}
.launch-skip{position:absolute;right:20px;top:calc(14px + env(safe-area-inset-top,0px));min-height:36px;padding:0 13px;display:flex;align-items:center;gap:8px;color:#566575;background:#ffffffc9;border:1px solid #dce6ef;border-radius:22px;font-size:12px}
.launch-skip span{font-size:23px;font-weight:300;line-height:1}.launch-skip:hover{background:white}
.launch-progress{position:absolute;bottom:calc(12px + env(safe-area-inset-bottom,0px));left:40%;width:20%;height:2px;background:#dbe5ee;border-radius:3px;overflow:hidden}
.launch-progress span{display:block;width:100%;height:100%;background:#c51e2d;transform-origin:left;animation:launch-progress 3.4s linear both}
.launch-sr{position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}
@keyframes launch-writing{from{clip-path:inset(0 100% 64% 0);opacity:.3}to{clip-path:inset(0 0 64% 0);opacity:1}}
@keyframes launch-city-in{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes launch-brand-in{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
@keyframes launch-light{from{transform:translateX(-50%);opacity:0}35%{opacity:.7}to{transform:translateX(50%);opacity:0}}
@keyframes launch-progress{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@media(prefers-reduced-motion:reduce){.launch-art,.launch-glow,.launch-progress span{animation:none!important}.launch-glow{display:none}}
</style>
