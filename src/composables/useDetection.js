// composables/useDetection.js
import { ref, computed } from 'vue'
import { API } from '../config.js'

export function useDetection() {

  // ── Raw data ──────────────────────────────────────────────────────
  const results = ref([])

  async function loadData() {
    const res  = await fetch(API.results)
    const data = await res.json()
    results.value = data
    clearFilter()
  }

  // ── Verify / Revert ───────────────────────────────────────────────
  // API fields:
  //   verify_status: false + verify_result: false + remark: null → Pending
  //   verify_status: true  + verify_result: true  + remark: "." → PASS
  //   verify_status: true  + verify_result: false + remark: "." → FAIL
  //
  // PATCH body: { verify_status, verify_result, remark }
  async function verifyRecord({ id, action, remark }) {
    const verify_result = action === 'PASS'   // true = PASS, false = FAIL
    const record = results.value.find(r => r.id === id)
    if (!record) return

    // Optimistic update
    const snapshot = {
      verify_status: record.verify_status,
      verify_result: record.verify_result,
      remark:        record.remark,
      _reviewed:     record._reviewed,
    }
    record.verify_status = true           // always true once reviewed
    record.verify_result = verify_result  // true=PASS, false=FAIL
    record.remark        = remark
    record._reviewed     = true

    try {
      const res = await fetch(API.verifyStatus(id), {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ verify_status: true, verify_result, remark }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    } catch (err) {
      record.verify_status = snapshot.verify_status
      record.verify_result = snapshot.verify_result
      record.remark        = snapshot.remark
      record._reviewed     = snapshot._reviewed
      console.error('verify failed:', err)
      alert(`Failed to update record #${id}: ${err.message}`)
    }
  }

  async function revertRecord(id) {
    const record = results.value.find(r => r.id === id)
    if (!record) return

    const snapshot = {
      verify_status: record.verify_status,
      verify_result: record.verify_result,
      remark:        record.remark,
      _reviewed:     record._reviewed,
    }
    record.verify_status = false
    record.verify_result = false
    record.remark        = null
    record._reviewed     = false

    try {
      const res = await fetch(API.verifyStatus(id), {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ verify_status: false, verify_result: false, remark: null }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    } catch (err) {
      record.verify_status = snapshot.verify_status
      record.verify_result = snapshot.verify_result
      record.remark        = snapshot.remark
      record._reviewed     = snapshot._reviewed
      console.error('revert failed:', err)
      alert(`Failed to revert record #${id}: ${err.message}`)
    }
  }

  // ── Filter state ──────────────────────────────────────────────────
  const filter = ref({ plant: null, area: null, nvr_id: null, camera_ch: null })

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

  function clearFilter() {
    filter.value = { plant: null, area: null, nvr_id: null, camera_ch: null }
  }
  function selectPlant(plant) {
    filter.value = { plant, area: null, nvr_id: null, camera_ch: null }
  }
  function selectArea(plant, area) {
    filter.value = { plant, area, nvr_id: null, camera_ch: null }
  }
  function selectNvr(plant, area, nvr_id) {
    filter.value = { plant, area, nvr_id, camera_ch: null }
  }
  function selectCam(plant, area, nvr_id, camera_ch) {
    filter.value = { plant, area, nvr_id, camera_ch }
  }

  // ── Tree ──────────────────────────────────────────────────────────
  const tree = computed(() => {
    const t = {}
    results.value.forEach(r => {
      const p = r.plant    || '(none)'
      const a = r.area     || '(none)'
      const n = r.nvr_id   || '(none)'
      const c = r.camera_ch|| '(none)'
      if (!t[p])       t[p]    = {}
      if (!t[p][a])    t[p][a] = {}
      if (!t[p][a][n]) t[p][a][n] = new Set()
      t[p][a][n].add(c)
    })
    return t
  })

  // ── Count helpers ─────────────────────────────────────────────────
  function countPlant(plant) {
    return results.value.filter(r => (r.plant || '(none)') === plant).length
  }
  function countArea(plant, area) {
    return results.value.filter(r =>
      (r.plant || '(none)') === plant &&
      (r.area  || '(none)') === area
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

  // ── Active node check ─────────────────────────────────────────────
  function isActiveNode(plant, area, nvr, cam) {
    const f = filter.value
    if (cam  !== undefined) return f.plant === plant && f.area === area && f.nvr_id === nvr && f.camera_ch === cam
    if (nvr  !== undefined) return f.plant === plant && f.area === area && f.nvr_id === nvr && !f.camera_ch
    if (area !== undefined) return f.plant === plant && f.area === area && !f.nvr_id
    return f.plant === plant && !f.area
  }

  return {
    results,
    filteredResults,
    filter,
    tree,
    loadData,
    verifyRecord,
    revertRecord,
    clearFilter,
    selectPlant,
    selectArea,
    selectNvr,
    selectCam,
    countPlant,
    countArea,
    countNvr,
    countCam,
    isActiveNode,
  }
}