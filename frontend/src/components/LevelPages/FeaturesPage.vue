<template>
  <div class="levelPage">
    <div v-if="!feature">
      <p>No feature data found.</p>
    </div>

    <div class="content" v-else>
      <h2 class="topBar">{{ feature.name }}</h2>

      <!-- Debug -->
      <!-- <pre>{{ feature }}</pre> -->

      <div class="feature" v-html="formatDesc(feature.desc || feature.description)"></div>
    </div>
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

<style scoped>
.topBar { margin-bottom: 2rem;}
.content{ width: 100%;}
.feature{
  backdrop-filter: blur(3px);
  border: 1px solid var(--vt-c-bronze);
  padding: 12px 16px;
  width: 85%;
  margin: auto;
}

@media (max-width:450px) {
  .feature { width: 90%;}
}

</style>