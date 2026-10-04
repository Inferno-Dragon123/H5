<script setup>
defineProps({ size: { type: [Number, String], default: 27 } })
</script>

<template>
  <!--
    ICBC emblem path extracted unchanged from the verified vector source:
    https://upload.wikimedia.org/wikipedia/commons/3/3f/ICBC_China_logo.svg
    Checked against ICBC's official homepage logo:
    https://v.icbc.com.cn/userfiles/Resources/ICBC/shouye/images/2017/logo.png
    The source uses an inverted Y axis; retain that orientation below.
    The parent brand supplies the accessible bank name.
  -->
  <svg class="bank-icbc-mark" :width="size" :height="size" viewBox="0 0 58 58" aria-hidden="true" focusable="false">
    <g transform="translate(30.18 40.062) scale(1 -1)">
      <path fill="currentColor" fill-rule="evenodd" d="M 0,0 V -4.426 H 14.363 V 8.854 H 5.529 v 4.427 h 8.834 V 26.576 H 0 v -4.43 H 9.93 V 17.709 H 1.078 V 4.426 H 9.93 V 0 Z m -25.533,11.062 c 0,13.442 10.904,24.356 24.353,24.356 13.446,0 24.352,-10.914 24.352,-24.356 0,-13.447 -10.906,-24.353 -24.352,-24.353 -13.449,0 -24.353,10.906 -24.353,24.353 m -4.461,0 c 0,15.917 12.892,28.809 28.814,28.809 15.918,0 28.819,-12.892 28.819,-28.809 0,-15.917 -12.901,-28.814 -28.819,-28.814 -15.922,0 -28.814,12.897 -28.814,28.814 m 27.76,11.096 v 4.428 H -16.615 V 13.299 h 8.812 V 8.867 h -8.812 V -4.418 H -2.234 V 0.01 h -9.955 v 4.426 h 8.851 v 13.295 h -8.851 v 4.427"/>
    </g>
  </svg>
</template>
