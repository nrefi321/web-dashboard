<!-- components/TreeSidebar.vue -->
<script setup>
import { ref } from 'vue'
import TreePlantChildren from './TreePlantChildren.vue'

const props = defineProps({
  open:           { type: Boolean,  default: true },
  tree:           { type: Object,   default: () => ({}) },
  filter:         { type: Object,   required: true },
  totalCount:     { type: Number,   default: 0 },
  countGroup:     { type: Function, required: true },
  countPlant:     { type: Function, required: true },
  countArea:      { type: Function, required: true },
  countNvr:       { type: Function, required: true },
  countCam:       { type: Function, required: true },
  isActiveNode:   { type: Function, required: true },
})

const emit = defineEmits([
  'clear-filter', 'select-verify-group',
  'select-plant', 'select-area', 'select-nvr', 'select-cam',
])

const expandedGroups = ref({ unverified: true, verified: false })
const expanded = ref({ plants: {}, areas: {}, nvrs: {} })

function toggleGroup(group) {
  expandedGroups.value[group] = !expandedGroups.value[group]
}
function togglePlant(group, plant) {
  const key = `${group}__${plant}`
  expanded.value.plants[key] = !expanded.value.plants[key]
}
function toggleArea(group, plant, area) {
  const key = `${group}__${plant}__${area}`
  expanded.value.areas[key] = !expanded.value.areas[key]
}
function toggleNvr(group, plant, area, nvr) {
  const key = `${group}__${plant}__${area}__${nvr}`
  expanded.value.nvrs[key] = !expanded.value.nvrs[key]
}

function onSelectGroup(group) {
  emit('select-verify-group', group)
  expandedGroups.value[group] = true
}
function onSelectPlant(group, plant) {
  emit('select-plant', group, plant)
  expanded.value.plants[`${group}__${plant}`] = true
}
function onSelectArea(group, plant, area) {
  emit('select-area', group, plant, area)
  expanded.value.areas[`${group}__${plant}__${area}`] = true
}
function onSelectNvr(group, plant, area, nvr) {
  emit('select-nvr', group, plant, area, nvr)
  expanded.value.nvrs[`${group}__${plant}__${area}__${nvr}`] = true
}
</script>

<template>
  <aside class="sidebar" :class="{ collapsed: !open }">
    <div class="sidebar-scroll">

      <!-- All -->
      <div class="tree-root">
        <button
          class="tree-node tree-node--root"
          :class="{ active: !filter.verifyGroup && !filter.plant }"
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

      <!-- Unverified Group -->
      <div class="group-section">
        <div class="tree-row">
          <button class="tree-chevron" @click="toggleGroup('unverified')">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
              :style="{ transform: expandedGroups.unverified ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform .18s' }">
              <path d="M3 2L7 5L3 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button
            class="tree-node tree-node--group tree-node--unverified"
            :class="{ active: filter.verifyGroup === 'unverified' && !filter.plant }"
            @click="onSelectGroup('unverified')"
          >
            <span class="group-dot group-dot--unverified"></span>
            <span class="node-label">Unverified</span>
            <span class="node-count">{{ countGroup('unverified') }}</span>
          </button>
        </div>

        <div v-if="expandedGroups.unverified" class="tree-children">
          <div v-for="(areas, plant) in tree.unverified" :key="'u-' + plant">
            <div class="tree-row">
              <button class="tree-chevron" @click="togglePlant('unverified', plant)">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                  :style="{ transform: expanded.plants['unverified__' + plant] ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform .18s' }">
                  <path d="M3 2L7 5L3 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button
                class="tree-node tree-node--plant"
                :class="{ active: isActiveNode('unverified', plant) }"
                @click="onSelectPlant('unverified', plant)"
              >
                <svg class="node-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 10V5L6 2L10 5V10H7.5V7.5H4.5V10H2Z" fill="currentColor" opacity="0.75"/>
                </svg>
                <span class="node-label">{{ plant }}</span>
                <span class="node-count">{{ countPlant(plant, 'unverified') }}</span>
              </button>
            </div>
            <div v-if="expanded.plants['unverified__' + plant]" class="tree-children">
              <TreePlantChildren
                :areas="areas" :plant="plant" group="unverified"
                :expanded="expanded" :filter="filter"
                :count-area="countArea" :count-nvr="countNvr" :count-cam="countCam"
                :is-active-node="isActiveNode"
                @toggle-area="toggleArea" @toggle-nvr="toggleNvr"
                @select-area="onSelectArea" @select-nvr="onSelectNvr"
                @select-cam="(p,a,n,c) => emit('select-cam', p, a, n, c)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Verified Group -->
      <div class="group-section">
        <div class="tree-row">
          <button class="tree-chevron" @click="toggleGroup('verified')">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
              :style="{ transform: expandedGroups.verified ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform .18s' }">
              <path d="M3 2L7 5L3 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button
            class="tree-node tree-node--group tree-node--verified"
            :class="{ active: filter.verifyGroup === 'verified' && !filter.plant }"
            @click="onSelectGroup('verified')"
          >
            <span class="group-dot group-dot--verified"></span>
            <span class="node-label">Verified</span>
            <span class="node-count">{{ countGroup('verified') }}</span>
          </button>
        </div>

        <div v-if="expandedGroups.verified" class="tree-children">
          <div v-for="(areas, plant) in tree.verified" :key="'v-' + plant">
            <div class="tree-row">
              <button class="tree-chevron" @click="togglePlant('verified', plant)">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                  :style="{ transform: expanded.plants['verified__' + plant] ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform .18s' }">
                  <path d="M3 2L7 5L3 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button
                class="tree-node tree-node--plant"
                :class="{ active: isActiveNode('verified', plant) }"
                @click="onSelectPlant('verified', plant)"
              >
                <svg class="node-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 10V5L6 2L10 5V10H7.5V7.5H4.5V10H2Z" fill="currentColor" opacity="0.75"/>
                </svg>
                <span class="node-label">{{ plant }}</span>
                <span class="node-count">{{ countPlant(plant, 'verified') }}</span>
              </button>
            </div>
            <div v-if="expanded.plants['verified__' + plant]" class="tree-children">
              <TreePlantChildren
                :areas="areas" :plant="plant" group="verified"
                :expanded="expanded" :filter="filter"
                :count-area="countArea" :count-nvr="countNvr" :count-cam="countCam"
                :is-active-node="isActiveNode"
                @toggle-area="toggleArea" @toggle-nvr="toggleNvr"
                @select-area="onSelectArea" @select-nvr="onSelectNvr"
                @select-cam="(p,a,n,c) => emit('select-cam', p, a, n, c)"
              />
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
  transition: width 0.22s ease, background 0.2s ease;
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

.tree-root { padding: 0 8px 2px; }
.group-section { margin-top: 4px; }

.tree-node--group { font-size: 12.5px; font-weight: 600; letter-spacing: 0.01em; }

.group-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.group-dot--unverified { background: #f87171; }
.group-dot--verified   { background: #34d468; }
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
  transition: background .12s, color .12s; min-width: 0;
}
.tree-node:hover { background: var(--surface2); color: var(--text); }
.tree-node.active { background: var(--accent-bg, var(--text)); color: var(--accent-text, #fff); }

.node-icon { flex-shrink: 0; opacity: 0.5; color: currentColor; }
.tree-node.active .node-icon { opacity: 0.9; }

.node-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: currentColor; }

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