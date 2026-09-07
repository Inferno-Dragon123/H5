<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { avatarPng, composeAvatar, DEFAULT_AVATAR, HAIR_NAMES, normalizeAvatar, SUIT_NAMES } from './avatarRenderer'

const props = defineProps({
  modelValue: { type: Object, default: () => ({ ...DEFAULT_AVATAR }) },
  compact: { type: Boolean, default: false },
})
const canvas = ref(null)
const ready = ref(false)
const error = ref('')
const avatar = computed(() => normalizeAvatar(props.modelValue))
const description = computed(() => `${avatar.value.gender === 'female' ? '女生' : '男生'}探索者，${HAIR_NAMES[avatar.value.gender][avatar.value.hair]}，${SUIT_NAMES[avatar.value.suit]}`)
let revision = 0

watch([canvas, avatar, () => props.compact], async () => {
  if (!canvas.value) return
  const thisRevision = ++revision
  error.value = ''
  try {
    const image = await composeAvatar(avatar.value)
    if (thisRevision !== revision || !canvas.value) return
    const target = canvas.value
    target.width = props.compact ? 280 : 576
    target.height = props.compact ? 280 : 995
    const ctx = target.getContext('2d')
    ctx.clearRect(0, 0, target.width, target.height)
    // The source layers share one canvas center. The same centered portrait
    // window is used for every thumbnail, so no hairstyle gets a custom shift.
    if (props.compact) ctx.drawImage(image, 90, 30, 396, 440, 9, 0, 262, 280)
    else ctx.drawImage(image, 0, 0)
    ready.value = true
  } catch (failure) {
    if (thisRevision === revision) error.value = failure.message
  }
}, { deep: true, immediate: true })
onBeforeUnmount(() => { revision++ })
defineExpose({ exportPng: () => avatarPng(avatar.value), toDataURL: () => avatarPng(avatar.value, false) })
</script>

<template>
  <div class="avatar-figure" :class="{ 'avatar-figure--compact': compact, 'avatar-figure--ready': ready }">
    <canvas ref="canvas" role="img" :aria-label="description" />
    <span v-if="error" class="avatar-figure__status">{{ error }}</span>
    <span v-else-if="!ready" class="avatar-figure__status" aria-live="polite">形象加载中…</span>
  </div>
</template>

<style scoped>
.avatar-figure { position:relative; width:100%; height:100%; display:flex; align-items:center; justify-content:center; min-height:0; }
.avatar-figure canvas { display:block; width:100%; height:100%; object-fit:contain; opacity:0; transition:opacity .25s ease; }
.avatar-figure--ready canvas { opacity:1; }
.avatar-figure--compact { aspect-ratio:1; overflow:hidden; }
.avatar-figure--compact canvas { object-fit:contain; }
.avatar-figure__status { position:absolute; left:10%; right:10%; top:48%; text-align:center; font-size:12px; color:#6e879c; }
</style>
