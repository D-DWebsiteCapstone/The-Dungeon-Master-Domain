<template>
  <div v-if="!feature">
    <p>No feature data found.</p>
  </div>

  <div v-else>
    <h1>{{ feature.name }}</h1>

    <!-- Debug -->
    <!-- <pre>{{ feature }}</pre> -->

    <div v-html="formatDesc(feature.desc || feature.description)"></div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { featureStore } from '@/stores/featureStore' // adjust path

const route = useRoute()

const feature = computed(() => {
  const id = Number(route.params.id)
  return featureStore.getFeature(id)
})

function formatDesc(desc) {
  if (!desc) return ''

  return desc
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
}

onMounted(() => {
  if (!featureStore.features.length) {
    featureStore.loadFeatures()
  }
})
</script>

