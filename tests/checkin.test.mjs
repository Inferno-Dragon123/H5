import { test } from 'node:test'
import assert from 'node:assert/strict'
import { places, modes } from '../src/data/world.js'
import { createCheckInCode, parseCheckInCode, createCheckInRecord, createExplorationCertificate } from '../src/checkIn.js'

const origin='https://h5-mu-bay.vercel.app'

test('all point codes round-trip to same-site map links',()=>{
 for(const place of places){
  const code=createCheckInCode(place.id,origin)
  assert.equal(parseCheckInCode(code,origin),place.id)
  assert.equal(new URL(code).hash,'#map')
 }
 assert.throws(()=>createCheckInCode('unknown',origin))
})

test('foreign, malformed, ambiguous and unknown point codes are rejected',()=>{
 for(const code of [
  'not a URL','javascript:alert(1)',
  'https://example.com/?checkin=wuyi#map',
  `${origin}/other?checkin=wuyi#map`,
  `${origin}/?checkin=wuyi#home`,
  `${origin}/?checkin=unknown#map`,
  `${origin}/?checkin=wuyi&checkin=taiping#map`,
  `${origin}/#map`,
 ])assert.equal(parseCheckInCode(code,origin),null,code)
})

test('record works without randomUUID on LAN HTTP and dates use Shanghai time',()=>{
 const descriptor=Object.getOwnPropertyDescriptor(globalThis,'crypto')
 Object.defineProperty(globalThis,'crypto',{configurable:true,value:{getRandomValues:bytes=>bytes.set([0x12,0xab,0x01,0xff])}})
 try{
  const record=createCheckInRecord('wuyi',new Date('2026-10-04T17:00:00Z'))
  assert.equal(record.id,'GYXQ-20261005-12AB01FF')
  assert.equal(record.checkedAt,'2026-10-04T17:00:00.000Z')
  assert.equal(record.method,'qr-demo')
 }finally{
  if(descriptor)Object.defineProperty(globalThis,'crypto',descriptor)
  else delete globalThis.crypto
 }
})

test('graduation requires both all route lessons and all route check-ins',()=>{
 const route=modes.find(mode=>mode.id==='city').ids
 const record=createCheckInRecord('wuyi',new Date('2026-10-05T00:00:00Z'),'00000001')
 for(const [completed,checkins,expected] of [
  [[],route,false],[route,[],false],
  [route,route.slice(1),false],[route.slice(1),route,false],
  [route,route,true],
 ]){
  const state={name:'测试探索者',mode:'city',completed,checkins,points:50}
  const before=structuredClone(state)
  const certificate=createExplorationCertificate(state,'wuyi',record)
  assert.equal(certificate.isGraduated,expected)
  assert.equal(certificate.id.endsWith('-GRAD'),expected)
  assert.deepEqual(state,before)
 }
})

test('a mismatched point record cannot issue a certificate',()=>{
 const record=createCheckInRecord('taiping',new Date('2026-10-05T00:00:00Z'),'00000002')
 assert.throws(()=>createExplorationCertificate({mode:'city',completed:[],checkins:[]},'wuyi',record))
})
