<!-- components/RemarkModal.vue -->
<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show:       { type: Boolean, required: true },
  actionType: { type: String,  default: '' },
  item:       { type: Object,  default: null },
})

const emit = defineEmits(['close', 'submit'])

const remarkText = ref("")

watch(() => props.show, (val) => {
  if (val) remarkText.value = ""
})

function submit() {
  // remark is optional — send null if empty so API gets correct unreviewed state
  emit('submit', {
    id:     props.item?.id,
    action: props.actionType,
    remark: remarkText.value.trim() || null,
  })
}
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="emit('close')">
      <div class="modal">

        <div class="modal-header">
          <div class="modal-title">
            <span class="modal-action-pill" :class="actionType === 'PASS' ? 'pill--pass' : 'pill--fail'">
              {{ actionType }}
            </span>
            <span class="modal-id">Record #{{ item?.id }}</span>
          </div>
          <button class="modal-close" @click="emit('close')">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <textarea
          v-model="remarkText"
          class="modal-textarea"
          placeholder="Add a remark…"
          rows="4"
          autofocus
        ></textarea>

        <div class="modal-footer">
          <button class="btn btn--ghost" @click="emit('close')">Cancel</button>
          <button
            class="btn"
            :class="actionType === 'PASS' ? 'btn--pass' : 'btn--fail'"
            @click="submit"
          >
            Confirm {{ actionType }}
          </button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.4);
  backdrop-filter: blur(4px); display: flex; align-items: center;
  justify-content: center; z-index: 100; padding: 16px;
}
.modal {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 14px; width: 100%; max-width: 380px;
  box-shadow: 0 20px 60px rgba(0,0,0,.15); overflow: hidden;
}
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid var(--border); }
.modal-title  { display: flex; align-items: center; gap: 10px; }
.modal-action-pill { font-size: 11px; font-weight: 600; letter-spacing: .05em; padding: 3px 9px; border-radius: 99px; }
.pill--pass { background: var(--pass-bg); color: var(--pass); }
.pill--fail { background: var(--fail-bg); color: var(--fail); }
.modal-id   { font-family: var(--font-mono); font-size: 13px; color: var(--muted); }
.modal-close {
  background: none; border: none; cursor: pointer; color: var(--muted);
  display: flex; align-items: center; padding: 4px; border-radius: 4px;
  transition: color .12s, background .12s;
}
.modal-close:hover { color: var(--text); background: var(--surface2); }
.modal-textarea {
  display: block; width: 100%; padding: 14px 16px;
  background: var(--surface2); border: none; border-bottom: 1px solid var(--border);
  font-family: var(--font); font-size: 14px; color: var(--text);
  resize: none; outline: none; line-height: 1.6; transition: background .12s;
}
.modal-textarea::placeholder { color: var(--muted); }
.modal-textarea:focus { background: var(--surface2); border-bottom-color: var(--border2); }
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
</style>