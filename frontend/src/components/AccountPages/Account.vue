<template>
<div v-sound class="accountPage">


  <header class="accountHeader">
    <button class="hamburger" @click="toggleSidebar">
        ☰
    </button>

  </header>

  <div 
    v-if="sidebarOpen && isMobile"
    class="modal"
    @click="sidebarOpen = false"
  ></div>

  <div class="accountLayout" :class="{ 'sidebar-collapsed': !sidebarOpen }">
    <aside v-sound class="sidebar" :class="{ open: sidebarOpen }" @click.stop>
      <router-link to="/Account/profile" @click="handleNavClick">Profile</router-link>
      <router-link to="/Account/help" @click="handleNavClick">Help</router-link>
      <router-link to="/Account/discord" @click="handleNavClick">Discord</router-link>

    </aside>

    <main class="content">
      <h1>The Ancient Texts</h1>
      <router-view />
    </main>

  </div>

  <div class = "spacer">
    <button class="parchmentButton" @click="logoutWithSound">LOGOUT</button>
    <br>
    <button class="parchmentButton" @click="showDeleteConfirm = true">DELETE ACCOUNT</button>
    <br>

    <div v-if="isAdmin" class="divider">
    <img src="../../assets/images/dividers/divider-left-long.png" alt="divider image">
    <div class="dividerh2"><h2>Admin</h2></div>
    <img src="../../assets/images/dividers/divider-right-long.png" alt="divider image">
    </div>
    <br>

    <button class="parchmentButton" v-if="isAdmin" @click="openBanModal">Ban User</button>
    <br>
    <button class="parchmentButton" v-if="isAdmin" @click="openDeleteCampaignModal">Delete Campaigns</button>
    <br>
    <button class="parchmentButton" v-if="isAdmin" @click="router.push('/AdminCampaign')">View All Campaigns</button>
    <br>
    <button class="parchmentButton" v-if="isAdmin" @click="router.push('/AdminCharacters')">View All Characters</button>
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
//import '../assets/base.css';
import { ref, computed, onMounted } from 'vue'
import { sounds } from '../../buttonSounds.js';
import { apiFetch } from '../../lib/api'


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
  const searchTerm = (search.value || '').toLowerCase();

  return (allUsers.value || []).filter(u => {
    const username = (u.username || '').toLowerCase();
    return username.includes(searchTerm);
  });
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

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}

const handleNavClick = () => {
  if (isMobile.value) {
    sidebarOpen.value = false;
  }
  sounds.default.play()
};

const isMobile = ref(false)
const sidebarOpen = ref(true)

function updateMobile() {
  isMobile.value = window.innerWidth <= 550
}

onMounted(() => {
  checkIfAdmin();
  updateMobile()
  sidebarOpen.value = !isMobile.value
  
})

</script>
<style scoped> 

.spacer {
  margin-top: 3rem;
  display:flex-start;
}

.text {
  text-align: center;
  margin: auto;
  margin-top: 3rem;
}

.divider{
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 3vh;
}

img {
  max-width: 28%;
  margin-left: 10px;
  margin-right: 10px;
}


p{
  margin-bottom: 1rem;
  width: 85%;
  margin-top: 1rem;
  text-align: center;
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
  z-index: 79;
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
  width: 80%;
  padding: 6px;
  border-radius: 5px;
}

.dividerh2 {
  display: inline;
  margin: 40px;
}


.accountLayout {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 1rem;
  width: 100%;
  margin: auto;
  transition: all 0.3s;
}

/* When collapsed */
.accountLayout.sidebar-collapsed {
  grid-template-columns: 0 1fr;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  max-height: 95%;
  background: rgba(60,40,20,0.5);
  border: 2px solid #7a5a30;
  border-radius: 8px;
  overflow: hidden;
  transition: width 0.3s, padding 0.3s;
}

.accountLayout.sidebar-collapsed .sidebar {
  padding: 0;
  width: 0;
}

.sidebar a {
  text-decoration: none;
  padding: 0.6rem 1rem;
  border-radius: 5px;
  color: white;
  transition: background 0.2s;
}

.sidebar a:hover, .sidebar a.router-link-active {
  background: rgba(255,255,255,0.2);
}

.content {
  /* padding: 2rem; */
  background: rgba(0,0,0,0.15);
  border-radius: 8px;
  min-height: 400px;
}

.accountHeader {
  display: flex;
  position: absolute;
  top: -25px;
  left: 5px;
  align-items: left;
  gap: 3rem;
}

.hamburger {
  font-size: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #fff;
}

@media (max-width: 950px) {
  .accountLayout {
    grid-template-columns: 170px 1fr;
  }
}

@media (max-width: 550px) {

  .accountLayout {
    display: block; /* kill grid */
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    min-height: 100%;
    width: 220px;

    transform: translateX(-100%);
    transition: transform 0.3s ease;

    z-index: 80; /* above modal */
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .content {
    width: 100%;
  }

  .divider {
    display: block;
    img{
      display: none;
    }
  }
}
</style>
