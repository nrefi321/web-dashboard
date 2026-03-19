<!-- components/AppHeader.vue -->
<script setup>
const props = defineProps({
  filteredCount: { type: Number, default: 0 },
  totalCount:    { type: Number, default: 0 },
  activePage:    { type: String, default: 'detection' },
  isDark:        { type: Boolean, default: false },
})

const emit = defineEmits(['toggle-sidebar', 'refresh', 'change-page', 'toggle-theme'])

function changePage(page) {
  emit('change-page', page)
}
</script>

<template>
  <header class="header">

    <!-- Top bar: title + logos -->
    <div class="header-top">
      <img src="/src/assets/utaclogo.png" alt="UTAC" class="header-logo" />
      <span class="header-title">AI CCTV Activity Monitoring</span>
      <img src="/src/assets/automationlogo.png" alt="Automation" class="header-logo header-logo--auto" />
    </div>

    <!-- Bottom bar: nav -->
    <div class="header-inner">

      <!-- Left: brand -->
      <div class="brand">
        <button
          v-show="props.activePage === 'detection'"
          class="sidebar-toggle"
          @click="emit('toggle-sidebar')"
          title="Toggle sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2"   y="3"    width="12" height="1.5" rx="0.75" fill="currentColor"/>
            <rect x="2"   y="7.25" width="8"  height="1.5" rx="0.75" fill="currentColor"/>
            <rect x="2"   y="11.5" width="10" height="1.5" rx="0.75" fill="currentColor"/>
          </svg>
        </button>
        <span class="brand-dot"></span>
        <span class="brand-name">AI Detection</span>
      </div>

      <!-- Center: tabs -->
      <nav class="tabs">
        <button
          class="tab"
          :class="{ active: props.activePage === 'detection' }"
          @click="changePage('detection')"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <rect x="1" y="1" width="5" height="5" rx="1" fill="currentColor" opacity="0.7"/>
            <rect x="7" y="1" width="5" height="5" rx="1" fill="currentColor" opacity="0.7"/>
            <rect x="1" y="7" width="5" height="5" rx="1" fill="currentColor" opacity="0.7"/>
            <rect x="7" y="7" width="5" height="5" rx="1" fill="currentColor" opacity="0.7"/>
          </svg>
          Detection
        </button>
        <button
          class="tab"
          :class="{ active: props.activePage === 'status' }"
          @click="changePage('status')"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.2" fill="none" opacity="0.7"/>
            <circle cx="6.5" cy="6.5" r="1.5" fill="currentColor"/>
            <path d="M6.5 2v1.5M6.5 9.5V11M2 6.5h1.5M9.5 6.5H11"
              stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.5"/>
          </svg>
          Bot Status
        </button>
        <button
          class="tab"
          :class="{ active: props.activePage === 'runs' }"
          @click="changePage('runs')"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M1.5 3.5h10M1.5 6.5h7M1.5 9.5h8.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity="0.7"/>
          </svg>
          Camera Runs
        </button>
      </nav>

      <!-- Right: meta -->
      <div class="header-meta">
        <template v-if="props.activePage === 'detection'">
          <span class="record-count">
            <span class="count-filtered">{{ props.filteredCount }}</span>
            <span class="count-sep">/</span>
            <span class="count-total">{{ props.totalCount }}</span>
          </span>
          <button class="btn-reload" @click="emit('refresh')">Refresh</button>
        </template>

        <!-- Theme toggle -->
        <button class="btn-theme" @click="emit('toggle-theme')" :title="props.isDark ? 'Switch to Day mode' : 'Switch to Night mode'">
          <!-- Sun icon (shown in dark mode) -->
          <svg v-if="props.isDark" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="1.4" fill="none"/>
            <path d="M8 1.5V3M8 13V14.5M1.5 8H3M13 8H14.5M3.4 3.4L4.5 4.5M11.5 11.5L12.6 12.6M3.4 12.6L4.5 11.5M11.5 4.5L12.6 3.4"
              stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
          <!-- Moon icon (shown in light mode) -->
          <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13.5 10.5A6 6 0 0 1 5.5 2.5a6 6 0 1 0 8 8z"
              stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </button>
      </div>

    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky; top: 0; z-index: 50;
  background: var(--surface);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  transition: background 0.2s ease;
}

/* Title bar */
.header-top {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  border-bottom: 1px solid var(--border);
  background: var(--text);
  padding: 0 20px;
  transition: background 0.2s ease;
}

.header-logo {
  height: 30px;
  width: auto;
  object-fit: contain;
  background: #fff;
  border-radius: 4px;
  padding: 2px 6px;
}

/* Automation logo is wider, give it a bit more space */
.header-logo--auto {
  height: 28px;
}

.header-title {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--bg);
  flex: 1;
  text-align: center;
}

/* Nav bar */
.header-inner {
  height: var(--header-h);
  padding: 0 20px;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
}

.brand { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.sidebar-toggle {
  background: none; border: none; color: var(--muted); cursor: pointer;
  padding: 5px; border-radius: 5px; display: flex; align-items: center;
  transition: color .15s, background .15s;
}
.sidebar-toggle:hover { color: var(--text); background: var(--surface2); }
.brand-dot {
  width: 7px; height: 7px; border-radius: 50%; background: var(--text);
  animation: blink 2.5s ease-in-out infinite;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }
.brand-name { font-size: 14px; font-weight: 600; letter-spacing: -.02em; }

.tabs {
  display: flex; gap: 2px;
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: 8px; padding: 3px;
}
.tab {
  display: flex; align-items: center; gap: 5px;
  background: none; border: none;
  padding: 5px 14px; border-radius: 6px;
  font-family: var(--font); font-size: 13px; font-weight: 500;
  color: var(--muted); cursor: pointer;
  transition: color .15s, background .15s;
  white-space: nowrap;
}
.tab:hover { color: var(--text); background: rgba(0,0,0,0.04); }
.tab.active {
  background: var(--surface); color: var(--text);
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.header-meta {
  display: flex; align-items: center; gap: 12px;
  flex-shrink: 0; min-width: 140px; justify-content: flex-end;
}
.record-count { font-family: var(--font-mono); font-size: 12px; color: var(--muted); }
.count-filtered { color: var(--text); font-weight: 600; }
.count-sep { margin: 0 2px; color: var(--border2); }
.btn-reload {
  background: var(--text); color: #fff; border: none;
  padding: 5px 14px; border-radius: var(--radius-sm);
  font-size: 13px; font-family: var(--font); cursor: pointer; transition: opacity .15s;
}
.btn-reload:hover { opacity: .75; }

.btn-theme {
  background: none; border: 1px solid var(--border);
  color: var(--muted); cursor: pointer;
  width: 32px; height: 32px; border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  transition: color .15s, background .15s, border-color .15s;
}
.btn-theme:hover { color: var(--text); background: var(--surface2); border-color: var(--border2); }

@media (max-width: 600px) {
  .brand-name { display: none; }
  .tab { padding: 5px 10px; font-size: 12px; }
  .header-title { font-size: 11px; letter-spacing: 0.04em; }
}
</style>