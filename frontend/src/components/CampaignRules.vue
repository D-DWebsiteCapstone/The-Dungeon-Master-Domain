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
    <h2>Rules to follow throughout your journey!</h2>
    
    <div v-if="rulesLoading" class="loading-state">
      <p>Loading rules...</p>
    </div>

    <div v-else-if="rulesStatus" class="error-state">
      <p>{{ rulesStatus }}</p>
      <button class="parchmentButton" @click="loadRules">Try Again</button>
    </div>

    <div v-else class="rules-container">
      <!-- Show PDF if available -->
      <div v-if="rulesPdfUrl" class="pdf-container">
        <div class="pdf-viewer">
          <iframe :src="rulesPdfUrl" class="pdf-iframe" title="Campaign Rules PDF"></iframe>
        </div>
      </div>
      
      <!-- Show text if no PDF but text exists -->
      <div v-else-if="rulesFullText" class="rules-scroll-pane">
        <div class="rules-content">
          <pre>{{ rulesFullText }}</pre>
        </div>
      </div>
      
      <!-- Show empty state -->
      <div v-else class="empty-state">
        <p>No rules content yet.</p>
        <p>Please wait for your DM to add the rules to view</p>
        <p>If you are the DM, you can add rules by going to the home page in the campaign and clicking the Rules Button!</p>
        <button class="parchmentButton" @click="router.push(`/campaign/${campaignId}`)">
          Go to Campaign Home
        </button>
      </div>
    </div>
  </div>

</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchRules } from '../lib/dataHelper.js'

const route = useRoute()
const router = useRouter()

// Get the campaign ID from the URL
const campaignId = route.params.campaignId

// Reactive state - mirroring Campaign.vue
const rulesLoading = ref(false)
const rulesStatus = ref('')
const rulesPdfUrl = ref('')
const rulesFullText = ref('')

async function loadRules() {
  
  rulesLoading.value = true
  rulesStatus.value = ''
  rulesPdfUrl.value = ''
  
  // Try to get from localStorage as fallback (same as Campaign.vue)
  rulesFullText.value = localStorage.getItem(`rules:${campaignId}`) || ''

  const res = await fetchRules(campaignId)
  
  // Same logic as Campaign.vue line 223
  if (res && res.valid !== false) {
    
    const serverText = res.rulesText || ''
    
    // Prefer server text if present; otherwise keep local cached text
    rulesFullText.value = serverText || rulesFullText.value

    // Try to create PDF blob - same logic as Campaign.vue
    let blobUrl = ''
    
    if (typeof res.pdfBase64 === 'string' && res.pdfBase64.length) {
      try {
        const bytes = Uint8Array.from(atob(res.pdfBase64), c => c.charCodeAt(0))
        const blob = new Blob([bytes], { type: 'application/pdf' })
        blobUrl = URL.createObjectURL(blob)
      } catch (error) {
        console.error('Error creating blob from base64:', error)
      }
    } else if (res.pdfBytes && (Array.isArray(res.pdfBytes) || Array.isArray(res.pdfBytes?.data))) {
      console.log('Using pdfBytes...')
      try {
        const bufferData = res.pdfBytes?.data || res.pdfBytes
        const bytes = new Uint8Array(bufferData)
        const blob = new Blob([bytes], { type: 'application/pdf' })
        blobUrl = URL.createObjectURL(blob)
      } catch (e) {
        console.error('Error creating blob from bytes:', e)
      }
    } else {
      console.log('No PDF data available')
    }
    
    rulesPdfUrl.value = blobUrl
  } else {
    console.log('Response is invalid or null')
    rulesStatus.value = res?.message || 'Failed to load rules.'
  }
  
  rulesLoading.value = false
}

onMounted(() => {
  loadRules()
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
  color: var(--vt-c-warm-white);
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

.rules-container {
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
.rules-scroll-pane {
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

.rules-content {
  color: #2f2416;
  max-width: 1000px;
  margin: 0 auto;
}

.rules-content pre {
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
.rules-scroll-pane::-webkit-scrollbar {
  width: 12px;
}

.rules-scroll-pane::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.rules-scroll-pane::-webkit-scrollbar-thumb {
  background: var(--vt-c-bronze);
  border-radius: 10px;
  border: 2px solid #f4ecd8;
}

.rules-scroll-pane::-webkit-scrollbar-thumb:hover {
  background: var(--vt-c-golden);
}

/* Adjust scroll size for big screens*/
@media (max-width: 1200px) {
  .rules-scroll-pane {
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

  .rules-container {
    height: calc(100vh - 200px);
    min-height: 400px;
  }

  .rules-scroll-pane {
    padding: 2rem 1.5rem;
  }

  .rules-content {
    max-width: 100%;
  }

  .rules-content pre {
    font-size: 1rem;
    line-height: 1.7;
  }

  .empty-state .parchmentButton {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .rules-scroll-pane {
    padding: 1.5rem 1rem;
  }
  
  .rules-content pre {
    font-size: 0.95rem;
  }
}

</style>