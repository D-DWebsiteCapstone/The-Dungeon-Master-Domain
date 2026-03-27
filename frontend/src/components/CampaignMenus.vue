<template>
    <nav class="navBar" v-sound>
      <button
        class="invisibleButton"
        @click="router.push(`/campaign/${campaignId}`)"
        :class="{ active: route.path === `/campaign/${campaignId}` }"
      >Home</button>
      <button
        class="invisibleButton"
        @click="router.push(`/campaign/${campaignId}/recaps`)"
        :class="{ active: route.path.includes('/recaps') }"
      >Recaps</button>
      <button
        class="invisibleButton"
        @click="router.push(`/campaign/${campaignId}/maps`)"
        :class="{ active: route.path.includes('/maps') }"
      >Map</button>
      <button
        class="invisibleButton"
        @click="router.push(`/campaign/${campaignId}/characters`)"
        :class="{ active: route.path.includes('/characters') }"
      >Characters</button>
      <button
        class="invisibleButton"
        @click="router.push(`/campaign/${campaignId}/rules`)"
        :class="{ active: route.path.includes('/rules') }"
      >Rules</button>
      <button
        class="invisibleButton"
        @click="router.push(`/campaign/${campaignId}/members`)"
        :class="{ active: route.path.includes('/members') }"
      >Members</button>
      <button
        class="invisibleButton"
        @click="router.push(`/campaign/${campaignId}/npcs`)"
        :class="{ active: route.path.includes('/npcs') }"
      >NPCs</button>
      <button
        class="invisibleButton"
        @click="router.push(`/campaign/${campaignId}/messages`)"
        :class="{ active: route.path.includes('/messages') }"
      >Messages</button>
      <button
        class="invisibleButton"
        @click="router.push(`/campaign/${campaignId}/tools`)"
        :class="{ active: route.path.includes('/tools') }"
      >Tools</button>
    </nav>
  </template>
  
  <script setup>
  import { useRoute, useRouter } from 'vue-router'
  
  const props = defineProps({
    campaignId: {
      type: String,
      required: true
    }
  })
  
  const route = useRoute()
  const router = useRouter()
  </script>