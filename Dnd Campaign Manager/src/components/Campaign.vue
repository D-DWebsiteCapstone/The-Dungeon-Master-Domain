<template>
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

    <p class="note">
      This is your unique campaign page.  
      Later you can display DM/player content, maps, or character sheets here.
    </p>

    <button @click="goHome">Return to Home</button>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// get the campaign code from the URL (/campaign/:id)
const campaignId = route.params.id
const campaignData = ref(null)

async function fetchCampaign() {
  try {
    const res = await fetch(`http://localhost:3000/data/campaign/${campaignId}`)
    const result = await res.json()
    if (result.valid && result.campaign) {
      campaignData.value = result.campaign
    } else {
      console.error('Campaign not found:', result)
    }
  } catch (err) {
    console.error('Error loading campaign:', err)
  }
}

function goHome() {
  router.push('/Home')
}

onMounted(() => {
  fetchCampaign()
})

</script>

<style scoped>
<style scoped>
.campaign-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  background: #1e1e2f;
  color: #f0f0f0;
  font-family: 'Cinzel', serif;
  padding: 2rem;
}

.campaign-code {
  background: #2d2d44;
  color: #ffe680;
  font-size: 1.2rem;
  font-weight: bold;
  padding: 8px 16px;
  border-radius: 8px;
  margin: 0.8rem 0;
}

.campaign-details {
  margin-top: 1rem;
  background: #2c2c40;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  max-width: 400px;
}

.join-code {
  background: #3a3a5c;
  color: #ffeb99;
  font-size: 1.4rem;
  font-weight: bold;
  padding: 8px 20px;
  border-radius: 8px;
  margin: 0.5rem 0 1rem 0;
  letter-spacing: 1px;
}

button {
  background: #ffe680;
  color: #1e1e2f;
  font-weight: 600;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 1.5rem;
}

button:hover {
  background: #ffd633;
}

.note {
  font-size: 1rem;
  opacity: 0.85;
  margin-top: 1rem;
}

</style>