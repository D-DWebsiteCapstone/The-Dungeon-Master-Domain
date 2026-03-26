<template>
  <!-- <nav class="navBar" v-sound>
    <button class="invisibleButton" @click="router.push(`/campaign/${campaignId}`)" :class="{ active: route.path === `/campaign/${campaignId}` }">Home</button>
    <button class="invisibleButton" @click="router.push(`/campaign/${campaignId}/recaps`)" :class="{ active: route.path.includes('/recaps') }">Recaps</button>
    <button class="invisibleButton" @click="router.push(`/campaign/${campaignId}/maps`)" :class="{ active: route.path.includes('/maps') }">Map</button>
    <button class="invisibleButton" @click="router.push(`/campaign/${campaignId}/characters`)" :class="{ active: route.path.includes('/characters') }">Characters</button>
    <button class="invisibleButton" @click="router.push(`/campaign/${campaignId}/rules`)" :class="{ active: route.path.includes('/rules') }">Rules</button>
    <button class="invisibleButton" @click="router.push(`/campaign/${campaignId}/members`)" :class="{ active: route.path.includes('/members') }">Members</button>

    <button class="invisibleButton"
  @click="router.push(`/campaign/${campaignId}/npcs`)"
  :class="{ active: route.path.includes('/npcs') }">NPCs</button>

  </nav> -->

  <CampaignMenu :campaignId="campaignId" />

  <div class="campaignPage" v-sound>
    <h2>Document your travels here</h2>

    <!-- Loading state -->
    <div v-if="loading" class="loading">Loading maps...</div>

    <!-- Error message -->
    <div v-if="error" class="error-msg">{{ error }}</div>

    <!-- Empty state -->
    <div v-else-if="!loading && allMaps.length === 0" class="emptyState">
      <p>No maps saved yet.</p>
      <button class="btn btn-primary" @click="showUploadModal = true">Upload First Map</button>
    </div>

    <!-- Maps display -->
    <div v-else-if="allMaps.length > 0">

      <!-- ADD NEW MAP BUTTON -->
      <div class="add-map-row" v-if="isDM">
        <button class="btn btn-primary btn-large" @click="showUploadModal = true" >
          ➕ ADD NEW MAP
        </button>
      </div>

      <!-- Main map display -->
      <div class="mainMapSection">
        <!-- Map frame + image stacked properly -->
        <div class="mapWrapper">
          <img class="mapBorder" :src="isVertical ? verticalFrame : horizontalFrame" alt="map frame" />
          <button class="mapClickArea" @click="showWholeMapModal = true" title="Click to enlarge">
            <img class="mapImage" :src="currentMapImage" @load="checkOrientation" alt="campaign map" />
          </button>
        </div>

        <!-- Map info + action buttons — OUTSIDE the frame stack, no z-index conflict -->
        <div class="mapInfo" v-if="currentMap">
          <p><strong>Uploaded by:</strong> {{ currentMap.createdBy }}</p>
          <p><strong>Uploaded on:</strong> {{ formatDate(currentMap.created_at) }}</p>
          <div class="mapActions" v-if="isDM">
            <button class="btn btn-edit" @click="openEditModal(currentMap)">✏️ Edit Map</button>
            <button class="btn btn-delete" @click="confirmDeleteMap(currentMap.id)">🗑️ Delete Map</button>
          </div>
        </div>
      </div>

      <!-- Thumbnail gallery -->
      <div v-if="allMaps.length > 1" class="thumbnailSection">
        <h3 class="gallery-title">All Maps</h3>
        <div class="thumbnailGrid">
          <div
            v-for="(map, index) in allMaps"
            :key="map.id"
            class="thumbnail"
            :class="{ selected: selectedMapIndex === index }"
            @click="selectMap(index)"
          >
            <img :src="map.map" class="thumbnail-img" alt="map thumbnail" />
            <div class="thumbnail-date">{{ formatDateShort(map.created_at) }}</div>
            <div class="thumbnail-actions" v-if="isDM">
              <button class="thumb-btn thumb-edit" @click.stop="openEditModal(map)" title="Edit">✏️</button>
              <button class="thumb-btn thumb-delete" @click.stop="confirmDeleteMap(map.id)" title="Delete">🗑️</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ============ UPLOAD MODAL ============ -->
  <Teleport to="body">
    <div v-if="showUploadModal" class="modal-backdrop" @click.self="closeUploadModal">
      <div class="modal-box">
        <h3 class="modal-title">Upload New Map</h3>
        <input type="file" accept="image/*" @change="handleUploadFile" ref="uploadInput" class="file-input" />
        <div v-if="uploadPreview" class="preview-wrap">
          <img :src="uploadPreview" class="preview-img" alt="preview" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-cancel" @click="closeUploadModal">Cancel</button>
          <button class="btn btn-primary" @click="uploadMap" :disabled="!uploadPreview">Upload</button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- ============ EDIT MODAL ============ -->
  <Teleport to="body">
    <div v-if="showEditModal" class="modal-backdrop" @click.self="closeEditModal">
      <div class="modal-box">
        <h3 class="modal-title">Edit Map</h3>
        <div v-if="editingMap" class="preview-wrap">
          <img :src="editPreview || editingMap.map" class="preview-img" alt="current map" />
        </div>
        <p class="modal-hint">Select a new image to replace the current map:</p>
        <input type="file" accept="image/*" @change="handleEditFile" ref="editInput" class="file-input" />
        <div class="modal-actions">
          <button class="btn btn-cancel" @click="closeEditModal">Cancel</button>
          <button class="btn btn-primary" @click="updateMap">Save Changes</button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- ============ DELETE MODAL ============ -->
  <Teleport to="body">
    <div v-if="showDeleteModal" class="modal-backdrop" @click.self="closeDeleteModal">
      <div class="modal-box modal-danger">
        <h3 class="modal-title danger-title">Delete Map</h3>
        <p class="modal-body-text">Are you sure you want to delete this map? This cannot be undone.</p>
        <div class="modal-actions">
          <button class="btn btn-cancel" @click="closeDeleteModal">Cancel</button>
          <button class="btn btn-delete" @click="deleteMap">Delete</button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- ============ FULLSCREEN MODAL ============ -->
  <Teleport to="body">
    <div v-if="showWholeMapModal" class="modal-backdrop fullscreen-backdrop" @click="showWholeMapModal = false">
      <img :src="currentMapImage" class="fullscreen-img" alt="full map" />
      <p class="fullscreen-hint">Click anywhere to close</p>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiFetch } from '../lib/api'

import CampaignMenu from './CampaignMenus.vue'

const route = useRoute()
const router = useRouter()
const campaignId = route.params.campaignId

// State
const allMaps = ref([])
const selectedMapIndex = ref(0)
const loading = ref(true)
const error = ref('')
const isVertical = ref(false)

// Modal states
const showUploadModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showWholeMapModal = ref(false)

// File handling
const uploadInput = ref(null)
const editInput = ref(null)
const uploadPreview = ref(null)
const editPreview = ref(null)
const editingMap = ref(null)
const mapToDelete = ref(null)

// Frames
const horizontalFrame = new URL('../assets/images/MapFrame.jpg', import.meta.url).href
const verticalFrame = new URL('../assets/images/MapFrameVertical.png', import.meta.url).href

// Computed
const currentMap = computed(() => allMaps.value[selectedMapIndex.value] ?? null)
const currentMapImage = computed(() => currentMap.value?.map ?? null)



const isDM = ref(false)
const members = ref([])


onMounted(loadMaps)

const checkIfDm = async()=>{
  try {
    const res = await apiFetch(`/data/campaign/${campaignId}/members`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    })

    const result = await res.json()

    if (result.valid) {
      members.value = result.members

      // Determine if CURRENT USER is DM
      const currentUserId = JSON.parse(atob(localStorage.getItem("authToken").split(".")[1])).id
      const me = result.members.find(m => m.userId === currentUserId)
      console.log(me)
      isDM.value = me?.role == "DM"
      console.log(isDM)
    } else {
      members.value = []
    }
  } catch (e) {
    console.error("Failed to load campaign members:", e)
  }
}

async function resolveCampaignFromMap(req, res, next) {
  try {
    const { mapId } = req.params

    if (!mapId) {
      return res.status(400).json({ valid: false, message: 'mapId required' })
    }

    const map = await getMapById(mapId)

    if (!map) {
      return res.status(404).json({ valid: false, message: 'Map not found' })
    }

    // inject campaignId so ensureDM can use it
    req.params.campaignId = map.campaign

    next()
  } catch (err) {
    console.error('resolveCampaignFromMap error:', err)
    res.status(500).json({ valid: false })
  }
}


async function loadMaps() {
  await checkIfDm();
  loading.value = true
  error.value = ''
  try {
    const token = localStorage.getItem('authToken')
    if (!token) { error.value = 'Please log in'; loading.value = false; return }

    const res = await apiFetch(`/data/campaign/${campaignId}/maps`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to load')

    const data = await res.json()
    if (data.valid && data.maps?.length) {
      allMaps.value = data.maps
      selectedMapIndex.value = 0
      checkOrientation()
    } else {
      allMaps.value = []
    }
  } catch (err) {
    console.error(err)
    error.value = 'Failed to load maps'
  } finally {
    loading.value = false
  }
}

function selectMap(index) {
  selectedMapIndex.value = index
  checkOrientation()
}

function checkOrientation() {
  if (!currentMapImage.value) return
  const img = new Image()
  img.onload = () => { isVertical.value = img.height > img.width }
  img.src = currentMapImage.value
}

// ---- Upload ----
function handleUploadFile(e) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 10 * 1024 * 1024) { error.value = 'File too large (max 10MB)'; return }
  const reader = new FileReader()
  reader.onload = (ev) => { uploadPreview.value = ev.target.result }
  reader.readAsDataURL(file)
}

async function uploadMap() {
  if (!uploadPreview.value) { error.value = 'Please select an image'; return }
  try {
    const token = localStorage.getItem('authToken')
    const username = localStorage.getItem('username') || 'unknown'
    const res = await apiFetch(`/data/campaign/${campaignId}/map`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ imageData: uploadPreview.value, createdBy: username })
    })
    if (!res.ok) throw new Error('Upload failed')
    await loadMaps()
    closeUploadModal()
  } catch (err) {
    console.error(err); error.value = 'Upload failed'
  }
}

function closeUploadModal() {
  showUploadModal.value = false
  uploadPreview.value = null
  if (uploadInput.value) uploadInput.value.value = ''
}

// ---- Edit ----
function openEditModal(map) {
  editingMap.value = map
  editPreview.value = null
  showEditModal.value = true
}

function handleEditFile(e) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 10 * 1024 * 1024) { error.value = 'File too large (max 10MB)'; return }
  const reader = new FileReader()
  reader.onload = (ev) => { editPreview.value = ev.target.result }
  reader.readAsDataURL(file)
}

async function updateMap() {
  if (!editingMap.value) return
  if (!editPreview.value) { closeEditModal(); return }
  try {
    const token = localStorage.getItem('authToken')
    const res = await apiFetch(`/data/map/${editingMap.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ imageData: editPreview.value })
    })
    if (!res.ok) throw new Error('Update failed')
    await loadMaps()
    closeEditModal()
  } catch (err) {
    console.error(err); error.value = 'Update failed'
  }
}

function closeEditModal() {
  showEditModal.value = false
  editingMap.value = null
  editPreview.value = null
  if (editInput.value) editInput.value.value = ''
}

// ---- Delete ----
function confirmDeleteMap(id) {
  mapToDelete.value = id
  showDeleteModal.value = true
}

async function deleteMap() {
  if (!mapToDelete.value) return
  try {
    const token = localStorage.getItem('authToken')
    const res = await apiFetch(`/data/map/${mapToDelete.value}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Delete failed')
    // If we deleted the selected map, reset index
    if (selectedMapIndex.value >= allMaps.value.length - 1) {
      selectedMapIndex.value = Math.max(0, allMaps.value.length - 2)
    }
    await loadMaps()
    closeDeleteModal()
  } catch (err) {
    console.error(err); error.value = 'Delete failed'
  }
}

function closeDeleteModal() {
  showDeleteModal.value = false
  mapToDelete.value = null
}

// ---- Formatting ----
function formatDate(d) {
  if (!d) return 'Unknown'
  return new Date(d).toLocaleString()
}
function formatDateShort(d) {
  if (!d) return 'Unknown'
  return new Date(d).toLocaleDateString()
}
</script>

<style scoped>
/* =====================
   MAP WRAPPER — the key fix
   The frame image is purely decorative and must NEVER intercept pointer events.
   The clickable map image and action buttons live ABOVE it.
   ===================== */
.mainMapSection {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
}

.mapWrapper {
  position: relative;
  width: 700px;
  height: 500px;
  max-width: 95vw;
  /* leave extra room so the decorative frame overflow doesn't cause scroll issues */
  margin-top: 5rem;
  margin-bottom: 2rem;
}

/* Decorative border — purely visual, never blocks clicks */
.mapBorder {
  position: absolute;
  width: 140%;
  top: 0;
  left: 0;
  transform: translate(-14%, -17.25%);
  z-index: 0;           /* behind everything */
  pointer-events: none; /* NEVER intercept clicks */
  user-select: none;
}

/* Clickable map area — sits above the frame */
.mapClickArea {
  position: absolute;
  inset: 0;
  z-index: 2;           /* above frame */
  border: none;
  padding: 0;
  background: none;
  cursor: zoom-in;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.mapImage {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

/* Map info + buttons — outside the stacking context of mapWrapper entirely */
.mapInfo {
  position: relative;
  z-index: 10;
  text-align: center;
  color: #fff;
  margin-top: 1rem;
  margin-bottom: 2rem;
}

.mapInfo p {
  margin: 0.4rem 0;
}

.mapActions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 14px;
}

/* =====================
   ADD MAP ROW
   ===================== */
.add-map-row {
  display: flex;
  justify-content: center;
  margin: 20px 0 0;
}

/* =====================
   BUTTONS
   ===================== */
.btn {
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.95rem;
  padding: 9px 22px;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
}

.btn:active:not(:disabled) {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary  { background: #c0a86a; color: #1a1a1a; }
.btn-primary:hover:not(:disabled)  { background: #d4b87a; }

.btn-edit     { background: #4a90e2; color: #fff; }
.btn-edit:hover:not(:disabled)     { background: #5a9ef2; }

.btn-delete   { background: #e04444; color: #fff; }
.btn-delete:hover:not(:disabled)   { background: #f05555; }

.btn-cancel   { background: #555; color: #fff; }
.btn-cancel:hover:not(:disabled)   { background: #666; }

.btn-large { font-size: 1.1rem; padding: 12px 30px; }

/* =====================
   THUMBNAILS
   ===================== */
.thumbnailSection {
  margin: 2rem 0;
}

.gallery-title {
  color: #c0a86a;
  text-align: center;
  margin-bottom: 1rem;
}

.thumbnailGrid {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

.thumbnail {
  width: 120px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  position: relative;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.thumbnail:hover { transform: translateY(-3px); }
.thumbnail.selected { border-color: #c0a86a; }

.thumbnail-img {
  width: 100%;
  height: 90px;
  object-fit: cover;
  display: block;
}

.thumbnail-date {
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  font-size: 0.65rem;
  padding: 3px 5px;
  text-align: center;
}

.thumbnail-actions {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  gap: 3px;
  /* always visible, not hidden behind anything */
  z-index: 5;
}

.thumb-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.85;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.thumb-btn:hover { opacity: 1; transform: scale(1.1); }

.thumb-edit   { background: #4a90e2; color: #fff; }
.thumb-delete { background: #e04444; color: #fff; }

/* =====================
   MODALS — use Teleport so they escape all stacking contexts
   ===================== */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.88);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999; /* nuclear option — nothing sits above this */
}

.modal-box {
  background: #242424;
  border: 2px solid #c0a86a;
  border-radius: 14px;
  padding: 30px;
  max-width: 480px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
}

.modal-danger { border-color: #e04444; }

.modal-title {
  color: #c0a86a;
  text-align: center;
  margin: 0 0 20px;
  font-size: 1.25rem;
}

.danger-title { color: #e04444; }

.modal-body-text {
  color: #ddd;
  text-align: center;
  margin: 1rem 0;
  line-height: 1.5;
}

.modal-hint {
  color: #aaa;
  font-size: 0.85rem;
  margin: 8px 0 4px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 22px;
}

.file-input {
  width: 100%;
  margin: 14px 0 4px;
  color: #ccc;
  font-size: 0.9rem;
}

.preview-wrap {
  text-align: center;
  margin: 12px 0;
}

.preview-img {
  max-width: 100%;
  max-height: 200px;
  border: 2px solid #c0a86a;
  border-radius: 8px;
  object-fit: contain;
}

/* =====================
   FULLSCREEN
   ===================== */
.fullscreen-backdrop {
  flex-direction: column;
  gap: 12px;
  cursor: zoom-out;
}

.fullscreen-img {
  max-width: 95vw;
  max-height: 90vh;
  object-fit: contain;
  border: 3px solid #c0a86a;
  border-radius: 10px;
}

.fullscreen-hint {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
}

/* =====================
   STATES
   ===================== */
.loading, .emptyState {
  text-align: center;
  padding: 3rem;
  color: #fff;
  font-size: 1.1rem;
}

.emptyState {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 15px;
  border: 2px dashed #c0a86a;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
  max-width: 400px;
  margin: 4rem auto;
}

.error-msg {
  color: #ff6666;
  background: rgba(255, 68, 68, 0.1);
  border: 1px solid #ff4444;
  border-radius: 8px;
  padding: 0.75rem 1.25rem;
  text-align: center;
  max-width: 500px;
  margin: 1rem auto;
}

/* =====================
   RESPONSIVE
   ===================== */
@media (max-width: 768px) {
  .mapWrapper {
    width: 100%;
    height: auto;
    aspect-ratio: 7 / 5;
    margin-top: 4rem;
  }

  .mapBorder {
    width: 120%;
    transform: translate(-12%, -20%);
  }
}
</style>