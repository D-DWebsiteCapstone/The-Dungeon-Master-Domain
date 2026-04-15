<template>
<div class="layout">
  <CampaignMenu :campaignId="campaignId" />

  <div class="campaignPage" v-sound>
    <h2>Meet Your Fellow Adventurers!</h2>

    <div class="corner-container">
      <img class="corner bottom-left" src="../assets/images/borders/goldCornerBottomLeft.png" alt="corner decoration" />
      <img class="corner bottom-right" src="../assets/images/borders/goldCornerBottomRight.png" alt="corner decoration" />
      <img class="corner top-right" src="../assets/images/borders/goldCornerTopRight.png" alt="corner decoration" />
      <img class="corner top-left" src="../assets/images/borders/goldCornerTopLeft.png" alt="corner decoration" />
      <div class="table-container">
        <div class="table">
          <div class="table-header">
            <div>User</div>
            <div>Role</div>
            <div v-if="isDm || isAdmin">Manage</div>
          </div>
          <div v-for="u in members" :key="u.userId" class="table-row">
            <div>{{ u.username }}</div>
            <div>{{ u.role }}</div>
            <div>
              <div class="tooltip-container">
                <button v-if="isDm" class="tableButton" @click="openPermissionsModal(u)">
                  <img class="imgQuill" src="../assets/images/icons/Quill-WarmWhite.png" />
                </button>
                <span class="tooltip-text">Edit Permissions</span>
              </div>
              <div class="tooltip-container">
                <button
                  v-if="canRemovePlayers && u.role !== 'DM' && isAdmin || u.userId !== currentUserId"
                  class="tableButton"
                  @click="openRemoveModal(u)"
                >
                  <img class="imgRemove" src="../assets/images/icons/Grave-WarmWhite.png" />
                </button>
                <span class="tooltip-text">Remove player</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="inlineButtons">
      <button v-if="isDm || isAdmin" class="parchmentButton" @click="openBanUser()">Ban User</button>
      <button v-if="!isDm || !isAdmin" class="parchmentButton" @click="confirmLeaveCampaign()">Leave Campaign</button>
      <button v-if="isDm || isAdmin" class="parchmentButton" @click="openUnbanUser()">Unban User</button>
      <button v-if="isDM || isAdmin" class="parchmentButton" @click="deleteCampaign">DELETE CAMPAIGN</button>
    </div>

    <!-- Remove player modal -->
    <div v-if="showRemoveModal" id="removePlayer" class="modal">
      <div class="popup">
        <div class="popuptxt">
          <br><br><br><br>
          <p>Are you sure you want to remove <strong>{{ selectedUser?.name }}</strong>?</p>
          <br /><br />
          <div class="options"><button class="popupButton" @click="confirmRemoveUser()">Remove</button>
          <button class="popupButton" @click="showRemoveModal = false">Cancel</button></div>
        </div>
      </div>
    </div>

    <!-- Change permissions modal -->
    <div v-if="showPermissionsModal" id="playerPermissions" class="modal">
      <div class="popup">
        <div class="popuptxt">
          <br><br><br>
          <p>Select the permissions for <strong>{{ selectedUser?.name }}</strong>.</p>
          <br />
          <div class="radio-group">
            <label class="custom-radio">
              <input type="radio" name="role" value="Player" v-model="selectedRole" />
              <span class="radio-mark"></span>
              Player
            </label>
            <label class="custom-radio">
              <input type="radio" name="role" value="Co DM" v-model="selectedRole" />
              <span class="radio-mark"></span>
              Co-DM
            </label>
          </div>
          <br /><br />
          <div class="options"><button class="popupButton" @click="confirmPermissions()">Submit</button>
          <button class="popupButton" @click="showPermissionsModal = false">Cancel</button></div>
        </div>
      </div>
    </div>

    <!-- Ban user modal -->
    <div v-if="showBanModal" id="banUser" class="modal">
      <div class="popup">
        <div class="popuptxt">
          <p>Select the player you wish to ban from this campaign, then confirm.</p>
          <br /><br />
          <select v-model="selectedUserId">
            <option value="" disabled>Select a player...</option>
            <option v-for="m in members.filter(m => m.role !== 'DM')" :key="m.userId" :value="m.userId">
              {{ m.username }} — {{ m.role }}
            </option>
          </select>
          <br /><br />
          <button class="popupButton" @click="openConfirmBanModal()">Ban User</button>
          <button class="popupButton" @click="showBanModal = false">Cancel</button>
        </div>
      </div>
    </div>
 
  <Teleport to="body">
    <div v-if="showConfirmBanModal" class="modal-backdrop" @click.self="showConfirmBanModal = false">
      <div class="modal-box modal-danger">
        <div class="danger-icon">⚠️</div>
        <h3 class="modal-title danger-title">ban User</h3>
        <p class="modal-body-text">Are you sure?</p>
        <div class="modal-actions">
          <button class="btn btn-cancel" @click="showConfirmBanModal = false">Cancel</button>
          <button class="btn btn-delete" @click="confirmBanUser()">Ban User</button>
        </div>
      </div>
    </div>
  </Teleport>

    <!-- Unban user modal -->
    <div v-if="showUnbanModal" id="unbanUser" class="modal">
      <div class="popup">
        <div class="popuptxt">
          <p>Select the player you wish to unban from this campaign, then confirm.</p>
          <br /><br />
          <select v-model="selectedUnbanUserId">
            <option value="" disabled>Select a banned player...</option>
            <option v-for="m in bannedCampaign" :key="m.userId" :value="m.userId">
              {{ m.username }}
            </option>
          </select>
          <br /><br>
          <!-- FIX: guard added — only opens confirm modal if a user is selected -->
          <button class="popupButton" @click="openConfirmUnbanModal()">Unban User</button>
          <button class="popupButton" @click="showUnbanModal = false">Cancel</button>
        </div>
      </div>
    </div>
  </div>
  </div>

  <Teleport to="body">
    <div v-if="showConfirmUnbanModal" class="modal-backdrop" @click.self="showConfirmUnbanModal = false">
      <div class="modal-box modal-danger">
        <div class="danger-icon">⚠️</div>
        <h3 class="modal-title danger-title">Unban User</h3>
        <p class="modal-body-text">Are you sure?</p>
        <div class="modal-actions">
          <button class="btn btn-cancel" @click="showConfirmUnbanModal = false">Cancel</button>
          <button class="btn btn-delete" @click="confirmUnbanUser()">Unban User</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import '../assets/base.css'
import { apiFetch } from '../lib/api'
import { jwtDecode } from 'jwt-decode'
import CampaignMenu from './CampaignMenus.vue'

const route = useRoute()
const router = useRouter()
const campaignId = route.params.campaignId
const members = ref([])
const bannedCampaign = ref([])

const token = localStorage.getItem('authToken')
const decoded = jwtDecode(token)
const userId = decoded.id
const isAdmin = ref(decoded.role === 'Admin')

const isDM = ref(false)
const isDm = isDM // alias for template
const canRemovePlayers = ref(false)
const currentUserId = ref('')

const showRemoveModal = ref(false)
const showPermissionsModal = ref(false)
const showBanModal = ref(false)
const showUnbanModal = ref(false)
const showConfirmUnbanModal = ref(false)
const showConfirmBanModal = ref(false)
const showConfirmRemovePlayerModal = ref(false)

const selectedUser = ref(null)
const selectedRole = ref('Player')
const selectedUserId = ref('')
const selectedUnbanUserId = ref('')
const selectedRemoveUserId = ref('')
const banUsername = ref('')

// ─── API Calls ────────────────────────────────────────────────────────────────

async function removeUser(id) {
  if (!id) {
    console.error('removeUser called without id')
    return { valid: false, message: 'Missing user id' }
  }
  try {
    const res = await apiFetch(`/data/campaign/${campaignId}/member/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      }
    })
    const json = await res.json().catch(() => null)
    if (!res.ok) {
      console.error('removeUser failed', res.status, json)
      return { valid: false, message: json?.message || `HTTP ${res.status}` }
    }
    return json || { valid: true }
  } catch (err) {
    console.error('removeUser exception', err)
    return { valid: false, message: String(err) }
  }
}

async function postChangeUserRole(userId, role) {
  if (!userId || !role) {
    console.error('postChangeUserRole called without id or role')
    return { valid: false, message: 'Missing parameters' }
  }
  try {
    const res = await apiFetch(`/data/campaign/${campaignId}/change-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ userId, role })
    })
    const json = await res.json().catch(() => null)
    if (!res.ok) {
      console.error('postChangeUserRole failed', res.status, json)
      return { valid: false, message: json?.message || `HTTP ${res.status}` }
    }
    return json || { valid: true }
  } catch (err) {
    console.error('postChangeUserRole exception', err)
    return { valid: false, message: String(err) }
  }
}

async function banUser(id) {
  if (!id) {
    console.error('banUser called without id')
    return { valid: false, message: 'Missing user id' }
  }
  try {
    const res = await apiFetch('/user/ban', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ userId: id, campaignId })
    })
    const json = await res.json().catch(() => null)
    if (!res.ok) {
      console.error('banUser failed', res.status, json)
      return { valid: false, message: json?.message || `HTTP ${res.status}` }
    }
    return json || { valid: true }
  } catch (err) {
    console.error('banUser exception', err)
    return { valid: false, message: String(err) }
  }
}

async function unbanUser(id) {
  if (!id) {
    console.error('unbanUser called without id')
    return { valid: false, message: 'Missing user id' }
  }
  try {
    const res = await apiFetch('/user/ban', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ userId: id, campaignId })
    })
    const json = await res.json().catch(() => null)
    if (!res.ok) {
      console.error('unbanUser failed', res.status, json)
      return { valid: false, message: json?.message || `HTTP ${res.status}` }
    }
    return json || { valid: true }
  } catch (err) {
    console.error('unbanUser exception', err)
    return { valid: false, message: String(err) }
  }
}

// ─── Data Loading ─────────────────────────────────────────────────────────────

async function loadMembers() {
  try {
    const res = await apiFetch(`/data/campaign/${campaignId}/members`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
    })
    const result = await res.json()
    if (result.valid) {
      members.value = result.members
      const tokenUserId = JSON.parse(atob(localStorage.getItem('authToken').split('.')[1])).id
      currentUserId.value = tokenUserId
      const me = result.members.find(m => m.userId === tokenUserId)
      isDM.value = me?.role === 'DM'
      canRemovePlayers.value = me?.role === 'DM' || me?.role === 'Co DM' || isAdmin
    } else {
      members.value = []
      canRemovePlayers.value = false
      currentUserId.value = ''
    }
  } catch (e) {
    console.error('Failed to load campaign members:', e)
    members.value = []
    canRemovePlayers.value = false
    currentUserId.value = ''
  }
}

async function loadBannedCampaign() {
  try {
    const res = await apiFetch(`/data/campaign/${campaignId}/bannedMembers`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
    })
    const result = await res.json()
    if (result.valid && Array.isArray(result.banned)) {
      bannedCampaign.value = result.banned.map(u => ({
        userId: u.userId,
        username: u.username || 'Unknown User'
      }))
    } else {
      bannedCampaign.value = []
    }
  } catch (e) {
    console.error('Failed to load banned users:', e)
    bannedCampaign.value = []
  }
}

// ─── Modal Openers ────────────────────────────────────────────────────────────

function openRemoveModal(member) {
  selectedUser.value = member ? { ...member, name: member.username } : null
  showRemoveModal.value = true
}

function openConfirmUnbanModal() {
  if (!selectedUnbanUserId.value) {
    alert('Please select a user to unban.')
    return
  }
  showUnbanModal.value = false
  showConfirmUnbanModal.value = true
}

function openConfirmBanModal() {
  if (!selectedUserId.value) {
    alert('Please select a user to ban.')
    return
  }
  showBanModal.value = false
  showConfirmBanModal.value = true
}

function openPermissionsModal(member) {
  if (member) {
    selectedUser.value = { ...member, name: member.username }
    selectedRole.value = member.role || 'Player'
  } else {
    selectedUser.value = null
    selectedRole.value = 'Player'
  }
  showPermissionsModal.value = true
}

function openBanUser(member = null) {
  if (member) {
    banUsername.value = member.username || ''
    selectedUser.value = member
    selectedUserId.value = member.userId || ''
  } else {
    banUsername.value = ''
    selectedUser.value = null
    selectedUserId.value = ''
  }
  showBanModal.value = true
}

function openUnbanUser() {
  selectedUnbanUserId.value = ''
  showUnbanModal.value = true
}

// ─── Confirmations ────────────────────────────────────────────────────────────

async function confirmRemoveUser() {
  const id = selectedUser.value?.userId
  if (!id) {
    alert('No user selected to remove.')
    return
  }

  const result = await removeUser(id)
  if (result?.valid) {
    members.value = members.value.filter(m => m.userId !== id)
    showRemoveModal.value = false
    selectedUser.value = null
    alert('User removed from campaign.')
  } else {
    alert(result?.message || 'Failed to remove user.')
  }
}

async function confirmPermissions() {
  const id = selectedUser.value?.userId
  if (!id) {
    alert('No user selected to change permissions for.')
    return
  }
  const role = selectedRole.value || 'Player'
  const result = await postChangeUserRole(id, role)
  if (result?.valid) {
    const idx = members.value.findIndex(m => m.userId === id)
    if (idx !== -1) members.value[idx].role = role
    showPermissionsModal.value = false
    selectedUser.value = null
    alert('Permissions updated.')
  } else {
    alert(result?.message || 'Failed to update permissions.')
  }
}

async function confirmBanUser() {
  const userId =
    selectedUserId.value ||
    members.value.find(m => m.username === (banUsername.value || '').trim())?.userId
  if (!userId) {
    alert('Please select a user to ban.')
    return
  }
  const member = members.value.find(m => m.userId === userId)
  const displayName = member ? member.username : banUsername.value

  const result = await banUser(userId)
  const ok = result && (result.valid === true || result.success === true)
  if (ok) {
    alert(`User ${displayName} has been banned from this campaign.`)
    members.value = members.value.filter(m => m.userId !== userId)
    await loadBannedCampaign()
    showConfirmBanModal.value = false
    banUsername.value = ''
    selectedUserId.value = ''
  } else {
    alert(result?.message || result?.error || 'Failed to ban user.')
  }
}

// FIX: this function is now actually called by the confirm button in the modal
async function confirmUnbanUser() {
  if (!selectedUnbanUserId.value) {
    alert('Please choose a user to unban.')
    return
  }
  const unbannedUser = bannedCampaign.value.find(u => u.userId === selectedUnbanUserId.value)
  const displayName = unbannedUser?.username || selectedUnbanUserId.value

  try {
    const result = await unbanUser(selectedUnbanUserId.value)
    const ok = result && (result.valid === true || result.success === true)
    if (ok) {
      alert(`User ${displayName} has been unbanned from this campaign.`)
      bannedCampaign.value = bannedCampaign.value.filter(u => u.userId !== selectedUnbanUserId.value)
      loadMembers();
      showConfirmUnbanModal.value = false
      selectedUnbanUserId.value = ''
    } else {
      alert(result?.message || 'Failed to unban user.')
    }
  } catch (err) {
    console.error('Unban failed:', err)
    alert('Server error while unbanning user.')
  }
}

async function confirmLeaveCampaign() {
  const currentUserId = JSON.parse(atob(localStorage.getItem('authToken').split('.')[1])).id
  const currentUser = members.value.find(m => m.userId === currentUserId)
  if (!currentUser) {
    alert('Unable to find your membership in this campaign.')
    return
  }
  if (!confirm('Are you sure you want to leave this campaign? You will need a new invite to rejoin.')) return

  try {
    const res = await apiFetch(`/data/campaign/${campaignId}/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      }
    })
    const json = await res.json().catch(() => null)
    if (!res.ok) {
      alert(json?.message || 'Failed to leave campaign.')
      return
    }
    if (json?.valid) {
      alert('You have left the campaign.')
      router.push('/Home')
    } else {
      alert(json?.message || 'Failed to leave campaign.')
    }
  } catch (err) {
    console.error('Leave campaign exception', err)
    alert('Server error while leaving campaign.')
  }
}

async function deleteCampaign() {
  if (!confirm('Are you sure you want to delete this entire campaign? This cannot be undone.')) return
  try {
    const res = await apiFetch(`/data/campaign/${campaignId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
    })
    const json = await res.json()
    if (json.valid) {
      alert('Campaign deleted.')
      router.push('/Home')
    } else {
      alert(json.message || 'Failed to delete campaign.')
    }
  } catch (err) {
    console.error(err)
    alert('Server error while deleting campaign.')
  }
}

onMounted(() => {
  loadMembers()
  loadBannedCampaign()
})
</script>

<style scoped>
.layout {
  display: flex;
  align-items: flex-start;
}
.campaignPage {
  flex: 1;
  margin-left: 10px;
  min-width: 0; /* VERY important for preventing overflow issues */
}
.corner-container {
  margin-top: 10vh;
  margin-bottom: 10vh;
  width: 100%;
  max-width: 700px;
  min-height: 300px;
  position: relative;
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 12px;
  box-shadow: 0 0 30px var(--vt-c-bronze);
  padding: 20px;
  backdrop-filter: blur(3px);
}

.corner {
  position: absolute;
  width: 150px;
  height: 150px;
  z-index: 2;
}

.corner.top-left {
  top: 0;
  left: 0;
  transform: translate(-10%, -10%);
}

.corner.top-right {
  top: 0;
  right: 0;
  transform: translate(10%, -10%);
}

.corner.bottom-left {
  bottom: 0;
  left: 0;
  transform: translate(-10%, 10%);
}

.corner.bottom-right {
  bottom: 0;
  right: 0;
  transform: translate(10%, 10%);
}

.table-container {
  width: 100%;
  padding: 20px;
  overflow-x: auto;
}

.table {
  margin: auto;
  width: 100%;
  min-width: 475px;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  color: var(--vt-c-warm-white);
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(150px, 1fr));
  width: 100%;
  min-height: 60px;
  padding: 8px 20px;
  align-items: center;
  box-sizing: border-box;
  border-bottom: 1px solid var(--vt-c-warm-white);
}

.table-header > div,
.table-row > div {
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.table-row > div:nth-child(3) {
  overflow: visible !important;
  position: relative;
  z-index: 100;
}

.table-header {
  font-weight: bold;
  font-size: 22px;
}

.tableButton {
  background: transparent;
  border: none;
  cursor: pointer;
}


.imgQuill {
  width: 40px;
  height: 40px;
  margin: 0px 4px 3px 0px;
}

.imgRemove {
  width: 40px;
  height: 40px;
  margin-top: 5px;
}

::v-deep(.modal) {
  display: flex;
}

.inlineButtons {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 20px;
  margin-bottom: 4rem;
  max-width: 100%;
  flex-wrap: wrap;
}

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
  background: linear-gradient(160deg, #1e1912, #151209);
  border: 1px solid rgba(192, 168, 106, 0.45);
  border-radius: 14px;
  padding: 2rem;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: modalIn 0.2s ease;
}

@keyframes modalIn {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-danger  { border-color: rgba(224, 68, 68, 0.5); }
.modal-title   { color: #c0a86a; text-align: center; margin: 0 0 8px; font-size: 1.2rem; font-family: Georgia, serif; }
.danger-title  { color: #e04444; }
.danger-icon   { text-align: center; font-size: 2rem; }
.modal-body-text { color: #bbb; text-align: center; line-height: 1.6; margin: 0; }
.modal-actions { display: flex; gap: 10px; justify-content: center; margin-top: 12px; }

.btn {
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.9rem;
  padding: 9px 22px;
  transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4); }
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-primary  { background: #c0a86a; color: #1a1208; }
.btn-primary:hover:not(:disabled) { background: #d4b87a; }
.btn-delete   { background: #e04444; color: #fff; }
.btn-delete:hover:not(:disabled) { background: #f05555; }
.btn-cancel   { background: #3a3530; color: #ccc; border: 1px solid #555; }
.btn-cancel:hover:not(:disabled) { background: #4a453f; }

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
  transition: transform 0.15s;
  background: rgba(224, 68, 68, 0.2);
  color: #ff7777;
}
.icon-btn:hover { transform: scale(1.15); background: rgba(224, 68, 68, 0.5); }

@media (max-width: 940px) {
  .inlineButtons {
    flex-direction: column;
    gap: 16px;
    align-items: center;
  }

  .table {
    min-width: unset;
  }

  /*.table-header,
  .table-row {
    grid-template-columns: repeat(2, minmax(140px, 1fr));
    gap: 10px;
  } */
}

@media (max-width: 950px) {
  .table-header,
  .table-row {
    grid-template-columns: repeat(3, minmax(120px, 1fr));
  }

  .table-row > div:nth-child(1), .table-row > div:nth-child(2) {
    font-size: 0.75rem;
    overflow-x: auto;
  }

  .tooltip-container {
    display: flex;
  }
  .tooltip-text {
    width: 110px;
    bottom: 70%;
    left: 35%;
    font-size: 10px;
  }
}

@media (max-width: 720px) {
  .table-header>div:nth-child(2) {
    display:none;
  }

  .table-row>div:nth-child(1), .table-row>div:nth-child(2) {
    grid-column: 1;
    padding: 5px 0px;
  }

  .table-header, .table-row {
    grid-template-columns: minmax(120px, 1fr) minmax(40px, 1fr);
  }

  .table-header {
    font-size: 1rem;
  }

  .corner-container {
    padding: 12px;
  }

  .tooltip-container {
    display: inline-block;
  }

  .tooltip-text {
    bottom: 94%;
  }
}

@media (max-width: 650px) {
  .table-row>div:nth-child(3) {
    grid-column: 2;
    grid-row: 1/span 2;
  }
  .tooltip-container {
    display: flex;
  }

  .table-container {
    padding: 7px 5px;
  }
}

@media (max-width: 580px) {
  .tooltip-text {
    left: 20%;
  }
}

@media (max-width: 375px) {
  .table-header>div:nth-child(1) {
    grid-column: 1/ span 2;
    text-align: center;
    font-size: 1.2rem;
  }

  .table-header>div:nth-child(3) {
    display: none;
  }

  .table-header, .table-row {
    grid-template-columns: minmax(120px, 1fr), minmax(40px, 0.5fr);
  }

  .tooltip-text {
    display: none;
  }
}

@media (max-width: 550px) {
  .layout {
    display: block; /* removes sidebar column completely */
  }
}
</style>