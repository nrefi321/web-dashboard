<!-- components/DetectionCard.vue -->
<script setup>
import { ref, computed } from 'vue'
import { convertPath, getMedia } from '../utils/mediaHelper.js'
import { formatBKK } from '../utils/timeHelper.js'
import Lightbox from './Lightbox.vue'

const props = defineProps({
  item:  { type: Object, required: true },
  index: { type: Number, default: 0 },
})

const emit = defineEmits(['open-modal', 'revert'])

const mediaIdx  = ref(0)
const mediaList = getMedia(props.item)

function next() { mediaIdx.value = (mediaIdx.value + 1) % mediaList.length }
function prev() { mediaIdx.value = (mediaIdx.value - 1 + mediaList.length) % mediaList.length }
const current = () => mediaList[mediaIdx.value]

// Lightbox
const lightboxOpen = ref(false)
const lightboxIdx  = ref(0)

function openLightbox(idx) {
  if (mediaList[idx]?.src) {
    lightboxIdx.value = idx
    lightboxOpen.value = true
  }
}

// API fields:
//   verify_status: false, verify_result: false, remark: null  → Pending
//   verify_status: true,  verify_result: true,  remark: "."  → PASS
//   verify_status: true,  verify_result: false, remark: "."  → FAIL
//   _reviewed: local flag set after user submits this session
const isReviewed    = computed(() =>
  props.item._reviewed || props.item.verify_status === true
)
const reviewedLabel = computed(() => props.item.verify_result === true ? 'Normal' : 'Suspected')
</script>

<template>
  <div class="card" :class="{ 'card--reviewed': isReviewed }" :style="{ animationDelay: `${index * 0.04}s` }">

    <!-- Top bar -->
    <div class="card-top">
      <span class="card-id">#{{ item.id }}</span>
      <span class="badge"
        :class="{
          'badge--normal':    isReviewed && item.verify_result === true,
          'badge--suspected': isReviewed && item.verify_result === false,
          'badge--pending':   !isReviewed,
        }"
      >
        <template v-if="isReviewed">
          <svg v-if="item.verify_result === true" width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path d="M1 4.5L3.5 7L8 1.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path d="M4.5 1L4.5 5.5M4.5 7v.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
          {{ reviewedLabel }}
        </template>
        <template v-else>Pending</template>
      </span>
    </div>

    <!-- Media viewer -->
    <div class="viewer">
      <button class="nav-btn" @click="prev">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="media-frame">
        <div class="media-label">{{ current().label }}</div>
        <template v-if="current().type === 'image'">
          <img
            :src="convertPath(current().src)"
            :alt="current().label"
            class="clickable-img"
            @click="openLightbox(mediaIdx)"
          />
        </template>
        <template v-else>
          <video controls preload="metadata">
            <source :src="convertPath(current().src)" />
          </video>
        </template>
        <!-- Reviewed overlay -->
        <div v-if="isReviewed" class="reviewed-overlay" :class="item.verify_result === true ? 'overlay--normal' : 'overlay--suspected'">
          <svg v-if="item.verify_result === true" width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M5 16L12 23L27 8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 6L16 20M16 24v1" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          <span>{{ reviewedLabel }}</span>
        </div>
        <div class="dots">
          <span v-for="(_, mi) in mediaList" :key="mi" class="dot"
            :class="{ active: mediaIdx === mi }" @click="mediaIdx = mi"></span>
        </div>
      </div>
      <button class="nav-btn" @click="next">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <!-- Meta -->
    <div class="card-meta">
      <div class="meta-row"><span class="meta-key">Plant</span><span class="meta-val">{{ item.plant || '—' }}</span></div>
      <div class="meta-row"><span class="meta-key">Area</span><span class="meta-val">{{ item.area || '—' }}</span></div>
      <div class="meta-row"><span class="meta-key">Camera</span><span class="meta-val">{{ item.camera_ch || '—' }}</span></div>
      <div class="meta-row">
        <span class="meta-key">Detected</span>
        <span class="meta-val meta-val--time">
          {{ formatBKK(item.detected_suspicious_time) }}
        </span>
      </div>
      <!-- Show remark if reviewed -->
      <div v-if="isReviewed && item.remark" class="meta-row">
        <span class="meta-key">Remark</span>
        <span class="meta-val meta-val--remark">{{ item.remark }}</span>
      </div>
    </div>

    <!-- Actions: Pass/Fail when pending, Revert when reviewed -->
    <div class="card-actions">

      <template v-if="!isReviewed">
        <!-- Suspected = verify_result: false (orange) -->
        <button class="action-btn action-btn--suspected" @click="emit('open-modal', 'SUSPECTED', item)">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 2L6.5 7.5M6.5 10v.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          Suspected
        </button>
        <!-- Normal = verify_result: true (green) -->
        <button class="action-btn action-btn--normal" @click="emit('open-modal', 'NORMAL', item)">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 6.5L5.5 10L11 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Normal
        </button>
      </template>

      <template v-else>
        <button class="action-btn action-btn--revert" @click="emit('revert', item.id)">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 5H8.5C10.43 5 12 6.57 12 8.5C12 10.43 10.43 12 8.5 12H5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            <path d="M4.5 2.5L2 5L4.5 7.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Revert to Pending
        </button>
      </template>

    </div>

  </div>

  <!-- Lightbox -->
  <Lightbox
    :show="lightboxOpen"
    :media-list="mediaList.map(m => ({ ...m, src: convertPath(m.src) }))"
    :start-idx="lightboxIdx"
    @close="lightboxOpen = false"
  />

</template>

<style scoped>
.card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden;
  opacity: 0; animation: rise .3s ease forwards;
  transition: box-shadow .18s, border-color .18s, background 0.2s ease;
}
.card:hover { border-color: var(--border2); box-shadow: 0 2px 8px rgba(0,0,0,.07), 0 8px 24px rgba(0,0,0,.05); }
.card--reviewed { border-color: var(--border2); }
@keyframes rise { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }

/* Top bar */
.card-top { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid var(--border); }
.card-id { font-family: var(--font-mono); font-size: 11px; color: var(--muted); }
.badge {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 99px;
}
.badge--pending   { background: var(--surface2); color: var(--muted); }
.badge--normal    { background: var(--pass-bg);  color: var(--pass);  font-weight: 600; }
.badge--suspected { background: var(--warn-bg);  color: var(--warn);  font-weight: 600; }

/* Viewer */
.viewer { display: flex; align-items: center; background: #111; height: 260px; }
.nav-btn {
  flex-shrink: 0; width: 30px; height: 100%;
  background: transparent; border: none; color: rgba(255,255,255,.4);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: color .12s, background .12s;
}
.nav-btn:hover { color: #fff; background: rgba(255,255,255,.06); }

.media-frame { flex: 1; height: 100%; position: relative; overflow: hidden; }
.media-frame img, .media-frame video { width: 100%; height: 100%; object-fit: contain; display: block; }
.clickable-img { cursor: zoom-in; transition: opacity .15s; }
.clickable-img:hover { opacity: 0.9; }

.media-label {
  position: absolute; top: 7px; left: 7px; z-index: 2;
  font-size: 10px; font-weight: 500; letter-spacing: .06em; text-transform: uppercase;
  color: rgba(255,255,255,.75); background: rgba(0,0,0,.45);
  backdrop-filter: blur(4px); padding: 2px 7px; border-radius: 4px;
}

/* Reviewed overlay on media */
.reviewed-overlay {
  position: absolute; inset: 0; z-index: 3;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 6px;
  font-size: 11px; font-weight: 700; letter-spacing: .08em;
  pointer-events: none;
}
.overlay--normal    { background: rgba(22,128,60,0.55);  color: #fff; }
.overlay--suspected { background: rgba(202,138,4,0.65);  color: #fff; }

.dots { position: absolute; bottom: 7px; left: 50%; transform: translateX(-50%); display: flex; gap: 4px; z-index: 4; }
.dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,.3); cursor: pointer; transition: background .12s, transform .12s; }
.dot.active { background: #fff; transform: scale(1.3); }

/* Meta */
.card-meta { padding: 10px 12px; display: flex; flex-direction: column; gap: 5px; border-bottom: 1px solid var(--border); }
.meta-row { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
.meta-key { font-size: 11px; color: var(--muted); flex-shrink: 0; }
.meta-val { font-size: 12px; font-weight: 500; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 180px; }
.meta-val--time   { font-family: var(--font-mono); font-size: 10.5px; font-weight: 400; color: var(--muted); }
.meta-val--remark { white-space: normal; word-break: break-word; color: var(--muted); font-weight: 400; font-size: 11px; }

/* Actions */
.card-actions { display: grid; grid-template-columns: 1fr 1fr; }
.action-btn {
  display: flex; align-items: center; justify-content: center; gap: 5px;
  padding: 12px; border: none; font-family: var(--font); font-size: 15px;
  font-weight: 700; cursor: pointer; transition: opacity .12s;
}
.action-btn:hover { opacity: .8; }
.action-btn--suspected {
  background: var(--warn-bg);
  color: var(--warn);
  border-right: 1px solid var(--border);
  font-weight: 600;
}
.action-btn--normal {
  background: var(--pass-bg);
  color: var(--pass);
  font-weight: 600;
}
.action-btn--revert {
  grid-column: span 2;
  background: var(--surface2); color: var(--muted);
  border-top: 1px solid var(--border);
  font-size: 12px;
}
.action-btn--revert:hover { color: var(--text); opacity: 1; background: var(--border); }
</style>