<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { ArrowUpRight, Bell, Bookmark, CalendarDays, Check, ChevronLeft, ChevronRight, Gem, Headphones, Home, MapPin, MessageSquare, ScanLine, Search, ShieldCheck, ShoppingBag, Smile, Sparkles, X } from 'lucide-vue-next'
import './bank-home.css'
import BankLogo from './BankLogo.vue'

const emit = defineEmits(['enter-project'])
const props = defineProps({ points: { type: Number, default: 0 } })
const query = ref('')
const slide = ref(0)
const activeTab = ref('精选')
const toast = ref('')
const feature = ref(null)
const featureSheet = ref(null)
let toastTimer
let swipeStart = null
let suppressBannerClickUntil = 0
let featureTrigger = null

const primaryServices = [
  { name: '支付', icon: 'payment', caption: '付款、收款，便捷随行', description: '日常支付服务，随时随地轻松享生活。' },
  { name: '账单', icon: 'bill', caption: '每一笔，都心中有数', description: '清晰记录收支，让生活更有规划。' },
  { name: '银行卡', icon: 'card', caption: '你的随身金融管家', description: '查看卡片、管理账户，一站掌握。' },
  { name: '权益', icon: 'benefits', caption: '美好生活，更多惊喜', description: '发现工银星启，开启城市探索与专属权益。' },
]
const services = [
  { name: '爱购优惠', crop: [82, 979, 134, 128] },
  { name: '百城万店', crop: [277, 979, 134, 128] },
  { name: '爱旅行', crop: [472, 979, 134, 128] },
  { name: '影票', crop: [667, 979, 134, 128] },
  { name: '美食优惠', crop: [862, 979, 134, 128] },
  { name: '生活缴费', crop: [82, 1198, 134, 124] },
  { name: '办卡', crop: [277, 1198, 134, 124] },
  { name: '一键绑卡', crop: [472, 1198, 134, 124] },
  { name: '健康生活', crop: [667, 1198, 134, 124] },
  { name: '全部', crop: [862, 1198, 134, 124] },
]
const tabs = [
  { name: '精选', icon: Home }, { name: '生活', icon: Bookmark }, { name: '商城', icon: Gem }, { name: '分期', icon: ShoppingBag }, { name: '我的', icon: Smile },
]
const matchingServices = computed(() => [...primaryServices, ...services].filter(item => item.name.includes(query.value.trim())))
const projectMatches = computed(() => !query.value.trim() || ['工银星启', '智游镜界', '长沙', '探索', '活动', '金融', '反诈'].some(word => word.includes(query.value.trim()) || query.value.trim().includes(word)))
const dayLabel = new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit' }).format(new Date()).replace('/', '/')
const weekLabel = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date().getDay()]

// Reuse the supplied reference's small illustrations while keeping every region interactive DOM.
function spriteStyle(crop) {
  const [x, y, width, height] = crop
  return {
    aspectRatio: `${width} / ${height}`,
    backgroundSize: `${1080 / width * 100}% ${2374 / height * 100}%`,
    backgroundPosition: `${x / (1080 - width) * 100}% ${y / (2374 - height) * 100}%`,
  }
}
function notify(message) {
  clearTimeout(toastTimer)
  toast.value = message
  toastTimer = setTimeout(() => { toast.value = '' }, 3000)
}
function openFeature(name) {
  featureTrigger = document.activeElement
  const service = primaryServices.find(item => item.name === name)
  feature.value = { name, caption: service?.caption || '发现生活里的小美好', description: service?.description || '这个入口已为你保留。更多城市玩法，尽在工银星启·智游镜界。' }
  nextTick(() => featureSheet.value?.querySelector('.bank-sheet-close')?.focus())
}
function nextSlide(direction) { slide.value = (slide.value + direction + 3) % 3 }
function swipeEnd(event) {
  if (swipeStart === null) return
  const distance = event.clientX - swipeStart
  swipeStart = null
  if (Math.abs(distance) > 45) {
    suppressBannerClickUntil = performance.now() + 500
    nextSlide(distance < 0 ? 1 : -1)
  }
}
function activateBanner(name) {
  if (performance.now() < suppressBannerClickUntil) return
  if (name === 'project') emit('enter-project')
  else openFeature(name)
}
function submitSearch() {
  if (projectMatches.value) emit('enter-project')
  else if (matchingServices.value.length) openFeature(matchingServices.value[0].name)
  else notify('没有找到相关入口，试试搜索“工银星启”')
}
function selectTab(name) {
  activeTab.value = name
  if (name !== '精选') openFeature(name)
}
function closeFeature() {
  feature.value = null
  activeTab.value = '精选'
  nextTick(() => {
    if (featureTrigger?.isConnected) featureTrigger.focus()
    featureTrigger = null
  })
}
function handleSheetKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeFeature()
    return
  }
  if (event.key !== 'Tab') return
  const buttons = [...(featureSheet.value?.querySelectorAll('button:not(:disabled), [href], input:not(:disabled), [tabindex="0"]') || [])]
  if (!buttons.length) { event.preventDefault(); return }
  const first = buttons[0]
  const last = buttons[buttons.length - 1]
  if (!featureSheet.value.contains(document.activeElement) || (event.shiftKey && document.activeElement === first)) {
    event.preventDefault()
    ;(event.shiftKey ? last : first).focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
onBeforeUnmount(() => clearTimeout(toastTimer))
</script>

<template>
  <div class="bank-stage">
    <main class="bank-home" aria-label="中国工商银行 App 首页场景演示">
      <header class="bank-header">
        <div class="bank-brand-line">
          <div class="bank-brand" aria-label="中国工商银行">
            <BankLogo class="bank-icbc-mark" aria-hidden="true" />
            <span><b>中国工商银行</b><small>INDUSTRIAL AND COMMERCIAL BANK OF CHINA</small></span>
          </div>
          <span class="bank-demo-label">参赛场景演示</span>
        </div>
        <div class="bank-top-tools">
          <button class="bank-location" @click="notify('当前城市：长沙市')" aria-label="当前城市长沙市"><MapPin :size="22"/><span>长沙市</span></button>
          <form class="bank-search" role="search" @submit.prevent="submitSearch">
            <Search :size="17" aria-hidden="true"/>
            <input v-model="query" type="search" placeholder="美好生活打卡" aria-label="搜索服务或工银星启活动" maxlength="30"/>
            <button v-if="query" type="button" @click="query = ''" aria-label="清空搜索"><X :size="14"/></button>
          </form>
          <button class="bank-tool" @click="openFeature('在线客服')" aria-label="在线客服"><Headphones :size="24"/></button>
          <button class="bank-tool bank-message-tool" @click="openFeature('消息中心')" aria-label="消息中心"><MessageSquare :size="23"/><i/></button>
          <button class="bank-tool" @click="openFeature('扫一扫')" aria-label="扫一扫"><ScanLine :size="24"/></button>
        </div>
        <div class="bank-welcome"><span>美好生活，工银相伴</span><span>一起发现长沙 <Sparkles :size="12"/></span></div>
        <i class="bank-cloud bank-cloud-one" aria-hidden="true"/><i class="bank-cloud bank-cloud-two" aria-hidden="true"/>
      </header>

      <section class="bank-primary-services" aria-label="常用金融服务">
        <button v-for="service in primaryServices" :key="service.name" @click="openFeature(service.name)"><img class="bank-primary-icon" :src="`/assets/bank/primary-${service.icon}-v2.png`" alt=""/><span>{{ service.name }}</span></button>
      </section>

      <section v-if="query.trim()" class="bank-search-results" aria-label="搜索结果">
        <div class="bank-search-result-title"><span>搜索结果</span><small>{{ query }}</small></div>
        <button v-if="projectMatches" class="bank-project-search" @click="emit('enter-project')"><Sparkles :size="21"/><span><b>工银星启·智游镜界</b><small>跟随工小智，开启长沙探索之旅</small></span><ChevronRight :size="18"/></button>
        <div v-if="matchingServices.length" class="bank-service-results"><button v-for="service in matchingServices" :key="service.name" @click="openFeature(service.name)">{{ service.name }}<ChevronRight :size="15"/></button></div>
        <p v-if="!projectMatches && !matchingServices.length">暂未找到相关入口，试试“工银星启”。</p>
      </section>

      <section class="bank-carousel" aria-label="精选活动" aria-roledescription="轮播" @pointerdown="swipeStart = $event.clientX" @pointerup="swipeEnd" @pointercancel="swipeStart = null" @keydown.left.prevent="nextSlide(-1)" @keydown.right.prevent="nextSlide(1)">
        <Transition name="bank-slide" mode="out-in">
          <button v-if="slide === 0" key="project" class="bank-banner bank-project-banner" @click="activateBanner('project')" aria-label="进入智游镜界活动">
            <img class="bank-banner-scenery" src="/assets/hero.webp" alt=""/>
            <div class="bank-banner-project-copy"><span class="bank-banner-label">长沙限定 · 城市探索</span><h1>工银星启<span>智游镜界</span></h1><p>跟工小智，解锁城市里的惊喜</p><span class="bank-banner-cta">即刻出发 <ArrowUpRight :size="13"/></span></div>
            <img class="bank-banner-mascot" src="/assets/mascot-happy.png" alt="工小智"/><span class="bank-banner-star bank-banner-star-one" aria-hidden="true">✦</span><span class="bank-banner-star bank-banner-star-two" aria-hidden="true">✧</span>
          </button>
          <button v-else-if="slide === 1" key="autumn" class="bank-banner bank-autumn-banner" @click="activateBanner('爱购金秋')" aria-label="查看爱购金秋优惠"><span class="bank-banner-sr">爱购金秋，至高享 666 元优惠</span></button>
          <button v-else key="life" class="bank-banner bank-life-banner" @click="activateBanner('美好生活季')"><div><span class="bank-banner-label">工银爱购 · 美好生活季</span><h2>小日子，大美好</h2><p>把每一份心意，装进生活</p><span class="bank-banner-cta">发现精彩 <ChevronRight :size="13"/></span></div><span class="bank-life-art" aria-hidden="true"><ShoppingBag :size="66" stroke-width="1.3"/><i>♡</i></span></button>
        </Transition>
        <div class="bank-carousel-controls"><button @click="nextSlide(-1)" aria-label="上一个活动"><ChevronLeft :size="14"/></button><div class="bank-carousel-dots"><button v-for="(_, index) in 3" :key="index" :class="{ active: slide === index }" :aria-label="`展示第 ${index + 1} 个活动`" :aria-pressed="slide === index" @click="slide = index"/></div><button @click="nextSlide(1)" aria-label="下一个活动"><ChevronRight :size="14"/></button></div>
      </section>

      <section class="bank-lifestyle-services" aria-label="生活服务">
        <button v-for="service in services" :key="service.name" @click="openFeature(service.name)"><span class="bank-sprite bank-lifestyle-sprite" :style="spriteStyle(service.crop)" aria-hidden="true"/><span>{{ service.name }}</span></button>
      </section>

      <section class="bank-calendar" aria-labelledby="bank-calendar-title">
        <div class="bank-calendar-heading"><div><h2 id="bank-calendar-title">活动日历</h2><span class="bank-date">{{ dayLabel }} <b>{{ weekLabel }}</b></span></div><button @click="notify('今日精选活动已在下方为你呈现')">全部活动 <ChevronRight :size="13"/></button></div>
        <div class="bank-calendar-grid">
          <button class="bank-city-event" @click="emit('enter-project')" aria-label="参与工银星启·智游镜界城市探索活动"><span class="bank-event-badge">人气活动</span><h3>工银星启<br/><strong>智游镜界</strong></h3><p>这座城，等你解锁</p><img src="/assets/mascot-happy.png" alt=""/><span class="bank-city-event-cta">开启探索 <ArrowUpRight :size="14"/></span><span class="bank-event-orbit" aria-hidden="true"/></button>
          <div class="bank-calendar-side"><button class="bank-small-event bank-shopping-event" @click="openFeature('爱购优惠')"><span><h3>爱购优惠</h3><p>美好生活有惊喜</p><small>精选好礼 <ChevronRight :size="10"/></small></span><span class="bank-sprite bank-event-sprite" :style="spriteStyle([824, 1636, 158, 153])" aria-hidden="true"/></button><button class="bank-small-event bank-ai-event" @click="openFeature('AI 专区')"><span><h3>AI 专区</h3><p>让灵感触手可及</p><small>发现更多 <ChevronRight :size="10"/></small></span><span class="bank-sprite bank-event-sprite" :style="spriteStyle([824, 1900, 158, 153])" aria-hidden="true"/></button></div>
        </div>
      </section>

      <button class="bank-discovery-card" @click="emit('enter-project')"><span class="bank-discovery-icon"><ShieldCheck :size="29"/></span><span><small>工银星启 · 金融安全探索</small><b>边游长沙，边学反诈</b><p>换上喜欢的模样，开启你的城市故事</p></span><ChevronRight :size="18"/></button>
      <footer class="bank-home-footer"><span>中国工商银行 · 工银相伴，美好生活</span><span>参赛作品场景演示</span></footer>

      <nav class="bank-bottom-nav" aria-label="银行 App 导航"><button v-for="tab in tabs" :key="tab.name" :class="{ active: activeTab === tab.name }" :aria-current="activeTab === tab.name ? 'page' : undefined" @click="selectTab(tab.name)"><component :is="tab.icon" :size="26" :stroke-width="activeTab === tab.name ? 2.4 : 1.7"/><span>{{ tab.name }}</span><i v-if="activeTab === tab.name" aria-hidden="true"/></button></nav>

      <Transition name="bank-toast"><div v-if="toast" class="bank-toast" role="status"><Check :size="15"/>{{ toast }}</div></Transition>
      <Transition name="bank-sheet"><div v-if="feature" class="bank-sheet-backdrop" @click.self="closeFeature" @keydown="handleSheetKeydown"><section ref="featureSheet" class="bank-feature-sheet" role="dialog" aria-modal="true" :aria-label="feature.name" tabindex="-1"><span class="bank-sheet-handle"/><button class="bank-sheet-close" @click="closeFeature" aria-label="关闭"><X :size="20"/></button><div class="bank-feature-icon"><component :is="feature.name === '消息中心' ? Bell : feature.name === '扫一扫' ? ScanLine : ShieldCheck" :size="32"/></div><small>中国工商银行 · 参赛场景演示</small><h2>{{ feature.name }}</h2><h3>{{ feature.caption }}</h3><p>{{ feature.description }}</p><span v-if="feature.name === '消息中心'" class="bank-message-preview"><Sparkles :size="17"/>工银星启·智游镜界活动已上线，邀你探索长沙。</span><span v-if="feature.name === '权益' && props.points > 0" class="bank-message-preview">你的星启探索积分：{{ props.points }}</span><div class="bank-sheet-actions"><button class="bank-sheet-primary" @click="feature = null; emit('enter-project')">进入工银星启活动 <ArrowUpRight :size="16"/></button><button class="bank-sheet-secondary" @click="closeFeature">返回首页</button></div></section></div></Transition>
    </main>
  </div>
</template>
