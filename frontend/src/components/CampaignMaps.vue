<template>
  <div class="layout">
    <CampaignMenu :campaignId="campaignId" />
  
    <div class="campaignPage" v-sound>
      <h2>Document your travels here</h2>
      <div class="description" v-if="isDM">
        <p>Upload maps for your players to reference.
          Only you and Co-DMs can create, change, delete, and set default maps.</p>
      </div>
  
      <!-- Loading state -->
      <div v-if="loading" class="loading">Loading maps...</div>
  
      <!-- Error message -->
      <div v-if="error" class="error-msg">{{ error }}</div>
  
      <!-- DM: empty state -->
      <div v-else-if="!loading && allMaps.length === 0 && isDM" class="emptyState">
        <p>No maps saved yet.</p>
        <button class="parchmentButton" @click="showUploadModal = true">Upload First Map</button>
      </div>
  
      <!-- Player: no default map state -->
      <div v-else-if="!loading && !isDM && allMaps.length === 0" class="emptyState">
        <p>No map has been shared yet.</p>
      </div>

  
      <!-- DM view: full management -->
      <div v-else-if="!loading && allMaps.length > 0">
        <!-- Main map display  -->
        <div class="mainMapSection">
          <!-- PICTURE FRAME -->
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

              <div class="ornate top"></div>
              <div class="ornate bottom"></div>
              <div class="ornate left"></div>
              <div class="ornate right"></div>

            </div>
          </div>
  
          <div class="mapInfo" v-if="currentMap">
            <!-- Default badge -->
            <div class="default-badge" :class="{ active: currentMap.isDefault }" v-if="isDM">
              {{ currentMap.isDefault ? 'Default Map' : 'Not default' }}
            </div>
  
            <p><strong>Uploaded by:</strong> {{ currentMap.createdBy }}</p>
            <!-- <p><strong>Uploaded on:</strong> {{ formatDate(currentMap.created_at) }}</p> -->
  
            <div class="mapActions" v-if="isDM">
              <!-- Set as default -->
              <button
                v-if="!currentMap.isDefault"
                class="btn btn-star"
                @click="setAsDefault(currentMap)">
                <img alt="Default" src="../assets/images/icons/laurel.png">Set as Default</button>
              <button class="btn btn-edit" @click="openEditModal(currentMap)">
                <img alt="Edit" src="../assets/images/icons/Quill-WarmWhite.png">Edit Map</button>
              <button class="btn btn-delete" @click="confirmDeleteMap(currentMap.id)">
               <img alt="Delete" src="../assets/images/icons/Fire-WarmWhite.png">Delete Map</button>
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
              <!-- <div class="thumbnail-date">{{ formatDateShort(map.created_at) }}</div> -->
              <div v-if="map.isDefault" class="thumbnail-default-badge">
                <img alt="Default" src="../assets/images/icons/laurel.png">
              </div>
              <div class="thumbnail-actions" v-if="isDM">
                <button v-if="!map.isDefault" class="thumb-btn thumb-star" @click.stop="setAsDefault(map)" title="Set as default">
                  <img alt="Default" src="../assets/images/icons/laurel.png">
                </button>
                <button class="thumb-btn thumb-edit" @click.stop="openEditModal(map)" title="Edit">
                  <img alt="Edit" src="../assets/images/icons/Quill-WarmWhite.png">
                </button>
                <button class="thumb-btn thumb-delete" @click.stop="confirmDeleteMap(map.id)" title="Delete">
                  <img alt="Delete" src="../assets/images/icons/Fire-WarmWhite.png">
                </button>
              </div>
            </div>
          </div>
        </div>
        <!-- DM action buttons -->
        <div class="add-map-row" v-if="isDM">
          <button class="parchmentButton" @click="showUploadModal = true">
            ADD NEW MAP
          </button>
          <button v-if="defaultMap" class="parchmentButton" @click="clearDefault">
            Clear Default Map
          </button>
        </div>
      </div>
    </div>
  </div>
  
    <!-- ============ UPLOAD MODAL ============ -->
    <Teleport to="body">
      <div v-if="showUploadModal" class="modal-backdrop" @click.self="closeUploadModal">
        <div class="modal-box">
          <h3 class="modal-title">Upload New Map</h3>
          <div class="uploadBox" v-if="!uploadPreview">
            <input id="uploadInput" type="file" accept="image/*" @change="handleUploadFile" ref="uploadInput" style= "display: none"/>
            <label for="uploadInput" class="file-input">
              <span class="filetxt">Select Image</span>
            </label>
          </div>
          <div v-if="uploadPreview" class="preview-wrap">
            <img :src="uploadPreview" class="preview-img" alt="preview" />
          </div>
          <!-- Option to set as default on upload -->
          <label class="default-checkbox">
            <input type="checkbox" v-model="uploadAsDefault" />
            Set as default map (visible to players)
          </label>
          <div class="modal-actions">
            <button class="btn btn-cancel" @click="closeUploadModal">Cancel</button>
            <button class="btn btn-primary" @click="uploadMap" :disabled="!uploadPreview || saving">Upload</button>
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
          <div class="uploadBox" v-if="!uploadPreview">
            <input id="editInput" type="file" accept="image/*" @change="handleEditFile" ref="editInput" class="file-input" style= "display: none"/>
            <label for="editInput" class="file-input edit">
              <span class="filetxt">Select Image</span>
            </label>
          </div>
          
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
            <button class="btn btn-delete" @click="deleteMap" :disabled="saving">Delete</button>
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
  const saving = ref(false)
  
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

  
  // Computed
  const currentMap = computed(() => allMaps.value[selectedMapIndex.value] ?? null)
  const currentMapImage = computed(() => currentMap.value ? formatMap(currentMap.value.map) : null)
  
  // computed default map
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
        isDM.value = me?.role === 'DM' || me?.role === 'Co DM'
      } else {
        members.value = []
      }
    } catch (e) {
      console.error('Failed to load campaign members:', e)
    }
  }


  async function loadMaps() {
    loading.value = true
    error.value = ''

    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        error.value = 'Please log in'
        loading.value = false
        return
      }

      const res = await apiFetch(`/data/campaign/${campaignId}/maps`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) throw new Error('Failed to load')

      const data = await res.json()

      if (data.valid && data.maps?.length) {
        allMaps.value = data.maps
        console.log('RAW MAPS:', data.maps)

        const defaultIndex = allMaps.value.findIndex(m => m.isDefault)
        selectedMapIndex.value = defaultIndex !== -1 ? defaultIndex : 0
      } else {
        allMaps.value = []
      }
      console.log(
      'Defaults:',
      allMaps.value.filter(m => m.isDefault).map(m => m.id)
    )

    } catch (err) {
      console.error(err)
      error.value = 'Failed to load maps'
    } finally {
      loading.value = false
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
  }
  
  
  
  // ── Set default map ──
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
  
  // ──  Clear default (no-map state) ──
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
    saving.value = true
    try {
      const token = localStorage.getItem('authToken')
      const username = localStorage.getItem('username') || 'unknown'
      const res = await apiFetch(`/data/campaign/${campaignId}/map`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          imageData: uploadPreview.value,
          createdBy: username,
          isDefault: uploadAsDefault.value  // pass default flag
        })
      })
      if (!res.ok) throw new Error('Upload failed')
      await loadMaps()
      closeUploadModal()
    } catch (err) {
      console.error(err); error.value = 'Upload failed'
    }
    finally {
      saving.value = false
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
    saving.value = true
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
    } finally {
      saving.value = false
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
  .description {
    margin-bottom: 2rem;
  }

  /* ================= FRAME/IMG CONTAINER ================= */
  .map-frame {
    --frame: clamp(72px, 6vw, 116px);

    --edge-h: calc(var(--frame) * 0.31);
    --edge-v: calc(var(--frame) * 0.54);

    --overhang-x: calc(var(--frame) * 0.6);
    --overhang-y: calc(var(--frame) * 0.43);

    --corner-offset-x: calc(var(--frame) * 0.06);
    --corner-offset-y: calc(var(--frame) * 0.1175);

    --ornate-top-w: clamp(70px, 10vw, 120px);
    --ornate-bottom-w: clamp(50px, 8vw, 100px);
    --ornate-side-h: clamp(50px, 10vw, 90px);

    --ornate-side-overhang: calc(var(--ornate-side-h) * 0.08);
    --ornate-top-overhang: calc(var(--ornate-top-w) * 0.3);
    --ornate-bottom-overhang: calc(var(--ornate-bottom-w) * -0.07);

    position: relative;
    display: inline-block;

    margin: 5vh 3rem;

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
    bottom: calc(-1 * var(--overhang-y) + var(--corner-offset-y) + 0.4px);
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

  .ornate.top {
    position: absolute;
    top: calc(-1 * var(--overhang-y) - var(--corner-offset-y) - var(--ornate-top-overhang));
    left: calc(50% - ( var(--ornate-top-w)/2));
    background: url('../assets/images/mapFrames/ornate-top.png');
    aspect-ratio: 4/3;
    width: var(--ornate-top-w);
    background-size: cover;
    background-repeat: no-repeat;
    z-index:1;
  }

  .ornate.bottom {
    position: absolute;
    bottom: calc(-1 * var(--overhang-y) - var(--corner-offset-y) - var(--ornate-bottom-overhang));
    left: calc(50% - ( var(--ornate-bottom-w)/2));
    background: url('../assets/images/mapFrames/ornate-bottom.png');
    aspect-ratio: 2/1;
    width: var(--ornate-bottom-w);
    background-size: cover;
    background-repeat: no-repeat;
    z-index:1;
  }
 
  .ornate.left {
    position: absolute;
    left: calc(-1 * var(--overhang-x) - var(--corner-offset-x) - var(--ornate-side-overhang));
    top: calc(50% - (var(--ornate-side-h)/2));
    background: url('../assets/images/mapFrames/ornate-left.png');
    aspect-ratio: 3/4;
    height: var(--ornate-side-h);
    background-size: cover;
    background-repeat: no-repeat;
    z-index:1;
  }

  .ornate.right {
    position: absolute;
    right: calc(-1 * var(--overhang-x) - var(--corner-offset-x) - var(--ornate-side-overhang));
    top: calc(50% - (var(--ornate-side-h)/2));
    background: url('../assets/images/mapFrames/ornate-right.png');
    aspect-ratio: 3/4;
    height: var(--ornate-side-h);
    background-size: cover;
    background-repeat: no-repeat;
    z-index:1;
  }
  
  .mainMapSection {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 2rem;
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
  }
  
  .mapInfo {
    position: relative;
    z-index: 10;
    text-align: center;
    color: var(--vt-c-golden);
    margin-top: 1rem;
    margin-bottom: 2rem;
  }
  
  .mapInfo p { margin: 0.4rem 0; }
  
  /* default badge */
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
    border-color: var(--vt-c-parchment);
    color: var(--vt-c-parchment);
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
    border: none;
    border-radius:
    6px; cursor: pointer;
    font-weight: 700;
    font-size: 0.95rem;
    padding: 6px 20px;
    transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    width: 175px;
    height: 40px;
  }
  .btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.35); }
  .btn:active:not(:disabled) { transform: translateY(0); }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-large   { font-size: 1.1rem; padding: 12px 30px; }

  .btn-primary { 
    background: linear-gradient(
      145deg,
      #f7e7a3 0%,
      #e4c76a 30%,
      #c9a645 50%,
      #a67c1f 70%,
      #e8d18a 100%
    );

    box-shadow:
      inset 0 2px 3px rgba(255,255,255,0.6),
      inset 0 -3px 5px rgba(0,0,0,0.25),
      0 4px 10px rgba(0,0,0,0.35);

    text-shadow:
      0 0.75px 0 rgba(255,255,255,0.6),
      0 -0.75px 0 rgba(0,0,0,0.3);
  }

  .btn-star  {
    background: var(--vt-c-parchment);
    color: var(--vt-c-dark-brown);

      background: linear-gradient(
      145deg,
      #f7e7a3 0%,
      #e4c76a 30%,
      #c9a645 50%,
      #a67c1f 70%,
      #e8d18a 100%
    );

    box-shadow:
      inset 0 2px 3px rgba(255,255,255,0.6),
      inset 0 -3px 5px rgba(0,0,0,0.25),
      0 4px 10px rgba(0,0,0,0.35);

    text-shadow:
      0 0.75px 0 rgba(255,255,255,0.6),
      0 -0.75px 0 rgba(0,0,0,0.3);
  }
  .btn-star img{
    height: 22px;
    width: 22px;
  }
  
  .btn-warning { background: #e08c2a; color: #fff; }
  .btn-warning:hover:not(:disabled) { background: #f09c3a; }

  .btn-edit { background: var(--vt-c-blue); color: var(--vt-c-warm-white); }
  .btn-edit:hover:not(:disabled) { background: #477cbd; }
  .btn-edit img{
    height: 26px;
    width: 26px;
  }
  .btn-delete img{
    height: 24px;
    width: 24px;
  }
  .btn-delete   { background: var(--vt-c-red); color: var(--vt-c-warm-white); }
  .btn-delete:hover:not(:disabled) { background: #cd4646; }

  .btn-cancel   { background: var(--vt-c-grey); color: var(--vt-c-warm-white); border: 1px solid #555; }
  .btn-cancel:hover:not(:disabled) { background: #4a453f; }

  /* Thumbnails */
  .thumbnailSection { margin: 2rem 0; }
  .gallery-title { color: var(--vt-c-parchment); text-align: center; margin-bottom: 1rem; }
  .thumbnailGrid { display: flex; gap: 15px; flex-wrap: wrap; justify-content: center; }
  
  .thumbnail {
    width: 120px; border-radius: 8px; overflow: hidden;
    cursor: pointer; border: 2px solid transparent;
    position: relative;
    transition: border-color 0.2s ease, transform 0.2s ease;
  }
  .thumbnail:hover { transform: translateY(-3px); }
  .thumbnail.selected { border-color: var(--vt-c-dark-parchment); }
  .thumbnail.isDefault { border-color: #e4c76a; }
  
  .thumbnail-img { width: 100%; height: 100px; object-fit: cover; display: block; }
  .thumbnail-date {
    background: rgba(0,0,0,0.75); color: var(--vt-c-golden);
    font-size: 0.65rem; padding: 3px 5px; text-align: center;
  }
  
  .thumbnail-default-badge {
    position: absolute; top: 0px; left: 0px;
    background: rgba(0,0,0,0.7);
    border-radius: 4px;
    height: 100%;
    width: 100%;
    padding-top: 32px;
    font-size: 0.7rem;
  }
  
  .thumbnail-default-badge img {
    height: 50px;
    width: auto;
  }
  
  .thumbnail-actions {
    position: absolute; top: 4px; right: 4px;
    display: flex; gap: 3px; z-index: 5;  opacity: 0;
  }

  .thumbnail:hover .thumbnail-actions {opacity: 1;}
  
  .thumb-btn {
    width: 24px; height: 24px;
    border: none; border-radius: 4px; cursor: pointer;
    font-size: 0.75rem; display: flex; align-items: center; justify-content: center;
    opacity: 0.85; transition: opacity 0.15s, transform 0.15s;
  }
  .thumb-btn:hover { opacity: 1; transform: scale(1.1); }
  .thumb-star   {  background: #e4c76a; color: var(--vt-c-dark-brown);  } 
  .thumb-star img{
    height: 19px;
    width: 19px;
  }
  .thumb-edit     { background: var(--vt-c-blue); color: var(--vt-c-warm-white); }
  .thumb-edit img{
    height: 19px;
    width: 19px;
  }
  .thumb-delete img{
    height: 19px;
    width: 19px;
  }
  .thumb-delete   { background: var(--vt-c-red); color: var(--vt-c-warm-white); }
  
  /* Modals */
  .modal-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.88);
    display: flex; justify-content: center; align-items: center;
    z-index: 99999;
  }
  .modal-box {
    background: linear-gradient(145deg, rgba(30, 27, 26, 0.95), rgba(20, 17, 17, 0.98));
    border: 1px solid #e8c17377;
    border-radius: 14px;
    padding: 30px;
    max-width: 480px;
    width: 90%;
    align-items: center;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(192, 168, 106, 0.1);
    display: flex; flex-direction: column; gap: 8px;
    animation: modalIn 0.2s ease;
  }
  
  @keyframes modalIn {
    from { opacity: 0; transform: translateY(16px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .modal-danger  { border-color: #e04444; }
  .modal-title   { color: var(--vt-c-dark-parchment); text-align: center; margin: 0 0 20px; font-size: 1.25rem; }
  .danger-title  { color: #e04444; }
  .modal-body-text { 
    color: var(--vt-c-parchment);
    text-align: center;
    line-height: 1.6;
    margin: 0.5rem 0;
  }
  .modal-hint  { 
    color: var(--vt-c-golden); 
    font-size: 0.85rem; 
    margin: 8px 0 4px; 
  }
    
  .modal-actions { 
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 10px;
    flex-wrap: wrap;
  }

  input[type="checkbox"] {
    appearance: none;
    -webkit-appearance: none; /* For older Safari support */
    width: 25px;
    height: 25px;
    border: 2px solid var(--vt-c-golden);
    border-radius: 4px;
    cursor: pointer;
    outline: none;
    display: inline-grid;
    place-content: center;
  }
  /* When checked, change background and add the "check" symbol */
  input[type="checkbox"]:checked {
    background-color: #e8d18a;
    border-color: var(--vt-c-bronze);
  }

  input[type="checkbox"]::before {
    content: "";
    width: 18px;
    height: 18px;
    transform: scale(0); /* Hide by default */
    transition: 120ms transform ease-in-out;
    background-size: contain;
    background-repeat: no-repeat;
  }

  input[type="checkbox"]:checked::before {
    transform: scale(1); /* Show when checked */
    background-image: url('../assets/images/icons/laurel.png');
  }

  input[type="checkbox"]:focus-visible {
  outline: 2px solid var(--vt-c-warm-white);
  outline-offset: 2px;
  } 


  .default-checkbox {
    display: inline-flex; align-items: center;  gap: 8px;
    color: var(--vt-c-dark-parchment); font-size: 0.85rem; cursor: pointer;
    margin-top: 4px;
  }
  
  .uploadBox {  width: 50%;}
  .file-input {
    width: 100%;
    height: 100px;
    margin: 14px 0 4px;
    background: #d4a33b48;
    border: 2px dashed var(--vt-c-dark-parchment);
    border-radius: 8px;
    cursor:pointer;
    align-items: center;
    display: flex;
    justify-content: center;
    color: var(--vt-c-warm-white); 
    font-size: 1rem;
   }

   .edit {
    height: 50px;
   }

   .filetxt {
    font-size: 1.2rem;
    letter-spacing: 1px;
    line-height: 1.6;
    color: var(--vt-c-warm-white);
    font-family: 'Cinzel', 'serif';
    text-align: center;
   }

   .modal-actions .btn {
    width: 150px;
   }

  .preview-wrap { text-align: center; margin: 12px 0; }
  .preview-img {
    max-width: 100%; max-height: 200px;
    border: 2px solid var(--vt-c-dark-parchment); border-radius: 8px; object-fit: contain;
  }
  
  .fullscreen-backdrop { flex-direction: column; gap: 12px; cursor: zoom-out; }
  .fullscreen-img {
    max-width: 95vw; max-height: 90vh; object-fit: contain;
    border: 3px solid var(--vt-c-dark-parchment); border-radius: 10px;
  }
  .fullscreen-hint { color: rgba(255,255,255,0.5); font-size: 0.85rem; }
  
  /* States */
  .loading, .emptyState { text-align: center; padding: 3rem; color: var(--vt-c-parchment); font-size: 1.1rem; }
  .emptyState {
    background: rgba(0,0,0,0.3); border-radius: 15px;
    border: 2px dashed var(--vt-c-dark-parchment);
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

    @media (max-width: 750px) {
    .map-frame {
      --ornate-bottom-overhang: calc(var(--ornate-bottom-w) * -0.16);
    }
  }

  @media (max-width: 650px){
    .edge.bottom {
      bottom: calc(-1 * var(--overhang-y) + var(--corner-offset-y) + 0.1px) !important;
    }
    .edge.top {
      top: calc(-1 * var(--overhang-y) + var(--corner-offset-y) + 0.1px) !important;
    }
  }

  @media (max-width: 550px) {
    .map-frame {
      --ornate-top-overhang: calc(var(--ornate-top-w) * 0.26);
    }
  }
</style>