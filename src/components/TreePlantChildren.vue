<!-- components/TreePlantChildren.vue -->
<script setup>
defineProps({
  areas:       { type: Object,   required: true },
  plant:       { type: String,   required: true },
  group:       { type: String,   required: true },
  expanded:    { type: Object,   required: true },
  filter:      { type: Object,   required: true },
  countArea:   { type: Function, required: true },
  countNvr:    { type: Function, required: true },
  countCam:    { type: Function, required: true },
  isActiveNode:{ type: Function, required: true },
})

const emit = defineEmits(['toggle-area', 'toggle-nvr', 'select-area', 'select-nvr', 'select-cam'])
</script>

<template>
  <div>
    <div v-for="(nvrs, area) in areas" :key="area">
      <div class="tree-row">
        <button class="tree-chevron" @click="emit('toggle-area', group, plant, area)">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
            :style="{ transform: expanded.areas[`${group}__${plant}__${area}`] ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform .18s' }">
            <path d="M3 2L7 5L3 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button
          class="tree-node tree-node--area"
          :class="{ active: isActiveNode(group, plant, area) }"
          @click="emit('select-area', group, plant, area)"
        >
          <svg class="node-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="1.5" y="3" width="9" height="7" rx="1" stroke="currentColor" stroke-width="1.2" fill="none"/>
            <path d="M4 3V2.5C4 1.67 4.67 1 5.5 1H6.5C7.33 1 8 1.67 8 2.5V3" stroke="currentColor" stroke-width="1.2"/>
          </svg>
          <span class="node-label">{{ area }}</span>
          <span class="node-count">{{ countArea(plant, area, group) }}</span>
        </button>
      </div>

      <!-- NVR -->
      <div v-if="expanded.areas[`${group}__${plant}__${area}`]" class="tree-children">
        <div v-for="(cameras, nvr) in nvrs" :key="nvr">
          <div class="tree-row">
            <button class="tree-chevron" @click="emit('toggle-nvr', group, plant, area, nvr)">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                :style="{ transform: expanded.nvrs[`${group}__${plant}__${area}__${nvr}`] ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform .18s' }">
                <path d="M3 2L7 5L3 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button
              class="tree-node tree-node--nvr"
              :class="{ active: isActiveNode(group, plant, area, nvr) }"
              @click="emit('select-nvr', group, plant, area, nvr)"
            >
              <svg class="node-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="1" y="3.5" width="8" height="5" rx="1" stroke="currentColor" stroke-width="1.2" fill="none"/>
                <path d="M9 5.5L11 4.5V7.5L9 6.5" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
                <circle cx="4.5" cy="6" r="1" fill="currentColor" opacity="0.7"/>
              </svg>
              <span class="node-label">{{ nvr }}</span>
              <span class="node-count">{{ countNvr(plant, area, nvr, group) }}</span>
            </button>
          </div>

          <!-- Camera CH -->
          <div v-if="expanded.nvrs[`${group}__${plant}__${area}__${nvr}`]" class="tree-children">
            <div v-for="cam in [...cameras].sort()" :key="cam" class="tree-row">
              <span class="tree-cam-indent"></span>
              <button
                class="tree-node tree-node--cam"
                :class="{ active: isActiveNode(group, plant, area, nvr, cam) }"
                @click="emit('select-cam', plant, area, nvr, cam)"
              >
                <svg class="node-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="2.2" stroke="currentColor" stroke-width="1.2" fill="none"/>
                  <circle cx="6" cy="6" r="0.8" fill="currentColor"/>
                </svg>
                <span class="node-label">CH {{ cam }}</span>
                <span class="node-count">{{ countCam(plant, area, nvr, cam, group) }}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
.tree-node.active .node-count { background: rgba(128,128,128,.2); color: var(--accent-text, #fff); }
.tree-node--area  { font-size: 12.5px; }
.tree-node--nvr   { font-size: 12px; }
.tree-node--cam   { font-size: 11.5px; }
.tree-children {
  margin-left: 16px; padding-left: 8px;
  border-left: 1px solid var(--tree-line);
}
</style>