<!-- components/BotStatusPage.vue -->
<script setup>
import { computed, onMounted } from 'vue'
import { useBotStatus } from '../composables/useBotStatus.js'

const { bots, loading, error, startPolling } = useBotStatus()

onMounted(() => startPolling(5000))

// API shape: { machine, cpu, ram, disk, other, active, last_seen }
// active = boolean true/false

const totalBots  = computed(() => bots.value.length)
const activeBots = computed(() => bots.value.filter(b => b.active === true).length)
const warnBots   = computed(() => bots.value.filter(b =>
  b.active === true && (b.cpu >= 70 || b.ram >= 70 || b.disk >= 70)
).length)

function gaugeColor(pct) {
  if (pct >= 80) return 'var(--fail)'
  if (pct >= 70) return 'var(--warn)'
  return 'var(--pass)'
}

function formatLastSeen(iso) {
  if (!iso) return '—'
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 10)   return 'just now'
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}
</script>

<template>
  <div class="status-page">

    <!-- Summary bar -->
    <div class="summary-bar">
      <div class="summary-card">
        <span class="summary-val">{{ totalBots }}</span>
        <span class="summary-key">Total</span>
      </div>
      <div class="summary-card">
        <span class="summary-val summary-val--active">{{ activeBots }}</span>
        <span class="summary-key">Active</span>
      </div>
      <div class="summary-card">
        <span class="summary-val summary-val--offline">{{ totalBots - activeBots }}</span>
        <span class="summary-key">Offline</span>
      </div>
      <div class="summary-card">
        <span class="summary-val summary-val--warn">{{ warnBots }}</span>
        <span class="summary-key">High Load</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading && bots.length === 0" class="state-msg">
      <div class="spinner"></div>
      Loading machine status…
    </div>

    <!-- Error -->
    <div v-else-if="error && bots.length === 0" class="state-error">
      ⚠ {{ error }}
    </div>

    <!-- Bot grid -->
    <div v-else class="bot-grid">
      <div
        v-for="(bot, i) in bots"
        :key="bot.machine"
        class="bot-card"
        :class="{ 'bot-card--offline': !bot.active }"
        :style="{ animationDelay: `${i * 0.05}s` }"
      >

        <!-- Header -->
        <div class="bot-header">
          <div class="bot-identity">
            <span class="bot-status-dot" :class="bot.active ? 'dot--active' : 'dot--offline'"></span>
            <span class="bot-name">{{ bot.machine }}</span>
          </div>
          <span class="bot-badge" :class="bot.active ? 'badge--active' : 'badge--offline'">
            {{ bot.active ? 'Active' : 'Offline' }}
          </span>
        </div>

        <!-- Metrics -->
        <div class="metrics" :class="{ 'metrics--dim': !bot.active }">

          <!-- CPU -->
          <div class="metric">
            <div class="metric-top">
              <span class="metric-label">CPU</span>
              <span class="metric-value" :style="{ color: gaugeColor(bot.cpu) }">
                {{ bot.cpu != null ? `${bot.cpu}%` : '—' }}
              </span>
            </div>
            <div class="gauge-track">
              <div class="gauge-fill" :style="{
                width: `${bot.cpu ?? 0}%`,
                background: gaugeColor(bot.cpu),
              }"></div>
            </div>
          </div>

          <!-- RAM -->
          <div class="metric">
            <div class="metric-top">
              <span class="metric-label">RAM</span>
              <span class="metric-value" :style="{ color: gaugeColor(bot.ram) }">
                {{ bot.ram != null ? `${bot.ram}%` : '—' }}
              </span>
            </div>
            <div class="gauge-track">
              <div class="gauge-fill" :style="{
                width: `${bot.ram ?? 0}%`,
                background: gaugeColor(bot.ram),
              }"></div>
            </div>
          </div>

          <!-- Disk -->
          <div class="metric">
            <div class="metric-top">
              <span class="metric-label">Disk</span>
              <span class="metric-value" :style="{ color: gaugeColor(bot.disk) }">
                {{ bot.disk != null ? `${bot.disk}%` : '—' }}
              </span>
            </div>
            <div class="gauge-track">
              <div class="gauge-fill" :style="{
                width: `${bot.disk ?? 0}%`,
                background: gaugeColor(bot.disk),
              }"></div>
            </div>
          </div>

          <!-- Other -->
          <div v-if="bot.other != null && bot.other !== ''" class="metric-remark">
            <span class="metric-label">Other</span>
            <span class="remark-text">{{ bot.other }}</span>
          </div>

        </div>

        <!-- Footer: last seen -->
        <div class="bot-footer">
          <span class="footer-item">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <circle cx="5" cy="5" r="3.5" stroke="currentColor" stroke-width="1.2" fill="none"/>
              <path d="M5 3V5.5L6.5 6.5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>
            </svg>
            Last seen: {{ formatLastSeen(bot.last_seen) }}
          </span>
        </div>

      </div>
    </div>

    <!-- Auto-refresh indicator -->
    <div class="refresh-bar">
      <span class="refresh-dot" :class="{ 'refresh-dot--error': error }"></span>
      <span v-if="error" style="color: var(--fail)">{{ error }} — retrying every 5s</span>
      <span v-else>Auto-refreshing every 5s</span>
    </div>

  </div>
</template>

<style scoped>
.status-page { padding: 20px 22px 60px; }

/* Summary */
.summary-bar {
  display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;
}
.summary-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 14px 24px;
  display: flex; flex-direction: column; gap: 2px;
  min-width: 100px; box-shadow: var(--shadow);
}
.summary-val {
  font-size: 26px; font-weight: 700;
  font-family: var(--font-mono); letter-spacing: -0.03em;
}
.summary-val--active  { color: var(--pass); }
.summary-val--offline { color: var(--muted); }
.summary-val--warn    { color: var(--warn); }
.summary-key {
  font-size: 11px; color: var(--muted);
  text-transform: uppercase; letter-spacing: 0.06em;
}

/* States */
.state-msg {
  display: flex; align-items: center; gap: 10px;
  padding: 40px; color: var(--muted); font-size: 14px;
}
.spinner {
  width: 16px; height: 16px; border-radius: 50%;
  border: 2px solid var(--border); border-top-color: var(--text);
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.state-error {
  padding: 12px 16px; background: var(--fail-bg);
  color: var(--fail); border: 1px solid var(--fail);
  border-radius: var(--radius-sm); font-size: 13px; margin-bottom: 16px;
}

/* Grid */
.bot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

/* Card */
.bot-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden;
  opacity: 0; animation: rise .3s ease forwards;
  transition: border-color .18s, box-shadow .18s, background 0.2s;
}
.bot-card:hover {
  border-color: var(--border2);
  box-shadow: 0 2px 8px rgba(0,0,0,.07), 0 8px 24px rgba(0,0,0,.05);
}
.bot-card--offline { filter: grayscale(0.3); opacity: 0.7; }
@keyframes rise { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }

/* Header */
.bot-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px;
}
.bot-identity { display: flex; align-items: center; gap: 8px; }
.bot-status-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}
.dot--active {
  background: var(--pass);
  animation: pulse 2s ease-in-out infinite;
}
.dot--offline { background: var(--muted); }
@keyframes pulse {
  0%,100% { box-shadow: 0 0 0 2px rgba(52,212,104,.15); }
  50%      { box-shadow: 0 0 0 5px rgba(52,212,104,.06); }
}
.bot-name { font-size: 13px; font-weight: 600; letter-spacing: -.01em; }
.bot-badge {
  font-size: 10px; font-weight: 600; padding: 2px 8px;
  border-radius: 99px; letter-spacing: 0.04em; text-transform: uppercase;
}
.badge--active  { background: var(--pass-bg); color: var(--pass); }
.badge--offline { background: var(--surface2); color: var(--muted); }

/* Metrics */
.metrics {
  padding: 10px 14px 12px;
  display: flex; flex-direction: column; gap: 10px;
  border-top: 1px solid var(--border);
}
.metrics--dim { opacity: 0.4; pointer-events: none; }

.metric { display: flex; flex-direction: column; gap: 5px; }

/* Other — plain remark row */
.metric-remark {
  display: flex; align-items: baseline;
  justify-content: space-between; gap: 8px;
  padding-top: 4px;
  border-top: 1px dashed var(--border);
}
.remark-text {
  font-size: 11px; color: var(--muted);
  text-align: right; font-style: italic;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  max-width: 160px;
}
.metric-top {
  display: flex; justify-content: space-between; align-items: baseline;
}
.metric-label {
  font-size: 11px; color: var(--muted); text-transform: uppercase;
  letter-spacing: 0.06em; font-family: var(--font-mono);
}
.metric-value {
  font-size: 13px; font-weight: 600; font-family: var(--font-mono);
  transition: color .4s;
}
.gauge-track {
  height: 5px; background: var(--surface2); border-radius: 99px; overflow: hidden;
}
.gauge-fill {
  height: 100%; border-radius: 99px;
  transition: width .6s ease, background .4s;
  min-width: 2px;
}

/* Footer */
.bot-footer {
  padding: 8px 14px;
  border-top: 1px solid var(--border);
}
.footer-item {
  display: flex; align-items: center; gap: 4px;
  font-size: 11px; color: var(--muted);
}

/* Refresh bar */
.refresh-bar {
  display: flex; align-items: center; gap: 6px;
  margin-top: 20px; font-size: 11px; color: var(--muted);
}
.refresh-dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--pass);
  animation: pulse 2s ease-in-out infinite;
}
.refresh-dot--error { background: var(--fail); animation: none; }

@media (max-width: 680px) {
  .status-page { padding: 16px 12px 40px; }
  .bot-grid { grid-template-columns: 1fr; }
}
</style>