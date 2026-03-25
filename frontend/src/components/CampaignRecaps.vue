<template>
<nav class="navBar" v-sound>
  <button class="invisibleButton" @click="router.push(`/campaign/${campaignId}`)" :class="{ active: route.path === `/campaign/${campaignId}` }">Home</button>
    <button class="invisibleButton" @click="router.push(`/campaign/${campaignId}/maps`)" :class="{ active: route.path.includes('/maps') }">Map</button>
    <button class="invisibleButton" @click="router.push(`/Recaps/${campaignId}/description`)" :class="{ active: route.path.includes('/description') }">Recaps</button>
    <button class="invisibleButton" @click="router.push(`/campaign/${campaignId}/characters`)" :class="{ active: route.path.includes('/characters') }">Characters</button>
    <button class="invisibleButton" @click="router.push(`/campaign/${campaignId}/rules`)" :class="{ active: route.path.includes('/rules') }">Rules</button>
    <button class="invisibleButton" @click="router.push(`/campaign/${campaignId}/members`)" :class="{ active: route.path.includes('/members') }">Members</button>
    
</nav>

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
      <div class="recap-form-section">
        <button class="parchmentButton" @click="showForm = !showForm">
          {{ showForm ? 'Cancel' : '+ New Recap' }}
        </button>

        <div v-if="showForm" class="recap-form">
          <textarea
            v-model="newDescription"
            placeholder="Write your session recap here..."
            rows="6"
          />
          <p v-if="formError" class="error-text">{{ formError }}</p>
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
          <span class="recap-number">Session {{ recap.orderNumber }}</span>

          <!-- Removing the ability to remove recaps rn. Maybe implement later? It's still stuck with the old recaps 
          <button class="delete-btn" @click="deleteRecap(recap.id)">✕</button> -->
        </div>
        <div class="recap-content">
          <pre>{{ recap.description }}</pre>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchRecap } from '../lib/dataHelper.js'
import { apiFetch } from '../lib/api.js'


defineProps({
  campaignId: {
    type: String,
    required: false
  }
})
const route = useRoute()
const router = useRouter()

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


async function loadRecaps() {
  recapLoading.value = true
  recapStatus.value = ''
  
  try {
    const result = await fetchRecap(campaignId)
    console.log("RESULT: ", result)
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

onMounted(() => {
  loadRecaps()
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
  height: calc(100vh - 220px);
  min-height: 600px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* PDF display styles */
.pdf-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.pdf-viewer {
  flex: 1;
  background: #2d2d44;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.pdf-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* Text display styles - Document-like appearance */
.recap-scroll-pane {
  flex: 1;
  background: #f4ecd8;
  border: 2px solid var(--vt-c-bronze);
  border-radius: 12px;
  padding: 4rem 6rem;
  overflow-y: auto;
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
    height: calc(100vh - 200px);
    min-height: 400px;
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