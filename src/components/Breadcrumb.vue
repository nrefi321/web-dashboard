<!-- components/Breadcrumb.vue -->
<script setup>
defineProps({
  filter: { type: Object, required: true },
})

const emit = defineEmits(['clear', 'select-plant', 'select-area', 'select-nvr'])
</script>

<template>
  <div class="breadcrumb" v-if="filter.plant">
    <button class="crumb" @click="emit('clear')">All</button>
    <span class="crumb-sep">›</span>

    <button
      class="crumb"
      :class="{ active: !filter.area }"
      @click="emit('select-plant', filter.plant)"
    >{{ filter.plant }}</button>

    <template v-if="filter.area">
      <span class="crumb-sep">›</span>
      <button
        class="crumb"
        :class="{ active: !filter.nvr_id }"
        @click="emit('select-area', filter.plant, filter.area)"
      >{{ filter.area }}</button>
    </template>

    <template v-if="filter.nvr_id">
      <span class="crumb-sep">›</span>
      <button
        class="crumb"
        :class="{ active: !filter.camera_ch }"
        @click="emit('select-nvr', filter.plant, filter.area, filter.nvr_id)"
      >{{ filter.nvr_id }}</button>
    </template>

    <template v-if="filter.camera_ch">
      <span class="crumb-sep">›</span>
      <span class="crumb active">CH {{ filter.camera_ch }}</span>
    </template>
  </div>
</template>

<style scoped>
.breadcrumb {
  display: flex; align-items: center; gap: 4px;
  margin-bottom: 16px; flex-wrap: wrap;
}
.crumb {
  background: none; border: none; font-family: var(--font);
  font-size: 12px; color: var(--muted); cursor: pointer;
  padding: 2px 6px; border-radius: 4px;
  transition: color .12s, background .12s;
}
.crumb:hover { color: var(--text); background: var(--surface2); }
.crumb.active { color: var(--text); font-weight: 500; cursor: default; }
.crumb.active:hover { background: none; }
.crumb-sep { color: var(--border2); font-size: 14px; user-select: none; }
</style>