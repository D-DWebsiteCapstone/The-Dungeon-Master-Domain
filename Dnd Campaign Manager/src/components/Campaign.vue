<template>
 <nav class="navBar" v-sound>
    <button class = "invisibleButton" @click="router.push('/Campaign')" :class="{ active: route.path === '/Campaign' }">Home</button>
    <button class = "invisibleButton" @click="router.push('/CampaignRecaps')" :class="{ active: route.path === '/CampaignRecaps' }">Recaps</button>
    <button class = "invisibleButton" @click="router.push('/CampaignMaps')" :class="{ active: route.path === '/CampaignMaps' }">Maps</button>
    <button class = "invisibleButton" @click="router.push('/CampaignCharacters')" :class="{ active: route.path === '/CampaignCharacters' }">Characters</button>
    <button class = "invisibleButton" @click="router.push('/CampaignRules')" :class="{ active: route.path === '/CampaignRules' }">Rules</button>
<button class="invisibleButton" 
  @click="router.push(`/campaign/${campaignId}/members`)"
  :class="{ active: route.path.includes('/CampaignMembers') }">
  Members
</button>  </nav>

  <div class="campaignPage" v-sound>
    <h1>Welcome to Your Campaign!</h1>
    <p>You’ve entered campaign code:</p>
    <div class="campaign-code">{{ campaignId }}</div>

    <div v-if="campaignData" class="campaign-details">
      <h2>{{ campaignData.title }}</h2>
      <p><strong>Join Code:</strong></p>
      <div class="join-code">{{ campaignData.joinCode }}</div>
      <p>Share this code with your players so they can join.</p>
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
import '../assets/base.css';

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
<style scoped>


.generated-code {
  padding: 6px 10px;
  background: #f3f3f3;
  border-radius: 4px;
  font-weight: 600;
  font-family:'Times New Roman', Times, serif;
  max-width: 90%;
  color: var(--vt-c-black);
  word-break: break-all;
  margin-top: 8px;
}

.campaign-code {
  background: #2d2d44;
  color: var(--vt-c-red);
  font-size: 1.5rem;
  font-weight: bold;
  font-family:'Times New Roman', Times, serif;
  padding: 10px 20px;
  border-radius: 8px;
  margin: 1rem 0;
}
</style>