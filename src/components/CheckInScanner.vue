<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import QRCode from 'qrcode'
import AppIcon from './AppIcon.vue'
import { createCheckInCode, parseCheckInCode } from '../checkIn'

const props = defineProps({
  places: { type: Array, required: true },
  initialPlace: { type: String, default: 'wuyi' },
  checkins: { type: Array, default: () => [] },
  initialCode: { type: String, default: '' }
})
const emit = defineEmits(['checkin'])

const selectedPlaceId = ref('')
const phase = ref('ready')
const scannedCode = ref('')
const qrSvg = ref('')
const qrError = ref('')
const confirming = ref(false)
let scanTimer
let qrGeneration = 0
let alive = true

const selectedPlace = computed(() => props.places.find(place => place.id === selectedPlaceId.value))
const currentCode = computed(() => selectedPlace.value ? createCheckInCode(selectedPlace.value.id) : '')
const alreadyCheckedIn = computed(() => props.checkins.some(record =>
  typeof record === 'string' ? record === selectedPlaceId.value : record?.placeId === selectedPlaceId.value
))
const currentStep = computed(() => phase.value === 'recognized' ? 2 : phase.value === 'scanning' ? 1 : 0)
const steps = ['选择点位', '扫码识别', '生成证书']

function cancelScan() {
  clearTimeout(scanTimer)
  scanTimer = undefined
}

function resetScan() {
  cancelScan()
  phase.value = 'ready'
  scannedCode.value = ''
  confirming.value = false
}

watch(selectedPlaceId, resetScan, { flush: 'sync' })

watch(
  [() => props.initialPlace, () => props.initialCode, () => props.places],
  ([initialPlace, initialCode], previous) => {
    const codeChanged = !previous || previous[1] !== initialCode
    const linkedPlaceId = codeChanged && initialCode ? parseCheckInCode(initialCode) : null
    const hasPlace = id => props.places.some(place => place.id === id)
    if (linkedPlaceId && hasPlace(linkedPlaceId)) {
      selectedPlaceId.value = linkedPlaceId
      cancelScan()
      scannedCode.value = initialCode
      confirming.value = false
      phase.value = 'recognized'
      return
    }
    const placeChanged = !previous || previous[0] !== initialPlace
    if (placeChanged && hasPlace(initialPlace)) selectedPlaceId.value = initialPlace
    else if (!hasPlace(selectedPlaceId.value)) selectedPlaceId.value = props.places[0]?.id || ''
  },
  { immediate: true }
)

watch(currentCode, async code => {
  const generation = ++qrGeneration
  qrSvg.value = ''
  qrError.value = ''
  if (!code) return
  try {
    const svg = await QRCode.toString(code, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 4,
      width: 208,
      color: { dark: '#244c40', light: '#ffffff' }
    })
    if (alive && generation === qrGeneration) qrSvg.value = svg
  } catch {
    if (alive && generation === qrGeneration) qrError.value = '二维码暂时生成失败，请重新选择点位。'
  }
}, { immediate: true })

function startScan() {
  if (!selectedPlace.value || !qrSvg.value || phase.value === 'scanning') return
  const code = currentCode.value
  const placeId = parseCheckInCode(code)
  if (!placeId || placeId !== selectedPlaceId.value) return
  cancelScan()
  scannedCode.value = ''
  confirming.value = false
  phase.value = 'scanning'
  scanTimer = setTimeout(() => {
    scanTimer = undefined
    if (!alive || selectedPlaceId.value !== placeId || phase.value !== 'scanning') return
    scannedCode.value = code
    phase.value = 'recognized'
  }, 1500)
}

function confirmCheckIn() {
  if (phase.value !== 'recognized' || confirming.value) return
  const placeId = parseCheckInCode(scannedCode.value)
  if (!placeId || placeId !== selectedPlaceId.value) return
  confirming.value = true
  emit('checkin', { placeId, code: scannedCode.value })
}

onUnmounted(() => {
  alive = false
  qrGeneration++
  cancelScan()
})
</script>

<template>
  <section class="checkin-scanner" :data-scan-phase="phase">
    <span class="checkin-eyebrow">CITY CHECK-IN · 扫码体验</span>
    <h2 id="dialog-title">扫码，把这一站收藏</h2>
    <p class="checkin-intro">识别地标二维码，留下城市足迹，再领取你的打卡证书。</p>

    <ol class="checkin-steps" aria-label="打卡流程">
      <li v-for="(step, index) in steps" :key="step" :class="{ active: index === currentStep, done: index < currentStep }" :aria-current="index === currentStep ? 'step' : undefined">
        <span><AppIcon v-if="index < currentStep" name="Check" :size="12"/><template v-else>{{ index + 1 }}</template></span>
        <b>{{ step }}</b>
      </li>
    </ol>

    <label class="checkin-field-label" for="checkin-place">选择演示点位</label>
    <select id="checkin-place" v-model="selectedPlaceId" :disabled="!places.length">
      <option v-for="place in places" :key="place.id" :value="place.id">{{ place.name }}{{ checkins.some(record => typeof record === 'string' ? record === place.id : record?.placeId === place.id) ? ' · 已打卡' : '' }}</option>
    </select>

    <div class="checkin-qr-card" :class="{ scanning: phase === 'scanning', recognized: phase === 'recognized' }" :aria-busy="phase === 'scanning'">
      <div class="checkin-qr-frame">
        <!-- Only the SVG produced by the QR encoder is inserted here. -->
        <div v-if="qrSvg" class="checkin-qr-image" role="img" :aria-label="`${selectedPlace?.name || ''}打卡二维码`" v-html="qrSvg"/>
        <div v-else class="checkin-qr-loading"><AppIcon name="ScanLine" :size="48"/><span>{{ qrError ? '请重新选择点位' : '正在生成二维码' }}</span></div>
        <i v-if="phase === 'scanning'" class="checkin-scan-line" aria-hidden="true"/>
      </div>
      <span class="checkin-qr-place"><AppIcon :name="selectedPlace?.icon || 'MapPin'" :size="16"/>{{ selectedPlace?.name || '暂未提供演示点位' }}</span>
      <small>可用另一台手机扫描，打开此地标的打卡页</small>
    </div>

    <div class="checkin-status" role="status" aria-live="polite">
      <p v-if="qrError" class="checkin-error">{{ qrError }}</p>
      <div v-else-if="phase === 'recognized'" class="checkin-recognized">
        <span class="checkin-success-icon"><AppIcon name="CheckCheck" :size="22"/></span>
        <div><b>已识别 · {{ selectedPlace?.name }}</b><p>{{ alreadyCheckedIn ? '此地标已打卡，可再次导出原证书。' : '地标已确认，完成打卡即可生成纪念证书。' }}</p></div>
      </div>
      <p v-else-if="phase === 'scanning'" class="checkin-scanning-status"><AppIcon name="ScanLine" :size="16"/>正在识别 {{ selectedPlace?.name }} 的二维码…</p>
      <p v-else class="checkin-help">点击下方按钮体验扫码识别，无需摄像头或定位权限。</p>
    </div>

    <div class="checkin-actions">
      <template v-if="phase === 'recognized'">
        <button class="checkin-button checkin-confirm" :disabled="confirming" @click="confirmCheckIn"><AppIcon :name="alreadyCheckedIn ? 'Download' : 'ShieldCheck'" :size="18"/><span>{{ alreadyCheckedIn ? '导出此地标证书' : '确认打卡并生成证书' }}</span></button>
        <button class="checkin-button checkin-retry" @click="startScan"><AppIcon name="RefreshCw" :size="16"/>重新扫码</button>
      </template>
      <button v-else class="checkin-button checkin-start" :disabled="phase === 'scanning' || !qrSvg" @click="startScan"><AppIcon name="ScanLine" :size="18"/><span>{{ phase === 'scanning' ? '正在扫码，请稍候…' : '开始扫码演示' }}</span></button>
    </div>
    <p class="checkin-footnote">演示打卡不验证真实到访，记录与证书保存在本机体验中。</p>
  </section>
</template>

<style scoped>
.checkin-scanner{width:100%;min-width:0;color:#244437}
.checkin-eyebrow{display:block;padding-right:22px;color:#819583;font-size:9px;font-weight:600;letter-spacing:1.35px;line-height:1.8}
.checkin-scanner h2{margin:9px 0 7px;padding-right:12px;color:#244437;font-size:25px;line-height:1.55}
.checkin-intro{color:#7b887a;font-size:12px;line-height:1.8}
.checkin-steps{display:flex;gap:7px;list-style:none;padding:0;margin:20px 0}
.checkin-steps li{display:flex;align-items:center;gap:5px;flex:1;min-width:0;color:#93a091;font-size:11px;white-space:nowrap}
.checkin-steps li>span{display:grid;place-items:center;flex-shrink:0;width:22px;height:22px;border:1px solid #dce4d8;border-radius:50%;background:#f8f9f2;font-size:10px;font-weight:600}
.checkin-steps li b{font-size:inherit;font-weight:500}
.checkin-steps .active{color:#277251}.checkin-steps .active>span{background:#2d7959;color:#fff;border-color:#2d7959}.checkin-steps .done{color:#5d8a66}.checkin-steps .done>span{background:#e7f2e1;border-color:#d1e3c9}
.checkin-field-label{display:block;margin-bottom:7px;color:#5d705e;font-size:11px;font-weight:600}
.checkin-scanner select{display:block;box-sizing:border-box;width:100%;max-width:100%;min-width:0;border:1px solid #dce3d3;background:#fffef9;border-radius:10px;padding:11px 12px;color:#34513b;font-size:12px}
.checkin-qr-card{display:flex;flex-direction:column;align-items:center;gap:9px;margin:16px 0 14px;padding:17px 12px 13px;border:1px solid #e4e8d8;border-radius:16px;background:linear-gradient(145deg,#fbfcf3,#f5f8ee)}
.checkin-qr-frame{position:relative;width:min(100%,188px);aspect-ratio:1;border:1px solid #dce7d6;border-radius:12px;overflow:hidden;background:#fff}
.checkin-qr-image{width:100%;height:100%;line-height:0}.checkin-qr-image :deep(svg){display:block;width:100%;height:100%;max-width:100%}
.checkin-qr-loading{display:flex;align-items:center;justify-content:center;flex-direction:column;gap:15px;width:100%;height:100%;color:#9ab29b;font-size:10px}
.checkin-qr-place{display:flex;align-items:center;gap:6px;color:#355a42;font-size:13px;font-weight:600}.checkin-qr-card>small{max-width:100%;color:#8c9785;text-align:center;font-size:10px;line-height:1.7}
.checkin-scan-line{position:absolute;left:4%;right:4%;top:8%;height:3px;background:#55a764;box-shadow:0 0 12px #5bbc77,0 8px 22px #64b97470;animation:checkin-sweep 1.1s ease-in-out infinite alternate;pointer-events:none}.scanning .checkin-qr-frame{border-color:#86b38b;box-shadow:0 0 0 4px #bfd9b51f}.recognized .checkin-qr-frame{border-color:#a9c79f}
.checkin-status{min-height:37px;margin-bottom:16px}.checkin-help,.checkin-scanning-status,.checkin-error{font-size:11px;line-height:1.85;color:#81917d}.checkin-scanning-status{display:flex;align-items:center;gap:6px;color:#438757}.checkin-error{color:#a55845}
.checkin-recognized{display:flex;align-items:center;gap:11px;padding:12px;border:1px solid #d6e6ce;border-radius:12px;background:#edf5e8}.checkin-success-icon{display:grid;place-items:center;flex-shrink:0;width:36px;height:36px;border-radius:50%;background:#dceccd;color:#408455}.checkin-recognized>div{min-width:0}.checkin-recognized b{display:block;font-size:13px;font-weight:650;line-height:1.6;overflow-wrap:anywhere}.checkin-recognized p{margin-top:3px;color:#7a8e71;font-size:10px;line-height:1.8}
.checkin-actions{display:grid;gap:9px}.checkin-button{display:flex;align-items:center;justify-content:center;gap:8px;box-sizing:border-box;width:100%;min-width:0;min-height:44px;padding:12px 10px;border:1px solid transparent;border-radius:10px;background:#2d7959;color:#fff;font-size:12px;font-weight:600;line-height:1.6;white-space:normal}.checkin-button:not(:disabled):hover{background:#236345}.checkin-button:disabled{opacity:.6;cursor:default}.checkin-button span{min-width:0;overflow-wrap:anywhere}.checkin-retry{border-color:#d9e3d2;background:#fafcf5;color:#5d7c58}.checkin-retry:not(:disabled):hover{background:#f0f5e8}.checkin-footnote{margin-top:11px;color:#99a18d;font-size:9px;line-height:1.8;text-align:center}
@keyframes checkin-sweep{from{top:8%}to{top:90%}}
@media(max-width:380px){.checkin-scanner h2{font-size:22px}.checkin-intro{font-size:11px}.checkin-steps{gap:5px;margin:17px 0}.checkin-steps li{font-size:9px;gap:4px}.checkin-steps li>span{width:20px;height:20px}.checkin-qr-frame{width:min(100%,172px)}.checkin-qr-card{padding:13px 8px 11px}.checkin-qr-card>small{font-size:9px}.checkin-recognized{padding:10px;gap:8px}.checkin-recognized b{font-size:12px}}
@media(prefers-reduced-motion:reduce){.checkin-scan-line{animation:none;top:50%}}
</style>
