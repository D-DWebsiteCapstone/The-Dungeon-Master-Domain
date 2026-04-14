<template>
  <div class="layout">
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
      <button class="stoneButton single" @click="loadRecaps">Try Again</button>
    </div>

    <div v-else class="recap-container">

      <!-- DM/Co DM: New Recap button + form -->
      <div v-if="canModifyRecaps" class="recap-form-section">
        <button class="stoneButton single" @click="showForm = !showForm">
          {{ showForm ? 'Cancel' : '+ New Recap' }}
        </button>

        <div v-if="showForm" class="recapCard recapCard-pane">
          <textarea v-model="newDescription" rows="8" /> 
          <p v-if="formError" class="error-text">{{ formError }}</p>
          <br>

          <button class="stoneButton" :disabled="formLoading" @click="createRecap">
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
        class="recapCard recapCard-pane"
      >
        <div class="recapHeader">
          <span class="recap-number">Session{{ recap.orderNumber }} <br> </span>
          <!-- The line below is the edit button and it starts the edit using the start edit func -->
        </div>

        <!-- Edit mode-->
        <div v-if="editingId === recap.id" class="recapContent">
          <textarea v-model="editDescription" rows="8"  /> 
          <button class="stoneButton card" @click="saveEdit(recap.id)">Save</button>
          <button class="stoneButton card" @click="cancelEdit">Cancel</button>
          
        </div>

        <div class="recapContent">
          <pre v-if="currentlyEditing === false">{{ recap.description }}</pre>
          <div v-if=" canModifyRecaps && editingId !== recap.id">
            <button class = "stoneButton card" @click="startEdit(recap)">Edit</button>
            <button class="stoneButton card" @click="removeRecap(recap.id)">Delete</button>
          </div>
        </div>
      </div>
      <button v-if="isStaff" class="stoneButton special" @click="changeRecapPermission">
        Allow Player Recap: {{ canEditRecaps }}
      </button>  
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { fetchRecap, fetchUserCampaignRole, fetchPlayerRecapFunctionality, sendPlayerRecapFunctionality } from '../lib/dataHelper.js'

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

//this checks if your role in the campaign is DM, Co DM or admin
const isStaff = computed(() =>
  campaignRole.value === 'DM' ||
  campaignRole.value === "Co DM" ||
  decoded.role === 'admin'
)

//loading function. gets the fetch recap from datahelper.js
async function loadRecaps() {
  recapLoading.value = true
  recapStatus.value = ''
  
  try {
    //fetchRecap in dataHelper file
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

//creating recap 
async function createRecap() {
  //getting reap from the text box
  if(!newDescription.value.trim()) {
    formError.value = 'Recap cannot be empty.'
    return
  }
  //the form where the description was
  formLoading.value = true;
  formError.value = '';
  
  //dataHelper.js stuff
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

//this is for putting the box up again as well as permissions viewing recaps. This makes the page look a little
// better when editing recaps
function startEdit(recap) {
  editingId.value = recap.id
  currentlyEditing.value = true;
  editDescription.value = recap.description
}

//cancelling the edit if you don't want to save the recap.
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



//RECAP PERMISSION STUFF!!!!!!!!!!!!! 
const isPlayer = computed(() => campaignRole.value === 'Player')

const canModifyRecaps = computed(() => 
  isStaff.value || (isPlayer.value && canEditRecaps.value)
)

//have to check if anybody can edit recaps, goes onto onMounted()
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

//datahelper/backend process
async function changeRecapPermission() {
 const newValue = await sendPlayerRecapFunctionality(campaignId);
 canEditRecaps.value = newValue;
 loadRecaps();
}

onMounted(() => {
  checkRecapPermission();
  loadRecaps();
})
</script>

<style scoped>

/* .campaignPage {
  padding: 1rem 2rem 2rem;
  max-width: 100%;
  margin: 0 auto;
  min-height: calc(100vh - 100px);
}*/

h2 {
  margin-bottom: 2.5rem;
  font-size: 2.2rem;
} 

 .layout {
  display: flex;
  align-items: flex-start;
}
.campaignPage {
  flex: 1;
  min-width: 0; /* VERY important for preventing overflow issues */
}

textarea {
  background-color: var(--vt-c-warm-white);
  border: 2px solid var(--vt-c-red);
  color: var(--vt-c-red);
  border-radius: 0px;
  box-shadow: 0 0 0 2px rgba(142, 64, 64, 0.393);

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
  width: 80%;
  min-width: 250px;
}


.recapCard {
  position: relative;
  border: 2px solid var(--vt-c-warm-white);
  padding: 16px;
  margin: 1rem;
  width: calc(100% - 2rem);

  /* OUTER DEPTH */
  box-shadow:
    2px 10px 45px rgb(69, 69, 49),
    0 0 0 2px rgba(201, 166, 107, 0.393);

  overflow: hidden;
}

.recapCard::before {
  content: "";
  position: absolute;
  inset: 0;

  background-image: url('../assets/images/Textures/Stone.png');
  background-repeat: repeat;
  background-size: 18%;

  filter: blur(0.3px) brightness(0.85);

  z-index: 0;
}

.recapCard::after {
  content: "";
  position: absolute;
  inset: 0;

  background:
    radial-gradient(circle at center, transparent 10%, rgba(0, 0, 0, 0.228)),
    linear-gradient(rgba(0, 0, 0, 0.112), rgba(0, 0, 0, 0.368));

  z-index: 1;
}

.recapCard-pane > * {
  position: relative;
  z-index: 2;
}

.recapHeader {
  display: inline-block;
  margin-bottom: 1rem;
  border-bottom: solid 1px var(--vt-c-red);
  color: var(--vt-c-red);
  font-family: 'NorseFont';
  font-size: 1.6rem;
  letter-spacing: 2px;
  width: 50%;

  /* GLOWING TEXT */
  text-shadow:
    0 0 6px rgba(152, 71, 71, 0.7),
    0 0 12px rgba(162, 77, 77, 0.4),
    0 0 20px rgba(140, 66, 66, 0.2);
}

.recapContent {
  color: var(--vt-c-warm-white);
  text-shadow: 0 0 4px rgba(255,255,255,0.15);
  max-width: 1000px;
  margin: 0 auto;
}

.stoneButton.single {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  width: 180px;
}

.stoneButton.special {
  font-size: 1.5rem;
  margin-top: 2rem;
  width: fit-content;
}

.stoneButton::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url('../assets/images/Textures/Stone.png');
  background-repeat: repeat;
  background-size: 250%;
  filter: blur(0.4px) brightness(0.75);

  z-index: -1;
}

.stoneButton {  
  position: relative;
  overflow: hidden;
  color: var(--vt-c-red);
  font-family: 'NorseFont';
  width: 150px;
  margin: 16px;
  margin-bottom: 0;
  padding: 10px 18px;
  font-size: 1.2rem;
  letter-spacing: 1.5px;
  cursor: pointer;

  border: 1px solid #373731;
  box-shadow:
    3px 3px 8px rgba(0,0,0,0.8),
    -2px -2px 4px rgba(255,255,255,0.1),
    inset 0 1px 2px rgba(255,255,255,0.15),
    inset 0 -2px 3px rgba(0,0,0,0.6);

  transition: all 0.15s ease;
  z-index: 3;
}

.stoneButton:active {
  transform: translateY(3px);

  box-shadow:
    inset 3px 3px 8px rgba(0,0,0,0.8),
    inset -2px -2px 4px rgba(255,255,255,0.05);
}

.stoneButton:hover {
  transform: translateY(-2px); /* LIFT */

  box-shadow:
    0 12px 24px rgba(0,0,0,0.7), 
    0 4px 8px rgba(0,0,0,0.5),

    /* reduce inset so it feels less "pressed" */
    inset 0 1px 1px rgba(255,255,255,0.1),
    inset 0 -1px 2px rgba(0,0,0,0.4);
}

.stoneButton {
  text-shadow:
    0 1px 0 rgba(255,255,255,0.2),
    0 -1px 0 rgba(0,0,0,0.7);
}

.recapContent pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: "Cinzel", serif;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
  letter-spacing: 1px;
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

/* .empty-state .parchmentButton {
  margin-top: 1rem;
  padding: 0.875rem 2rem;
  font-size: 1.1rem;
  min-width: 200px;
} */

/* Scrollbar styling */
.recapCard-pane::-webkit-scrollbar {
  width: 12px;
}

.recapCard-pane::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.recapCard-pane::-webkit-scrollbar-thumb {
  background: var(--vt-c-bronze);
  border-radius: 10px;
  border: 2px solid #f4ecd8;
}

.recapCard-pane::-webkit-scrollbar-thumb:hover {
  background: var(--vt-c-golden);
}



/* adjust scroll size for smaller screens */
@media (max-width: 768px) {
  .campaignPage {
    padding: 1rem;
  }

  .h2 {
    font-size: 1.8rem;
  }

  .rulesContent pre{ 
    max-width: 100%;
    font-size: 0.8rem;
   }

  /* .empty-state .parchmentButton {
    width: 100%;
  } */
}

@media (max-width: 550px) {
  .layout {
    display: block; /* removes sidebar column completely */
  }
}

@media (max-width: 480px) {
  .recapContent pre { font-size: 0.95rem; }
  .stoneButton {
    width: 120px;
    margin: 8px;
    margin-top: 16px;
  }
}

</style>