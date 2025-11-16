<template>
 <nav class="navBar" v-sound>
    <button class = "invisibleButton" @click="router.push('/Campaign')" :class="{ active: route.path === '/Campaign' }">Home</button>
    <button class = "invisibleButton" @click="router.push('/Recaps')" :class="{ active: route.path === '/Recaps' }">Recaps</button>
    <button class = "invisibleButton" @click="router.push('/Maps')" :class="{ active: route.path === '/Maps' }">Maps</button>
    <button class = "invisibleButton" @click="router.push('/CampaignCharacters')" :class="{ active: route.path === '/CampaignCharacters' }">Characters</button>
    <button class = "invisibleButton" @click="router.push('/Rules')" :class="{ active: route.path === '/Rules' }">Rules</button>
    <button class = "invisibleButton" @click="router.push('/CampaignMembers')" :class="{ active: route.path === '/CampaignMembers' }">Members</button>
  </nav>

  <div class="campaignPage">
    <h2>Welcome to Your Campaign!</h2>
    <p>Here you can see all members of the campaign and change permissions</p>

    <p>
      List members here
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
//const campaignId = route.params.id

// Define reactive state for campaign data
//const campaignData = ref(null)

// Fetch campaign info when page loads
// onMounted(async () => {
//   try {
//     const response = await fetch(`https://localhost:3000/data/campaign/${campaignId}`)
//     const result = await response.json()
//     if (result.valid) {
//       campaignData.value = result.campaign
//       console.log('Campaign data loaded:', result.campaign)
//     } else {
//       console.error('Failed to load campaign:', result.message)
//     }
//   } catch (err) {
//     console.error('Error fetching campaign:', err)
//   }
// })
</script>
<style scoped>



</style>