<template>
<nav class="navBar" v-sound>
  <button class="invisibleButton"@click="router.push(`/campaign/${campaignId}`)":class="{ active: route.path === `/campaign/${campaignId}` }">Home</button>
  <button class="invisibleButton"@click="router.push(`/campaign/${campaignId}/recaps`)":class="{ active: route.path.includes('/recaps') }">Recaps</button>
  <button class="invisibleButton"@click="router.push(`/campaign/${campaignId}/maps`)":class="{ active: route.path.includes('/maps') }">Maps</button>
  <button class="invisibleButton"@click="router.push(`/campaign/${campaignId}/characters`)":class="{ active: route.path.includes('/characters') }">Characters</button>
  <button class="invisibleButton"@click="router.push(`/campaign/${campaignId}/rules`)":class="{ active: route.path.includes('/rules') }">Rules</button>
  <button class="invisibleButton"@click="router.push(`/campaign/${campaignId}/members`)":class="{ active: route.path.includes('/members') }">Members</button>
</nav>


  <div class="campaignPage" v-sound>
    <h2>Welcome to Your Campaign!</h2>
    <p>Here you can see all members of the campaign, remove players, and delete the campaign</p>

    <div class="corner-container">
      <img class = "corner bottom-left" src="../assets/images/goldCornerBottomLeft.png" alt="corner decoration" />
      <img class = "corner bottom-right" src="../assets/images/goldCornerBottomRight.png" alt="corner decoration" />
      <img class = "corner top-right" src="../assets/images/goldCornerTopRight.png" alt="corner decoration" />
      <img class = "corner top-left" src="../assets/images/goldCornerTopLeft.png" alt="corner decoration" />
      <div class = "table-container">
        <div class="table">
          <div class="table-header">
            <div>Name</div>
            <div>Role</div>
            <div>Manage</div>
          </div>
            <div v-for="u in members" :key="u.userId" class="table-row">
            <div>{{ u.username }}</div>
            <div>{{ u.role }}</div>
            <div>
                <!---Add quill on paper to manage permissions -->
                <div class="tooltip-container">
                  <button v-if="isDm" class="tableButton" @click="openPermissionsModal(u)"><img class="imgQuill" src="../assets/images/Quill-WarmWhite.png" /></button>
                  <span class="tooltip-text">Edit Permissions</span>
                </div>
                <!--Make remove player button into a gravestone img -->
                <div class="tooltip-container">
                  <button v-if="isDm" class="tableButton" @click="openRemoveModal(u)"><img class ="imgRemove" src="../assets/images/Grave-WarmWhite.png" /></button>
                  <span class="tooltip-text">Remove player</span>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
    <div class="inlineButtons">
      <button v-if="isDm" class = "parchmentButton" @click="openBanUser()">Ban User</button>
      <!-- This is how stuff is hidden from users from the screen-->
      <button v-if = "isDM" class = "parchmentButton" @click="deleteCampaign">DELETE CAMPAIGN</button>

    </div>

    <!--Popup to remove players from the campaign-->
    <div v-if="showRemoveModal" id="removePlayer" class="modal" >
      <div class="popup">
        <div class="popuptxt">
          <p>Are you sure you want to remove <strong>{{ selectedUser?.name }}</strong>?</p>
          <br>
          <br>
          <!--This remove function only occurs visually...get rid of it later-->
          <button class="popupButton" @click="confirmRemoveUser()">Remove</button> 
          <button class="popupButton" @click="showRemoveModal = false">Cancel</button>
        </div>
      </div>
    </div>

    <!--Popup to change permissions for players in the campaign-->
    <div v-if="showPermissionsModal" id="playerPermissions" class="modal" >
      <div class="popup">
        <div class="popuptxt">
          <p>Select the permissions for <strong>{{ selectedUser?.name }}</strong>.</p>
          <br>
          <div class="radio-group">
            <label class="custom-radio">
              <input type="radio" name="role" value="Player"  v-model="selectedRole">
              <span class="radio-mark"></span>
              Player
            </label>

            <label class="custom-radio">
              <input type="radio" name="role" value="Co DM"  v-model="selectedRole">
              <span class="radio-mark"></span>
              Co-DM
            </label>
          </div>
          <br>
          <br>
          <!--This remove function only occurs visually...it is useless-->
          <button class="popupButton" @click="confirmPermissions()">Submit</button> 
          <button class="popupButton" @click="showPermissionsModal = false">Cancel</button>
        </div>
      </div>
    </div>

    <!--Popup to ban nasty wasty users from the campaign-->
        <div v-if="showBanModal" id="banUser" class="modal" >
      <div class="popup">
        <div class="popuptxt">
          <p>Select the player you wish to ban from this campaign, then confirm.</p>
          <br>
          <br>
          <!-- Select a member from the current campaign members -->
          <select v-model="selectedUserId">
            <option value="" disabled>Select a player...</option>
            <option v-for="m in members" :key="m.userId" :value="m.userId">{{ m.username }} — {{ m.role }}</option>
          </select>
          <br />
          <br />
          <button class="popupButton" @click="confirmBanUser()">Ban User</button>
          <button class="popupButton" @click="showBanModal = false">Cancel</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import '../assets/base.css';

const route = useRoute()
const router = useRouter()
// Get the campaign ID from the URL (/campaign/:id)
const campaignId = route.params.campaignId
const members = ref([])


//TODO : Ban user popup logic CHECK IF WORKS
async function banUser(id) {
  // Call backend route to ban a user from this campaign
  if (!id) {
    console.error('banUser called without id')
    return { valid: false, message: 'Missing user id' }
  }

  try {
    const res = await fetch('https://localhost:3000/user/ban', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
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


// Remove user (delegates to backend call)
async function deleteUser(id) {
  return await removeUser(id)
}

// Change permissions popup logic (delegates to backend call)
async function changeUserRole(id, role) {
  return await postChangeUserRole(id, role)
}

// Backend call: remove a member from campaign
async function removeUser(id) {
  if (!id) {
    console.error('removeUser called without id')
    return { valid: false, message: 'Missing user id' }
  }

  try {
    const res = await fetch(`https://localhost:3000/data/campaign/${campaignId}/member/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
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

// Backend call: change a member's role
async function postChangeUserRole(userId, role) {
  if (!userId || !role) {
    console.error('postChangeUserRole called without id or role')
    return { valid: false, message: 'Missing parameters' }
  }

  try {
    const res = await fetch(`https://localhost:3000/data/campaign/${campaignId}/change-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
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

// UI helpers for modals
function openRemoveModal(member) {
  if (member) selectedUser.value = { ...member, name: member.username }
  else selectedUser.value = null
  showRemoveModal.value = true
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

// Called when user confirms removal in the modal
async function confirmRemoveUser() {
  const id = selectedUser.value?.userId
  if (!id) {
    alert('No user selected to remove.')
    return
  }

  if (!confirm(`Are you sure you want to remove ${selectedUser.value?.username}?`)) return

  const result = await removeUser(id)
  if (result && result.valid) {
    members.value = members.value.filter(m => m.userId !== id)
    showRemoveModal.value = false
    selectedUser.value = null
    alert('User removed from campaign.')
  } else {
    alert(result?.message || 'Failed to remove user.')
  }
}

// Called when DM submits permissions change
async function confirmPermissions() {
  const id = selectedUser.value?.userId
  if (!id) {
    alert('No user selected to change permissions for.')
    return
  }

  const role = selectedRole.value || 'Player'
  const result = await postChangeUserRole(id, role)
  if (result && result.valid) {
    const idx = members.value.findIndex(m => m.userId === id)
    if (idx !== -1) members.value[idx].role = role
    showPermissionsModal.value = false
    selectedUser.value = null
    alert('Permissions updated.')
  } else {
    alert(result?.message || 'Failed to update permissions.')
  }
}


// Open the ban modal (optionally pre-fill with a member)
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

// Confirm the ban: find the member by username and call banUser
async function confirmBanUser() {
  // Prefer the explicit selected user id from the dropdown
  const userId = selectedUserId.value || (members.value.find(m => m.username === (banUsername.value || '').trim())?.userId)
  if (!userId) {
    alert('Please select a user to ban.')
    return
  }

  const member = members.value.find(m => m.userId === userId)
  const displayName = member ? member.username : banUsername.value

  // Ask for confirmation before banning
  if (!confirm(`Are you sure you want to ban ${displayName} from this campaign?`)) return

  const result = await banUser(userId)
  // Accept both { valid: true } and legacy { success: true } responses
  const ok = result && (result.valid === true || result.success === true)
  if (ok) {
    alert(`User ${displayName} has been banned from this campaign.`)
    members.value = members.value.filter(m => m.userId !== userId)
    // Close the ban modal and clear inputs
    showBanModal.value = false
    banUsername.value = ''
    selectedUserId.value = ''
  } else {
    alert(result?.message || result?.error || 'Failed to ban user.')
  }
}


//delete campaign function

const isDM = ref(false)
// alias to support templates using different casing
const isDm = isDM
const showDeletePopup = ref(false)
// Modal and selection state
const showRemoveModal = ref(false)
const showPermissionsModal = ref(false)
const showBanModal = ref(false)
const selectedUser = ref(null)
const selectedRole = ref('Player')
// Input model for ban modal (username string)
const banUsername = ref('')
// Selected user id for ban modal (preferred)
const selectedUserId = ref('')

//This is the function to retrieve members from the database for a campaign
async function loadMembers() {
  try {
    const res = await fetch(`https://localhost:3000/data/campaign/${campaignId}/members`, {
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
      isDM.value = me?.role === "DM"
    } else {
      members.value = []
    }
  } catch (e) {
    console.error("Failed to load campaign members:", e)
    members.value = []
  }
}

async function deleteCampaign() {
  if (!confirm("Are you sure you want to delete this entire campaign? This cannot be undone.")) {
    return
  }

  try {
    const res = await fetch(`https://localhost:3000/data/campaign/${campaignId}`, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    })

    const json = await res.json()

    if (json.valid) {
      alert("Campaign deleted.")
      router.push('/Home')
    } else {
      alert(json.message || "Failed to delete campaign.")
    }
  } catch (err) {
    console.error(err)
    alert("Server error while deleting campaign.")
  }
}


onMounted(() => {
  loadMembers()
})


</script>
<style scoped>

.corner-container {
  margin-top:10vh;
  margin-bottom:10vh;
  width: 100%;
  max-width: 700px;
  min-height:300px;
  position:relative;
  display: flex;
  justify-content: center;
  box-sizing: border-box;

  background: transparent;
  border-collapse: collapse;
  border-radius: 12px;  
  box-shadow: 0 0 30px var(--vt-c-bronze); /* warm glow */
  padding: 20px;
  background: rgba(0,0,0,0.25); /* ultra transparent */
  backdrop-filter: blur(3px);
}

.corner {
  position: absolute;
  width: 150px;
  height: 150px;
  z-index:2; 
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
  padding:20px;
  overflow-x: auto;
}

.table{
  margin: auto;
  width: 100%;
  min-width: 475px;
  justify-content: center;
  align-items:center;
  box-sizing: border-box;
  color: var(--vt-c-warm-white);
}

.table-header, .table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  width: 100%;
  padding: 8px 20px;
  align-items: center;
  box-sizing: border-box;
  grid-template-columns: repeat(3, minmax(150px, 1fr));
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
  position: relative; /* important for stacking context */
  z-index: 100;
}

.table-header {
  font-weight: bold;
  font-size: 22px;
}

.tableButton {
  background:transparent;
  border:none;
  cursor:pointer;
}

.imgQuill {
  width: 40px;
  height: 40px;
  margin: 0px;
  margin-right: 4px;
  margin-bottom: 3px;
}

.imgRemove {
  width: 40px;
  height: 40px;
  margin: 0px;
  margin-top:5px;
}

::v-deep(.modal){
  display:flex;
}

.inlineButtons {
  display: flex;
  justify-content: center;
  gap: 40px; /* spacing between options */
  margin-top: 20px;
  margin-bottom: 4rem;
}

@media (max-width: 900px) {
  .inlineButtons {
    flex-direction: column;
    gap: 16px;
    align-items: center;
  }

  .table {
    min-width: unset;
  }

  .table-header,
  .table-row {
    grid-template-columns: repeat(2, minmax(140px, 1fr));
    gap: 10px;
  }
}

@media (max-width: 760px) {
  .table-header,
  .table-row {
    grid-template-columns: repeat(2, minmax(130px, 1fr));
  }
}

@media (max-width: 640px) {
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 6px;
    padding: 10px 12px;
  }

  .table-header {
    font-size: 1rem;
  }

  .corner-container {
    padding: 12px;
  }
}


/* Hide the original radio */
.custom-radio input[type="radio"] {
  display: none;
}

/* The wrapper aligns circle + text inline */
.custom-radio {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 16px;
  margin-bottom: 10px;
  margin-left: 2rem;
}

/* Custom radio circle */
.radio-mark {
  width: 18px;
  height: 18px;
  border: 2px solid var(--vt-c-dark-brown);
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
  position: relative;
  transition: border-color .2s;
}

/* Filled inner dot (hidden until checked) */
.radio-mark::after {
  content: "";
  width: 10px;
  height: 10px;
  background: var(--vt-c-navy);
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  transition: transform .2s ease;
}

/* When checked */
.custom-radio input[type="radio"]:checked + .radio-mark {
  border-color: var(--vt-c-navy);
}

.custom-radio input[type="radio"]:checked + .radio-mark::after {
  transform: translate(-50%, -50%) scale(1);
}

.tooltip-container {
  position: relative;
  display: inline-block;
}

.tooltip-text {
  visibility: hidden;
  opacity: 0;
  width: 150px;
  background-color: var(--vt-c-golden);
  color: var(--vt-c-red);
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;
  position: absolute;
  z-index: 30; /* Ensure it appears above other content */
  bottom: 96%; /* Example: Position above the button */
  left: 45%;
  /*margin-left: -60px;  Half of the width to center it */
  transition: opacity 0.3s ease;
  font-size: 12px
}

.tooltip-container button:hover + .tooltip-text {
  visibility: visible;
  opacity: 1;
}

/*.tooltip-text::after {
  content: "";
  position: absolute;
  top: 100%; /* Position below the tooltip text 
  left: 50%;
  margin-left: -5px; /* Half of the arrow width 
  border-width: 5px;
  border-style: solid;
  border-color: #333 transparent transparent transparent; /* Color of the arrow 
} */


</style>
