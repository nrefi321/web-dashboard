<!-- components/Lightbox.vue -->
<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  show:      { type: Boolean, default: false },
  mediaList: { type: Array,   default: () => [] }, // [{ src, type, label }]
  startIdx:  { type: Number,  default: 0 },
})

const emit = defineEmits(['close'])

const currentIdx = ref(props.startIdx)

// Reset index when opened
watch(() => props.show, (val) => {
  if (val) currentIdx.value = props.startIdx
})
watch(() => props.startIdx, (val) => {
  currentIdx.value = val
})

const current = computed(() => props.mediaList[currentIdx.value] || {})

function prev() {
  currentIdx.value = (currentIdx.value - 1 + props.mediaList.length) % props.mediaList.length
}
function next() {
  currentIdx.value = (currentIdx.value + 1) % props.mediaList.length
}

// Keyboard navigation
function onKey(e) {
  if (!props.show) return
  if (e.key === 'ArrowLeft')  prev()
  if (e.key === 'ArrowRight') next()
  if (e.key === 'Escape')     emit('close')
}
</script>

<template>
  <Transition name="lightbox">
    <div
      v-if="show"
      class="lightbox-overlay"
      @click.self="emit('close')"
      @keydown="onKey"
      tabindex="0"
    >
      <div class="lightbox-box">

        <!-- Header -->
        <div class="lightbox-header">
          <span class="lightbox-label">{{ current.label }}</span>
          <div class="lightbox-header-right">
            <span class="lightbox-counter">{{ currentIdx + 1 }} / {{ mediaList.length }}</span>
            <button class="lightbox-close" @click="emit('close')">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 3L15 15M15 3L3 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Media area -->
        <div class="lightbox-media-wrap">

          <!-- Prev button -->
          <button class="lb-nav lb-nav--prev" @click="prev" v-if="mediaList.length > 1">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M13 4L7 10L13 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <!-- Media -->
          <div class="lightbox-media">
            <img
              v-if="current.type === 'image'"
              :key="'img-' + current.src"
              :src="current.src"
              :alt="current.label"
            />
            <video v-else :key="'vid-' + current.src" controls>
              <source :src="current.src" />
            </video>
          </div>

          <!-- Next button -->
          <button class="lb-nav lb-nav--next" @click="next" v-if="mediaList.length > 1">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 4L13 10L7 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

        </div>

        <!-- Dot indicators -->
        <div class="lightbox-dots" v-if="mediaList.length > 1">
          <span
            v-for="(_, i) in mediaList"
            :key="i"
            class="lb-dot"
            :class="{ active: currentIdx === i }"
            @click="currentIdx = i"
          ></span>
        </div>

        <!-- Thumbnails -->
        <div class="lightbox-thumbs" v-if="mediaList.length > 1">
          <div
            v-for="(m, i) in mediaList"
            :key="i"
            class="lb-thumb"
            :class="{ active: currentIdx === i }"
            @click="currentIdx = i"
          >
            <img v-if="m.type === 'image'" :src="m.src" :alt="m.label" />
            <div v-else class="lb-thumb-video">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <polygon points="4,2 14,8 4,14" fill="currentColor"/>
              </svg>
            </div>
            <span class="lb-thumb-label">{{ m.label }}</span>
          </div>
        </div>

      </div>
    </div>
  </Transition>
</template>

<style scoped>
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.95);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  outline: none;
}

.lightbox-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1400px;
  max-height: 98vh;
  gap: 10px;
}

/* Header */
.lightbox-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.lightbox-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.6);
}
.lightbox-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.lightbox-counter {
  font-size: 12px;
  color: rgba(255,255,255,0.4);
  font-family: var(--font-mono);
}
.lightbox-close {
  background: rgba(255,255,255,0.1);
  border: none;
  color: rgba(255,255,255,0.7);
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background .15s, color .15s;
}
.lightbox-close:hover { background: rgba(255,255,255,0.2); color: #fff; }

/* Media wrap */
.lightbox-media-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.lb-nav {
  flex-shrink: 0;
  width: 40px; height: 40px;
  background: rgba(255,255,255,0.1);
  border: none;
  border-radius: 50%;
  color: rgba(255,255,255,0.7);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background .15s, color .15s;
}
.lb-nav:hover { background: rgba(255,255,255,0.2); color: #fff; }

.lightbox-media {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  max-height: calc(98vh - 160px);
  width: 100%;
}
.lightbox-media img,
.lightbox-media video {
  max-width: 100%;
  max-height: calc(98vh - 160px);
  width: 100%;
  object-fit: contain;
  border-radius: 4px;
  animation: fade-in 0.15s ease;
}
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

/* Dots */
.lightbox-dots {
  display: flex;
  gap: 6px;
}
.lb-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,0.25);
  cursor: pointer;
  transition: background .15s, transform .15s;
}
.lb-dot.active { background: #fff; transform: scale(1.3); }

/* Thumbnails */
.lightbox-thumbs {
  display: flex;
  gap: 8px;
}
.lb-thumb {
  width: 72px;
  cursor: pointer;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid transparent;
  opacity: 0.5;
  transition: opacity .15s, border-color .15s;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.lb-thumb.active { border-color: #fff; opacity: 1; }
.lb-thumb:hover  { opacity: 0.85; }
.lb-thumb img    { width: 100%; height: 48px; object-fit: cover; display: block; }
.lb-thumb-video  {
  width: 100%; height: 48px;
  background: rgba(255,255,255,0.1);
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.6);
}
.lb-thumb-label {
  font-size: 9px;
  color: rgba(255,255,255,0.5);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 3px 0;
}

/* Transition */
.lightbox-enter-active, .lightbox-leave-active { transition: opacity 0.2s ease; }
.lightbox-enter-from, .lightbox-leave-to { opacity: 0; }
</style>