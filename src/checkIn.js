import { places, modes } from './data/world.js'

const placeIds=new Set(places.map(place=>place.id))
const defaultOrigin=()=>globalThis.location?.origin||'https://h5-mu-bay.vercel.app'

export function createCheckInCode(placeId,origin=defaultOrigin()){
 if(!placeIds.has(placeId))throw new Error('未知打卡地标')
 const url=new URL('/',origin)
 url.searchParams.set('checkin',placeId)
 url.hash='map'
 return url.href
}

export function parseCheckInCode(code,origin=defaultOrigin()){
 try{
  const url=new URL(code)
  if(url.origin!==origin||url.pathname!=='/'||url.hash!=='#map'||url.searchParams.getAll('checkin').length!==1)return null
  const id=url.searchParams.get('checkin')
  return placeIds.has(id)?id:null
 }catch{return null}
}

function createRecordToken(){
 const bytes=new Uint8Array(4)
 if(globalThis.crypto?.getRandomValues){
  globalThis.crypto.getRandomValues(bytes)
  return Array.from(bytes,byte=>byte.toString(16).padStart(2,'0')).join('')
 }
 return Math.random().toString(16).slice(2,10).padEnd(8,'0')
}

export function createCheckInRecord(placeId,now=new Date(),token=createRecordToken()){
 if(!placeIds.has(placeId))throw new Error('未知打卡地标')
 const date=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(now).replaceAll('-','')
 return {id:`GYXQ-${date}-${token.toUpperCase()}`,placeId,checkedAt:now.toISOString(),method:'qr-demo'}
}

export function createExplorationCertificate(state,placeId,record){
 const place=places.find(item=>item.id===placeId),mode=modes.find(item=>item.id===state.mode)
 if(!place||!mode||record?.placeId!==placeId)throw new Error('缺少有效的打卡记录')
 const completed=new Set(state.completed),checkins=new Set(state.checkins)
 const routeCompleted=mode.ids.filter(id=>completed.has(id)).length
 const allChecked=mode.ids.every(id=>checkins.has(id))
 const isGraduated=allChecked&&routeCompleted===mode.ids.length
 return {
  id:`${record.id}-${mode.id.toUpperCase()}${isGraduated?'-GRAD':''}`,name:String(state.name||'星城探索者').slice(0,24),
  placeId,placeName:place.name,checkedAt:record.checkedAt,modeName:mode.full,modeId:mode.id,
  routeCompleted,routeTotal:mode.ids.length,checkinCount:checkins.size,
  isGraduated,
 }
}
