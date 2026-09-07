import { ref } from 'vue'
export const soundEnabled=ref(false)
let bgm=null, voice=null, scene='explore'
export function setScene(value){
 const changed=scene!==value
 scene=value
 if(changed && bgm){bgm.pause();bgm=null}
 if(soundEnabled.value)startMusic()
}
async function startMusic(){
 if(!bgm){bgm=new Audio(`/assets/audio/${scene}.mp3`);bgm.loop=scene!=='victory';bgm.volume=.2}
 try {await bgm.play();return true}catch{return false}
}
export async function toggleSound(){
 soundEnabled.value=!soundEnabled.value
 if(soundEnabled.value){if(!await startMusic()){soundEnabled.value=false;return false}}
 else {bgm?.pause();voice?.pause()}
 return true
}
export function sfx(name){if(soundEnabled.value){const a=new Audio(`/assets/audio/${name}.mp3`);a.volume=.36;a.play().catch(()=>{})}}
export function speak(name){
 if(!soundEnabled.value)return
 voice?.pause();voice=new Audio(`/assets/audio/voice-${name}.mp3`);voice.volume=.75
 if(bgm)bgm.volume=.07
 voice.onended=()=>{if(bgm)bgm.volume=.2}
 voice.play().catch(()=>{if(bgm)bgm.volume=.2})
}
