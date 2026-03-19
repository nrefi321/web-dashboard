// composables/useTheme.js
import { ref, watch, onMounted } from 'vue'

const isDark = ref(false)

export function useTheme() {
  function apply(dark) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }

  function toggle() {
    isDark.value = !isDark.value
  }

  function init() {
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = saved ? saved === 'dark' : prefersDark
  }

  watch(isDark, apply, { immediate: false })

  return { isDark, toggle, init }
}