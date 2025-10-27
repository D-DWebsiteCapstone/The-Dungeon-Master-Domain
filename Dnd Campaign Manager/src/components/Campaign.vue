<template>
  <div class="campaign-page">
    <h1>Welcome to Your Campaign!</h1>
    <p>Campaign ID:</p>
    <div class="campaign-code">{{ campaign?.id || 'Loading...' }}</div>

    <p>Join Code:</p>
    <div class="campaign-code">{{ campaign?.joinCode || 'Loading...' }}</div>

    <button @click="goHome">Return to Home</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const campaign = ref(null)

onMounted(async () => {
  const id = route.params.id
  const res = await fetch(`http://localhost:3000/data/campaign/id/${id}`)
  const data = await res.json()
  if (data.valid) {
    campaign.value = data.campaign
  } else {
    alert('Campaign not found')
    router.push('/Home')
  }
})
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
