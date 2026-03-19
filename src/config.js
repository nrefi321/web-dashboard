// src/config.js
export const API_BASE   = import.meta.env.VITE_API_BASE   || ''
export const MEDIA_BASE = import.meta.env.VITE_MEDIA_BASE || 'http://10.153.94.123:8003'

export const API = {
  results:      `${API_BASE}/api/v_bot/ai-result/?skip=0&limit=100`,
  verifyStatus: (id) => `${API_BASE}/api/v_bot/ai-result/verify_status/${id}`,
  botStatus:    `${API_BASE}/api/v_bot/bot-monitoring/`,
  cameraRuns:   (task) => `${API_BASE}/api/v_bot/camera-runs/task?task=${task}`,
}