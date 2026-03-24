<template>
<nav class="navBar" v-sound>
  <button class="invisibleButton"@click="router.push(`/campaign/${campaignId}`)":class="{ active: route.path === `/campaign/${campaignId}` }">Home</button>
  <button class="invisibleButton"@click="router.push(`/campaign/${campaignId}/maps`)":class="{ active: route.path.includes('/maps') }">Map</button>
  <button class="invisibleButton"@click="router.push(`/campaign/${campaignId}/characters`)":class="{ active: route.path.includes('/characters') }">Characters</button>
  <button class="invisibleButton"@click="router.push(`/campaign/${campaignId}/rules`)":class="{ active: route.path.includes('/rules') }">Rules</button>
  <button class="invisibleButton"@click="router.push(`/campaign/${campaignId}/members`)":class="{ active: route.path.includes('/members') }">Members</button>
</nav>


  <div class="campaignPage" v-sound>
    <h2>Document your travels here</h2>

    <!-- Only show file input and upload button if no map exists -->
    <div v-if="!mapImage">
      <!-- File input for selecting image -->
      <input type="file" accept="image/*" @change="previewMap">

      <!-- Preview before upload -->
      <div v-if="previewImage" style="margin-top:10px;">
        <p><strong>Preview:</strong></p>
        <img :src="previewImage" style="max-width:400px; border:1px solid #aaa;" />
        <br>
        <button @click="uploadMap" style="margin-top:5px;">Upload Map</button>
      </div>
    </div>

    <!-- Display any error messages -->
    <div v-if="error" style="color:red; margin-top:10px;">{{ error }}</div>

    
    <hr>

    <!-- Display saved map with frame and click to view full size -->
    <div v-if="mapImage">
      <div class="mapContainer">
        <img class="mapBorder" src="../assets/images/MapFrame2.png" />
        <div class="tooltip-container">
          <button class="mapButton"
            @mousemove="moveTooltip"
            @mouseenter="showTooltip = true"
            @mouseleave="showTooltip = false"
            ref="hoverButton" @click="showWholeMapModal = true">
              <img class="mapImage" :src="mapImage" @error="handleImageError" @load="handleImageLoad" />
          </button>
          <span class="tooltip-text follow-tooltip" ref="tooltipEl" v-show="showTooltip">Expand Image</span>
        </div>
      </div>
    </div>
    <!-- Show message if no map uploaded yet -->
    <div v-else>No map saved yet.</div>

      
  </div> 

  <!-- Edit button - only shown if map exists -->
  <div class="editButton" v-if="mapImage">
    <button class="parchmentButton" @click="showEditModal = true">Edit Map</button>
  </div>

    <!-- Edit/Replace map popup modal -->
    <div v-if="showEditModal" class="modal">
      <div class="popup">
        <div class="popuptxt">
          <h3>Change Map</h3>
          
          <!-- File input to select new map image -->
          <input type="file" accept="image/*" @change="previewNewMap" ref="fileInput">
          
          <!-- Show preview of newly selected image before replacing -->
          <div v-if="newMapPreview" style="margin-top:10px;">
            <p><strong>New Map Preview:</strong></p>
            <img :src="newMapPreview" style="max-width:300px; border:1px solid #aaa;" />
          </div>
          
          <br>
          <!-- Submit button - replaces map in database -->
          <button class="popupButton" @click="submitMapChange">Submit</button>
          <!-- Cancel button - closes modal without changes -->
          <button class="popupButton" @click="cancelMapChange">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Full-size map modal - shows map at full resolution when clicked -->
    <div v-if="showWholeMapModal" class="modal mapModal">
      <img class="expandedMap" :src="mapImage" @error="handleImageError" @load="handleImageLoad" />
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

// Reactive state variables
const mapImage = ref(null)           // Current saved map from database
const previewImage = ref(null)       // Preview of image before initial upload
const newMapPreview = ref(null)      // Preview of new image in edit modal
const error = ref(null)              // Error message display
const maxSize = 10 * 1024 * 1024     // Maximum file size: 10MB
const isVertical = ref(false)        // Track if image is vertical orientation
const showEditModal = ref(false)     // Controls edit map modal visibility
const showWholeMapModal = ref(false) // Controls full-size map modal visibility
const fileInput = ref(null)          // Reference to file input element

// Frame image URLs for different orientations
const horizontalFrame = new URL('../assets/images/MapFrame.jpg', import.meta.url).href
const verticalFrame = new URL('../assets/images/MapFrameVertical.png', import.meta.url).href

// Load map on component mount
onMounted(() => {
  loadMap()
})

/**
 * Preview selected map before initial upload
 * Validates file size and displays preview
 * @param {Event} event - File input change event
 */
function previewMap(event) {
  const file = event.target.files[0]
  if (!file) return

  // Check if file exceeds maximum size
  if (file.size > maxSize) {
    error.value = "Image too large. Max 10MB."
    return
  }

  // Read file and convert to base64 data URL
  const reader = new FileReader()
  reader.onload = (e) => {
    previewImage.value = e.target.result
    error.value = null

    // Check if image is vertical or horizontal for frame selection
    checkImageOrientation(previewImage.value).then((vertical) => {
      isVertical.value = vertical
    })
  }
  
  reader.readAsDataURL(file)
}

/**
 * Preview newly selected map in edit modal
 * Used when replacing existing map
 * @param {Event} event - File input change event
 */
function previewNewMap(event) {
  const file = event.target.files[0]
  if (!file) return

  // Check if file exceeds maximum size
  if (file.size > maxSize) {
    error.value = "Image too large. Max 10MB."
    return
  }

  // Read file and convert to base64 data URL
  const reader = new FileReader()
  reader.onload = (e) => {
    newMapPreview.value = e.target.result
    error.value = null

    // Check orientation for frame selection
    checkImageOrientation(newMapPreview.value).then((vertical) => {
      isVertical.value = vertical
    })
  }
  
  reader.readAsDataURL(file)
}

/**
 * Upload map image to database
 * Sends base64 image data to backend API
 */
async function uploadMap() {
  if (!previewImage.value) {
    error.value = "Please select an image first."
    return
  }

  try {
    // Get username from localStorage for tracking who uploaded
    const createdBy = localStorage.getItem('username') || 'unknown'
    console.log('[uploadMap] Uploading map for campaign:', campaignId, 'by:', createdBy)

    // POST request to upload endpoint with image data
    const response = await apiFetch(`/data/campaign/${campaignId}/map`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        imageData: previewImage.value,  // Base64 image data
        createdBy: createdBy
      })
    })

    // Handle different error responses
    if (!response.ok) {
      if (response.status === 413) {
        error.value = "Image is too large. Please choose a smaller image (max 50MB)."
      } else if (response.status === 400) {
        error.value = "Invalid image data. Please try again."
      } else {
        error.value = `Upload failed. (Error: ${response.status})`
      }
      console.error('[uploadMap] Upload failed:', response.status)
      return
    }

    const result = await response.json()
    console.log('[uploadMap] Upload successful:', result)
    
    // Clear preview and reload map from database
    previewImage.value = null
    error.value = null
    await loadMap()
  } catch (err) {
    console.error('Upload error:', err)
    error.value = "Server unreachable. Please try again."
  }
}

/**
 * Submit map change from edit modal
 * Deletes existing map(s) then uploads new map to database
 */
async function submitMapChange() {
  if (!newMapPreview.value) {
    error.value = "Please select a new image first."
    return
  }

  try {
    // Get username for tracking
    const createdBy = localStorage.getItem('username') || 'unknown'
    console.log('[submitMapChange] Replacing map for campaign:', campaignId)

    // STEP 1: Delete all existing maps for this campaign
    console.log('[submitMapChange] Deleting old map(s)...')
    const deleteResponse = await apiFetch(`/data/campaign/${campaignId}/map`, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    })

    if (!deleteResponse.ok) {
      console.error('[submitMapChange] Failed to delete old map:', deleteResponse.status)
      // Continue anyway - old map might not exist
    } else {
      console.log('[submitMapChange] Old map(s) deleted successfully')
    }

    // STEP 2: Upload new map
    console.log('[submitMapChange] Uploading new map...')
    const response = await apiFetch(`/data/campaign/${campaignId}/map`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        imageData: newMapPreview.value,  // New base64 image data
        createdBy: createdBy
      })
    })

    // Handle error responses
    if (!response.ok) {
      if (response.status === 413) {
        error.value = "Image is too large. Please choose a smaller image (max 50MB)."
      } else if (response.status === 400) {
        error.value = "Invalid image data. Please try again."
      } else {
        error.value = `Upload failed. (Error: ${response.status})`
      }
      console.error('[submitMapChange] Upload failed:', response.status)
      return
    }

    const result = await response.json()
    console.log('[submitMapChange] Map replaced successfully:', result)
    
    // Clear preview and close modal
    newMapPreview.value = null
    error.value = null
    showEditModal.value = false
    
    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    
    // Reload map to show new image
    await loadMap()
  } catch (err) {
    console.error('Map change error:', err)
    error.value = "Server unreachable. Please try again."
  }
}

/**
 * Cancel map change and close edit modal
 * Clears preview without saving changes
 */
function cancelMapChange() {
  newMapPreview.value = null
  error.value = null
  showEditModal.value = false
  
  // Reset file input if it exists
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

/**
 * Load existing map from database
 * Fetches map for current campaign and displays it
 */
async function loadMap() {
  if (!campaignId) {
    console.warn('[loadMap] No campaignId available')
    return
  }

  try {
    console.log('[loadMap] Fetching map for campaign:', campaignId)
    
    // GET request to retrieve map
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

    // If valid response with map data, set it to display
    if (result.valid && result.map) {
      console.log('[loadMap] Map data found, length:', result.map.length)
      console.log('[loadMap] Map data preview:', result.map.substring(0, 80) + '...')
      mapImage.value = result.map
      console.log('[loadMap] mapImage.value set successfully')
      
      // Check orientation of the loaded map for frame selection
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

/**
 * Check if image is vertical or horizontal orientation
 * Used to select appropriate frame style
 * @param {string} base64 - Base64 encoded image data URL
 * @returns {Promise<boolean>} - True if vertical, false if horizontal
 */
function checkImageOrientation(base64) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img.height > img.width)
    img.src = base64
  })
}

/**
 * Handle image load error
 * Logs error details for debugging
 * @param {Event} event - Image error event
 */
function handleImageError(event) {
  console.error('[Image Error] Failed to load image')
  console.error('[Image Error] src:', event.target.src.substring(0, 100) + '...')
  console.error('[Image Error] mapImage.value:', mapImage.value?.substring(0, 100) + '...')
  error.value = "Failed to display map image"
}

/**
 * Handle successful image load
 * Confirms image loaded properly
 */
function handleImageLoad() {
  console.log('[Image Load] Image loaded successfully!')
}

function changeMap() {
  showEditModal.value = false;
}

const tooltipEl = ref(null);
const hoverButton = ref(null);
const showTooltip = ref(false);

function moveTooltip(event) {
  if (!tooltipEl.value) return;

  const rect = hoverButton.value.getBoundingClientRect();

  // mouse position relative to the button
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  tooltipEl.value.style.left = x + 15 + "px";   // 15px offset
  tooltipEl.value.style.top = y + 15 + "px";
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
  z-index: 0;
}

.mapImage{
  /* position:relative; */
  /* width:100%; 
  height: 100%; */
  z-index: 50;
  width: 690px;
  height: 450px;
  /* object-fit: contain;
  display: block; */
  object-fit: cover;
  object-position:center;
}

.expandedMap {
  max-width:95%;
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

/* Override global tooltip rules for this page only */
:deep(.follow-tooltip) {
  position: absolute !important;
  bottom: auto !important;


  pointer-events: none;
  transform: none !important;
  visibility: visible !important;
  opacity: 1 !important;

  /* Optional: smoother motion */
  transition: none !important;
}


</style>
