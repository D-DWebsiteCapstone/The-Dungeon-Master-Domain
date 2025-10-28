<template>
  <div class="campaign-page">
    <h1>Welcome to Your Campaign!</h1>
    <p>Campaign ID:</p>
    <div class="campaign-code">{{ campaign?.id || 'Loading...' }}</div>

    <p>
      This is your unique campaign page.  
      Later you can display DM/player content, maps, or character sheets here.
    </p>

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
