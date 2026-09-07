const imageCache = new Map()
const hairCache = new Map()

export const DEFAULT_AVATAR = { gender: 'female', hair: 0, suit: 0, color: '#754b32' }
export const HAIR_NAMES = {
  female: ['元气高马尾', '轻盈及肩发', '俏皮双丸子', '温柔麻花辫', '浪漫大波浪'],
  male: ['清爽短发', '碎盖中分', '利落侧背头', '微分碎盖', '高颅顶寸头'],
}
export const SUIT_NAMES = ['城市探索者', '太平街·新国潮', '江阁·诗意华裳', '潮宗街·街头玩家', '金融守护者']
export const HAIR_COLORS = [
  { name: '栗子棕', value: '#754b32' }, { name: '午夜黑', value: '#202631' },
  { name: '焦糖金', value: '#d89a40' }, { name: '莓果红', value: '#a73354' },
  { name: '雾霭蓝', value: '#406ec3' }, { name: '香芋紫', value: '#9c6cc4' },
  { name: '薄荷绿', value: '#3b9c87' }, { name: '落日橘', value: '#dd7037' },
  { name: '樱花粉', value: '#e18fa9' }, { name: '月光银', value: '#b7c7d8' },
]

export function normalizeAvatar(model = {}) {
  model = model && typeof model === 'object' ? model : {}
  const index = (value) => Number.isFinite(Number(value)) ? Math.max(0, Math.min(4, Math.round(Number(value)))) : 0
  return {
    gender: model.gender === 'male' ? 'male' : 'female',
    hair: index(model.hair), suit: index(model.suit),
    color: /^#[a-f\d]{6}$/i.test(model.color || '') ? model.color : DEFAULT_AVATAR.color,
  }
}

function loadImage(url) {
  if (!imageCache.has(url)) {
    imageCache.set(url, new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => { imageCache.delete(url); reject(new Error('形象素材暂时没有加载成功')) }
      image.src = url
    }))
  }
  return imageCache.get(url)
}

function tintHair(source, color, key) {
  if (hairCache.has(key)) return hairCache.get(key)
  const texture = document.createElement('canvas')
  texture.width = 576; texture.height = 995
  const ctx = texture.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(source, 0, 0)
  const pixels = ctx.getImageData(0, 0, texture.width, texture.height)
  const rgb = [1, 3, 5].map((at) => parseInt(color.slice(at, at + 2), 16))
  for (let i = 0; i < pixels.data.length; i += 4) {
    if (!pixels.data[i + 3]) continue
    const lightness = pixels.data[i] / 255
    const shade = .34 + .74 * lightness
    const highlight = Math.max(0, lightness - .64) * .40
    for (let channel = 0; channel < 3; channel++) {
      pixels.data[i + channel] = Math.min(255, rgb[channel] * shade + (255 - rgb[channel]) * highlight)
    }
  }
  ctx.putImageData(pixels, 0, 0)
  if (hairCache.size > 64) hairCache.delete(hairCache.keys().next().value)
  hairCache.set(key, texture)
  return texture
}

export async function composeAvatar(model) {
  const avatar = normalizeAvatar(model)
  const stem = `${import.meta.env.BASE_URL}assets/avatar/${avatar.gender}`
  const [base, suit, hair] = await Promise.all([
    loadImage(`${stem}-base.png`), loadImage(`${stem}-suit-${avatar.suit}.png`),
    loadImage(`${stem}-hair-${avatar.hair}.png`),
  ])
  const canvas = document.createElement('canvas')
  canvas.width = 576; canvas.height = 995
  const ctx = canvas.getContext('2d')
  ctx.drawImage(base, 0, 0)
  ctx.drawImage(suit, 0, 0)
  ctx.drawImage(tintHair(hair, avatar.color, `${avatar.gender}-${avatar.hair}-${avatar.color}`), 0, 0)
  return canvas
}

export async function paintAvatar(target, model, compact = false) {
  const canvas = await composeAvatar(model)
  const ctx = target.getContext('2d')
  target.width = compact ? 280 : canvas.width
  target.height = compact ? 280 : canvas.height
  ctx.clearRect(0, 0, target.width, target.height)
  if (compact) ctx.drawImage(canvas, 90, 30, 396, 440, 9, 0, 262, 280)
  else ctx.drawImage(canvas, 0, 0)
  return target
}

export async function avatarPng(model, download = true) {
  const canvas = await composeAvatar(model)
  const poster = document.createElement('canvas')
  poster.width = 800; poster.height = 1100
  const ctx = poster.getContext('2d')
  const gradient = ctx.createLinearGradient(0, 0, 800, 1100)
  gradient.addColorStop(0, '#effcff'); gradient.addColorStop(1, '#dcf0ff')
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 800, 1100)
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(400, 880, 210, 52, 0, 0, Math.PI * 2); ctx.fill()
  ctx.drawImage(canvas, 152, 80, 496, 857)
  ctx.fillStyle = '#14334e'; ctx.textAlign = 'center'; ctx.font = 'bold 32px "Microsoft YaHei", sans-serif'
  ctx.fillText('我的星启探索者', 400, 988)
  ctx.font = '20px "Microsoft YaHei", sans-serif'; ctx.fillStyle = '#60879e'
  ctx.fillText('工银星启 · 智游镜界', 400, 1032)
  const url = poster.toDataURL('image/png')
  if (download) {
    const link = document.createElement('a'); link.href = url; link.download = '我的星启探索者.png'
    document.body.appendChild(link); link.click(); link.remove()
  }
  return url
}
