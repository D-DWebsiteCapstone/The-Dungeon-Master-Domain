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
    <div v-if="mapImage">
      <button class="mapButton" @click="showWholeMapModal = true"><div class="mapContainer">
        <img class="mapBorder" src="../assets/images/MapFrame.jpg" />
        <img class="mapImage" :src="mapImage" @error="handleImageError" @load="handleImageLoad" />
      </div></button>
    </div>
    <div v-else>No map saved yet.</div>


      

  <!-- <h2>Saved Map:</h2>
    <div v-if="mapImage">
      <div class="mapContainer"
      :style="{ borderImageSource: `url(${isVertical ? verticalFrame : horizontalFrame})` }">
        <img class="mapImage" :src="mapImage" @error="handleImageError" @load="handleImageLoad" />
      </div>
    </div>
    <div v-else>No map saved yet.</div> -->

  </div> 

  <div class="editButton">
  <button class="parchmentButton" @click="showEditModal = true">Edit Map</button>
  </div>

    <!--Edit/Remove map popup-->
    <div v-if="showEditModal" class="modal">
      <div class="popup">
        <div class="popuptxt">
          <h3>Change Map</h3>
          <!--DAMIEN can we make this like the edit character popup where 
            you can click on the picture to change it?-->
          <button class="popupButton" @click="changeMap">Submit</button>
          <button class="popupButton" @click="showEditModal = false">Cancel</button>
        </div>
      </div>
    </div>

    <div v-if="showWholeMapModal" class="modal mapModal">
      <img :src="mapImage" @error="handleImageError" @load="handleImageLoad" />
      <button class="popupButton" @click="showWholeMapModal = false">Close</button>
    </div>

</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { apiFetch } from '../lib/api'

const route = useRoute()
const router = useRouter()

const campaignId = route.params.campaignId

// Reactive state
const mapImage = ref(null)      // saved map
const previewImage = ref(null)  // selected map before upload
const error = ref(null)
const maxSize = 10 * 1024 * 1024 // 10MB
const isVertical = ref(false);
const horizontalFrame = new URL('../assets/images/MapFrame.jpg', import.meta.url).href;
const verticalFrame = new URL('../assets/images/MapFrameVertical.png', import.meta.url).href;
const showEditModal = ref(false);
const showWholeMapModal = ref(false);

// Load map on component mount
onMounted(() => {
  loadMap()
});

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

    checkImageOrientation(previewImage.value).then((vertical) => {
      isVertical.value = vertical;
    });
  }
  
  reader.readAsDataURL(file)
}

// Upload map to database
async function uploadMap() {
  if (!previewImage.value) {
    error.value = "Please select an image first."
    return
  }

  try {
    const createdBy = localStorage.getItem('username') || 'unknown'
    console.log('[uploadMap] Uploading map for campaign:', campaignId, 'by:', createdBy) // Debug

    const response = await apiFetch(`/data/campaign/${campaignId}/map`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        imageData: previewImage.value,
        createdBy: createdBy
      })
    })

    if (!response.ok) {
      // Handle different error codes
      if (response.status === 413) {
        error.value = "Image is too large. Please choose a smaller image (max 50MB)."
      } else if (response.status === 400) {
        error.value = "Invalid image data. Please try again."
      } else {
        error.value = `Upload failed. (Error: ${response.status})`
      }
      console.error('[uploadMap] Upload failed:', response.status) // Debug
      return
    }

    const result = await response.json()
    console.log('[uploadMap] Upload successful:', result) // Debug
    previewImage.value = null
    error.value = null
    await loadMap()
  } catch (err) {
    console.error('Upload error:', err)
    error.value = "Server unreachable. Please try again."
  }
}

// Load map from database
async function loadMap() {
  if (!campaignId) {
    console.warn('[loadMap] No campaignId available')
    return
  }

  try {
    console.log('[loadMap] Fetching map for campaign:', campaignId)
    const response = await apiFetch(`/data/campaign/${campaignId}/map`)
    
    console.log('[loadMap] Response status:', response.status)
    console.log('[loadMap] Response ok:', response.ok)

    if (!response.ok) {
      console.error('[loadMap] API returned error status:', response.status)
      error.value = 'Failed to load map'
      return
    }

    const result = await response.json()
    console.log('[loadMap] API response object:', result)
    console.log('[loadMap] result.valid:', result.valid)
    console.log('[loadMap] result.map exists:', !!result.map)
    console.log('[loadMap] result.map type:', typeof result.map)

    if (result.valid && result.map) {
      console.log('[loadMap] Map data found, length:', result.map.length)
      console.log('[loadMap] Map data preview:', result.map.substring(0, 80) + '...')
      mapImage.value = result.map
      console.log('[loadMap] mapImage.value set successfully')
      
      // Check orientation of the loaded map
      checkImageOrientation(result.map).then((vertical) => {
        isVertical.value = vertical
      })
    } else if (result.valid && !result.map) {
      console.log('[loadMap] No map found for this campaign')
      mapImage.value = null
    } else {
      console.error('[loadMap] Invalid response or missing valid flag')
      mapImage.value = null
    }
  } catch (err) {
    console.error('[loadMap] Catch error:', err)
    error.value = "Failed to load map."
  }
}

function checkImageOrientation(base64) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.height > img.width);
    img.src = base64;
  });
}

function handleImageError(event) {
  console.error('[Image Error] Failed to load image')
  console.error('[Image Error] src:', event.target.src.substring(0, 100) + '...')
  console.error('[Image Error] mapImage.value:', mapImage.value?.substring(0, 100) + '...')
  error.value = "Failed to display map image"
}

function handleImageLoad() {
  console.log('[Image Load] Image loaded successfully!')
}

function changeMap() {
  showEditModal.value = false;
}


</script>

<style scoped>

::v-deep(.modal){
  display:flex;
}

.modal.mapModal{
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding-top: 4rem;
  overflow-y: auto;
  backdrop-filter:blur(7px);
  background-color: #00000076;

  button {
    background-color: var(--vt-c-navy);
    border-radius: 10px;
    color: var(--vt-c-gold);
    margin-top:2rem;
  }
}

.mapContainer{
  margin-left:auto;
  margin-right:auto;
  position: relative;
  justify-content: center;
  align-items: center;
  margin-top: 10rem;
  margin-bottom: 8rem;

  width: 700px;
  height: 500px;
  /* height: fit-content; */
  max-width: 1000px;
  /* border: 2px solid bisque; */



  /* Testing with the vertical frame
  aspect-ratio: 3/2;
  width: 69%;
  border-style: solid;
  border-width: 60px;  
  border-image: url('../assets/images/MapFrame.jpg') 130 fill stretch;
  border-image-slice: 130 fill;
  border-image-width: 60px;
  border-image-repeat: stretch;
  padding-top:55px;
  padding-bottom:58px;
  padding-left:53px;
  padding-right:86px; 
  box-sizing: border-box; */ 

}

.mapBorder{
  position:absolute;
  width: 140%;
  top: 0;
  left: 0;
  /* max-width: 1500px; */
  transform: translate(-14.0%, -17.25%);
  z-index: 2;
}

.mapImage{
  /* position:relative; */
  /* width:100%; 
  height: 100%; */
  z-index: 5;
  width: 690px;
  height: 450px;
  /* object-fit: contain;
  display: block; */
  object-fit: cover;
  object-position:center;
}

.mapButton {
  border: none;
  padding: 0;
  background: none;
  cursor: pointer;
  z-index:100;
}

.mapOverlay {
  position: absolute;
  inset: 0;
  background-color: transparent;
  transition: background-color 0.2s ease, backdrop-filter 0.2s ease;
  pointer-events: none; /* let hover pass through to mapImage */
}

.mapImage:hover + .mapOverlay {
  backdrop-filter: blur(3px);
  background-color: #00000066; /* Black w/ opacity */
  z-index: 5;
}

.editButton {
  display:flex;
  justify-content:left;
  padding-left: 60px;
  align-items: center;
  gap: 15px;
}

</style>
