<template>
  <div class="campaign-page">
    <h1>Welcome to Your Campaign!</h1>
    <p>You’ve entered campaign code:</p>
    <div class="campaign-code">{{ campaignId }}</div>

    <p>
      This is your unique campaign page.  
      Later you can display DM/player content, maps, or character sheets here.
    </p>

  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// get the campaign code from the URL (/campaign/:id)
const campaignId = route.params.id

</script>