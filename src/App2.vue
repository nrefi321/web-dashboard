<!-- App.vue -->
<script setup>
import { ref, onMounted }   from 'vue'
import { useDetection }     from './composables/useDetection.js'
import { useTheme }         from './composables/useTheme.js'
import AppHeader            from './components/AppHeader.vue'
import TreeSidebar          from './components/TreeSidebar.vue'
import Breadcrumb           from './components/Breadcrumb.vue'
import DetectionCard        from './components/DetectionCard.vue'
import RemarkModal          from './components/RemarkModal.vue'
import BotStatusPage        from './components/BotStatusPage.vue'
import CameraRunsPage       from './components/CameraRunsPage.vue'

const { isDark, toggle: toggleTheme, init: initTheme } = useTheme()

const activePage  = ref('detection')
const sidebarOpen = ref(true)

const {
  results, filteredResults, filter, tree, loadData,
  verifyRecord, revertRecord,
  clearFilter, selectVerifyGroup, selectPlant, selectArea, selectNvr, selectCam,
  countGroup, countPlant, countArea, countNvr, countCam, isActiveNode,
} = useDetection()

const showModal   = ref(false)
const modalAction = ref('')
const modalItem   = ref(null)

function openModal(action, item) {
  modalAction.value = action
  modalItem.value   = item
  showModal.value   = true
}

async function handleSubmit(payload) {
  showModal.value = false
  await verifyRecord(payload)
}

onMounted(() => {
  initTheme()
  loadData()
})
</script>

<template>
  <div class="app">

    <AppHeader
      :filtered-count="filteredResults.length"
      :total-count="results.length"
      :active-page="activePage"
      :is-dark="isDark"
      @toggle-sidebar="sidebarOpen = !sidebarOpen"
      @refresh="loadData"
      @change-page="activePage = $event"
      @toggle-theme="toggleTheme"
    />

    <!-- Detection page -->
    <div v-if="activePage === 'detection'" class="body-layout">

      <TreeSidebar
        :open="sidebarOpen"
        :tree="tree"
        :filter="filter"
        :total-count="results.length"
        :count-group="countGroup"
        :count-plant="countPlant"
        :count-area="countArea"
        :count-nvr="countNvr"
        :count-cam="countCam"
        :is-active-node="isActiveNode"
        @clear-filter="clearFilter"
        @select-verify-group="selectVerifyGroup"
        @select-plant="(g, p) => selectPlant(p, g)"
        @select-area="(g, p, a) => selectArea(p, a, g)"
        @select-nvr="(g, p, a, n) => selectNvr(p, a, n, g)"
        @select-cam="(p, a, n, c) => selectCam(p, a, n, c)"
      />

      <main class="main">
        <Breadcrumb
          :filter="filter"
          @clear="clearFilter"
          @select-plant="selectPlant"
          @select-area="selectArea"
          @select-nvr="selectNvr"
        />
        <div v-if="filteredResults.length === 0" class="empty-state">
          No records match the selected filter.
        </div>
        <div class="grid">
          <DetectionCard
            v-for="(item, i) in filteredResults"
            :key="item.id"
            :item="item"
            :index="i"
            @open-modal="openModal"
            @revert="revertRecord"
          />
        </div>
      </main>

    </div>

    <!-- Status page -->
    <div v-else-if="activePage === 'status'" class="body-layout body-layout--full">
      <main class="main">
        <BotStatusPage />
      </main>
    </div>

    <!-- Camera Runs page -->
    <div v-else-if="activePage === 'runs'" class="body-layout body-layout--full">
      <CameraRunsPage style="flex:1; width:100%; min-width:0; overflow:hidden;" />
    </div>

    <RemarkModal
      :show="showModal"
      :action-type="modalAction"
      :item="modalItem"
      @close="showModal = false"
      @submit="handleSubmit"
    />

    <!-- Footer -->
    <footer class="app-footer">
      <span class="footer-company">UTAC THAI LIMITED</span>
      <span class="footer-sep"></span>
      <span class="footer-dept">Automation Department</span>
    </footer>

  </div>
</template>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { width: 100%; height: 100%; }

body {
  width: 100%; height: 100%;
  background: var(--bg); color: var(--text);
  font-family: var(--font); font-size: 14px; line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
  transition: background 0.2s ease, color 0.2s ease;
}

#app { width: 100%; height: 100%; }

.app {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

:root {
  --bg:        #f9f9f8;
  --surface:   #ffffff;
  --surface2:  #f4f4f3;
  --border:    #e8e8e6;
  --border2:   #d0d0cc;
  --text:      #1a1a18;
  --muted:     #8a8a84;
  --tree-line: #e0e0dc;
  --pass:      #15803d;
  --pass-bg:   #86efac;
  --fail:      #b91c1c;
  --fail-bg:   #fca5a5;
  --warn:      #b45309;
  --warn-bg:   #fcd34d;
  --sidebar-w: 240px;
  --header-h:  52px;
  --title-h:   44px;
  --radius:    10px;
  --radius-sm: 6px;
  --shadow:    0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04);
  --font:      'DM Sans', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'DM Mono', ui-monospace, monospace;
  --logo-filter: none;
  --accent-bg:   #1a1a18;
  --accent-text: #ffffff;
}

[data-theme="dark"] {
  --bg:        #111318;
  --surface:   #1c1f2e;
  --surface2:  #252838;
  --border:    #2e3247;
  --border2:   #3d4160;
  --text:      #f0f2f8;
  --muted:     #9098b4;
  --tree-line: #2e3247;
  --pass:      #22c55e;
  --pass-bg:   #14532d;
  --fail:      #f87171;
  --fail-bg:   #2d0f0f;
  --warn:      #f59e0b;
  --warn-bg:   #451a03;
  --shadow:    0 1px 4px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3);
  --logo-filter: brightness(0) invert(1) opacity(0.8);
  --accent-bg:   #ffffff;
  --accent-text: #1a1a18;
}

body {
  background: var(--bg); color: var(--text);
  font-family: var(--font); font-size: 14px; line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

.body-layout {
  display: flex;
  flex: 1;
  width: 100%;
  overflow: hidden;
  height: calc(100vh - var(--title-h) - var(--header-h) - 28px);
}
.body-layout--full .main { padding-top: 20px; }

.main {
  flex: 1;
  width: 0;
  min-width: 0;
  overflow-y: auto;
  padding: 20px 22px 60px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
  gap: 16px;
  width: 100%;
}

.empty-state { text-align: center; padding: 60px; color: var(--muted); font-size: 14px; }

.app-footer {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: 28px;
  background: var(--surface);
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 40;
  transition: background 0.2s ease;
}
.footer-company { font-size: 11px; font-weight: 600; color: var(--text); letter-spacing: 0.04em; }
.footer-sep { width: 3px; height: 3px; border-radius: 50%; background: var(--border2); }
.footer-dept { font-size: 11px; color: var(--muted); letter-spacing: 0.03em; }

@media (max-width: 680px) {
  .main { padding: 16px 12px 40px; }
  .grid { grid-template-columns: 1fr; }
}
</style>