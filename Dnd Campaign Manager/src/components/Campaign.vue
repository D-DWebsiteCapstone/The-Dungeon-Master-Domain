<template>
 <nav class="navBar">
    <button 
      @click="router.push('/campaign')" 
      :class="{ active: route.path === '/campaign' }"
    >
      Home
    </button>

    <button 
      @click="router.push('/Recaps')" 
      :class="{ active: route.path === '/Recaps' }"
    >
      Recaps
    </button>

    <button 
      @click="router.push('/Maps')" 
      :class="{ active: route.path === '/Maps' }"
    >
      Maps
    </button>

    <button 
      @click="router.push('/CampaignCharacters')" 
      :class="{ active: route.path === '/CampaignCharacters' }"
    >
      Characters
    </button>

    <button 
      @click="router.push('/Rules')" 
      :class="{ active: route.path === '/Rules' }"
    >
      Rules
    </button>

    <button 
      @click="router.push('/Members')" 
      :class="{ active: route.path === '/Members' }"
    >
      Members
    </button>
  </nav>

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
.navBar {
  display: flex;
  justify-content: space-evenly; /* Even spacing across the full width */
  background-color: var(--vt-c-red);
  padding: 10px;
  width: 100%;
}

button {
  flex: 1; /* Each button gets equal width */
  margin: 0 5px;
  padding: 10px 0;
  background: transparent;
  border: none;
  color: var(--vt-c-black);
  font-size: 1rem;
  cursor: pointer;
}

button:hover, button.active {
  background-color: rgba(255, 255, 255, 0.2);
  color: var(--vt-c-white);
}

/* Stack vertically on small screens */
@media (max-width: 730px) {
  .navBar {
    flex-direction: column;
    align-items: stretch; /* Makes each button fill full width */
  }

  button {
    width: 100%;
    margin: 5px 0; /* Space between stacked buttons */
  }
}
</style>