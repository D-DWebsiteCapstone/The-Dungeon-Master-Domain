<template>
<nav class="navBar" v-sound>
  <button class="invisibleButton"@click="router.push(`/campaign/${campaignId}`)":class="{ active: route.path === `/campaign/${campaignId}` }">Home</button>
  <button class="invisibleButton"@click="router.push(`/campaign/${campaignId}/recaps`)":class="{ active: route.path.includes('/recaps') }">Recaps</button>
  <button class="invisibleButton"@click="router.push(`/campaign/${campaignId}/maps`)":class="{ active: route.path.includes('/maps') }">Maps</button>
  <button class="invisibleButton"@click="router.push(`/campaign/${campaignId}/characters`)":class="{ active: route.path.includes('/characters') }">Characters</button>
  <button class="invisibleButton"@click="router.push(`/campaign/${campaignId}/rules`)":class="{ active: route.path.includes('/rules') }">Rules</button>
  <button class="invisibleButton"@click="router.push(`/campaign/${campaignId}/members`)":class="{ active: route.path.includes('/members') }">Members</button>
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
const campaignId = route.params.campaignId

// Define reactive state for campaign data
const campaignData = ref(null)

</script>

<style scoped>

::v-deep(.modal){
  display:flex;
}



</style>