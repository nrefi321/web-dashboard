// composables/useCameraRuns.js
import { ref } from 'vue'
import { API } from '../config.js'

export const TASKS = [
  { key: 'BOT_RUNNING',            label: 'Bot Running',          color: 'blue'   },
  { key: 'BOT_FINISHED',           label: 'Bot Finished',         color: 'green'  },
  { key: 'BOT_ERROR',              label: 'Bot Error',            color: 'red'    },
  { key: 'VIDEO_CONVERTED',        label: 'Video Converted',      color: 'green'  },
  { key: 'VIDEO_CONVERTED_ERROR',  label: 'Video Convert Error',  color: 'red'    },
  { key: 'AI_RUNNING',             label: 'AI Running',           color: 'blue'   },
  { key: 'AI_FINISHED',            label: 'AI Finished',          color: 'green'  },
  { key: 'AI_ERROR',               label: 'AI Error',             color: 'red'    },
]

export function useCameraRuns() {
  const runs       = ref([])
  const loading    = ref(false)
  const error      = ref(null)
  const activeTask = ref(TASKS[0].key)
  const counts     = ref({})  // { BOT_RUNNING: 3, VIDEO_CONVERTED: 10, ... }

  async function loadRuns(task) {
    loading.value    = true
    error.value      = null
    activeTask.value = task
    try {
      const res  = await fetch(API.cameraRuns(task))
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      runs.value = Array.isArray(data) ? data : []
      // Update count for this task
      counts.value[task] = runs.value.length
    } catch (err) {
      error.value = err.message
      runs.value  = []
      console.error('Failed to load camera runs:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch counts for ALL tasks in parallel (called once on mount)
  async function loadAllCounts() {
    const results = await Promise.allSettled(
      TASKS.map(t => fetch(API.cameraRuns(t.key)).then(r => r.json()))
    )
    results.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        const data = result.value
        counts.value[TASKS[i].key] = Array.isArray(data) ? data.length : 0
      } else {
        counts.value[TASKS[i].key] = 0
      }
    })
  }

  return { runs, loading, error, activeTask, counts, loadRuns, loadAllCounts }
}