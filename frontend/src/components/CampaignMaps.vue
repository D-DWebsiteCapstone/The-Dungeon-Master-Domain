<template>
  <div class="layout">
    <CampaignMenu :campaignId="campaignId" />
  
    <div class="campaignPage" v-sound>
      <h2>Document your travels here</h2>
  
      <!-- Loading state -->
      <div v-if="loading" class="loading">Loading maps...</div>
  
      <!-- Error message -->
      <div v-if="error" class="error-msg">{{ error }}</div>
  
      <!-- DM: empty state -->
      <div v-else-if="!loading && allMaps.length === 0 && isDM" class="emptyState">
        <p>No maps saved yet.</p>
        <button class="parchmentButton" @click="showUploadModal = true">Upload First Map</button>
      </div>
  
      <!-- Player: no default map state (DND-50) -->
      <div v-else-if="!loading && !isDM && !defaultMap" class="emptyState">
        <p>No map has been shared yet.</p>
      </div>
  
      <!-- Player view: default map only (DND-51) -->
      <div v-else-if="!loading && !isDM && defaultMap">
        <div class="mainMapSection">
          <div class="mapWrapper">
            <img class="mapBorder" :src="isVertical ? verticalFrame : horizontalFrame" alt="map frame" />
            <button class="mapClickArea" @click="showWholeMapModal = true" title="Click to enlarge">
              <img class="mapImage" :src="formatMap(defaultMap.map)" @load="checkOrientationOf(defaultMap)" alt="campaign map" />
            </button>
          </div>
          <div class="mapInfo">
            <p><strong>Shared by:</strong> {{ defaultMap.createdBy }}</p>
            <p><strong>Updated:</strong> {{ formatDate(defaultMap.created_at) }}</p>
          </div>
        </div>
      </div>
  
      <!-- DM view: full management (DND-49, DND-50, DND-51) -->
      <div v-else-if="!loading && isDM && allMaps.length > 0">
  
        <!-- DM action buttons -->
        <div class="add-map-row">
          <button class="parchmentButton" @click="showUploadModal = true">
            ADD NEW MAP
          </button>
          <button v-if="defaultMap" class="btn btn-warning" @click="clearDefault">
            🗺️ Clear Default Map
          </button>
        </div>
  

        <!-- TEST FRAME -->
        <div class="map-frame">

          <img class="map" :src="currentMapImage" alt="campaign map" />

          <div class="frame">
            <div class="corner tl"></div>
            <div class="corner tr"></div>
            <div class="corner bl"></div>
            <div class="corner br"></div>

            <div class="edge top"></div>
            <div class="edge bottom"></div>
            <div class="edge left"></div>
            <div class="edge right"></div>
          </div>
        </div>




        <!-- Main map display  -->
        <div class="mainMapSection">
          <!--<div class="mapWrapper">
            <img class="mapBorder" :src="isVertical ? verticalFrame : horizontalFrame" alt="map frame" />
            <button class="mapClickArea" @click="showWholeMapModal = true" title="Click to enlarge">
              <img class="mapImage" :src="currentMapImage" @load="checkOrientation" alt="campaign map" />
            </button>
          </div>-->
  
          <div class="mapInfo" v-if="currentMap">
            <!-- Default badge (DND-49) -->
            <div class="default-badge" :class="{ active: currentMap.isDefault }">
              {{ currentMap.isDefault ? '⭐ Default Map — visible to players' : '👁️ Not default — players cannot see this' }}
            </div>
  
            <p><strong>Uploaded by:</strong> {{ currentMap.createdBy }}</p>
            <p><strong>Uploaded on:</strong> {{ formatDate(currentMap.created_at) }}</p>
  
            <div class="mapActions">
              <!-- Set as default (DND-49) -->
              <button
                v-if="!currentMap.isDefault"
                class="btn btn-star"
                @click="setAsDefault(currentMap)"
              >⭐ Set as Default</button>
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
              :class="{ selected: selectedMapIndex === index, isDefault: map.isDefault }"
              @click="selectMap(index)"
            >
              <img :src="formatMap(map.map)" class="thumbnail-img" alt="map thumbnail" />
              <div class="thumbnail-date">{{ formatDateShort(map.created_at) }}</div>
              <div v-if="map.isDefault" class="thumbnail-default-badge">⭐</div>
              <div class="thumbnail-actions">
                <button class="thumb-btn thumb-star" @click.stop="setAsDefault(map)" title="Set as default">⭐</button>
                <button class="thumb-btn thumb-edit" @click.stop="openEditModal(map)" title="Edit">✏️</button>
                <button class="thumb-btn thumb-delete" @click.stop="confirmDeleteMap(map.id)" title="Delete">🗑️</button>
              </div>
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
          <!-- DND-49: option to set as default on upload -->
          <label class="default-checkbox">
            <input type="checkbox" v-model="uploadAsDefault" />
            Set as default map (visible to players)
          </label>
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
            <img :src="editPreview || formatMap(editingMap.map)" class="preview-img" alt="current map" />
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
        <img :src="currentMapImage || formatMap(defaultMap?.map)" class="fullscreen-img" alt="full map" />
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
  const isDM = ref(false)
  const members = ref([])
  const uploadAsDefault = ref(false)
  
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
  const horizontalFrame = new URL('../assets/images/mapFrames/MapFrame.png', import.meta.url).href
  const verticalFrame = new URL('../assets/images/mapFrames/MapFrameVertical.png', import.meta.url).href
  
  // Computed
  const currentMap = computed(() => allMaps.value[selectedMapIndex.value] ?? null)
  const currentMapImage = computed(() => currentMap.value ? formatMap(currentMap.value.map) : null)
  
  // DND-49: computed default map
  const defaultMap = computed(() => allMaps.value.find(m => m.isDefault) ?? null)
  
  onMounted(async () => {
    await checkIfDm()
    await loadMaps()
  })
  
  // ── DM check ──
  const checkIfDm = async () => {
    try {
      const res = await apiFetch(`/data/campaign/${campaignId}/members`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      })
      const result = await res.json()
      if (result.valid) {
        members.value = result.members
        const currentUserId = JSON.parse(atob(localStorage.getItem('authToken').split('.')[1])).id
        const me = result.members.find(m => m.userId === currentUserId)
        isDM.value = me?.role === 'DM'
      } else {
        members.value = []
      }
    } catch (e) {
      console.error('Failed to load campaign members:', e)
    }
  }

  
  // ── Load maps ──
  async function loadAllMaps() {
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
        // Sort: default first so it's always index 0
        allMaps.value = [...data.maps].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))
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

  async function loadMaps() {

    if(isDM.value)
    {
      await loadAllMaps();
    } else {

      loading.value = true
      error.value = ''
      try {
        const token = localStorage.getItem('authToken')
        if (!token) { error.value = 'Please log in'; loading.value = false; return }
    
        const res = await apiFetch(`/data/campaign/${campaignId}/defaultmap`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Failed to load')
    
        const data = await res.json()
        if (data.valid && data.maps?.length) {
          // Sort: default first so it's always index 0
          allMaps.value = [...data.maps].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))
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

  }

  
  // ── Format base64 map ──
  function formatMap(raw) {
    if (!raw) return ''
    if (typeof raw === 'string' && (raw.startsWith('data:') || raw.startsWith('http'))) return raw
    return `data:image/png;base64,${raw}`
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
  
  function checkOrientationOf(map) {
    if (!map?.map) return
    const img = new Image()
    img.onload = () => { isVertical.value = img.height > img.width }
    img.src = formatMap(map.map)
  }
  
  // ── DND-49: Set default map ──
  async function setAsDefault(map) {
    try {
      const token = localStorage.getItem('authToken')
      const res = await apiFetch(`/data/campaign/${campaignId}/maps/default/${map.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error()
      await loadMaps()
    } catch {
      error.value = 'Failed to set default map'
    }
  }
  
  // ── DND-50: Clear default (no-map state) ──
  async function clearDefault() {
    try {
      const token = localStorage.getItem('authToken')
      const res = await apiFetch(`/data/campaign/${campaignId}/maps/default`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error()
      await loadMaps()
    } catch {
      error.value = 'Failed to clear default map'
    }
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
        body: JSON.stringify({
          imageData: uploadPreview.value,
          createdBy: username,
          isDefault: uploadAsDefault.value  // DND-49: pass default flag
        })
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
    uploadAsDefault.value = false
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
  .layout {
    display: flex;
    align-items: flex-start;
  }
  .campaignPage {
    flex: 1;
    min-width: 0;
  }

.map-frame {
  --frame: clamp(72px, 6vw, 116px);

  --edge-h: calc(var(--frame) * 0.31);
  --edge-v: calc(var(--frame) * 0.54);

  --overhang-x: calc(var(--frame) * 0.6);
  --overhang-y: calc(var(--frame) * 0.43);

  --corner-offset-x: calc(var(--frame) * 0.06);
  --corner-offset-y: calc(var(--frame) * 0.1175);

  position: relative;
  display: inline-block;

  margin: 4rem 3rem 0 3rem;

}


/* ================= MAP ================= */
.map {  
  display: block;
  width: 100%;
  max-width: 800px;
  height: auto;

}

/* ================= FRAME LAYER ================= */
.frame {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
}

/* ================= CORNERS ================= */
.corner {
  position: absolute;
  width: var(--frame);
  height: var(--frame);
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

/* These intentionally sit OUTSIDE box */
.corner.tl {
  top: calc(-1 * var(--overhang-y));
  left: calc(-1 * var(--overhang-x));
  background-image: url('../assets/images/mapFrames/corner-tl.png');
}

.corner.tr {
  top: calc(-1 * var(--overhang-y));
  right: calc(-1 * var(--overhang-x));
  background-image: url('../assets/images/mapFrames/corner-tr.png');
}

.corner.bl {
  bottom: calc(-1 * var(--overhang-y));
  left: calc(-1 * var(--overhang-x));
  background-image: url('../assets/images/mapFrames/corner-bl.png');
}

.corner.br {
  bottom: calc(-1 * var(--overhang-y));
  right: calc(-1 * var(--overhang-x));
  background-image: url('../assets/images/mapFrames/corner-br.png');
}

/* ================= EDGES ================= */
.edge {
  position: absolute;
}

/* edges DO NOT push content, they overlay */
.edge.top {
  top: calc(-1 * var(--overhang-y) + var(--corner-offset-y));
  left: calc(var(--frame) - var(--overhang-x));
  right: calc(var(--frame) - var(--overhang-x));
  height: var(--edge-h);
  filter: brightness(0.9);
  background: url('../assets/images/mapFrames/edge-top.png');
  background-repeat: repeat-x;
  background-size: auto 100%;
}

.edge.bottom {
  bottom: calc(-1 * var(--overhang-y) + var(--corner-offset-y));
  left: calc(var(--frame) - var(--overhang-x));
  right: calc(var(--frame) - var(--overhang-x));
  height: var(--edge-h);
  filter: brightness(0.9);
  background: url('../assets/images/mapFrames/edge-bottom.png');
  background-repeat: repeat-x;
  background-size: auto 100%;
}

.edge.left {
  top: calc(var(--frame) - var(--overhang-y));
  bottom: calc(var(--frame) - var(--overhang-y));
  left: calc(-1 * var(--overhang-x) + var(--corner-offset-x));
  width: var(--edge-v);
  background: url('../assets/images/mapFrames/edge-left.png');
  background-repeat: repeat-y;
  background-size: 100% auto;
}

.edge.right {
  top: calc(var(--frame) - var(--overhang-y));
  bottom: calc(var(--frame) - var(--overhang-y));
  right: calc(-1 * var(--overhang-x) + var(--corner-offset-x));
  width: var(--edge-v);
  background: url('../assets/images/mapFrames/edge-right.png');
  background-repeat: repeat-y;
  background-size: 100% auto;
}
 
  
  .mainMapSection {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 2rem;
    /* overflow-y: auto;
    backdrop-filter: blur(7px);
    background-color: #00000076; */
  
    button {
      background-color: var(--vt-c-navy);
      border-radius: 10px;
      color: var(--vt-c-gold);
      margin-top: 1.25rem;
    }
  }
  
  .mapWrapper {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: auto;
    aspect-ratio: 7/5;
    max-width: 85vw;
    margin-top: 1rem;
    margin-bottom: 2rem;
  }
  
  .mapBorder {
    position: absolute;
    max-width: 135%;
    top: 40px; left: 20px;
    transform: translate(-14%, -17.25%);
    z-index: 1;
    pointer-events: none;
    user-select: none;
  }
  
  .mapClickArea {
    position: absolute;
    inset: 0;
    z-index: 0;
    border: none;
    padding: 0;
    background: none;
    cursor: zoom-in;
    max-width: 94%;
    max-height: 90%;
    overflow: hidden;
  }
  
  .mapImage {
    width: 100%;
    height: 100%;
    aspect-ratio: 7 / 5;
    object-fit: contain;
    object-position: center;
    /* display: block; */
  }
  
  .mapInfo {
    position: relative;
    z-index: 10;
    text-align: center;
    color: #fff;
    margin-top: 1rem;
    margin-bottom: 2rem;
  }
  
  .mapInfo p { margin: 0.4rem 0; }
  
  /* DND-49: default badge */
  .default-badge {
    display: inline-block;
    padding: 4px 14px;
    border-radius: 20px;
    font-size: 0.82rem;
    margin-bottom: 0.75rem;
    background: rgba(255,255,255,0.05);
    border: 1px solid #555;
    color: #888;
    transition: all 0.2s;
  }
  .default-badge.active {
    background: rgba(192,168,106,0.15);
    border-color: #c0a86a;
    color: #c0a86a;
  }
  
  .mapActions {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 14px;
    flex-wrap: wrap;
  }
  
  .add-map-row {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin: 20px 0 0;
    flex-wrap: wrap;
  }
  
  /* Buttons */
  .btn {
    border: none; border-radius: 6px; cursor: pointer;
    font-weight: 700; font-size: 0.95rem; padding: 9px 22px;
    transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
    display: inline-flex; align-items: center; gap: 6px;
  }
  .btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.35); }
  .btn:active:not(:disabled) { transform: translateY(0); }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-large   { font-size: 1.1rem; padding: 12px 30px; }
  .btn-primary { background: #c0a86a; color: #1a1a1a; }
  .btn-primary:hover:not(:disabled) { background: #d4b87a; }
  .btn-star    { background: gold; color: #1a1208; }
  .btn-star:hover:not(:disabled) { background: #ffd740; }
  .btn-warning { background: #e08c2a; color: #fff; }
  .btn-warning:hover:not(:disabled) { background: #f09c3a; }
  .btn-edit    { background: #4a90e2; color: #fff; }
  .btn-edit:hover:not(:disabled) { background: #5a9ef2; }
  .btn-delete  { background: #e04444; color: #fff; }
  .btn-delete:hover:not(:disabled) { background: #f05555; }
  .btn-cancel  { background: #555; color: #fff; }
  .btn-cancel:hover:not(:disabled) { background: #666; }
  
  /* Thumbnails */
  .thumbnailSection { margin: 2rem 0; }
  .gallery-title { color: #c0a86a; text-align: center; margin-bottom: 1rem; }
  .thumbnailGrid { display: flex; gap: 15px; flex-wrap: wrap; justify-content: center; }
  
  .thumbnail {
    width: 120px; border-radius: 8px; overflow: hidden;
    cursor: pointer; border: 2px solid transparent;
    position: relative;
    transition: border-color 0.2s ease, transform 0.2s ease;
  }
  .thumbnail:hover { transform: translateY(-3px); }
  .thumbnail.selected { border-color: #c0a86a; }
  .thumbnail.isDefault { border-color: gold; }
  
  .thumbnail-img { width: 100%; height: 90px; object-fit: cover; display: block; }
  .thumbnail-date {
    background: rgba(0,0,0,0.75); color: #fff;
    font-size: 0.65rem; padding: 3px 5px; text-align: center;
  }
  
  .thumbnail-default-badge {
    position: absolute; top: 4px; left: 4px;
    background: rgba(0,0,0,0.7);
    border-radius: 4px; padding: 2px 4px;
    font-size: 0.7rem;
  }
  
  .thumbnail-actions {
    position: absolute; top: 4px; right: 4px;
    display: flex; gap: 3px; z-index: 5;
  }
  
  .thumb-btn {
    width: 24px; height: 24px;
    border: none; border-radius: 4px; cursor: pointer;
    font-size: 0.75rem; display: flex; align-items: center; justify-content: center;
    opacity: 0.85; transition: opacity 0.15s, transform 0.15s;
  }
  .thumb-btn:hover { opacity: 1; transform: scale(1.1); }
  .thumb-star   { background: rgba(255,215,0,0.9); }
  .thumb-edit   { background: #4a90e2; color: #fff; }
  .thumb-delete { background: #e04444; color: #fff; }
  
  /* Modals */
  .modal-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.88);
    display: flex; justify-content: center; align-items: center;
    z-index: 99999;
  }
  .modal-box {
    background: #242424; border: 2px solid #c0a86a;
    border-radius: 14px; padding: 30px;
    max-width: 480px; width: 90%;
    box-shadow: 0 20px 60px rgba(0,0,0,0.8);
    display: flex; flex-direction: column; gap: 8px;
  }
  .modal-danger  { border-color: #e04444; }
  .modal-title   { color: #c0a86a; text-align: center; margin: 0 0 20px; font-size: 1.25rem; }
  .danger-title  { color: #e04444; }
  .modal-body-text { color: #ddd; text-align: center; margin: 1rem 0; line-height: 1.5; }
  .modal-hint    { color: #aaa; font-size: 0.85rem; margin: 8px 0 4px; }
  .modal-actions { display: flex; gap: 12px; justify-content: center; margin-top: 22px; }
  
  .default-checkbox {
    display: flex; align-items: center; gap: 8px;
    color: #c0a86a; font-size: 0.85rem; cursor: pointer;
    margin-top: 4px;
  }
  
  .file-input { width: 100%; margin: 14px 0 4px; color: #ccc; font-size: 0.9rem; }
  .preview-wrap { text-align: center; margin: 12px 0; }
  .preview-img {
    max-width: 100%; max-height: 200px;
    border: 2px solid #c0a86a; border-radius: 8px; object-fit: contain;
  }
  
  .fullscreen-backdrop { flex-direction: column; gap: 12px; cursor: zoom-out; }
  .fullscreen-img {
    max-width: 95vw; max-height: 90vh; object-fit: contain;
    border: 3px solid #c0a86a; border-radius: 10px;
  }
  .fullscreen-hint { color: rgba(255,255,255,0.5); font-size: 0.85rem; }
  
  /* States */
  .loading, .emptyState { text-align: center; padding: 3rem; color: #fff; font-size: 1.1rem; }
  .emptyState {
    background: rgba(0,0,0,0.3); border-radius: 15px;
    border: 2px dashed #c0a86a;
    display: flex; flex-direction: column; align-items: center; gap: 1.2rem;
    max-width: 400px; margin: 4rem auto;
  }
  .error-msg {
    color: #ff6666; background: rgba(255,68,68,0.1);
    border: 1px solid #ff4444; border-radius: 8px;
    padding: 0.75rem 1.25rem; text-align: center;
    max-width: 500px; margin: 1rem auto;
  }
  
  @media (max-width: 768px) {
    .mapWrapper { width: 100%; height: auto; aspect-ratio: 7/5; margin-top: 2rem; }
     .mapBorder { width: 120%; transform: translate(-15%, -17.25%); } 
  }


@media (max-width: 550px) {
  .layout {
    display: block; /* removes sidebar column completely */
  }
}
</style>