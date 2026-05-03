<template>
<div class="layout">
  <CampaignMenu :campaignId="campaignId" />

  <div class="campaignPage" v-sound>
    <div class="page-header">
      <h2 class="page-title">Who am I talking to?</h2>
      <p class="page-subtitle">Persons of interest throughout the realm</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="state-box">
      <span class="spinner"></span>
      <p>Consulting the ledger…</p>
    </div>

    <!-- Error -->
    <div v-if="error" class="error-msg">{{ error }}</div>

    <!-- DM add button -->
    <div v-if="isDM && !loading && npcs.length != 0" class="add-row">
      <button class="btn btn-primary btn-large" @click="openCreateModal">
        <span class="btn-icon"></span> Add NPC
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && (npcs==null||npcs.length == 0)" class="state-box empty-box">
      <div class="empty-icon">
        <img alt="Pawn" src="../assets/images/icons/Pawns-Parchment.png">
      </div>
      <p>No notable figures yet.</p>
      <button v-if="isDM" class="btn btn-primary" @click="openCreateModal">Introduce the First NPC</button>
    </div>

    <!-- NPC grid -->
    <div v-else-if="!loading" class="npcGrid">
      <div
        v-for="(npc, i) in npcs"
        :key="npc.id"
        class="npcCard"
        :style="{ animationDelay: `${i * 60}ms` }"
        @click="openDetailModal(npc)"
      >
        <!-- Wax seal / avatar -->
        <div class="npcSeal">
          <span class="npcInitial">{{ npc.name.charAt(0).toUpperCase() }}</span>
        </div>

        <div class="npcBody">
          <h3 class="npcName">{{ npc.name }}</h3>
          <p class="npcPreview">{{ truncate(npc.description, 90) }}</p>
          <p class="npcMeta">Added by {{ npc.createdBy }}</p>
        </div>

        <!-- DM actions inside card, stop propagation so card click doesn't fire -->
        <div v-if="isDM" class="npcCardActions" @click.stop>
          <button class="icon-btn edit-btn" title="Edit NPC" @click="openEditModal(npc)">
            <img alt="Edit" src="../assets/images/icons/Quill-WarmWhite.png">
          </button>
          <button class="icon-btn delete-btn" title="Delete NPC" @click="confirmDelete(npc.id)">
            <img alt="Delete" src="../assets/images/icons/Grave-WarmWhite.png">
          </button>
        </div>
      </div>
    </div>
  </div>
  </div>

  <!-- ── DETAIL MODAL ── -->
  <Teleport to="body">
    <div v-if="showDetailModal" class="modal-backdrop" @click.self="closeDetailModal">
      <div class="modal-box detail-modal">
        <div class="detail-seal">
          <span class="detail-initial">{{ detailNpc?.name.charAt(0).toUpperCase() }}</span>
        </div>
        <h3 class="modal-title">{{ detailNpc?.name }}</h3>
        <div class="detail-scroll">
          <p class="detail-description">{{ detailNpc?.description || 'No description recorded.' }}</p>
        </div>
        <p class="detail-meta">Introduced by {{ detailNpc?.createdBy }} · {{ formatDate(detailNpc?.created_at) }}</p>
        <div class="modal-actions">
          <button class="btn btn-cancel" @click="closeDetailModal">Close</button>
          <template v-if="isDM">
            <button class="btn btn-edit" @click="openEditModal(detailNpc); closeDetailModal()">Edit</button>
            <button class="btn btn-delete" @click="confirmDelete(detailNpc.id); closeDetailModal()">Delete</button>
          </template>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- ── CREATE MODAL ── -->
  <Teleport to="body">
    <div v-if="showCreateModal" class="modal-backdrop" @click.self="closeCreateModal">
       <div class="modal">
        <div class="popup">
          <div class="popuptxt">
            <h3 class="modal-title">New NPC</h3>
            <br>
            <label class="field-label">Name <span class="required">*</span></label>
            <input
              v-model="form.name"
              class="field-input"
              placeholder="e.g. Taven the Innkeeper"
              maxlength="100"
              @keydown.enter="createNpc"
              ref="nameInputRef"
            />
            <br>
            <br>
            <label class="field-label">Description</label>
            <textarea
              v-model="form.description"
              class="field-textarea"
              rows="6"
              placeholder="Appearance, mannerisms, secrets, role in the world…"
              maxlength="2000"
            />
            <p class="char-count">{{ form.description.length }} / 2000</p>
            <div class="modal-actions">
              <button class="btn btn-cancel" @click="closeCreateModal">Cancel</button>
              <button class="btn btn-primary" @click="createNpc" :disabled="!form.name.trim() || saving">
                {{ saving ? 'Saving…' : 'Create' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- ── EDIT MODAL ── -->
  <Teleport to="body">
    <div v-if="showEditModal" class="modal-backdrop" @click.self="closeEditModal">
      <div class="modal">
      <div class="popup">
      <div class="popuptxt">
        <h3 class="modal-title">Edit NPC</h3>
        <br>
        <label class="field-label">Name <span class="required">*</span></label>
        <input v-model="form.name" class="field-input" maxlength="100" @keydown.enter="saveEdit" />
        <br>
        <br>
        <label class="field-label">Description</label>
        <textarea v-model="form.description" class="field-textarea" rows="6" maxlength="2000" />
        <p class="char-count">{{ form.description.length }} / 2000</p>
        <div class="modal-actions">
          <button class="btn btn-cancel" @click="closeEditModal">Cancel</button>
          <button class="btn btn-primary" @click="saveEdit" :disabled="!form.name.trim() || saving">
            {{ saving ? 'Saving…' : 'Save Changes' }}
          </button>
        </div>
      </div>
      </div>
      </div>
    </div>
  </Teleport>

  <!-- ── DELETE MODAL ── -->
  <Teleport to="body">
    <div v-if="showDeleteModal" class="modal-backdrop" @click.self="closeDeleteModal">
      <div class="modal-box modal-danger">
        <div class="danger-icon">⚠️</div>
        <h3 class="modal-title danger-title">Remove NPC</h3>
        <p class="modal-body-text">
          Are you sure you want to remove <strong>{{ deletingName }}</strong>?
          This cannot be undone.
        </p>
        <div class="modal-actions">
          <button class="btn btn-cancel" @click="closeDeleteModal">Cancel</button>
          <button class="btn btn-delete" @click="deleteNpc" :disabled="saving">
            {{ saving ? 'Deleting…' : 'Remove' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiFetch } from '../lib/api'

import CampaignMenu from './CampaignMenus.vue'

const route = useRoute()
const router = useRouter()
const campaignId = route.params.campaignId

// ── State ──
const npcs = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
// const isDM = ref(localStorage.getItem('role') === 'DM')

// ── Modal visibility ──
const showDetailModal = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)

// ── Data refs ──
const form = ref({ name: '', description: '' })
const detailNpc = ref(null)
const editingId = ref(null)
const deletingId = ref(null)
const deletingName = ref('')
const nameInputRef = ref(null)


const isDM = ref(false)
const members = ref([])




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

onMounted(loadNpcs)

// ── API ──
async function loadNpcs() {
  await checkIfDm();
  loading.value = true
  error.value = ''
  try {
    const token = localStorage.getItem('authToken')
    const res = await apiFetch(`/data/campaign/${campaignId}/npcs`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error()
    const data = await res.json()
    npcs.value = data.valid ? data.npcs : []
  } catch {
    error.value = 'Failed to load NPCs. Please try again.'
  } finally {
    loading.value = false
  }
}

async function createNpc() {
  if (!form.value.name.trim() || saving.value) return
  saving.value = true
  error.value = ''
  try {
    const token = localStorage.getItem('authToken')
    const res = await apiFetch(`/data/campaign/${campaignId}/npc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: form.value.name.trim(), description: form.value.description.trim() })
    })
    if (!res.ok) throw new Error()
    await loadNpcs()
    closeCreateModal()
  } catch {
    error.value = 'Failed to create NPC.'
    closeCreateModal()
  } finally {
    saving.value = false
  }
}

async function saveEdit() {
  if (!form.value.name.trim() || saving.value) return
  saving.value = true
  error.value = ''
  try {
    const token = localStorage.getItem('authToken')
    const res = await apiFetch(`/data/npc/${editingId.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: form.value.name.trim(), description: form.value.description.trim() })
    })
    if (!res.ok) throw new Error()
    await loadNpcs()
    closeEditModal()
  } catch {
    error.value = 'Failed to update NPC.'
    closeEditModal()
  } finally {
    saving.value = false
  }
}

async function deleteNpc() {
  if (saving.value) return
  saving.value = true
  error.value = ''
  try {
    const token = localStorage.getItem('authToken')
    const res = await apiFetch(`/data/npc/${deletingId.value}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error()
    await loadNpcs()
    closeDeleteModal()
  } catch {
    error.value = 'Failed to delete NPC.'
    closeDeleteModal()
  } finally {
    saving.value = false
  }
}

// ── Modal helpers ──
function openDetailModal(npc) {
  detailNpc.value = npc
  showDetailModal.value = true
}
function closeDetailModal() {
  showDetailModal.value = false
  detailNpc.value = null
}

function openCreateModal() {
  form.value = { name: '', description: '' }
  showCreateModal.value = true
  nextTick(() => nameInputRef.value?.focus())
}
function closeCreateModal() {
  showCreateModal.value = false
}

function openEditModal(npc) {
  editingId.value = npc.id
  form.value = { name: npc.name, description: npc.description || '' }
  showEditModal.value = true
}
function closeEditModal() {
  showEditModal.value = false
  editingId.value = null
}

function confirmDelete(id) {
  const npc = npcs.value.find(n => n.id === id)
  deletingId.value = id
  deletingName.value = npc?.name || 'this NPC'
  showDeleteModal.value = true
}
function closeDeleteModal() {
  showDeleteModal.value = false
  deletingId.value = null
  deletingName.value = ''
}

// ── Utils ──
function truncate(str, max) {
  if (!str) return ''
  return str.length > max ? str.slice(0, max) + '…' : str
}
function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<style scoped>
/* ── Page ── */

.page-header {
  text-align: center;
  margin: 0rem 0 1rem;
}

.page-title {
  font-size: 2rem;
  color: var(--vt-c-golden);
  margin: 0;
  letter-spacing: 0.04em;
}

.page-subtitle {
  color: var(--vt-c-dark-parchment);
  font-style: italic;
  margin: 0.4rem 0 0;
  font-size: 0.95rem;
}

/* ── Add row ── */
.add-row {
  display: flex;
  justify-content: center;
  margin: 1.5rem 0 2rem;
}

/* ── NPC Grid ── */
.npcGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
}

/* ── NPC Card ── */
.npcCard {
  background: linear-gradient(145deg, rgba(30, 27, 26, 0.95), rgba(20, 17, 17, 0.98));
  border: 1px solid #e8c173b9;
  border-radius: 12px;
  padding: 1.25rem;
  cursor: pointer;
  position: relative;
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
  box-shadow:
    0 10px 25px rgba(0,0,0,0.7),
    inset 0 1px 2px rgba(255,255,255,0.05),
    inset 0 -3px 6px rgba(0,0,0,0.6);
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  animation: cardFadeIn 0.4s ease both;
  z-index: 1;
}

.npcCard::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12;
  background: radial-gradient(ellipse at top left, rgba(192, 168, 106, 0.05), transparent 60%);
  pointer-events: none;
  z-index: 0;
}

.npcCard::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 12px;

  box-shadow:
    0 0 12px rgba(255, 215, 120, 0.655),
    0 0 24px rgba(255, 215, 120, 0.509);

  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
  z-index: 2;
}

.npcCard:hover::after {
  opacity: 1;
}

.npcCard:hover {
  border-color: rgba(192, 168, 106, 0.7);
  transform: translateY(-3px) scale(1.01);
  box-shadow:
    0 16px 30px rgba(0,0,0,0.8),
    inset 0 1px 2px rgba(255,255,255,0.05),
    inset 0 -3px 6px rgba(0,0,0,0.6);
}

@keyframes cardFadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Seal / Avatar ── */
.npcSeal {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: radial-gradient(circle, #3a2e1a, #1e1810);
  border: 2px solid var(--vt-c-dark-parchment);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgb(0, 0, 0), inset 0 1px 0 rgba(192,168,106,0.2);
  text-shadow: 0 0 6px rgba(241, 225, 183, 0.422);
}

.npcInitial {
  color: #c6a965d0;
  font-size: 1.3rem;
  font-weight: 700;
  line-height: 1;
  font-family: Georgia, serif;
}

/* ── Card body ── */
.npcBody {
  flex: 1;
  min-width: 0;
}

.npcName {
  color: var(--vt-c-golden);
  font-size: 1.05rem;
  margin: 0 0 0.35rem;
  font-family: Georgia, serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.npcPreview {
  color: var(--vt-c-parchment);
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0 0 0.5rem;
  overflow-x: hidden;
  text-overflow: ellipsis;
}

.npcMeta {
  color: #6a5a40;
  font-size: 0.72rem;
  margin: 0;
  font-style: italic;
}

/* ── Card action buttons ── */
.npcCardActions {
  position: absolute;
  top: 80px;
  left: 18px;
  display: flex;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.npcCard:hover .npcCardActions {
  opacity: 1;
}

.icon-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.icon-btn:hover { transform: scale(1.15); }

.edit-btn{
  height: 22px;
  width: 22px;
  background: var(--vt-c-blue);
  color: var(--vt-c-warm-white);
}
.edit-btn img{
  height: 19px;
  width: 19px;
}
.delete-btn img{
  height: 24px;
  width: 24px;
}
.delete-btn{
  height: 24px;
  width: 24px;
  background: var(--vt-c-red);
  color: var(--vt-c-warm-white);
}

/* ── Buttons ── */
.btn {
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.9rem;
  padding: 8px 20px;
  transition: transform 0.15s, box-shadow 0.15s, background 0.15s, opacity 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 90px;
  gap: 5px;
  font-family: 'Cinzel', serif;
}

.btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(0,0,0,0.4); }
.btn:active:not(:disabled) { transform: translateY(0); }
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-large { font-size: 1rem; padding: 11px 28px; }
.btn-icon { font-size: 1rem; }

.btn-primary  {
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


.btn-edit     { background: var(--vt-c-blue); color: var(--vt-c-warm-white); }
.btn-edit:hover:not(:disabled) { background: #477cbd; }
.btn-delete   { background: var(--vt-c-red); color: var(--vt-c-warm-white); }
.btn-delete:hover:not(:disabled) { background: #cd4646; }
.btn-cancel   { background: var(--vt-c-grey); color: var(--vt-c-warm-white); border: 1px solid #555; }
.btn-cancel:hover:not(:disabled) { background: #4a453f; }

/* ── Modals ── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.88);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
  padding: 1rem;
}

.modal-box {
  background: linear-gradient(145deg, rgba(30, 27, 26, 0.95), rgba(20, 17, 17, 0.98));
  border: 1px solid #e8c17377;
  border-radius: 14px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(192, 168, 106, 0.1);
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: modalIn 0.2s ease;
}

@keyframes modalIn {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-danger { border-color: rgba(224, 68, 68, 0.5); }

.modal-title {
  color: var(--vt-c-golden);
  text-align: center;
  margin: 0 0 8px;
  font-size: 1.3rem;
  font-family: Georgia, serif;
  letter-spacing: 0.03em;
}

.danger-title { color: #e04444; }
.danger-icon  { text-align: center; font-size: 2rem; margin-bottom: -4px; }

.modal-body-text {
  color: var(--vt-c-parchment);
  text-align: center;
  line-height: 1.6;
  margin: 0.5rem 0;
}

.modal-body-text strong { color: var(--vt-c-golden); }

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 12px;
  flex-wrap: wrap;
}

/* ── Detail modal ── */
.detail-modal { max-width: 560px; }

.detail-seal {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: radial-gradient(circle, #3a2e1a, #1e1810);
  border: 2px solid var(--vt-c-dark-parchment);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.5rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.6);
  text-shadow: 0 0 6px rgba(241, 225, 183, 0.422);
}

.detail-initial {
  color: #c6a965d0;
  font-size: 1.8rem;
  font-family: Georgia, serif;
  font-weight: 700;
}

.detail-scroll {
  max-height: 260px;
  overflow-y: auto;
  padding: 0.75rem;
  background: rgba(0,0,0,0.25);
  border-radius: 8px;
  border: 1px solid rgba(192,168,106,0.1);
  margin: 0.5rem 0;
}

.detail-scroll::-webkit-scrollbar { width: 5px; }
.detail-scroll::-webkit-scrollbar-track { background: transparent; }
.detail-scroll::-webkit-scrollbar-thumb { background: #c0a86a55; border-radius: 3px; }

.detail-description {
  color: var(--vt-c-parchment);
  line-height: 1.75;
  font-size: 0.95rem;
  white-space: pre-wrap;
  margin: 0;
}

.detail-meta {
  color: #6a5a40;
  font-size: 0.75rem;
  text-align: center;
  font-style: italic;
  margin: 0;
}

/* ── Form fields ── */
.popuptxt { padding: 1.5rem; display: block; text-align: left;}
.popuptxt .modal-title {  color: var(--vt-c-dark-brown); }


.field-label {
  color: var(--vt-c-dark-brown);
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.required { color: #e04444; margin-left: 2px; }

.field-input,
.field-textarea {
  width: 100%;
  background: rgba(57, 49, 17, 0.35);
  border: 1px solid #3a3020;
  border-radius: 7px;
  color: var(--vt-c-golden);
  padding: 10px 13px;
  font-size: 0.93rem;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-family: inherit;
}

.field-input:focus,
.field-textarea:focus {
  outline: none;
  border-color: var(--vt-c-parchment);
  box-shadow: 0 0 0 3px rgba(192, 168, 106, 0.12);
}

.field-input::placeholder,
.field-textarea::placeholder {
  color: var(--vt-c-parchment)
}

.field-textarea { resize: vertical; min-height: 120px; }

.char-count {
  color: #6a5a40;
  font-size: 0.72rem;
  text-align: right;
  margin: -4px 0 0;
}

.popup .btn-cancel:hover:not(:disabled) { background: var(--vt-c-dark-grey); }

/* ── States ── */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem 2rem;
  color: var(--vt-c-dark-parchment);
  font-style: italic;
}

.empty-box {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 16px;
  border: 2px dashed var(--vt-c-dark-parchment);
  max-width: 350px;
  min-width: 250px;
  margin: 3rem auto;
  padding: 3rem 2rem;
}

.empty-icon img { height: 60px; width: 60px;}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(192, 168, 106, 0.2);
  border-top-color: #c0a86a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.error-msg {
  color: #ff7777;
  background: rgba(255, 68, 68, 0.08);
  border: 1px solid rgba(255, 68, 68, 0.3);
  border-radius: 8px;
  padding: 0.75rem 1.25rem;
  text-align: center;
  max-width: 500px;
  margin: 1rem auto;
}

@media(max-width: 700px) {
    .popuptxt { padding: 3rem;}
}

/* ── Responsive ── */
@media (max-width: 600px) {
  .npcGrid { grid-template-columns: minmax(100px, 1fr); }
  .npcCard {  max-width: 100%;  }
  .npcCardActions { opacity: 1; }
  .modal-box { padding: 1.5rem; }
  .field-input, .field-textarea {font-size: 0.6rem; }
  .popuptxt { padding: 2.5rem;}
}

@media(max-width: 400px) {
    .popuptxt { padding: 1rem;}
}

@media (max-width: 550px) {
  .campaignPage { margin-left: 10px;}
}
</style>