<template>
  <div class="campaign-page">
    <h1>Welcome to Your Campaign!</h1>
    <p>You’ve entered campaign code:</p>
    <div class="campaign-code">{{ campaignId }}</div>

    <p class="note">
      This is your unique campaign page.  
      Later you can display DM/player content, maps, or character sheets here.
    </p>

    <button @click="goHome">Return to Home</button>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// get the campaign code from the URL (/campaign/:id)
const campaignId = route.params.id

function goHome() {
  router.push('/Home')
}
</script>

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
  font-size: 1.5rem;
  font-weight: bold;
  padding: 10px 20px;
  border-radius: 8px;
  margin: 1rem 0;
}

button {
  background: #ffe680;
  color: #1e1e2f;
  font-weight: 600;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
}

button:hover {
  background: #ffd633;
}

.note {
  font-size: 1rem;
  opacity: 0.8;
  margin-bottom: 1.5rem;
}
</style>
