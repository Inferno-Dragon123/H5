/**
 * Browser-only certificate renderer. It does not mutate progress or upload data.
 * @param {{id?:string,name?:string,placeName?:string,checkedAt?:string|number,
 * modeName?:string,routeCompleted?:number,routeTotal?:number,
 * checkinCount?:number,isGraduated?:boolean}} certificate
 * @returns {Promise<{dataUrl:string,fileName:string,width:number,height:number}>}
 */
export async function renderExplorationCertificate(certificate = {}) {
  if (typeof document === 'undefined') throw new Error('请在浏览器中生成证书。')
  if (document.fonts?.ready) await document.fonts.ready

  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1440
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('当前浏览器无法生成证书图片，请尝试其他浏览器。')

  const data = certificate || {}
  const name = cleanText(data.name, '星城探索者')
  const place = cleanText(data.placeName, '城市地标')
  const mode = cleanText(data.modeName, '城市探索')
  const id = cleanText(data.id, '体验纪念')
  const completed = count(data.routeCompleted)
  const total = count(data.routeTotal)
  const checkins = count(data.checkinCount)
  const graduated = data.isGraduated === true
  const ink = '#224f45', gold = '#ab854c', muted = '#788375'
  const sans = '"Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", sans-serif'
  const serif = '"Songti SC", "SimSun", "Noto Serif CJK SC", serif'

  function line(x1, y1, x2, y2, color = gold, width = 1) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2)
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke()
  }
  function text(value, x, y, size, color = ink, weight = '400', maxWidth = 840, family = sans) {
    ctx.font = `${weight} ${size}px ${family}`
    ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'
    ctx.fillText(fitText(ctx, String(value), maxWidth), x, y)
  }
  function tracked(value, x, y, size, spacing, color) {
    ctx.font = `500 ${size}px ${sans}`
    ctx.textAlign = 'left'; ctx.fillStyle = color
    const chars = Array.from(value)
    let start = x - (ctx.measureText(value).width + Math.max(0, chars.length - 1) * spacing) / 2
    chars.forEach(char => { ctx.fillText(char, start, y); start += ctx.measureText(char).width + spacing })
  }
  function star(x, y, size, color = gold) {
    ctx.save(); ctx.translate(x, y); ctx.fillStyle = color
    ctx.beginPath(); ctx.moveTo(0, -size); ctx.lineTo(size * .26, -size * .26)
    ctx.lineTo(size, 0); ctx.lineTo(size * .26, size * .26); ctx.lineTo(0, size)
    ctx.lineTo(-size * .26, size * .26); ctx.lineTo(-size, 0)
    ctx.lineTo(-size * .26, -size * .26); ctx.closePath(); ctx.fill(); ctx.restore()
  }
  function roundedRect(x, y, w, h, r) {
    // Avoid Canvas.roundRect so the export also works in older mobile WebViews.
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath()
  }

  // Warm paper, subtle deterministic grain, and an engraved double border.
  const paper = ctx.createLinearGradient(0, 0, 1080, 1440)
  paper.addColorStop(0, '#fffdf5'); paper.addColorStop(.55, '#f7f3e7'); paper.addColorStop(1, '#efe7d4')
  ctx.fillStyle = paper; ctx.fillRect(0, 0, 1080, 1440)
  ctx.fillStyle = 'rgba(130,109,72,.065)'
  for (let i = 0; i < 1800; i++) {
    const x = (i * 137.573) % 1080, y = (i * 271.391) % 1440
    ctx.fillRect(x, y, 1, 1)
  }
  ctx.strokeStyle = gold; ctx.lineWidth = 2; ctx.strokeRect(44, 44, 992, 1352)
  ctx.strokeStyle = 'rgba(171,133,76,.55)'; ctx.lineWidth = .8; ctx.strokeRect(55, 55, 970, 1330)
  for (const [x, y, rotate] of [[68, 68, 0], [1012, 68, Math.PI / 2], [1012, 1372, Math.PI], [68, 1372, Math.PI * 1.5]]) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rotate)
    line(0, 0, 60, 0, gold, 3); line(0, 0, 0, 60, gold, 3)
    star(11, 11, 6); ctx.restore()
  }

  // Header and title.
  star(540, 107, 20)
  text('工银星启 · 智游镜界', 540, 163, 26, ink, '600')
  tracked('CHANGSHA · CITY EXPLORER', 540, 197, 15, 2.5, gold)
  text('城市探索', 540, 282, 53, ink, '600', 850, serif)
  text(graduated ? '结营证书' : '打卡纪念证书', 540, 356, 62, ink, '600', 850, serif)
  line(277, 390, 490, 390, 'rgba(171,133,76,.55)')
  line(590, 390, 803, 390, 'rgba(171,133,76,.55)')
  star(540, 390, 9)
  text('授予探索者', 540, 451, 20, muted)
  text(name, 540, 521, 49, ink, '600', 810, serif)
  line(340, 543, 740, 543, 'rgba(171,133,76,.35)')
  text(graduated ? '已完成路线挑战，并留下城市打卡足迹。' : '已在星城留下探索足迹，收获一份专属纪念。', 540, 589, 22, muted)
  text('愿每一次出发，都让成长与城市相遇。', 540, 625, 22, muted)

  // Progress is taken from current route data; a check-in is not a completed lesson.
  roundedRect(122, 676, 836, 145, 14)
  ctx.fillStyle = 'rgba(255,253,246,.68)'; ctx.fill()
  ctx.strokeStyle = 'rgba(171,133,76,.3)'; ctx.lineWidth = 1; ctx.stroke()
  line(401, 703, 401, 794, 'rgba(171,133,76,.3)')
  line(679, 703, 679, 794, 'rgba(171,133,76,.3)')
  text('路线已通关', 261, 718, 18, muted)
  text(`${completed} / ${total}`, 261, 779, 38, ink, '600', 230)
  text('城市打卡', 540, 718, 18, muted)
  text(`${checkins} 次`, 540, 779, 38, ink, '600', 230)
  text('探索路线', 819, 718, 18, muted)
  text(mode, 819, 773, 26, ink, '600', 230)

  text('本次打卡地标', 540, 877, 19, muted)
  text(place, 540, 923, 34, ink, '600', 820, serif)
  text(formatDate(data.checkedAt), 540, 969, 20, muted)
  text(`纪念编号  ${id}`, 540, 1005, 16, muted, '400', 820)

  drawCity(ctx, ink, gold)

  // A decorative explorer seal, deliberately distinct from official certification.
  ctx.save(); ctx.translate(833, 1163); ctx.rotate(-.14)
  ctx.fillStyle = '#f5f0e1'; ctx.beginPath(); ctx.arc(0, 0, 87, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = gold; ctx.lineWidth = 2.5
  ctx.beginPath(); ctx.arc(0, 0, 87, 0, Math.PI * 2); ctx.stroke()
  ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, 77, 0, Math.PI * 2); ctx.stroke()
  star(0, -41, 13)
  text('星城探索', 0, 5, 24, ink, '600', 140, serif)
  text('演示纪念', 0, 36, 17, gold, '500', 140)
  ctx.restore()

  line(160, 1278, 920, 1278, 'rgba(171,133,76,.5)')
  text('把城市的故事，收进自己的成长旅程', 540, 1319, 19, ink, '400')
  text('参赛体验纪念 · 非官方认证', 540, 1354, 17, muted)

  const safeName = name.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '').slice(0, 30) || '探索者'
  return {
    dataUrl: canvas.toDataURL('image/png'),
    fileName: `智游镜界-${graduated ? '结营证书' : '打卡纪念证书'}-${safeName}.png`,
    width: canvas.width,
    height: canvas.height,
  }
}

function cleanText(value, fallback) {
  return String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim() || fallback
}

function count(value) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0
}

// Use grapheme boundaries where available so truncation does not split an emoji.
function fitText(ctx, value, maxWidth) {
  if (ctx.measureText(value).width <= maxWidth) return value
  const chars = typeof Intl.Segmenter === 'function'
    ? Array.from(new Intl.Segmenter('zh', { granularity: 'grapheme' }).segment(value), part => part.segment)
    : Array.from(value)
  while (chars.length && ctx.measureText(`${chars.join('')}…`).width > maxWidth) chars.pop()
  return `${chars.join('')}…`
}

function formatDate(value) {
  if (value === null || value === undefined || value === '') return '打卡时间未记录'
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return '打卡时间未记录'
  const pad = number => String(number).padStart(2, '0')
  return `打卡时间  ${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日  ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function drawCity(ctx, ink, gold) {
  ctx.save()
  ctx.strokeStyle = 'rgba(34,79,69,.48)'; ctx.lineWidth = 1.6
  // River and mountain silhouettes.
  ctx.beginPath(); ctx.moveTo(153, 1215)
  ctx.bezierCurveTo(310, 1190, 406, 1237, 530, 1209)
  ctx.bezierCurveTo(638, 1184, 770, 1229, 925, 1209); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(153, 1235)
  ctx.bezierCurveTo(341, 1210, 473, 1250, 647, 1230)
  ctx.bezierCurveTo(743, 1213, 806, 1245, 925, 1230); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(154, 1169)
  ctx.bezierCurveTo(213, 1120, 236, 1145, 269, 1109)
  ctx.bezierCurveTo(285, 1093, 321, 1131, 350, 1154)
  ctx.bezierCurveTo(394, 1102, 417, 1108, 478, 1157); ctx.stroke()
  // Historic pavilion, tower, rooftops, and modern city.
  const segments = [
    [[206,1193],[206,1170],[184,1170],[201,1156],[222,1141],[244,1156],[260,1170],[237,1170],[237,1193]],
    [[192,1172],[252,1172]], [[216,1165],[216,1190]], [[228,1165],[228,1190]],
    [[287,1193],[287,1152],[306,1152],[306,1193]],
    [[282,1152],[296,1139],[311,1152]],
    [[321,1193],[321,1139],[355,1139],[355,1193]],
    [[338,1139],[338,1100]], [[328,1123],[348,1123]],
    [[376,1193],[376,1167],[406,1167],[406,1193]],
    [[370,1167],[391,1155],[412,1167]],
    [[431,1193],[431,1117],[463,1117],[463,1193]],
    [[438,1117],[438,1100],[457,1100],[457,1117]],
    [[484,1193],[484,1089],[511,1089],[511,1193]],
    [[490,1089],[490,1078],[505,1078],[505,1089]],
    [[532,1193],[532,1137],[570,1137],[570,1193]],
    [[591,1193],[591,1106],[626,1106],[626,1193]],
    [[634,1193],[634,1144],[662,1144],[662,1193]],
    [[680,1193],[680,1168],[715,1168],[715,1193]],
  ]
  segments.forEach(points => {
    ctx.beginPath(); points.forEach(([x,y], index) => index ? ctx.lineTo(x,y) : ctx.moveTo(x,y)); ctx.stroke()
  })
  ctx.strokeStyle = 'rgba(171,133,76,.5)'; ctx.lineWidth = 1
  for (const [x,y,w,h] of [[321,1139,34,54],[431,1117,32,76],[484,1089,27,104],[532,1137,38,56],[591,1106,35,87]]) {
    for (let row = y + 14; row < y + h - 5; row += 14) {
      for (let col = x + 8; col < x + w - 5; col += 11) {
        ctx.beginPath(); ctx.moveTo(col,row); ctx.lineTo(col,row+4); ctx.stroke()
      }
    }
  }
  ctx.strokeStyle = gold; ctx.lineWidth = .8
  ctx.beginPath(); ctx.moveTo(152, 1195); ctx.lineTo(715, 1195); ctx.stroke()
  ctx.restore()
}
