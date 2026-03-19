<script setup>

import { ref, computed } from 'vue'

const { item } = defineProps({
  item: Object
})

const mediaIndex = ref(0)

function convertPath(path){

  if(!path) return ""

  const parts = path.split("apitest\\")
  if(parts.length < 2) return ""

  const relative = parts[1].replace(/\\/g,"/")
  return "http://10.153.94.123:8003" + relative

}

const mediaList = computed(() => [

  { type:'image', label:'Image Predict', src:item.image_predict_path },

  { type:'image', label:'Image Original', src:item.image_original_path },

  { type:'video', label:'Video', src:item.video_path }

])

function next(){

  mediaIndex.value =
    (mediaIndex.value + 1) % mediaList.value.length

}

function prev(){

  mediaIndex.value =
    (mediaIndex.value - 1 + mediaList.value.length) %
    mediaList.value.length

}

</script>

<template>

<div class="viewer">

<button class="nav" @click="prev">⬅</button>

<div class="media">

<div class="media-label">

{{ mediaList[mediaIndex].label }}

</div>

<template v-if="mediaList[mediaIndex].type === 'image'">

<img :src="convertPath(mediaList[mediaIndex].src)" />

</template>

<template v-else>

<video controls preload="metadata">

<source :src="convertPath(mediaList[mediaIndex].src)" />

</video>

</template>

</div>

<button class="nav" @click="next">➡</button>

</div>

</template>