<!-- components/CameraRunsPage.vue -->
<script setup>
import { onMounted, computed } from 'vue'
import { useCameraRuns, TASKS } from '../composables/useCameraRuns.js'
import { formatBKK } from '../utils/timeHelper.js'

const { runs, loading, error, activeTask, counts, loadRuns, loadAllCounts } = useCameraRuns()

onMounted(() => {
  loadAllCounts()
  loadRuns(TASKS[0].key)
})

const activeTaskInfo = computed(() => TASKS.find(t => t.key === activeTask.value))

function formatTime(iso) { return formatBKK(iso) }

function duration(start, end) {
  if (!start || !end) return '—'
  const secs = Math.round((new Date(end) - new Date(start)) / 1000)
  if (secs < 60) return `${secs}s`
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}m ${s}s`
}

function statusColor(task) {
  const t = TASKS.find(x => x.key === task)
  return t ? t.color : 'muted'
}
</script>

<template>
  <div class="runs-layout">

    <!-- Sidebar task list -->
    <aside class="task-sidebar">
      <div class="task-sidebar-title">Task Type</div>
      <button
        v-for="task in TASKS"
        :key="task.key"
        class="task-btn"
        :class="[`task-btn--${task.color}`, { active: activeTask === task.key }]"
        @click="loadRuns(task.key)"
      >
        <span class="task-dot" :class="`dot--${task.color}`"></span>
        <span class="task-label">{{ task.label }}</span>
        <span class="task-count">{{ counts[task.key] ?? '—' }}</span>
      </button>
    </aside>

    <!-- Main content -->
    <div class="runs-main">

      <!-- Summary bar -->
      <div class="summary-bar">
        <div
          v-for="task in TASKS"
          :key="task.key"
          class="summary-card"
          :class="{ 'summary-card--active': activeTask === task.key }"
          @click="loadRuns(task.key)"
        >
          <span class="summary-count" :class="`count--${task.color}`">
            {{ counts[task.key] ?? '—' }}
          </span>
          <span class="summary-label">{{ task.label }}</span>
        </div>
      </div>

      <!-- Header -->
      <div class="runs-header">
        <div class="runs-title">
          <span class="runs-dot" :class="`dot--${activeTaskInfo?.color}`"></span>
          {{ activeTaskInfo?.label }}
        </div>
        <button class="btn-reload" @click="loadRuns(activeTask)">Refresh</button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="state-msg">
        <div class="spinner"></div>
        Loading…
      </div>

      <!-- Error -->
      <div v-else-if="error" class="state-error">⚠ {{ error }}</div>

      <!-- Empty -->
      <div v-else-if="runs.length === 0" class="state-empty">
        No records for this task type.
      </div>

      <!-- Grid -->
      <div v-else class="runs-grid">
        <div
          v-for="(run, i) in runs"
          :key="run.id"
          class="run-card"
          :style="{ animationDelay: `${i * 0.03}s` }"
        >

          <!-- Card header -->
          <div class="run-card-top">
            <span class="run-id">#{{ run.id }}</span>
            <span class="run-status" :class="`status--${statusColor(run.status)}`">
              {{ run.status }}
            </span>
          </div>

          <!-- Info rows -->
          <div class="run-meta">
            <div class="run-row">
              <span class="run-key">Transaction</span>
              <span class="run-val run-val--mono">{{ run.transaction_bot_id }}</span>
            </div>
            <div class="run-row">
              <span class="run-key">Plant</span>
              <span class="run-val">{{ run.plant || '—' }}</span>
            </div>
            <div class="run-row">
              <span class="run-key">Area</span>
              <span class="run-val">{{ run.area || '—' }}</span>
            </div>
            <div class="run-row">
              <span class="run-key">NVR ID</span>
              <span class="run-val">{{ run.nvr_id || '—' }}</span>
            </div>
            <div class="run-row">
              <span class="run-key">Camera CH</span>
              <span class="run-val">{{ run.camera_ch || '—' }}</span>
            </div>
            <div class="run-row">
              <span class="run-key">CCTV No.</span>
              <span class="run-val">{{ run.cctv_no || '—' }}</span>
            </div>
            <div class="run-row">
              <span class="run-key">Start</span>
              <span class="run-val run-val--time">{{ formatTime(run.start_time) }}</span>
            </div>
            <div class="run-row">
              <span class="run-key">End</span>
              <span class="run-val run-val--time">{{ formatTime(run.end_time) }}</span>
            </div>
            <div class="run-row">
              <span class="run-key">Duration</span>
              <span class="run-val run-val--mono">{{ duration(run.start_time, run.end_time) }}</span>
            </div>
            <div class="run-row">
              <span class="run-key">Timestamp</span>
              <span class="run-val run-val--time">{{ formatTime(run.timestamp) }}</span>
            </div>
            <div v-if="run.remark" class="run-row">
              <span class="run-key">Remark</span>
              <span class="run-val run-val--remark">{{ run.remark }}</span>
            </div>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.runs-layout {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* ── Summary bar ────────────────────────────────────────────────────── */
.summary-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.summary-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 90px;
  cursor: pointer;
  box-shadow: var(--shadow);
  transition: border-color .15s, box-shadow .15s;
}
.summary-card:hover {
  border-color: var(--border2);
  box-shadow: 0 2px 8px rgba(0,0,0,.07);
}
.summary-card--active {
  border-color: var(--text);
  box-shadow: 0 2px 8px rgba(0,0,0,.1);
}

.summary-count {
  font-size: 22px;
  font-weight: 700;
  font-family: var(--font-mono);
  letter-spacing: -0.03em;
}
.count--green { color: var(--pass); }
.count--red   { color: var(--fail); }
.count--blue  { color: #3b82f6; }

.summary-label {
  font-size: 10px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

/* ── Task sidebar ───────────────────────────────────────────────────── */
.task-sidebar {
  width: 200px;
  flex-shrink: 0;
  border-right: 1px solid var(--border);
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  background: var(--surface);
}

.task-sidebar-title {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
  padding: 4px 8px 8px;
}

.task-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  padding: 7px 10px;
  border-radius: 7px;
  font-family: var(--font);
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text);
  cursor: pointer;
  text-align: left;
  transition: background .12s, color .12s;
  width: 100%;
}
.task-btn:hover { background: var(--surface2); }
.task-btn.active { background: var(--text); color: #fff; }
.task-btn.active .task-count { background: rgba(255,255,255,.15); color: rgba(255,255,255,.8); }

.task-label { flex: 1; }

.task-count {
  font-family: var(--font-mono);
  font-size: 10px;
  background: var(--surface2);
  color: var(--muted);
  padding: 1px 6px;
  border-radius: 99px;
}

/* Dots */
.task-dot, .runs-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot--green { background: var(--pass); }
.dot--red   { background: var(--fail); }
.dot--blue  { background: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,.15); animation: pulse-blue 2s ease-in-out infinite; }
.dot--muted { background: var(--muted); }
@keyframes pulse-blue {
  0%,100% { box-shadow: 0 0 0 2px rgba(59,130,246,.15); }
  50%      { box-shadow: 0 0 0 5px rgba(59,130,246,.06); }
}

/* ── Main content ───────────────────────────────────────────────────── */
.runs-main {
  flex: 1;
  overflow-y: auto;
  padding: 20px 22px 60px;
  min-width: 0;
}

.runs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.runs-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -.01em;
}

.btn-reload {
  background: var(--text); color: #fff; border: none;
  padding: 5px 14px; border-radius: var(--radius-sm);
  font-size: 13px; font-family: var(--font); cursor: pointer; transition: opacity .15s;
}
.btn-reload:hover { opacity: .75; }

/* States */
.state-msg {
  display: flex; align-items: center; gap: 10px;
  padding: 40px 0; color: var(--muted); font-size: 14px;
}
.spinner {
  width: 16px; height: 16px; border-radius: 50%;
  border: 2px solid var(--border); border-top-color: var(--text);
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.state-error {
  padding: 12px 16px; background: var(--fail-bg); color: var(--fail);
  border: 1px solid var(--fail); border-radius: var(--radius-sm); font-size: 13px;
}
.state-empty {
  padding: 60px 0; text-align: center; color: var(--muted); font-size: 14px;
}

/* ── Grid ───────────────────────────────────────────────────────────── */
.runs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
}

/* ── Card ───────────────────────────────────────────────────────────── */
.run-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  opacity: 0;
  animation: rise .3s ease forwards;
  transition: border-color .18s, box-shadow .18s;
}
.run-card:hover {
  border-color: var(--border2);
  box-shadow: 0 2px 8px rgba(0,0,0,.07), 0 8px 24px rgba(0,0,0,.05);
}
@keyframes rise { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }

.run-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
}

.run-id {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--muted);
}

.run-status {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 99px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.status--green { background: var(--pass-bg); color: var(--pass); }
.status--red   { background: var(--fail-bg); color: var(--fail); }
.status--blue  { background: #eff6ff; color: #2563eb; }
[data-theme="dark"] .status--blue { background: #1e3a5f; color: #60a5fa; }

/* Meta rows */
.run-meta {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.run-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
}
.run-key {
  font-size: 11px;
  color: var(--muted);
  flex-shrink: 0;
}
.run-val {
  font-size: 12px;
  font-weight: 500;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}
.run-val--mono   { font-family: var(--font-mono); font-size: 10.5px; font-weight: 400; }
.run-val--time   { font-family: var(--font-mono); font-size: 10.5px; font-weight: 400; color: var(--muted); }
.run-val--remark { font-style: italic; color: var(--muted); white-space: normal; text-align: right; }

@media (max-width: 680px) {
  .task-sidebar { width: 160px; }
  .runs-main    { padding: 16px 12px 40px; }
  .runs-grid    { grid-template-columns: 1fr; }
}
</style>