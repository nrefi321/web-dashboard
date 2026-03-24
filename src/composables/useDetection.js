// composables/useDetection.js
import { ref, computed } from "vue";
import { API } from "../config.js";

export function useDetection() {
  // ── Raw data ──────────────────────────────────────────────────────
  const results = ref([]);

  async function loadData() {
    const res = await fetch(API.results);
    const data = await res.json();
    results.value = data;
    clearFilter();
  }

  // ── Verify / Revert ───────────────────────────────────────────────
  // API fields:
  //   verify_status: false + verify_result: false + remark: null  → Pending
  //   verify_status: true  + verify_result: false + remark: "."  → Suspected
  //   verify_status: true  + verify_result: true  + remark: "."  → Normal
  //
  // PATCH body: { verify_status, verify_result, remark }
  async function verifyRecord({ id, action, remark }) {
    const verify_result = action === "NORMAL"; // NORMAL=true, SUSPECTED=false
    const record = results.value.find((r) => r.id === id);
    if (!record) return;

    // Optimistic update
    const snapshot = {
      verify_status: record.verify_status,
      verify_result: record.verify_result,
      remark: record.remark,
      _reviewed: record._reviewed,
    };
    record.verify_status = true; // always true once reviewed
    record.verify_result = verify_result; // true=PASS, false=FAIL
    record.remark = remark;
    record._reviewed = true;

    try {
      const res = await fetch(API.verifyStatus(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verify_status: true, verify_result, remark }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      record.verify_status = snapshot.verify_status;
      record.verify_result = snapshot.verify_result;
      record.remark = snapshot.remark;
      record._reviewed = snapshot._reviewed;
      console.error("verify failed:", err);
      alert(`Failed to update record #${id}: ${err.message}`);
    }
  }

  async function revertRecord(id) {
    const record = results.value.find((r) => r.id === id);
    if (!record) return;

    const snapshot = {
      verify_status: record.verify_status,
      verify_result: record.verify_result,
      remark: record.remark,
      _reviewed: record._reviewed,
    };
    record.verify_status = false;
    record.verify_result = false;
    record.remark = null;
    record._reviewed = false;

    try {
      const res = await fetch(API.verifyStatus(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verify_status: false,
          verify_result: false,
          remark: null,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      record.verify_status = snapshot.verify_status;
      record.verify_result = snapshot.verify_result;
      record.remark = snapshot.remark;
      record._reviewed = snapshot._reviewed;
      console.error("revert failed:", err);
      alert(`Failed to revert record #${id}: ${err.message}`);
    }
  }

  // ── Filter state ──────────────────────────────────────────────────
  // verifyGroup: null = all, 'unverified' = verify_status false, 'verified' = verify_status true
  const filter = ref({
    verifyGroup: null,
    plant: null,
    area: null,
    nvr_id: null,
    camera_ch: null,
  });

  const filteredResults = computed(() => {
    return results.value.filter((r) => {
      const p = r.plant || "(none)";
      const a = r.area || "(none)";
      const n = r.nvr_id || "(none)";
      const c = r.camera_ch || "(none)";
      if (filter.value.verifyGroup === "verified" && !r.verify_status)
        return false;
      if (filter.value.verifyGroup === "unverified" && r.verify_status)
        return false;
      if (filter.value.plant && p !== filter.value.plant) return false;
      if (filter.value.area && a !== filter.value.area) return false;
      if (filter.value.nvr_id && n !== filter.value.nvr_id) return false;
      if (filter.value.camera_ch && c !== filter.value.camera_ch) return false;
      return true;
    });
  });

  function clearFilter() {
    filter.value = {
      verifyGroup: null,
      plant: null,
      area: null,
      nvr_id: null,
      camera_ch: null,
    };
  }
  function selectVerifyGroup(group) {
    filter.value = {
      verifyGroup: group,
      plant: null,
      area: null,
      nvr_id: null,
      camera_ch: null,
    };
  }
  function selectPlant(plant, group) {
    filter.value = {
      verifyGroup: group || filter.value.verifyGroup,
      plant,
      area: null,
      nvr_id: null,
      camera_ch: null,
    };
  }
  function selectArea(plant, area, group) {
    filter.value = {
      verifyGroup: group || filter.value.verifyGroup,
      plant,
      area,
      nvr_id: null,
      camera_ch: null,
    };
  }
  function selectNvr(plant, area, nvr_id, group) {
    filter.value = {
      verifyGroup: group || filter.value.verifyGroup,
      plant,
      area,
      nvr_id,
      camera_ch: null,
    };
  }
  function selectCam(plant, area, nvr_id, camera_ch) {
    filter.value = { ...filter.value, plant, area, nvr_id, camera_ch };
  }

  // ── Tree ──────────────────────────────────────────────────────────
  // Builds two separate trees: unverified and verified
  const tree = computed(() => {
    const unverified = {};
    const verified = {};
    results.value.forEach((r) => {
      const t = r.verify_status ? verified : unverified;
      const p = r.plant || "(none)";
      const a = r.area || "(none)";
      const n = r.nvr_id || "(none)";
      const c = r.camera_ch || "(none)";
      if (!t[p]) t[p] = {};
      if (!t[p][a]) t[p][a] = {};
      if (!t[p][a][n]) t[p][a][n] = new Set();
      t[p][a][n].add(c);
    });
    return { unverified, verified };
  });

  // ── Count helpers ─────────────────────────────────────────────────
  function countGroup(group) {
    if (group === "verified")
      return results.value.filter((r) => r.verify_status).length;
    if (group === "unverified")
      return results.value.filter((r) => !r.verify_status).length;
    return results.value.length;
  }
  function countPlant(plant, group) {
    return results.value.filter((r) => {
      if (group === "verified" && !r.verify_status) return false;
      if (group === "unverified" && r.verify_status) return false;
      return (r.plant || "(none)") === plant;
    }).length;
  }
  function countArea(plant, area, group) {
    return results.value.filter((r) => {
      if (group === "verified" && !r.verify_status) return false;
      if (group === "unverified" && r.verify_status) return false;
      return (r.plant || "(none)") === plant && (r.area || "(none)") === area;
    }).length;
  }
  function countNvr(plant, area, nvr, group) {
    return results.value.filter((r) => {
      if (group === "verified" && !r.verify_status) return false;
      if (group === "unverified" && r.verify_status) return false;
      return (
        (r.plant || "(none)") === plant &&
        (r.area || "(none)") === area &&
        (r.nvr_id || "(none)") === nvr
      );
    }).length;
  }
  function countCam(plant, area, nvr, cam, group) {
    return results.value.filter((r) => {
      if (group === "verified" && !r.verify_status) return false;
      if (group === "unverified" && r.verify_status) return false;
      return (
        (r.plant || "(none)") === plant &&
        (r.area || "(none)") === area &&
        (r.nvr_id || "(none)") === nvr &&
        (r.camera_ch || "(none)") === cam
      );
    }).length;
  }

  // ── Active node check ─────────────────────────────────────────────
  function isActiveNode(group, plant, area, nvr, cam) {
    const f = filter.value;
    if (f.verifyGroup !== group) return false;
    if (cam !== undefined)
      return (
        f.plant === plant &&
        f.area === area &&
        f.nvr_id === nvr &&
        f.camera_ch === cam
      );
    if (nvr !== undefined)
      return (
        f.plant === plant && f.area === area && f.nvr_id === nvr && !f.camera_ch
      );
    if (area !== undefined)
      return f.plant === plant && f.area === area && !f.nvr_id;
    if (plant !== undefined) return f.plant === plant && !f.area;
    return !f.plant; // group-level active
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
    selectVerifyGroup,
    selectPlant,
    selectArea,
    selectNvr,
    selectCam,
    countGroup,
    countPlant,
    countArea,
    countNvr,
    countCam,
    isActiveNode,
  };
}
