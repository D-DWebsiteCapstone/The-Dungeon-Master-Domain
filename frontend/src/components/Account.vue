<template>
<div v-sound class="accountPage">

  <h1>The Ancient Texts</h1>

  <p>
    The secret texts of this page holds your account settings, account deletion capabilities, 
      and the sacred logout button.
  </p>

  <div class="divider">
    <img src="../assets/images/divider-left-long.png" alt="divider image">
    <h2>Edit Account</h2>
    <img src="../assets/images/divider-right-long.png" alt="divider image">
  </div>


    <div class = "editInfo">
  <h2>Change Username</h2>
  <input v-model="newUsername" type="text" placeholder="New username" />
  <button class="parchmentButton" @click="changeUsername">Update Username</button>
  <p v-if="usernameMessage">{{ usernameMessage }}</p>
  <div class="spacer">
    <h2>Change Password</h2>
  </div>
  <input v-model="currentPassword" type="password" placeholder="Current password" />
  <input v-model="newPassword" type="password" placeholder="New password" />
  <input v-model="confirmPassword" type="password" placeholder="Confirm new password" />
  <button class="parchmentButton" @click="changePassword">Update Password</button>
  <p v-if="passwordMessage">{{ passwordMessage }}</p>
  <br>
  </div>
  <div class = "spacer">
  <button class="parchmentButton" @click="logoutWithSound">LOGOUT</button>
  <br>
  <button class="parchmentButton" @click="showDeleteConfirm = true">DELETE ACCOUNT</button>
  <br>
  <button class="parchmentButton" v-if="isAdmin" @click="openBanModal">Ban User</button>
  <br>
  <button class="parchmentButton" v-if="isAdmin" @click="openDeleteCampaignModal">Delete Campaigns</button>
  </div>
  

  <!-- Delete confirmation modal -->
  <div class="modal" v-if="showDeleteConfirm" :style="{ display: 'flex' }">
    <div class="popup">
      <div class="popuptxt">
          <p>{{ deleteMessages[currentStep] }}</p>
        <button class = "popupButton" v-if="currentStep < deleteMessages.length - 1" @click="nextDeleteStep">Yes, I'm sure</button>
        <button class = "popupButton" v-else @click="confirmDelete" :disabled="isDeleting">Final Confirmation: Delete my account</button>
        <button  class = "popupButton" @click="cancelDelete" :disabled="isDeleting"v-sound>Cancel</button>
      </div>
    </div>
  </div>
  <div class="modal" v-if="showBanModal">
    <div class="popup">
      <div class="popuptxt">
        <h3>Ban User</h3>

        <input type="text" v-model="search" placeholder="Search users...">

        <select v-model="selectedUserId">
          <option v-for="u in filteredUsers" :key="u.userid" :value="u.userid">
            {{ u.username }}
          </option>
        </select>

        <textarea v-model="banReason" placeholder="Enter reason"></textarea>

        <button class="popupButton" @click="submitBan">Ban User</button>
        <button class="popupButton" @click="showBanModal = false">Cancel</button>
      </div>
    </div>
  </div>
  <!-- Admin Delete Campaign Modal -->
  <div class="modal" v-if="showDeleteCampaignModal">
    <div class="popup">
      <div class="popuptxt">

        <h3>Delete Campaign</h3>

        <p>Select a campaign to permanently delete.</p>

        <select v-model="selectedCampaignId">
          <option disabled value="">-- Select Campaign --</option>
          <option v-for="c in allCampaigns" :key="c.id" :value="c.id">
            {{ c.title }} ({{ c.id }})
          </option>
        </select>

        <button class="popupButton" @click="confirmAdminCampaignDelete">Delete Campaign</button>
        <button class="popupButton" @click="showDeleteCampaignModal = false">Cancel</button>

      </div>
    </div>
  </div>

  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import '../assets/base.css';
import { ref, computed, onMounted } from 'vue'
import { sounds } from '../buttonSounds.js';
import { apiFetch } from '../lib/api'

const showDeleteCampaignModal = ref(false)
const allCampaigns = ref([])
const selectedCampaignId = ref('')
const route = useRoute()
const router = useRouter()

// Special logout button
function logoutWithSound() {
  sounds.sparkle.currentTime = 0 // restart if already playing
  sounds.sparkle.play()
  logout()
}

const logout = () => {
  localStorage.removeItem('authToken')
  router.push('/Login')
}

// Delete flow state
const showDeleteConfirm = ref(false)
const isDeleting = ref(false)
const currentStep = ref(0)

// Fun sequential messages
const deleteMessages = [
  "Are you sure you want to delete your account? This action cannot be undone.",
  "Really? You’ll lose all your data forever. Maybe just log out instead?",
  "Okay… but just to confirm, you *do* realize this erases all your campaigns?",
  "By clicking again, you set in motion events that cannot be reversed.",
  "The digital winds whisper, 'Turn back traveler... the void awaits.'",
  "The ancient scroll trembles — are you truly prepared to unmake your legend?",
  "So be it. Your fate is sealed. Speak the final words, and your tale shall end."
]

function startDeleteSequence() {
  currentStep.value = 0
  showDeleteConfirm.value = true
}

function nextDeleteStep() {
  if (currentStep.value < deleteMessages.length - 1) {
    currentStep.value++
  }
}

function cancelDelete() {
  showDeleteConfirm.value = false
  currentStep.value = 0
}

async function confirmDelete() {
  if (isDeleting.value) return
  isDeleting.value = true
  const token = localStorage.getItem('authToken')
  if (!token) {
    router.push('/Login')
    return
  }

  try {
    const res = await apiFetch('/user/delete', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })

    if (res.ok) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('userId')
      showDeleteConfirm.value = false
      router.push('/Login')
    } else {
      const body = await res.json().catch(() => ({}))
      alert(body.message || 'Failed to delete account')
    }
  } catch (err) {
    console.error('Delete failed', err)
    alert('Network error while deleting account')
  } finally {
    isDeleting.value = false
  }
}

const showBanModal = ref(false);
const allUsers = ref([]);
const selectedUserId = ref(null);
const banReason = ref("");
const search = ref("");
const isAdmin = ref(false);

async function loadUsers() {
  const response = await apiFetch("/user/all", {
    headers: { "Authorization": `Bearer ${localStorage.getItem('authToken')}` },
    cache: "no-store",           
    mode: "cors"                    
  });

  if (!response.ok) {
    console.error("loadUsers failed:", response.status, await response.text());
    allUsers.value = [];
    return;
  }

  const json = await response.json();
  allUsers.value = json;
}


async function checkIfAdmin() {
  try {
    const resp = await apiFetch("/user/role", {
      headers: { "Authorization": `Bearer ${localStorage.getItem('authToken')}` }
    });

    if (!resp.ok) {
      isAdmin.value = false;
      return;
    }

    const data = await resp.json();

    // Accept either backend format:
    // { role: "Admin" } OR { isAdmin: true }
    isAdmin.value =
      data?.role === "Admin" ||
      data?.isAdmin === true ||
      data?.role === true; // just in case backend sends a boolean
  } catch (err) {
    console.error("Failed to check admin role", err);
    isAdmin.value = false;
  }
}


async function openBanModal() {
  console.log("openBanModal() CALLED");
  await loadUsers();
  console.log("Loaded users:", allUsers.value);
  showBanModal.value = true;
  console.log("showBanModal after click:", showBanModal.value);
}


const filteredUsers = computed(() => {
  return allUsers.value.filter(u =>
    u.username.toLowerCase().includes(search.value.toLowerCase())
  );
});

async function submitBan() {
  const resp = await apiFetch("/user/ban/site", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("authToken")}`
    },
    body: JSON.stringify({
      userId: selectedUserId.value,
      reason: banReason.value
    })
  });

  const result = await resp.json();
  alert(result.message);
  showBanModal.value = false;


}

const newUsername = ref('')
const usernameMessage = ref('')

async function changeUsername() {
  usernameMessage.value = ''

  if (!newUsername.value.trim()) {
    usernameMessage.value = 'Please enter a username.'
    return
  }

  try {
    const res = await apiFetch('/user/change-username', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ newUsername: newUsername.value.trim() })
    })

    const result = await res.json()
    if (result.valid) {
      usernameMessage.value = 'Username updated!'
    } else {
      usernameMessage.value = result.message || 'Failed to update username.'
    }
  } catch (e) {
    console.error(e)
    usernameMessage.value = 'Error contacting server.'
  }
}

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordMessage = ref('')

async function changePassword() {
  passwordMessage.value = ''

  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    passwordMessage.value = 'Please fill all password fields.'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    passwordMessage.value = 'New passwords do not match.'
    return
  }

  try {
    const res = await apiFetch('/user/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        currentPassword: currentPassword.value,
        newPassword: newPassword.value
      })
    })

    const result = await res.json()
    if (result.valid) {
      passwordMessage.value = 'Password updated!'
      currentPassword.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
    } else {
      passwordMessage.value = result.message || 'Failed to update password.'
    }
  } catch (e) {
    console.error(e)
    passwordMessage.value = 'Error contacting server.'
  }
}
async function openDeleteCampaignModal() {
  try {
    const token = localStorage.getItem('authToken')

    const res = await apiFetch("/data/campaign/list-all", {
      headers: { Authorization: `Bearer ${token}` }
    })

    const result = await res.json()

    if (result.valid) {
      allCampaigns.value = result.campaigns
    } else {
      alert("Failed to load campaigns.")
    }

    showDeleteCampaignModal.value = true
  } catch (err) {
    console.error("Error loading campaigns:", err)
  }
}

async function confirmAdminCampaignDelete() {
  if (!selectedCampaignId.value) {
    alert("Please select a campaign.")
    return
  }

  if (!confirm("Are you sure you want to delete this campaign?")) return

  try {
    const token = localStorage.getItem('authToken')

    const res = await apiFetch(`/data/admin/campaign/${selectedCampaignId.value}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })

    const result = await res.json()

    if (result.valid) {
      alert("Campaign deleted.")
      showDeleteCampaignModal.value = false
      selectedCampaignId.value = ""
    } else {
      alert(result.message || "Failed to delete campaign")
    }
  } catch (err) {
    console.error("Error deleting campaign:", err)
  }
}

async function adminDeleteCampaign(campaignId) {
  const token = localStorage.getItem("authToken");

  const res = await apiFetch(`/data/campaign/${campaignId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const result = await res.json();

  if (result.valid) {
    alert("Campaign deleted");
  } else {
    alert(result.message || "Delete failed");
  }
}


onMounted(() => {
  checkIfAdmin();
})

</script>
<style scoped> 

.spacer {
  margin-top: 3rem;
  display:flex-start;
}

.divider{
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 10vh;
}

img {
  width: 30%;
  margin-left: 50px;
  margin-right: 50px;
}

.editInfo {
  margin: 6vh;
  display: block;
  text-align: left;
}

p{
  margin-bottom: 1rem;
}


.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.popuptxt {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

textarea {
  min-height: 80px;
  resize: vertical;
}

select, input, textarea {
  width: 100%;
  padding: 6px;
  border-radius: 5px;
}

</style>
