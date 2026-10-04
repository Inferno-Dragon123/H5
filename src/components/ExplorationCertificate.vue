<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { renderExplorationCertificate } from '../certificateRenderer'

const props = defineProps({ certificate: { type: Object, required: true } })
const emit = defineEmits(['downloaded', 'error'])
const rendered = ref(null)
const generating = ref(true)
const errorMessage = ref('')
const exportMessage = ref('')
const title = computed(() => props.certificate?.isGraduated === true ? '城市探索结营证书' : '城市探索打卡纪念证书')
let generation = 0

async function generate() {
  const current = ++generation
  generating.value = true
  errorMessage.value = ''
  exportMessage.value = ''
  rendered.value = null
  try {
    const result = await renderExplorationCertificate({ ...props.certificate })
    if (current === generation) rendered.value = result
  } catch (error) {
    if (current !== generation) return
    errorMessage.value = error instanceof Error ? error.message : '证书生成失败，请重试。'
    emit('error', error)
  } finally {
    if (current === generation) generating.value = false
  }
}

function download() {
  if (!rendered.value || generating.value) return
  try {
    const link = document.createElement('a')
    link.href = rendered.value.dataUrl
    link.download = rendered.value.fileName
    document.body.appendChild(link)
    try { link.click() } finally { link.remove() }
    exportMessage.value = '已发起 PNG 下载。手机也可长按证书图片保存到相册。'
    emit('downloaded', rendered.value)
  } catch (error) {
    errorMessage.value = '下载未完成，请长按证书图片保存，或重试下载。'
    emit('error', error)
  }
}

watch(() => props.certificate, generate, { deep: true, immediate: true })
onUnmounted(() => { generation++ })
</script>

<template>
  <section class="exploration-certificate" aria-label="证书预览与导出" :aria-busy="generating">
    <header class="certificate-header">
      <span class="certificate-eyebrow">EXPLORER KEEPSAKE</span>
      <h3>{{ title }}</h3>
      <p>让这次星城探索，成为一份可以珍藏的纪念。</p>
    </header>
    <div v-if="generating" class="certificate-placeholder" role="status">
      <span class="certificate-loader" aria-hidden="true"></span>
      <span>正在生成你的专属证书…</span>
    </div>
    <figure v-else-if="rendered" class="certificate-preview">
      <img :src="rendered.dataUrl" :alt="`${title}，授予${certificate.name || '星城探索者'}，已通关${certificate.routeCompleted || 0} / ${certificate.routeTotal || 0}，打卡${certificate.checkinCount || 0}次。参赛体验纪念，非官方认证。`" width="1080" height="1440" draggable="false" />
      <figcaption>高清 PNG · 1080 × 1440 · 手机可长按图片保存</figcaption>
    </figure>
    <p v-if="errorMessage" class="certificate-error" role="alert">{{ errorMessage }}</p>
    <div class="certificate-actions">
      <button v-if="!rendered && !generating" type="button" class="certificate-download" @click="generate">重新生成证书</button>
      <button v-else type="button" class="certificate-download" :disabled="generating || !rendered" @click="download">
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4" /></svg>
        {{ generating ? '证书生成中' : '导出证书 PNG' }}
      </button>
      <p class="certificate-save-note">电脑点击导出即可下载；手机若未自动下载，请长按上方证书图片选择保存。图片仅在本机生成。</p>
      <p v-if="exportMessage" class="certificate-export-message" role="status">{{ exportMessage }}</p>
    </div>
  </section>
</template>

<style scoped>
.exploration-certificate{width:100%;min-width:0;color:#224f45;font-family:inherit}
.certificate-header{text-align:center;margin:0 0 20px}
.certificate-eyebrow{display:block;font-size:10px;font-weight:700;letter-spacing:2.4px;color:#a7854d;margin-bottom:8px}
.certificate-header h3{margin:0;font-size:21px;font-weight:700;line-height:1.5;color:#224f45}
.certificate-header p{margin:7px 0 0;font-size:12px;color:#7b867c;line-height:1.7}
.certificate-preview{margin:0 auto;max-width:440px}
.certificate-preview img{display:block;width:100%;height:auto;border-radius:3px;box-shadow:0 10px 28px #36534919;border:1px solid #e5dcc6;-webkit-touch-callout:default;user-select:auto;-webkit-user-select:auto}
.certificate-preview figcaption{text-align:center;margin:13px 0 0;color:#8b897c;font-size:11px;line-height:1.7}
.certificate-placeholder{display:flex;align-items:center;justify-content:center;flex-direction:column;gap:18px;aspect-ratio:3/4;max-width:440px;margin:0 auto;border:1px solid #e5dcc6;border-radius:3px;background:linear-gradient(140deg,#fffdf5,#f0ead9);color:#7b867c;font-size:13px}
.certificate-loader{width:28px;height:28px;border:2px solid #d7ccb6;border-top-color:#29584b;border-radius:50%;animation:certificate-spin .9s linear infinite}
.certificate-actions{display:flex;align-items:center;flex-direction:column;gap:10px;margin-top:20px}
.certificate-download{display:flex;align-items:center;justify-content:center;gap:10px;width:min(100%,440px);min-height:48px;padding:12px 20px;border:1px solid #254f44;border-radius:12px;background:#254f44;color:#fffdf4;font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;transition:background .2s}
.certificate-download:hover:not(:disabled){background:#346859}
.certificate-download:focus-visible{outline:3px solid #c4a267;outline-offset:3px}
.certificate-download:disabled{opacity:.55;cursor:wait}
.certificate-save-note{max-width:430px;margin:0;color:#858c83;font-size:11px;line-height:1.8;text-align:center}
.certificate-export-message{margin:0;font-size:12px;color:#2f6955;line-height:1.7;text-align:center}
.certificate-error{padding:12px 15px;margin:16px 0;background:#fff3eb;color:#8a5537;border-radius:9px;font-size:13px;line-height:1.7;text-align:center}
@keyframes certificate-spin{to{transform:rotate(360deg)}}
@media(max-width:480px){.certificate-header{margin-bottom:16px}.certificate-header h3{font-size:19px}.certificate-header p{font-size:11px}.certificate-actions{margin-top:16px}.certificate-preview figcaption{font-size:10px}}
@media(prefers-reduced-motion:reduce){.certificate-loader{animation:none}}
</style>
