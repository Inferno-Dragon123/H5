import { ref } from 'vue'

export const soundEnabled=ref(false)
const musicVolume=.2, ambienceVolume=.12
const oneShotMusic=new Set(['victory','story-finale'])
const clips=new Set()
let bgm=null,voice=null,ambience=null,scene='explore',ambienceName=null,musicVersion=0,toggleVersion=0,pending=null,suspended=false,ducked=false

function trackedAudio(url){const audio=new Audio(url);clips.add(audio);audio.addEventListener('ended',()=>{if(!audio.loop&&!audio.datasetScene)clips.delete(audio)});return audio}
function stop(audio){if(!audio)return;audio.pause();clips.delete(audio)}
function fadeMusic(incoming,outgoing,version){
 const start=performance.now()
 const previousVolume=outgoing?.volume||0
 const tick=now=>{
  if(version!==musicVersion||suspended||!soundEnabled.value){if(incoming!==bgm)stop(incoming);if(outgoing!==bgm)stop(outgoing);return}
  const t=Math.max(0,Math.min(1,(now-start)/750))
  incoming.volume=musicVolume*(ducked?.35:1)*t
  if(outgoing)outgoing.volume=previousVolume*(1-t)
  if(t<1)requestAnimationFrame(tick)
  else stop(outgoing)
 }
 requestAnimationFrame(tick)
}
async function startMusic(){
 if(!soundEnabled.value||suspended)return false
 if(bgm?.datasetScene===scene){clips.add(bgm);bgm.volume=musicVolume*(ducked?.35:1);try{await bgm.play();return true}catch{return false}}
 if(pending?.scene===scene)return pending.promise
 const selected=scene,version=++musicVersion
 const incoming=trackedAudio(`/assets/audio/${selected}.mp3`)
 incoming.datasetScene=selected;incoming.loop=!oneShotMusic.has(selected);incoming.volume=0
 const promise=(async()=>{
  try{
   await incoming.play()
   if(version!==musicVersion||selected!==scene||suspended||!soundEnabled.value){stop(incoming);return false}
   const outgoing=bgm;bgm=incoming;fadeMusic(incoming,outgoing,version);return true
  }catch{stop(incoming);return false}
 })()
 pending={scene:selected,promise}
 promise.finally(()=>{if(pending?.promise===promise)pending=null})
 return promise
}
export function setScene(value){if(scene!==value){musicVersion++;toggleVersion++;pending=null}scene=value;suspended=false;if(soundEnabled.value)startMusic()}
export function pauseAudio(){suspended=true;musicVersion++;toggleVersion++;pending=null;for(const audio of new Set([...clips,bgm,voice,ambience]))stop(audio);bgm=null;voice=null;ambience=null;ambienceName=null;ducked=false}
export function setAmbience(value){
 if(value===ambienceName&&ambience)return
 stop(ambience);ambience=null;ambienceName=value||null
 if(!value||!soundEnabled.value||suspended)return
 const incoming=trackedAudio(`/assets/audio/ambience-${value}.mp3`);incoming.loop=true;incoming.volume=ambienceVolume;ambience=incoming
 incoming.play().catch(()=>stop(incoming))
}
export async function toggleSound(){
 const version=++toggleVersion
 if(soundEnabled.value){soundEnabled.value=false;musicVersion++;pending=null;for(const audio of new Set([...clips,bgm,voice,ambience])){if(!audio)continue;if(audio===bgm||audio===ambience)audio.pause();else stop(audio)}voice=null;ducked=false;return true}
 soundEnabled.value=true;suspended=false
 const started=await startMusic()
 if(version!==toggleVersion)return true
 if(!started){soundEnabled.value=false;return false}
 const desired=ambienceName;ambienceName=null;setAmbience(desired)
 return true
}
if(import.meta.hot)import.meta.hot.dispose(pauseAudio)
export function sfx(name){
 if(!soundEnabled.value||suspended)return
 const audio=trackedAudio(`/assets/audio/${name}.mp3`);audio.volume=.36;audio.play().catch(()=>stop(audio))
}
export function speak(name){
 if(!soundEnabled.value||suspended)return
 stop(voice);voice=trackedAudio(`/assets/audio/voice-${name}.mp3`);voice.volume=.75;ducked=true
 if(bgm)bgm.volume=musicVolume*.35
 const restore=()=>{ducked=false;if(bgm)bgm.volume=musicVolume}
 voice.addEventListener('ended',restore,{once:true});voice.addEventListener('error',restore,{once:true})
 voice.play().catch(restore)
}
