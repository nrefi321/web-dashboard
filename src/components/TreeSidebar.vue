<!-- components/TreeSidebar.vue -->
<script setup>
import { ref } from 'vue'

const props = defineProps({
  open:          { type: Boolean, default: true },
  tree:          { type: Object,  default: () => ({}) },
  filter:        { type: Object,  required: true },
  totalCount:    { type: Number,  default: 0 },
  countPlant:    { type: Function, required: true },
  countArea:     { type: Function, required: true },
  countNvr:      { type: Function, required: true },
  countCam:      { type: Function, required: true },
  isActiveNode:  { type: Function, required: true },
})

const emit = defineEmits([
  'clear-filter',
  'select-plant',
  'select-area',
  'select-nvr',
  'select-cam',
])

// Local expand state lives here — purely UI, not part of business logic
const expanded = ref({ plants: {}, areas: {}, nvrs: {} })

function togglePlant(plant) {
  expanded.value.plants[plant] = !expanded.value.plants[plant]
}
function toggleArea(plant, area) {
  expanded.value.areas[`${plant}__${area}`] = !expanded.value.areas[`${plant}__${area}`]
}
function toggleNvr(plant, area, nvr) {
  expanded.value.nvrs[`${plant}__${area}__${nvr}`] = !expanded.value.nvrs[`${plant}__${area}__${nvr}`]
}

function onSelectPlant(plant) {
  emit('select-plant', plant)
  if (!expanded.value.plants[plant]) expanded.value.plants[plant] = true
}
function onSelectArea(plant, area) {
  emit('select-area', plant, area)
  const key = `${plant}__${area}`
  if (!expanded.value.areas[key]) expanded.value.areas[key] = true
}
function onSelectNvr(plant, area, nvr) {
  emit('select-nvr', plant, area, nvr)
  const key = `${plant}__${area}__${nvr}`
  if (!expanded.value.nvrs[key]) expanded.value.nvrs[key] = true
}
</script>

<template>
  <aside class="sidebar" :class="{ collapsed: !open }">
    <div class="sidebar-scroll">

      <!-- All -->
      <div class="tree-root">
        <button
          class="tree-node tree-node--root"
          :class="{ active: !filter.plant }"
          @click="emit('clear-filter')"
        >
          <svg class="node-icon" width="13" height="13" viewBox="0 0 13 13" fill="none">
            <rect x="1" y="1" width="5" height="5" rx="1" fill="currentColor" opacity="0.8"/>
            <rect x="7" y="1" width="5" height="5" rx="1" fill="currentColor" opacity="0.8"/>
            <rect x="1" y="7" width="5" height="5" rx="1" fill="currentColor" opacity="0.8"/>
            <rect x="7" y="7" width="5" height="5" rx="1" fill="currentColor" opacity="0.8"/>
          </svg>
          <span class="node-label">All</span>
          <span class="node-count">{{ totalCount }}</span>
        </button>
      </div>

      <div class="tree-section-title">Plants</div>

      <!-- Plant -->
      <div v-for="(areas, plant) in tree" :key="plant">
        <div class="tree-row">
          <button class="tree-chevron" @click="togglePlant(plant)">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
              :style="{ transform: expanded.plants[plant] ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform .18s' }">
              <path d="M3 2L7 5L3 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button
            class="tree-node tree-node--plant"
            :class="{ active: isActiveNode(plant) }"
            @click="onSelectPlant(plant)"
          >
            <svg class="node-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 10V5L6 2L10 5V10H7.5V7.5H4.5V10H2Z" fill="currentColor" opacity="0.75"/>
            </svg>
            <span class="node-label">{{ plant }}</span>
            <span class="node-count">{{ countPlant(plant) }}</span>
          </button>
        </div>

        <!-- Area -->
        <div v-if="expanded.plants[plant]" class="tree-children">
          <div v-for="(nvrs, area) in areas" :key="area">
            <div class="tree-row">
              <button class="tree-chevron" @click="toggleArea(plant, area)">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                  :style="{ transform: expanded.areas[`${plant}__${area}`] ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform .18s' }">
                  <path d="M3 2L7 5L3 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button
                class="tree-node tree-node--area"
                :class="{ active: isActiveNode(plant, area) }"
                @click="onSelectArea(plant, area)"
              >
                <svg class="node-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect x="1.5" y="3" width="9" height="7" rx="1" stroke="currentColor" stroke-width="1.2" fill="none"/>
                  <path d="M4 3V2.5C4 1.67 4.67 1 5.5 1H6.5C7.33 1 8 1.67 8 2.5V3" stroke="currentColor" stroke-width="1.2"/>
                </svg>
                <span class="node-label">{{ area }}</span>
                <span class="node-count">{{ countArea(plant, area) }}</span>
              </button>
            </div>

            <!-- NVR -->
            <div v-if="expanded.areas[`${plant}__${area}`]" class="tree-children">
              <div v-for="(cameras, nvr) in nvrs" :key="nvr">
                <div class="tree-row">
                  <button class="tree-chevron" @click="toggleNvr(plant, area, nvr)">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                      :style="{ transform: expanded.nvrs[`${plant}__${area}__${nvr}`] ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform .18s' }">
                      <path d="M3 2L7 5L3 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                  <button
                    class="tree-node tree-node--nvr"
                    :class="{ active: isActiveNode(plant, area, nvr) }"
                    @click="onSelectNvr(plant, area, nvr)"
                  >
                    <svg class="node-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <rect x="1" y="3.5" width="8" height="5" rx="1" stroke="currentColor" stroke-width="1.2" fill="none"/>
                      <path d="M9 5.5L11 4.5V7.5L9 6.5" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
                      <circle cx="4.5" cy="6" r="1" fill="currentColor" opacity="0.7"/>
                    </svg>
                    <span class="node-label">{{ nvr }}</span>
                    <span class="node-count">{{ countNvr(plant, area, nvr) }}</span>
                  </button>
                </div>

                <!-- Camera CH -->
                <div v-if="expanded.nvrs[`${plant}__${area}__${nvr}`]" class="tree-children">
                  <div v-for="cam in [...cameras].sort()" :key="cam" class="tree-row">
                    <span class="tree-cam-indent"></span>
                    <button
                      class="tree-node tree-node--cam"
                      :class="{ active: isActiveNode(plant, area, nvr, cam) }"
                      @click="emit('select-cam', plant, area, nvr, cam)"
                    >
                      <svg class="node-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="2.2" stroke="currentColor" stroke-width="1.2" fill="none"/>
                        <circle cx="6" cy="6" r="0.8" fill="currentColor"/>
                      </svg>
                      <span class="node-label">CH {{ cam }}</span>
                      <span class="node-count">{{ countCam(plant, area, nvr, cam) }}</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-w);
  flex-shrink: 0;
  background: var(--surface);
  border-right: 1px solid var(--border);
  transition: width 0.22s ease;
  overflow: hidden;
}
.sidebar.collapsed { width: 0; }

.sidebar-scroll {
  width: var(--sidebar-w);
  height: 100%; overflow-y: auto; overflow-x: hidden;
  padding: 10px 0 24px;
  scrollbar-width: thin;
  scrollbar-color: var(--border2) transparent;
}
.sidebar-scroll::-webkit-scrollbar { width: 4px; }
.sidebar-scroll::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }

.tree-section-title {
  padding: 10px 14px 4px;
  font-size: 10px; font-weight: 600;
  letter-spacing: .08em; text-transform: uppercase;
  color: var(--muted);
}
.tree-root { padding: 0 8px 2px; }
.tree-row { display: flex; align-items: center; gap: 1px; }

.tree-chevron {
  flex-shrink: 0; width: 20px; height: 26px;
  background: none; border: none; cursor: pointer;
  color: var(--muted); display: flex; align-items: center; justify-content: center;
  border-radius: 4px; transition: color .12s, background .12s;
}
.tree-chevron:hover { color: var(--text); background: var(--surface2); }

.tree-cam-indent { width: 20px; flex-shrink: 0; }

.tree-node {
  flex: 1; display: flex; align-items: center; gap: 6px;
  background: none; border: none; cursor: pointer;
  padding: 4px 8px 4px 4px; border-radius: 6px;
  font-family: var(--font); text-align: left; color: var(--text);
  transition: background .12s; min-width: 0;
}
.tree-node:hover { background: var(--surface2); }
.tree-node.active { background: var(--text); color: #fff; }

.node-icon { flex-shrink: 0; opacity: 0.5; }
.tree-node.active .node-icon { opacity: 0.9; }

.node-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.node-count {
  flex-shrink: 0; font-family: var(--font-mono); font-size: 10px;
  color: var(--muted); background: var(--surface2);
  padding: 1px 5px; border-radius: 99px;
}
.tree-node.active .node-count { background: rgba(255,255,255,.15); color: rgba(255,255,255,.65); }

.tree-node--root  { font-size: 13px; font-weight: 500; }
.tree-node--plant { font-size: 13px; font-weight: 500; }
.tree-node--area  { font-size: 12.5px; }
.tree-node--nvr   { font-size: 12px; }
.tree-node--cam   { font-size: 11.5px; }

.tree-children {
  margin-left: 16px;
  padding-left: 8px;
  border-left: 1px solid var(--tree-line);
}
</style>