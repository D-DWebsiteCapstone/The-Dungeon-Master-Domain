<template>
 <nav class="navBar" v-sound>
    <button class = "invisibleButton" @click="router.push('/Campaign')" :class="{ active: route.path === '/Campaign' }">Home</button>
    <button class = "invisibleButton" @click="router.push('/CampaignRecaps')" :class="{ active: route.path === '/CampaignRecaps' }">Recaps</button>
    <button class = "invisibleButton" @click="router.push('/CampaignMaps')" :class="{ active: route.path === '/CampaignMaps' }">Maps</button>
    <button class = "invisibleButton" @click="router.push('/CampaignCharacters')" :class="{ active: route.path === '/CampaignCharacters' }">Characters</button>
    <button class = "invisibleButton" @click="router.push('/CampaignRules')" :class="{ active: route.path === '/CampaignRules' }">Rules</button>
    <button class = "invisibleButton" @click="router.push('/CampaignMembers')" :class="{ active: route.path === '/CampaignMembers' }">Members</button>
  </nav>

  <div class="campaignPage" v-sound>
    <h2>Aid your players in their quest by keeping them updated on all their adventures</h2>
    
  </div>

</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'


const route = useRoute()
const router = useRouter()

const user = ref([]);

async function loadUser() {
  user.value = await fetchMapFromDatabase();
}

onMounted(() => {
  loadUser();
});

// Get the campaign ID from the URL (/campaign/:id)
const campaignId = route.params.id

// Define reactive state for campaign data
const campaignData = ref(null)

//Fetch campaign info when page loads
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

::v-deep(.modal){
  display:flex;
}



</style>