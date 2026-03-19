<script setup>
import { ref, computed, onMounted } from 'vue'

const results    = ref([])
const mediaIndex = ref({})
const showModal  = ref(false)
const remarkText = ref("")
const actionType = ref("")
const currentItem = ref(null)
const sidebarOpen = ref(true)

// ── Active filter ─────────────────────────────────────────────────────
const filter = ref({ plant: null, area: null, nvr_id: null, camera_ch: null })

// Which nodes are expanded in the tree
const expanded = ref({ plants: {}, areas: {}, nvrs: {} })

// ── Build tree from data ──────────────────────────────────────────────
const tree = computed(() => {
  const t = {}
  results.value.forEach(r => {
    const p = r.plant    || '(none)'
    const a = r.area     || '(none)'
    const n = r.nvr_id   || '(none)'
    const c = r.camera_ch|| '(none)'
    if (!t[p]) t[p] = {}
    if (!t[p][a]) t[p][a] = {}
    if (!t[p][a][n]) t[p][a][n] = new Set()
    t[p][a][n].add(c)
  })
  return t
})

// ── Filtered results ──────────────────────────────────────────────────
const filteredResults = computed(() => {
  return results.value.filter(r => {
    const p = r.plant    || '(none)'
    const a = r.area     || '(none)'
    const n = r.nvr_id   || '(none)'
    const c = r.camera_ch|| '(none)'
    if (filter.value.plant     && p !== filter.value.plant)     return false
    if (filter.value.area      && a !== filter.value.area)      return false
    if (filter.value.nvr_id    && n !== filter.value.nvr_id)    return false
    if (filter.value.camera_ch && c !== filter.value.camera_ch) return false
    return true
  })
})

// ── Count helpers ─────────────────────────────────────────────────────
function countPlant(plant) {
  return results.value.filter(r => (r.plant || '(none)') === plant).length
}
function countArea(plant, area) {
  return results.value.filter(r =>
    (r.plant || '(none)') === plant && (r.area || '(none)') === area
  ).length
}
function countNvr(plant, area, nvr) {
  return results.value.filter(r =>
    (r.plant  || '(none)') === plant &&
    (r.area   || '(none)') === area  &&
    (r.nvr_id || '(none)') === nvr
  ).length
}
function countCam(plant, area, nvr, cam) {
  return results.value.filter(r =>
    (r.plant     || '(none)') === plant &&
    (r.area      || '(none)') === area  &&
    (r.nvr_id    || '(none)') === nvr   &&
    (r.camera_ch || '(none)') === cam
  ).length
}

// ── Tree interaction ──────────────────────────────────────────────────
function togglePlant(plant) {
  expanded.value.plants[plant] = !expanded.value.plants[plant]
}
function toggleArea(plant, area) {
  const key = `${plant}__${area}`
  expanded.value.areas[key] = !expanded.value.areas[key]
}
function toggleNvr(plant, area, nvr) {
  const key = `${plant}__${area}__${nvr}`
  expanded.value.nvrs[key] = !expanded.value.nvrs[key]
}

function selectPlant(plant) {
  filter.value = { plant, area: null, nvr_id: null, camera_ch: null }
  if (!expanded.value.plants[plant]) expanded.value.plants[plant] = true
}
function selectArea(plant, area) {
  filter.value = { plant, area, nvr_id: null, camera_ch: null }
  const key = `${plant}__${area}`
  if (!expanded.value.areas[key]) expanded.value.areas[key] = true
}
function selectNvr(plant, area, nvr) {
  filter.value = { plant, area, nvr_id: nvr, camera_ch: null }
  const key = `${plant}__${area}__${nvr}`
  if (!expanded.value.nvrs[key]) expanded.value.nvrs[key] = true
}
function selectCam(plant, area, nvr, cam) {
  filter.value = { plant, area, nvr_id: nvr, camera_ch: cam }
}
function clearFilter() {
  filter.value = { plant: null, area: null, nvr_id: null, camera_ch: null }
}

function isActiveNode(plant, area, nvr, cam) {
  const f = filter.value
  if (cam  !== undefined) return f.plant === plant && f.area === area && f.nvr_id === nvr && f.camera_ch === cam
  if (nvr  !== undefined) return f.plant === plant && f.area === area && f.nvr_id === nvr && !f.camera_ch
  if (area !== undefined) return f.plant === plant && f.area === area && !f.nvr_id
  return f.plant === plant && !f.area
}

// ── Media helpers ─────────────────────────────────────────────────────
function convertPath(path) {
  if (!path) return ""
  const parts = path.split("apitest\\")
  if (parts.length < 2) return ""
  return "http://localhost:9000/" + parts[1].replace(/\\/g, "/")
}
function getMedia(item) {
  return [
    { type: 'image', label: 'Predict',  src: item.image_predict_path },
    { type: 'image', label: 'Original', src: item.image_original_path },
    { type: 'video', label: 'Video',    src: item.video_path }
  ]
}
function nextMedia(id) {
  const list = getMedia(results.value.find(r => r.id === id))
  mediaIndex.value[id] = ((mediaIndex.value[id] || 0) + 1) % list.length
}
function prevMedia(id) {
  const list = getMedia(results.value.find(r => r.id === id))
  mediaIndex.value[id] = ((mediaIndex.value[id] || 0) - 1 + list.length) % list.length
}

// ── Modal ─────────────────────────────────────────────────────────────
function openModal(type, item) {
  actionType.value  = type
  currentItem.value = item
  remarkText.value  = ""
  showModal.value   = true
}
function submitRemark() {
  if (!remarkText.value.trim()) { alert("Remark cannot be empty"); return }
  console.log({ id: currentItem.value.id, action: actionType.value, remark: remarkText.value })
  showModal.value = false
}

// ── Data ──────────────────────────────────────────────────────────────
async function loadData() {
  const res  = await fetch('/api/v_bot/ai-result/')
  const data = await res.json()
  results.value = data
  clearFilter()
}

onMounted(loadData)
</script>

<template>
  <div class="app">

    <!-- Header -->
    <header class="header">
      <div class="header-inner">
        <div class="brand">
          <button class="sidebar-toggle" @click="sidebarOpen = !sidebarOpen">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2"   y="3"    width="12" height="1.5" rx="0.75" fill="currentColor"/>
              <rect x="2"   y="7.25" width="8"  height="1.5" rx="0.75" fill="currentColor"/>
              <rect x="2"   y="11.5" width="10" height="1.5" rx="0.75" fill="currentColor"/>
            </svg>
          </button>
          <span class="brand-dot"></span>
          <span class="brand-name">AI Detection</span>
        </div>
        <div class="header-meta">
          <span class="record-count">
            <span class="count-filtered">{{ filteredResults.length }}</span>
            <span class="count-sep">/</span>
            <span class="count-total">{{ results.length }}</span>
          </span>
          <button class="btn-reload" @click="loadData">Refresh</button>
        </div>
      </div>
    </header>

    <div class="body-layout">

      <!-- Sidebar tree -->
      <aside class="sidebar" :class="{ collapsed: !sidebarOpen }">
        <div class="sidebar-scroll">

          <div class="tree-root">
            <button class="tree-node tree-node--root" :class="{ active: !filter.plant }" @click="clearFilter">
              <svg class="node-icon" width="13" height="13" viewBox="0 0 13 13" fill="none">
                <rect x="1" y="1" width="5" height="5" rx="1" fill="currentColor" opacity="0.8"/>
                <rect x="7" y="1" width="5" height="5" rx="1" fill="currentColor" opacity="0.8"/>
                <rect x="1" y="7" width="5" height="5" rx="1" fill="currentColor" opacity="0.8"/>
                <rect x="7" y="7" width="5" height="5" rx="1" fill="currentColor" opacity="0.8"/>
              </svg>
              <span class="node-label">All</span>
              <span class="node-count">{{ results.length }}</span>
            </button>
          </div>

          <div class="tree-section-title">Plants</div>

          <!-- Plant -->
          <div v-for="(areas, plant) in tree" :key="plant" class="tree-plant">
            <div class="tree-row">
              <button class="tree-chevron" @click="togglePlant(plant)">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                  :style="{ transform: expanded.plants[plant] ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform .18s' }">
                  <path d="M3 2L7 5L3 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button class="tree-node tree-node--plant" :class="{ active: isActiveNode(plant) }" @click="selectPlant(plant)">
                <svg class="node-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 10V5L6 2L10 5V10H7.5V7.5H4.5V10H2Z" fill="currentColor" opacity="0.75"/>
                </svg>
                <span class="node-label">{{ plant }}</span>
                <span class="node-count">{{ countPlant(plant) }}</span>
              </button>
            </div>

            <!-- Area -->
            <div v-if="expanded.plants[plant]" class="tree-children">
              <div v-for="(nvrs, area) in areas" :key="area" class="tree-area">
                <div class="tree-row">
                  <button class="tree-chevron" @click="toggleArea(plant, area)">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                      :style="{ transform: expanded.areas[`${plant}__${area}`] ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform .18s' }">
                      <path d="M3 2L7 5L3 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                  <button class="tree-node tree-node--area" :class="{ active: isActiveNode(plant, area) }" @click="selectArea(plant, area)">
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
                  <div v-for="(cameras, nvr) in nvrs" :key="nvr" class="tree-nvr">
                    <div class="tree-row">
                      <button class="tree-chevron" @click="toggleNvr(plant, area, nvr)">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                          :style="{ transform: expanded.nvrs[`${plant}__${area}__${nvr}`] ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform .18s' }">
                          <path d="M3 2L7 5L3 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </button>
                      <button class="tree-node tree-node--nvr" :class="{ active: isActiveNode(plant, area, nvr) }" @click="selectNvr(plant, area, nvr)">
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
                        <button class="tree-node tree-node--cam" :class="{ active: isActiveNode(plant, area, nvr, cam) }" @click="selectCam(plant, area, nvr, cam)">
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

      <!-- Main content -->
      <main class="main">

        <!-- Breadcrumb -->
        <div class="breadcrumb" v-if="filter.plant">
          <button class="crumb" @click="clearFilter">All</button>
          <span class="crumb-sep">›</span>
          <button class="crumb" :class="{ active: !filter.area }" @click="selectPlant(filter.plant)">{{ filter.plant }}</button>
          <template v-if="filter.area">
            <span class="crumb-sep">›</span>
            <button class="crumb" :class="{ active: !filter.nvr_id }" @click="selectArea(filter.plant, filter.area)">{{ filter.area }}</button>
          </template>
          <template v-if="filter.nvr_id">
            <span class="crumb-sep">›</span>
            <button class="crumb" :class="{ active: !filter.camera_ch }" @click="selectNvr(filter.plant, filter.area, filter.nvr_id)">{{ filter.nvr_id }}</button>
          </template>
          <template v-if="filter.camera_ch">
            <span class="crumb-sep">›</span>
            <span class="crumb active">CH {{ filter.camera_ch }}</span>
          </template>
        </div>

        <div v-if="filteredResults.length === 0" class="empty-state">
          No records match the selected filter.
        </div>

        <div class="grid">
          <div
            v-for="(item, i) in filteredResults"
            :key="item.id"
            class="card"
            :style="{ animationDelay: `${i * 0.04}s` }"
          >
            <div class="card-top">
              <span class="card-id">#{{ item.id }}</span>
              <span class="badge" :class="item.verify_status ? 'badge--ok' : 'badge--warn'">
                {{ item.verify_status ? 'Verified' : 'Pending' }}
              </span>
            </div>

            <div class="viewer">
              <button class="nav-btn" @click="prevMedia(item.id)">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
              <div class="media-frame">
                <div class="media-label">{{ getMedia(item)[mediaIndex[item.id] || 0].label }}</div>
                <template v-if="getMedia(item)[mediaIndex[item.id] || 0].type === 'image'">
                  <img :src="convertPath(getMedia(item)[mediaIndex[item.id] || 0].src)" />
                </template>
                <template v-else>
                  <video controls preload="metadata">
                    <source :src="convertPath(getMedia(item)[mediaIndex[item.id] || 0].src)" />
                  </video>
                </template>
                <div class="dots">
                  <span v-for="(m, mi) in getMedia(item)" :key="mi" class="dot"
                    :class="{ active: (mediaIndex[item.id] || 0) === mi }"
                    @click="mediaIndex[item.id] = mi"></span>
                </div>
              </div>
              <button class="nav-btn" @click="nextMedia(item.id)">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </div>

            <div class="card-meta">
              <div class="meta-row"><span class="meta-key">Plant</span><span class="meta-val">{{ item.plant || '—' }}</span></div>
              <div class="meta-row"><span class="meta-key">Area</span><span class="meta-val">{{ item.area || '—' }}</span></div>
              <div class="meta-row"><span class="meta-key">Camera</span><span class="meta-val">{{ item.camera_ch || '—' }}</span></div>
              <div class="meta-row">
                <span class="meta-key">Detected</span>
                <span class="meta-val meta-val--time">
                  {{ item.detected_suspicious_time ? new Date(item.detected_suspicious_time).toLocaleString() : '—' }}
                </span>
              </div>
            </div>

            <div class="card-actions">
              <button class="action-btn action-btn--pass" @click="openModal('PASS', item)">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5L5.5 10L11 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                Pass
              </button>
              <button class="action-btn action-btn--fail" @click="openModal('FAIL', item)">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M3 3L10 10M10 3L3 10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
                Fail
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Modal -->
    <Transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal">
          <div class="modal-header">
            <div class="modal-title">
              <span class="modal-action-pill" :class="actionType === 'PASS' ? 'pill--pass' : 'pill--fail'">{{ actionType }}</span>
              <span class="modal-id">Record #{{ currentItem?.id }}</span>
            </div>
            <button class="modal-close" @click="showModal = false">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3L13 13M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </button>
          </div>
          <textarea v-model="remarkText" class="modal-textarea" placeholder="Add a remark…" rows="4" autofocus></textarea>
          <div class="modal-footer">
            <button class="btn btn--ghost" @click="showModal = false">Cancel</button>
            <button class="btn" :class="actionType === 'PASS' ? 'btn--pass' : 'btn--fail'" @click="submitRemark">
              Confirm {{ actionType }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:        #f9f9f8;
  --surface:   #ffffff;
  --surface2:  #f4f4f3;
  --border:    #e8e8e6;
  --border2:   #d0d0cc;
  --text:      #1a1a18;
  --muted:     #8a8a84;
  --tree-line: #e0e0dc;
  --pass:      #16803c;
  --pass-bg:   #f0fdf4;
  --fail:      #c0392b;
  --fail-bg:   #fff5f5;
  --warn:      #b45309;
  --warn-bg:   #fffbeb;
  --sidebar-w: 240px;
  --header-h:  52px;
  --radius:    10px;
  --radius-sm: 6px;
  --shadow:    0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04);
  --font:      'DM Sans', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'DM Mono', ui-monospace, monospace;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

/* Header */
.header {
  position: sticky; top: 0; z-index: 50;
  height: var(--header-h);
  background: rgba(249,249,248,0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}
.header-inner {
  height: 100%; padding: 0 20px;
  display: flex; align-items: center; justify-content: space-between;
}
.brand { display: flex; align-items: center; gap: 10px; }
.sidebar-toggle {
  background: none; border: none; color: var(--muted); cursor: pointer;
  padding: 5px; border-radius: 5px; display: flex; align-items: center;
  transition: color .15s, background .15s;
}
.sidebar-toggle:hover { color: var(--text); background: var(--surface2); }
.brand-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--text); animation: blink 2.5s ease-in-out infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }
.brand-name { font-size: 14px; font-weight: 600; letter-spacing: -.02em; }
.header-meta { display: flex; align-items: center; gap: 12px; }
.record-count { font-family: var(--font-mono); font-size: 12px; color: var(--muted); }
.count-filtered { color: var(--text); font-weight: 600; }
.count-sep { margin: 0 2px; color: var(--border2); }
.btn-reload {
  background: var(--text); color: #fff; border: none;
  padding: 5px 14px; border-radius: var(--radius-sm);
  font-size: 13px; font-family: var(--font); cursor: pointer; transition: opacity .15s;
}
.btn-reload:hover { opacity: .75; }

/* Body layout */
.body-layout { display: flex; height: calc(100vh - var(--header-h)); overflow: hidden; }

/* Sidebar */
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
.tree-node.active .node-count { background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.65); }

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

/* Main */
.main { flex: 1; overflow-y: auto; padding: 20px 22px 60px; min-width: 0; }

/* Breadcrumb */
.breadcrumb {
  display: flex; align-items: center; gap: 4px;
  margin-bottom: 16px; flex-wrap: wrap;
}
.crumb {
  background: none; border: none; font-family: var(--font);
  font-size: 12px; color: var(--muted); cursor: pointer;
  padding: 2px 6px; border-radius: 4px; transition: color .12s, background .12s;
}
.crumb:hover { color: var(--text); background: var(--surface2); }
.crumb.active { color: var(--text); font-weight: 500; cursor: default; }
.crumb.active:hover { background: none; }
.crumb-sep { color: var(--border2); font-size: 14px; user-select: none; }

/* Grid */
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }

.empty-state { text-align: center; padding: 60px; color: var(--muted); font-size: 14px; }

/* Card */
.card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden;
  opacity: 0; animation: rise .3s ease forwards;
  transition: box-shadow .18s, border-color .18s;
}
.card:hover { border-color: var(--border2); box-shadow: 0 2px 8px rgba(0,0,0,.07), 0 8px 24px rgba(0,0,0,.05); }
@keyframes rise { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }

.card-top { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid var(--border); }
.card-id { font-family: var(--font-mono); font-size: 11px; color: var(--muted); }
.badge { font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 99px; }
.badge--ok   { background: var(--pass-bg); color: var(--pass); }
.badge--warn { background: var(--warn-bg); color: var(--warn); }

.viewer { display: flex; align-items: center; background: #111; height: 190px; }
.nav-btn {
  flex-shrink: 0; width: 30px; height: 100%;
  background: transparent; border: none; color: rgba(255,255,255,.4);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: color .12s, background .12s;
}
.nav-btn:hover { color: #fff; background: rgba(255,255,255,.06); }

.media-frame { flex: 1; height: 100%; position: relative; overflow: hidden; }
.media-frame img, .media-frame video { width: 100%; height: 100%; object-fit: contain; display: block; }
.media-label {
  position: absolute; top: 7px; left: 7px; z-index: 2;
  font-size: 10px; font-weight: 500; letter-spacing: .06em; text-transform: uppercase;
  color: rgba(255,255,255,.75); background: rgba(0,0,0,.45);
  backdrop-filter: blur(4px); padding: 2px 7px; border-radius: 4px;
}
.dots { position: absolute; bottom: 7px; left: 50%; transform: translateX(-50%); display: flex; gap: 4px; }
.dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,.3); cursor: pointer; transition: background .12s, transform .12s; }
.dot.active { background: #fff; transform: scale(1.3); }

.card-meta { padding: 10px 12px; display: flex; flex-direction: column; gap: 5px; border-bottom: 1px solid var(--border); }
.meta-row { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
.meta-key { font-size: 11px; color: var(--muted); flex-shrink: 0; }
.meta-val { font-size: 12px; font-weight: 500; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 180px; }
.meta-val--time { font-family: var(--font-mono); font-size: 10.5px; font-weight: 400; color: var(--muted); }

.card-actions { display: grid; grid-template-columns: 1fr 1fr; }
.action-btn {
  display: flex; align-items: center; justify-content: center; gap: 5px;
  padding: 9px; border: none; font-family: var(--font); font-size: 12px;
  font-weight: 500; cursor: pointer; transition: opacity .12s;
}
.action-btn:hover { opacity: .8; }
.action-btn--pass { background: var(--pass-bg); color: var(--pass); border-right: 1px solid var(--border); }
.action-btn--fail { background: var(--fail-bg); color: var(--fail); }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.4);
  backdrop-filter: blur(4px); display: flex; align-items: center;
  justify-content: center; z-index: 100; padding: 16px;
}
.modal { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; width: 100%; max-width: 380px; box-shadow: 0 20px 60px rgba(0,0,0,.15); overflow: hidden; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid var(--border); }
.modal-title { display: flex; align-items: center; gap: 10px; }
.modal-action-pill { font-size: 11px; font-weight: 600; letter-spacing: .05em; padding: 3px 9px; border-radius: 99px; }
.pill--pass { background: var(--pass-bg); color: var(--pass); }
.pill--fail { background: var(--fail-bg); color: var(--fail); }
.modal-id { font-family: var(--font-mono); font-size: 13px; color: var(--muted); }
.modal-close { background: none; border: none; cursor: pointer; color: var(--muted); display: flex; align-items: center; justify-content: center; padding: 4px; border-radius: 4px; transition: color .12s, background .12s; }
.modal-close:hover { color: var(--text); background: var(--surface2); }
.modal-textarea { display: block; width: 100%; padding: 14px 16px; background: var(--surface2); border: none; border-bottom: 1px solid var(--border); font-family: var(--font); font-size: 14px; color: var(--text); resize: none; outline: none; line-height: 1.6; transition: background .12s; }
.modal-textarea::placeholder { color: var(--muted); }
.modal-textarea:focus { background: #fff; }
.modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 16px; }
.btn { padding: 7px 16px; border-radius: var(--radius-sm); border: none; font-family: var(--font); font-size: 13px; font-weight: 500; cursor: pointer; transition: opacity .12s; }
.btn:hover { opacity: .8; }
.btn--ghost { background: var(--surface2); color: var(--muted); }
.btn--pass  { background: var(--pass); color: #fff; }
.btn--fail  { background: var(--fail); color: #fff; }

.modal-enter-active, .modal-leave-active { transition: opacity .18s ease; }
.modal-enter-active .modal, .modal-leave-active .modal { transition: transform .18s ease, opacity .18s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal, .modal-leave-to .modal { transform: translateY(10px) scale(.98); opacity: 0; }

@media (max-width: 680px) {
  .sidebar { position: fixed; z-index: 40; height: calc(100vh - var(--header-h)); box-shadow: 4px 0 20px rgba(0,0,0,.08); }
  .main { padding: 16px 12px 40px; }
  .grid { grid-template-columns: 1fr; }
}
</style>