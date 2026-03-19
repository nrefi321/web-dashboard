// composables/useBotStatus.js
import { ref, onUnmounted } from 'vue'
import { API } from '../config.js'

export function useBotStatus() {
  const bots    = ref([])
  const loading = ref(false)
  const error   = ref(null)
  let   timer   = null

  async function loadStatus() {
    loading.value = true
    error.value   = null
    try {
      const res  = await fetch(API.botStatus)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      // Handle both array and single object
      bots.value = Array.isArray(data) ? data : [data]
    } catch (err) {
      error.value = err.message
      console.error('Failed to load bot status:', err)
    } finally {
      loading.value = false
    }
  }

  function startPolling(intervalMs = 5000) {
    loadStatus()
    timer = setInterval(loadStatus, intervalMs)
  }

  function stopPolling() {
    if (timer) { clearInterval(timer); timer = null }
  }

  onUnmounted(stopPolling)

  return { bots, loading, error, loadStatus, startPolling, stopPolling }
}