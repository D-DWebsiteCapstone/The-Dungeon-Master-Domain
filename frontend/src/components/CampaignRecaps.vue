<template>
<!-- <nav class="navBar" v-sound>
  <button class="invisibleButton"@click="router.push(`/campaign/${campaignId}`)":class="{ active: route.path === `/campaign/${campaignId}` }">Home</button>
  <button class="invisibleButton"@click="router.push(`/campaign/${campaignId}/recaps`)":class="{ active: route.path.includes('/recaps') }">Recaps</button>
  <button class="invisibleButton"@click="router.push(`/campaign/${campaignId}/maps`)":class="{ active: route.path.includes('/maps') }">Map</button>
  <button class="invisibleButton"@click="router.push(`/campaign/${campaignId}/characters`)":class="{ active: route.path.includes('/characters') }">Characters</button>
  <button class="invisibleButton"@click="router.push(`/campaign/${campaignId}/rules`)":class="{ active: route.path.includes('/rules') }">Rules</button>
  <button class="invisibleButton"@click="router.push(`/campaign/${campaignId}/members`)":class="{ active: route.path.includes('/members') }">Members</button>

  <button class="invisibleButton"
  @click="router.push(`/campaign/${campaignId}/npcs`)"
  :class="{ active: route.path.includes('/npcs') }">NPCs</button>

</nav> -->

  <CampaignMenu :campaignId="campaignId" />

  <div class="campaignPage" v-sound>
    <h2>Documentation of your epic adventures</h2>

    <!-- Loading -->
    <div v-if="recapLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading recaps...</p>
    </div>

    <!-- Error -->
    <div v-else-if="recapStatus" class="error-state">
      <p>{{ recapStatus }}</p>
      <button class="parchmentButton" @click="loadRecaps">Try Again</button>
    </div>

    <div v-else class="recap-container">

      <!-- DM/Co DM: New Recap button + form -->
      <div v-if="canModifyRecaps" class="recap-form-section">
        <button class="parchmentButton" @click="showForm = !showForm">
          {{ showForm ? 'Cancel' : '+ New Recap' }}
        </button>

        <div v-if="showForm" class="recap-form">
          <textarea v-model="newDescription" rows="8" style="width: 70%; font-family: Georgia, serif; font-size: 1.1rem;" /> 
          <p v-if="formError" class="error-text">{{ formError }}</p>
          <br>

          <button class="parchmentButton" :disabled="formLoading" @click="createRecap">
            {{ formLoading ? 'Saving...' : 'Create Recap' }}
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="recaps.length === 0 && !showForm" class="empty-state">
        <p>No recaps yet.</p>
        <p>Use the button above to write your first session recap!</p>
      </div>

      <!-- Recap list -->
      <div
        v-for="recap in recaps"
        :key="recap.id"
        class="recap-card recap-scroll-pane"
      >
        <div class="recap-header">
          <span class="recap-number">Session{{ recap.orderNumber }} <br> </span>
          <!-- The line below is the edit button and it starts the edit using the start edit func -->
        </div>

        <!-- Edit mode-->
        <div v-if="editingId === recap.id" class="recap-content">
          <textarea v-model="editDescription" rows="8" style="width: 100%; font-family: Georgia, serif; font-size: 1.1rem;" /> 
          <button class="parchmentButton" @click="saveEdit(recap.id)">Save</button>
          <button class="parchmentButton" @click="cancelEdit">Cancel</button>
          
        </div>

        <div class="recap-content">
          <pre v-if="currentlyEditing === false">{{ recap.description }}</pre>
          <div v-if=" canModifyRecaps && editingId !== recap.id">
            <button class = "parchmentButton" @click="startEdit(recap)">Edit</button>
            <button class="parchmentButton" @click="removeRecap(recap.id)">Delete</button>
          </div>
        </div>
      </div>
      <button v-if="isStaff" class="parchmentButton" @click="changeRecapPermission">
        Allow Player Recap: {{ canEditRecaps }}
      </button>  
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { fetchRecap, fetchUserCampaignRole, fetchPlayerRecapFunctionality } from '../lib/dataHelper.js'

import CampaignMenu from './CampaignMenus.vue'
import { apiFetch } from '../lib/api.js'
import { jwtDecode } from 'jwt-decode'


defineProps({
  campaignId: {
    type: String,
    required: false
  }
})
const route = useRoute()

// Get the campaign ID from the URL
const campaignId = route.params.campaignId

// Reactive state - mirroring Campaign.vue
const recaps = ref([])
const recapLoading = ref(false)
const recapStatus = ref('')
const showForm = ref(false)
const newDescription = ref('')
const formLoading = ref(false)
const formError = ref('')
const currentlyEditing = ref(false);


const token = localStorage.getItem('authToken');
const decoded = jwtDecode(token);
const campaignRole = ref('');
const canEditRecaps = ref(false);


const isStaff = computed(() =>
  campaignRole.value === 'DM' ||
  campaignRole.value === "Co DM" ||
  decoded.role === 'admin'
)
const isPlayer = computed(() => campaignRole.value === 'Player')
const canModifyRecaps = computed(() => 
  isStaff.value || (isPlayer.value && canEditRecaps.value)
)

async function checkRecapPermission() {
  const [role, playerRecapsAllowed] = await Promise.all([
    fetchUserCampaignRole(campaignId),
    fetchPlayerRecapFunctionality(campaignId)
  ])

  campaignRole.value = role
  canEditRecaps.value = playerRecapsAllowed

  console.log('campaignRole:', role)
  console.log('playerRecapsAllowed:', playerRecapsAllowed)
}

async function changeRecapPermission() {
  if (!isStaff.value) return   // 🔒 block players

  canEditRecaps.value = !canEditRecaps.value
  console.log('canEditRecaps is now:', canEditRecaps.value)
  //TODO changeRecap functionality move it to the backend and change the database. 
}

async function loadRecaps() {
  recapLoading.value = true
  recapStatus.value = ''
  
  try {
    const result = await fetchRecap(campaignId)
    
    if (result?.recaps) {
      recaps.value = result.recaps
    } else {
      recapStatus.value = 'No recaps found.'
    }

  } catch (err) {
    console.error('Failed to load recaps:', err)
    recapStatus.value = 'Something went wrong loading recaps.'
  } finally {
    recapLoading.value = false
  }
}

async function createRecap() {
  if(!newDescription.value.trim()) {
    formError.value = 'Recap cannot be empty.'
    return
  }
  formLoading.value = true;
  formError.value = '';
  
  try {
    const res = await apiFetch(`/Recaps/${campaignId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({campaignId, description: newDescription.value.trim() })
      
    })
    const data = await res.json()
    if(data) {
      recaps.value.push(data.recap)
      newDescription.value = ''
      showForm.value = false
      loadRecaps()
    } else {
      formError.value = data.message || 'Failed to save recap.'
    }
  }catch (err) {
    console.error('Failed to create recap:', err)
    formError.value = 'Something went wrong.'
  } finally {
    formLoading.value = false
  }
}

//recap editing
const editingId = ref(null)
const editDescription = ref('')

function startEdit(recap) {
  editingId.value = recap.id
  currentlyEditing.value = true;
  editDescription.value = recap.description
}

function cancelEdit() {
  currentlyEditing.value = false;
  editingId.value = null
  editDescription.value = ''
}

async function saveEdit(recapId) {
  console.log('saveEdit called with recapId:', recapId)
  if(!editDescription.value.trim()) return

  try {
    const res = await apiFetch(`/Recaps/${recapId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ description: editDescription.value.trim() })
    })
    const data = await res.json()
    if (data) {
      const index = recaps.value.findIndex(r => r.id === recapId)
      if (index !== -1) recaps.value[index].description = editDescription.value.trim()
      cancelEdit()
    }
  } catch (err) {
    console.error('Failed to edit recap: ', err)
  }
}

async function removeRecap(recapId) {
  if(confirm("Are you sure you want to delete the recap?")) {
    try {
      await apiFetch(`/Recaps/${campaignId}/${recapId}`, {
        method: 'DELETE',
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      })
    recaps.value = recaps.value.filter(r => r.id !== recapId)
    loadRecaps()

    } catch (err) {
      console.error('Failed to delete recap: ', err)
    }
  }
  
}

onMounted(() => {
  checkRecapPermission();
  loadRecaps();
})

</script>

<style scoped>

.campaignPage {
  padding: 1rem 2rem 2rem;
  max-width: 100%;
  margin: 0 auto;
  min-height: calc(100vh - 100px);
}

.campaignPage h2 {
  color: var(--vt-c-golden);
  margin-bottom: 0.5rem;
  font-size: 2.5rem;
  text-align: center;
}

.subtitle {
  color: var(--vt-c-warm-white);
  opacity: 0.8;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.1rem;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--vt-c-warm-white);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left-color: var(--vt-c-golden);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  color: #ff6b6b;
}

.recap-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}



/* Text display styles - Document-like appearance */
.recap-scroll-pane {
  flex: 1;
  background: #f4ecd8;
  border: 2px solid var(--vt-c-bronze);
  border-radius: 12px;
  padding: 4rem 6rem;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.3);
  background-image: url('../assets/PaperTextureCalm.png');
  background-size: cover;
  background-position: center;
  max-width: 100%;
  width: 100%;
}

.recap-content {
  color: #2f2416;
  max-width: 1000px;
  margin: 0 auto;
}

.recap-content pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 1.15rem;
  line-height: 1.9;
  margin: 0;
  letter-spacing: 0.3px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.empty-state p {
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.empty-state .parchmentButton {
  margin-top: 1rem;
  padding: 0.875rem 2rem;
  font-size: 1.1rem;
  min-width: 200px;
}

/* Scrollbar styling */
.recap-scroll-pane::-webkit-scrollbar {
  width: 12px;
}

.recap-scroll-pane::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.recap-scroll-pane::-webkit-scrollbar-thumb {
  background: var(--vt-c-bronze);
  border-radius: 10px;
  border: 2px solid #f4ecd8;
}

.recap-scroll-pane::-webkit-scrollbar-thumb:hover {
  background: var(--vt-c-golden);
}

/* Adjust scroll size for big screens*/
@media (max-width: 1200px) {
  .recap-scroll-pane {
    padding: 3rem 4rem;
  }
}

/* adjust scroll size for smaller screens */
@media (max-width: 768px) {
  .campaignPage {
    padding: 1rem;
  }

  .campaignPage h2 {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .recap-container {
    min-height: unset;
  }

  .recap-scroll-pane {
    padding: 2rem 1.5rem;
  }

  .recap-content {
    max-width: 100%;
  }

  .recap-content pre {
    font-size: 1rem;
    line-height: 1.7;
  }

  .empty-state .parchmentButton {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .recap-scroll-pane {
    padding: 1.5rem 1rem;
  }
  
  .recap-content pre {
    font-size: 0.95rem;
  }
}

</style>