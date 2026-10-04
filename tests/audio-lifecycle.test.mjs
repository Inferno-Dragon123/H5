import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'

let audio, frames, holds, instances, revision = 0
class TestAudio {
  constructor(url) { this.src=url;this.paused=true;this.loop=false;this.volume=1;this.listeners=new Map();instances.push(this) }
  get volume() { return this._volume }
  set volume(value) { if(value<0||value>1)throw new RangeError('Volume must be within [0, 1]');this._volume=value }
  addEventListener(name,callback) { const list=this.listeners.get(name)||[];list.push(callback);this.listeners.set(name,list) }
  play() {
    const index=holds.findIndex(hold=>this.src.endsWith(hold.file))
    if(index>=0) {
      const hold=holds.splice(index,1)[0]
      return new Promise(resolve=>{hold.release=()=>{this.paused=false;resolve()}})
    }
    this.paused=false
    return Promise.resolve()
  }
  pause() { this.paused=true }
  finish() { this.paused=true;for(const callback of this.listeners.get('ended')||[])callback() }
}
const settle=async()=>{for(let i=0;i<8;i++)await Promise.resolve();const pending=frames.splice(0);for(const callback of pending)callback(performance.now()+10000);for(let i=0;i<4;i++)await Promise.resolve()}
const music=()=>instances.filter(clip=>clip.datasetScene&&!clip.paused).map(clip=>clip.datasetScene)
const hold=file=>{const request={file,release:null};holds.push(request);return request}

beforeEach(async()=>{
  frames=[];holds=[];instances=[]
  globalThis.Audio=TestAudio
  globalThis.requestAnimationFrame=callback=>frames.push(callback)
  audio=await import(`../src/audio.js?test=${++revision}`)
})
afterEach(()=>{audio.pauseAudio();delete globalThis.Audio;delete globalThis.requestAnimationFrame})

test('a delayed chapter request cannot replace the resumed main music',async()=>{
  await audio.toggleSound();await settle()
  const request=hold('story.mp3')
  audio.setScene('story');audio.setScene('explore')
  request.release();await settle()
  assert.deepEqual(music(),['explore'])
  assert.equal(audio.soundEnabled.value,true)
})

test('a replayed one-shot victory remains stoppable after its ended event',async()=>{
  audio.setScene('victory');await audio.toggleSound();await settle()
  const victory=instances.find(clip=>clip.datasetScene==='victory')
  victory.finish();audio.setScene('victory');await settle()
  assert.equal(victory.paused,false)
  audio.pauseAudio()
  assert.equal(victory.paused,true)
  assert.deepEqual(music(),[])
})

test('leaving a chapter immediately stops music, ambience and voice before resuming main music',async()=>{
  await audio.toggleSound();audio.setScene('story-heritage');audio.setAmbience('street');audio.speak('alert');audio.sfx('villain');await settle()
  const chapter=instances.filter(clip=>!clip.paused)
  audio.pauseAudio()
  assert.ok(chapter.every(clip=>clip.paused))
  audio.setScene('explore');await settle()
  assert.deepEqual(music(),['explore'])
  assert.ok(chapter.every(clip=>clip.paused))
  assert.equal(audio.soundEnabled.value,true)
})

test('rapid on/off/on cannot let an obsolete play result turn off the latest preference',async()=>{
  const request=hold('explore.mp3'),first=audio.toggleSound()
  await audio.toggleSound();await audio.toggleSound();request.release();await first;await settle()
  assert.equal(audio.soundEnabled.value,true)
  assert.deepEqual(music(),['explore'])
})

test('changing scenes while sound starts preserves the enabled preference',async()=>{
  const request=hold('explore.mp3'),first=audio.toggleSound()
  audio.setScene('story-night');request.release();await first;await settle()
  assert.equal(audio.soundEnabled.value,true)
  assert.deepEqual(music(),['story-night'])
})

test('exit respects a user who has turned music off',async()=>{
  await audio.toggleSound();audio.setScene('story-chase');await settle();await audio.toggleSound()
  audio.pauseAudio();audio.setScene('explore');await settle()
  assert.equal(audio.soundEnabled.value,false)
  assert.ok(instances.every(clip=>clip.paused))
})

test('an early animation timestamp cannot throw and leave the outgoing track playing',async()=>{
  await audio.toggleSound();await settle();audio.setScene('story-heritage')
  for(let i=0;i<8;i++)await Promise.resolve()
  assert.doesNotThrow(()=>frames.shift()(0))
  await settle()
  assert.deepEqual(music(),['story-heritage'])
})
