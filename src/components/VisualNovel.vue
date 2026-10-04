<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import I from './AppIcon.vue'
import { soundEnabled, toggleSound, setScene, sfx, setAmbience } from '../audio'
const props = defineProps({ place: {type:Object,required:true}, mode:{type:String,default:'city'}, name:{type:String,default:'星城探索者'}, outcome:{type:Object,default:null}, nextPlace:{type:Object,default:null}, phase:{type:String,default:'story'} })
const emit = defineEmits(['quiz','exit','continue','restart'])
const frame=ref(null),ready=ref(false),error=ref(''),ended=ref(false),endPassed=ref(false),revision=ref(0)
const progress=ref({title:props.place.title,setting:props.place.name,index:0,total:0})
const session=crypto.randomUUID(),channel='star-city-novel-v2'
let readyTimer
const source=computed(()=>`/novel/index.html?${new URLSearchParams({chapter:props.place.id,mode:props.mode,session,revision:String(revision.value)})}`)
const musicScenes=new Set(['story','story-tension','story-finale','story-heritage','story-night','story-chase','victory','explore','quiz'])
const sounds=new Set(['click','transition','villain','unlock','points','correct','wrong','popup-break','call-connect','city-restore','bike-bell'])
const ambiences=new Set(['river','street'])
function send(type,extra={}){frame.value?.contentWindow?.postMessage({channel,session,type,...extra},location.origin)}
function sendOutcome(){if(ready.value&&props.outcome)send('quiz-result',props.outcome)}
function settings(){send('settings',{name:props.name,soundEnabled:soundEnabled.value})}
function onMessage(event){
 const data=event.data
 if(event.origin!==location.origin||event.source!==frame.value?.contentWindow||!data||data.channel!==channel||data.session!==session)return
 if(data.type==='ready'){clearTimeout(readyTimer);ready.value=true;error.value='';settings();sendOutcome()}
 else if(data.type==='quiz'){ended.value=false;setAmbience(null);emit('quiz')}
 else if(data.type==='progress'){progress.value={title:String(data.title||props.place.title),setting:String(data.setting||props.place.name),index:Number(data.index)||0,total:Number(data.total)||0}}
 else if(data.type==='audio'){if(musicScenes.has(data.scene))setScene(data.scene);if(sounds.has(data.sfx))sfx(data.sfx);if(data.ambience===null||ambiences.has(data.ambience))setAmbience(data.ambience)}
 else if(data.type==='end'){ended.value=true;endPassed.value=data.passed===true;setAmbience(null)}
 else if(data.type==='error'){error.value='剧情暂时没有载入成功，请重试。';console.error('Novel engine:',String(data.message||'').slice(0,300))}
}
function armTimer(){clearTimeout(readyTimer);readyTimer=setTimeout(()=>{if(!ready.value)error.value='剧情载入较慢，可以重试或返回地图。'},25000)}
function retry(){ready.value=false;error.value='';revision.value+=1;armTimer()}
watch(()=>props.outcome,sendOutcome)
watch(soundEnabled,settings)
watch(()=>props.name,settings)
onMounted(()=>{window.addEventListener('message',onMessage);armTimer()})
onBeforeUnmount(()=>{clearTimeout(readyTimer);window.removeEventListener('message',onMessage);setAmbience(null)})
</script>

<template>
 <section class="novel-player" aria-label="镜界视觉小说" :data-phase="phase">
  <iframe ref="frame" :key="revision" class="novel-frame" :src="source" title="工银星启·智游镜界剧情舞台" allow="fullscreen" />
  <header class="novel-toolbar"><button class="novel-back" @click="emit('exit')"><I name="ChevronLeft" :size="19"/><span>城市地图</span></button><div class="novel-title"><span>{{progress.title}}</span><small>{{progress.setting}}</small></div><div class="novel-tools"><button :aria-label="soundEnabled?'关闭剧情音乐':'开启剧情音乐'" @click="toggleSound"><I :name="soundEnabled?'Volume2':'VolumeX'" :size="18"/></button><button aria-label="从头阅读本章" title="从头阅读本章" @click="emit('restart')"><I name="RefreshCw" :size="17"/></button></div></header>
  <div v-if="!ready||error" class="novel-loading" role="status"><span class="novel-loading-star">✦</span><h2>{{error?'稍等，镜界正在连接':'城市故事，正在展开'}}</h2><p>{{error||'湘江的风、老街的灯，还有等你遇见的人。'}}</p><button v-if="error" @click="retry">重新载入</button></div>
  <Transition name="novel-end"><div v-if="ended" class="novel-end-layer"><section class="novel-ending"><span class="novel-ending-mark">{{endPassed?'✦':'◇'}}</span><small>{{endPassed?'CHAPTER COMPLETED':'THE INVESTIGATION CONTINUES'}}</small><h2>{{endPassed?'这一程，留下了你的光。':'再看一遍，真相就在细节里。'}}</h2><p>{{endPassed?(nextPlace?`沿着城市的故事，下一站是${nextPlace.name}。`:'这条路线的故事已经收官，回到地图收藏你的足迹。'):'工小智会陪你重新调查，把判断背后的原因看清楚。'}}</p><button class="novel-ending-primary" @click="endPassed?emit('continue'):emit('restart')">{{endPassed?(nextPlace?`前往${nextPlace.name}`:'返回城市地图'):'重新调查本章'}} <I name="ArrowRight" :size="17"/></button><button class="novel-ending-secondary" @click="emit('exit')">回到地图</button></section></div></Transition>
 </section>
</template>

<style scoped>
.novel-player{position:fixed;inset:0;z-index:70;background:#09111b;color:#edf8f5;isolation:isolate}.novel-frame{position:absolute;inset:0;width:100%;height:100%;border:0;background:#09111b}.novel-toolbar{position:absolute;z-index:10;inset:0 0 auto;height:calc(58px + env(safe-area-inset-top,0px));padding:env(safe-area-inset-top,0px) 26px 0;display:flex;align-items:center;gap:18px;background:linear-gradient(#07101aed,#07101a80,transparent);pointer-events:none}.novel-toolbar button{pointer-events:auto;color:#e4f4ef}.novel-back{display:flex;align-items:center;gap:5px;min-height:40px;font-size:11px;white-space:nowrap}.novel-title{display:flex;align-items:center;gap:12px;flex:1;min-width:0}.novel-title>span{font-size:12px;letter-spacing:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.novel-title small{font-size:9px;color:#d2dfd5a6;letter-spacing:.5px}.novel-tools{display:flex;gap:7px}.novel-tools button{width:35px;height:35px;display:grid;place-items:center;border:1px solid #ffffff25;border-radius:50%;background:#ffffff0a}.novel-tools button:hover{background:#ffffff1e}.novel-loading{position:absolute;inset:0;z-index:12;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(ellipse at 50% 55%,#143e46,#08101c 70%);padding:24px;text-align:center}.novel-loading-star{color:#d7e8a7;font-size:45px;animation:novel-load 2s ease-in-out infinite}.novel-loading h2{font-size:21px;font-weight:500;letter-spacing:2px;margin:24px 0 10px}.novel-loading p{font-size:11px;color:#8aa5b0;line-height:1.9}.novel-loading button{margin-top:25px;color:#17382f;background:#d0e9aa;padding:12px 25px;border-radius:8px;font-size:12px}.novel-end-layer{position:absolute;inset:0;z-index:9;display:grid;place-items:center;padding:68px 20px 22px;background:#08121b55;backdrop-filter:blur(8px)}.novel-ending{width:min(430px,100%);border:1px solid #d4ead632;border-radius:20px;background:linear-gradient(145deg,#10232af7,#0d1825f7);padding:32px;text-align:center;box-shadow:0 25px 100px #0007}.novel-ending-mark{display:block;font-size:44px;color:#d5e6a6;margin-bottom:12px}.novel-ending small{font-size:8px;letter-spacing:2px;color:#95b2aa}.novel-ending h2{font-size:22px;font-weight:500;line-height:1.7;margin:17px 0 13px}.novel-ending p{font-size:12px;color:#a3b5bb;line-height:1.9}.novel-ending-primary{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;background:#d2e8b5;color:#19392e;border-radius:8px;padding:14px;margin-top:25px;font-size:12px}.novel-ending-secondary{font-size:11px;color:#9fb4bf;padding:15px;margin-top:3px}.novel-end-enter-active,.novel-end-leave-active{transition:opacity .4s}.novel-end-enter-from,.novel-end-leave-to{opacity:0}@keyframes novel-load{0%,100%{opacity:.4;transform:scale(.9) rotate(-10deg)}50%{opacity:1;transform:scale(1.06) rotate(10deg)}}
@media(max-width:640px){.novel-toolbar{padding-left:12px;padding-right:12px;height:calc(53px + env(safe-area-inset-top,0px));gap:9px}.novel-back{font-size:9px}.novel-title{display:block}.novel-title span{display:block;font-size:10px;letter-spacing:0}.novel-title small{display:block;font-size:8px;margin-top:3px;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.novel-tools{gap:5px}.novel-tools button{width:29px;height:29px}.novel-ending{padding:26px 22px}.novel-ending h2{font-size:19px}.novel-loading h2{font-size:18px}}
@media(prefers-reduced-motion:reduce){.novel-loading-star{animation:none}.novel-end-enter-active,.novel-end-leave-active{transition:none}}
</style>
