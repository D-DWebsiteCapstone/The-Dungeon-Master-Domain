<template>
  <div class="CampaignNav">
    <button @click="router.push('/CampaignHome')">Home</button>
    <button @click="router.push('/Recaps')">Recaps</button>
    <button @click="router.push('/Maps')">Maps</button>
    <button @click="router.push('/Characters')">Character</button>
    <button @click="router.push('/Rules')">Rules</button>
    <button @click="router.push('/Members')">Members</button>
  </div>

  <div class="campaign-page">
    <h1>Welcome to Your Campaign!</h1>
    <p>You’ve entered campaign code:</p>
    <div class="campaign-code">{{ campaignId }}</div>

    <div v-if="campaignData" class="campaign-details">
      <h2>{{ campaignData.title }}</h2>
      <p><strong>Join Code:</strong></p>
      <div class="join-code">{{ campaignData.joinCode }}</div>
      <p class="note">Share this code with your players so they can join.</p>
    </div>

    <p v-else>Loading campaign details...</p>

    <p>
      This is your unique campaign page.  
      Later you can display DM/player content, maps, or character sheets here.
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Get the campaign ID from the URL (/campaign/:id)
const campaignId = route.params.id

// Define reactive state for campaign data
const campaignData = ref(null)

// Fetch campaign info when page loads
onMounted(async () => {
  try {
    const response = await fetch(`https://localhost:3000/data/campaign/${campaignId}`)
    const result = await response.json()
    if (result.valid) {
      campaignData.value = result.campaign
      console.log('Campaign data loaded:', result.campaign)
    } else {
      console.error('Failed to load campaign:', result.message)
    }
  } catch (err) {
    console.error('Error fetching campaign:', err)
  }
})
</script>