<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import App from './App.vue'
import BankHome from './components/BankHome.vue'
import BankLaunch from './components/BankLaunch.vue'
import { pauseAudio, setScene } from './audio'

const projectPages = new Set(['home', 'map', 'story', 'classroom', 'avatar', 'rewards', 'community', 'profile'])
const hash = () => location.hash.slice(1)
const stage = ref(projectPages.has(hash()) ? 'project' : 'splash')

function showBank({ replace = false } = {}) {
  pauseAudio()
  stage.value = 'bank'
  if (hash() !== 'bank') {
    history[replace ? 'replaceState' : 'pushState'](null, '', `${location.pathname}${location.search}#bank`)
  }
  window.scrollTo({ top: 0, behavior: 'instant' })
}
function enterProject() {
  setScene('explore')
  stage.value = 'project'
  location.hash = 'home'
  window.scrollTo({ top: 0, behavior: 'instant' })
}
function followLocation() {
  if (projectPages.has(hash())) {
    if (stage.value !== 'project') setScene('explore')
    stage.value = 'project'
  }
  else showBank({ replace: true })
}
onMounted(() => window.addEventListener('hashchange', followLocation))
onUnmounted(() => window.removeEventListener('hashchange', followLocation))
</script>

<template>
  <BankLaunch v-if="stage === 'splash'" @complete="showBank({ replace: true })" />
  <BankHome v-else-if="stage === 'bank'" @enter-project="enterProject" />
  <App v-else @return-bank="showBank" />
</template>

<style>
.bank-return-button{width:27px;height:30px;margin-right:2px;border:1px solid #e2e7ef;background:white;color:#64738a}
@media(max-width:640px){.bank-return-button{width:25px;height:27px;margin-right:0}}
</style>
