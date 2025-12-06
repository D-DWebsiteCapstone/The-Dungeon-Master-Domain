<template>
<nav class="navBar" v-sound>
  <button class="invisibleButton"@click="router.push(`/campaign/${campaignId}`)":class="{ active: route.path === `/campaign/${campaignId}` }">Home</button>
  <button class="invisibleButton"@click="router.push(`/campaign/${campaignId}/recaps`)":class="{ active: route.path.includes('/recaps') }">Recaps</button>
  <button class="invisibleButton"@click="router.push(`/campaign/${campaignId}/maps`)":class="{ active: route.path.includes('/maps') }">Map</button>
  <button class="invisibleButton"@click="router.push(`/campaign/${campaignId}/characters`)":class="{ active: route.path.includes('/characters') }">Characters</button>
  <button class="invisibleButton"@click="router.push(`/campaign/${campaignId}/rules`)":class="{ active: route.path.includes('/rules') }">Rules</button>
  <button class="invisibleButton"@click="router.push(`/campaign/${campaignId}/members`)":class="{ active: route.path.includes('/members') }">Members</button>
</nav>


  <div class="campaignPage" v-sound>
    <h2>Document your travels here</h2>


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

    <div class="mapContainer">
      <img class="mapBorder" src="../assets/images/MapFrame.jpg" />
      <img class="mapImage" src="../assets/images/Boo.png" />
    </div>
    
    
    <hr>

    <!-- Display saved map -->
    <h2>Saved Map:</h2>
    <div v-if="mapImage">
      <div class="mapContainer">
        <img class="mapBorder" src="../assets/images/MapFrame.jpg" />
        <img class="mapImage" :src="mapImage" />
      </div>
    </div>
    <div v-else>No map saved yet.</div>
  </div>


</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { apiFetch } from '../lib/api'

const route = useRoute()
const router = useRouter()

const campaignId = route.params.campaignId

const user = ref([]);

async function loadUser() {
  user.value = await fetchMapFromDatabase();
}

onMounted(() => {
  loadUser();
});

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
    const resp = await apiFetch("/map", {
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
    const resp = await apiFetch("/map/latest")
    const data = await resp.json()
    mapImage.value = data.image || null
  } catch {
    error.value = "Failed to load saved map."
  }
}

</script>

<style scoped>

::v-deep(.modal){
  display:flex;
}

.mapContainer{
  margin-left:auto;
  margin-right:auto;
  position: relative;
  justify-content: center;
  align-items: center;
  /* height: fit-content; */
  margin-top: 8rem;
  margin-bottom: 5rem;
  /* width: 70%;
  height: 70vh;
  max-height: 500px; */
  aspect-ratio: 3/2;
  width: 69%;
  /* max-width: 1000px; */
  border: 2px solid bisque;
}

.mapBorder{
  position:absolute;
  width: 144%;
  top: 0;
  left: 0;
  /* max-width: 1500px; */
  transform: translate(-15.25%, -17.25%);
  z-index: 2;
}

.mapImage{
  position:relative;
  /* max-width: 230px;
  max-height: 600px;
  margin-top: 0.75rem; */
  z-index: 1;
  object-fit: cover;
  object-position:center;
}

</style>
