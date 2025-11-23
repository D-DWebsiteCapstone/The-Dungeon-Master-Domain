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
    <h2>Document your journey here!</h2>


    <h1>D&D Map Upload</h1>

    <!-- File input -->
    <input type="file" accept="image/*" @change="previewMap">

    <!-- Preview before upload -->
    <div v-if="previewImage" style="margin-top:10px;">
      <p><strong>Preview:</strong></p>
      <img :src="previewImage" style="max-width:400px; border:1px solid #aaa;" />
      <br>
      <button @click="uploadMap" style="margin-top:5px;">Upload Map</button>
    </div>

    <div v-if="error" style="color:red; margin-top:10px;">{{ error }}</div>

    <hr>

    <!-- Display saved map -->
    <h2>Saved Map:</h2>
    <div v-if="mapImage">
      <img :src="mapImage" style="max-width:600px; border:2px solid black;" />
    </div>
    <div v-else>No map saved yet.</div>
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
// Reactive state
const mapImage = ref(null)      // saved map
const previewImage = ref(null)  // selected map before upload
const error = ref(null)
const maxSize = 10 * 1024 * 1024 // 10MB

// Preview map
function previewMap(event) {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > maxSize) {
    error.value = "Image too large. Max 10MB."
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    previewImage.value = e.target.result
    error.value = null
  }
  reader.readAsDataURL(file)
}

// Upload map
async function uploadMap() {
  if (!previewImage.value) {
    error.value = "Please select an image first."
    return
  }

  try {
    const resp = await fetch("https://127.0.0.1:3000/map", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: previewImage.value })
    })

    if (!resp.ok) {
      error.value = "Upload failed."
      return
    }

    previewImage.value = null
    error.value = null
    await fetchMap()
  } catch {
    error.value = "Server unreachable."
  }
}

// Fetch saved map
async function fetchMap() {
  try {
    const resp = await fetch("https://127.0.0.1:3000/map/latest")
    const data = await resp.json()
    mapImage.value = data.image || null
  } catch {
    error.value = "Failed to load saved map."
  }
}

// On mount, fetch current map
onMounted(() => {
  fetchMap()
})
</script>

<style scoped>

::v-deep(.modal){
  display:flex;
}



</style>