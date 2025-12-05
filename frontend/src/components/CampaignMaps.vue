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

    <hr>

    <!-- Display saved map -->
    <h2>Saved Map:</h2>
    <div v-if="mapImage">
      <img :src="mapImage" style="max-width:600px; border:2px solid black;" />
    </div>
    <div v-else>No map saved yet.</div>
  </div>

  <img src="../assets/images/op1.jpg" style="width:90%;"/>

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



</style>
