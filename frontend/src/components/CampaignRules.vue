<template>
  <CampaignMenu :campaignId="campaignId" />

  <div class="campaignPage" v-sound>
    <h2>Rules to follow throughout your journey!</h2>

    <!-- Loading -->
    <div v-if="rulesLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading rules...</p>
    </div>

    <!-- Error -->
    <div v-else-if="rulesStatus" class="error-state">
      <p>{{ rulesStatus }}</p>
      <button class="parchmentButton" @click="loadRules">Try Again</button>
    </div>

    <div v-else class="rules-container">

      <!-- DM: New Rule button + form -->
      <div class="rules-form-section">
        <button class="parchmentButton" @click="showForm = !showForm">
          {{ showForm ? 'Cancel' : '+ New Rule' }}
        </button>

        <div v-if="showForm" class="rules-form">
          <textarea
            v-model="newDescription"
            placeholder="Write your rule here..."
            rows="6"
          />
          <p v-if="formError" class="error-text">{{ formError }}</p>
          <button class="parchmentButton" :disabled="formLoading" @click="createRule">
            {{ formLoading ? 'Saving...' : 'Create Rule' }}
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="rules.length === 0 && !showForm" class="empty-state">
        <p>No rules yet.</p>
        <p>Use the button above to write your first rule!</p>
      </div>

      <!-- Rules list -->
      <div
        v-for="rule in rules"
        :key="rule.id"
        class="rule-card rules-scroll-pane"
      >
        <div class="rules-header">
          <span class="rule-number">Rule {{ rule.orderNumber }}<br></span>
        </div>

        <!-- Edit mode -->
        <div v-if="editingId === rule.id" class="rules-content">
          <textarea v-model="editDescription" rows="8" style="width: 100%; font-family: Georgia, serif; font-size: 1.1rem;" />
          <div style="display: flex; gap: 1rem; margin-top: 1rem;">
            <button class="parchmentButton" @click="saveEdit(rule.id)">Save</button>
            <button class="parchmentButton" @click="cancelEdit">Cancel</button>
          </div>
        </div>

        <!-- View mode -->
        <div v-else class="rules-content">
          <pre>{{ rule.description }}</pre>
          <button class="parchmentButton" @click="startEdit(rule)">Edit</button>
          <button class="parchmentButton" @click="removeRule(rule.id)">Delete</button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchRules, saveRule, editRule as editRuleHelper, deleteRule } from '../lib/dataHelper.js'

import CampaignMenu from './CampaignMenus.vue'
import { apiFetch } from '../lib/api.js'

defineProps({
  campaignId: {
    type: String,
    required: false
  }
})

const route = useRoute()
const router = useRouter()

const campaignId = route.params.campaignId

// Reactive state
const rules = ref([])
const rulesLoading = ref(false)
const rulesStatus = ref('')
const showForm = ref(false)
const newDescription = ref('')
const formLoading = ref(false)
const formError = ref('')

async function loadRules() {
  rulesLoading.value = true
  rulesStatus.value = ''

  try {
    const result = await fetchRules(campaignId)

    if (result?.rules) {
      rules.value = result.rules
    } else {
      rulesStatus.value = 'No rules found.'
    }
  } catch (err) {
    console.error('Failed to load rules:', err)
    rulesStatus.value = 'Something went wrong loading rules.'
  } finally {
    rulesLoading.value = false
  }
}

async function createRule() {
  if (!newDescription.value.trim()) {
    formError.value = 'Rule cannot be empty.'
    return
  }
  formLoading.value = true
  formError.value = ''

  try {
    const res = await apiFetch(`/rules/${campaignId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ description: newDescription.value.trim() })
    })
    const data = await res.json()
    if (data) {
      newDescription.value = ''
      showForm.value = false
      loadRules()
    } else {
      formError.value = data.message || 'Failed to save rule.'
    }
  } catch (err) {
    console.error('Failed to create rule:', err)
    formError.value = 'Something went wrong.'
  } finally {
    formLoading.value = false
  }
}

// Rule editing
const editingId = ref(null)
const editDescription = ref('')

function startEdit(rule) {
  console.log('startEdit got:', JSON.stringify(rule))
  editingId.value = rule.id
  editDescription.value = rule.description
}

function cancelEdit() {
  editingId.value = null
  editDescription.value = ''
}

async function saveEdit(ruleId) {
  console.log('saveEdit called with ruleId:', ruleId)
  if (!editDescription.value.trim()) return

  try {
    const res = await apiFetch(`/rules/${campaignId}/${ruleId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ description: editDescription.value.trim() })
    })
    const data = await res.json()
    if (data) {
      const index = rules.value.findIndex(r => r.id === ruleId)
      if (index !== -1) rules.value[index].description = editDescription.value.trim()
      cancelEdit()
    }
  } catch (err) {
    console.error('Failed to edit rule:', err)
  }
}

async function removeRule(ruleId) {
  if (confirm('Are you sure you want to delete this rule?')) {
    try {
      await apiFetch(`/rules/${campaignId}/${ruleId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      })
      rules.value = rules.value.filter(r => r.id !== ruleId)
      loadRules()
    } catch (err) {
      console.error('Failed to delete rule:', err)
    }
  }
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
  color: var(--vt-c-golden);
  margin-bottom: 0.5rem;
  font-size: 2.5rem;
  text-align: center;
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
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.rules-scroll-pane {
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

.rules-scroll-pane::-webkit-scrollbar { width: 12px; }
.rules-scroll-pane::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 10px; }
.rules-scroll-pane::-webkit-scrollbar-thumb { background: var(--vt-c-bronze); border-radius: 10px; border: 2px solid #f4ecd8; }
.rules-scroll-pane::-webkit-scrollbar-thumb:hover { background: var(--vt-c-golden); }

@media (max-width: 1200px) {
  .rules-scroll-pane { padding: 3rem 4rem; }
}

@media (max-width: 768px) {
  .campaignPage { padding: 1rem; }
  .campaignPage h2 { font-size: 2rem; }
  .rules-container { height: calc(100vh - 200px); min-height: 400px; }
  .rules-scroll-pane { padding: 2rem 1.5rem; }
  .rules-content { max-width: 100%; }
  .rules-content pre { font-size: 1rem; line-height: 1.7; }
}

@media (max-width: 480px) {
  .rules-scroll-pane { padding: 1.5rem 1rem; }
  .rules-content pre { font-size: 0.95rem; }
}
</style>