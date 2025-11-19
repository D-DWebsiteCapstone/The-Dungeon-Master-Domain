<template>
<div class="accountPage">
<aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <button class="menu-btn" @click="toggleSidebar">
    ☰
  </button>

<h2 class="logo" v-if="!isCollapsed">Collapsed</h2>
 <nav class="navBar">
    <button @click="router.push('/My Information')" :class="{ active: route.path === '/AccountInfo' }">Account</button>
    <button @click="router.push('/Subscription')" :class="{ active: route.path === '/Subscription' }">Subscription</button>
    <button @click="router.push('/History')" :class="{ active: route.path === '/History' }">History</button>
  </nav>
</aside>

<div class="accountMain">
    <h1>The Ancient Texts</h1>

    <p>
      The secret texts of this page holds your account settings, your subscription details, 
      the rich lore of your campaign history, and the sacred logout button.
    </p>

    <button @click="logout()">LOGOUT</button>
    <button @click="showDeleteConfirm = true">DELETE ACCOUNT</button>
    <button v-if="isAdmin" @click="openBanModal">Ban User</button>
    

    <!-- Delete confirmation modal -->
    <div class="modal" v-if="showDeleteConfirm" :style="{ display: 'flex' }">
      <div class="popup">
           <p>{{ deleteMessages[currentStep] }}</p>
          <button v-if="currentStep < deleteMessages.length - 1" @click="nextDeleteStep">Yes, I'm sure</button>
          <button v-else @click="confirmDelete" :disabled="isDeleting">Final Confirmation: Delete my account</button>
          <button @click="cancelDelete" :disabled="isDeleting">Cancel</button>
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

          <button @click="submitBan">Ban User</button>
          <button @click="showBanModal = false">Cancel</button>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import '../assets/base.css';
import { ref, computed, onMounted } from 'vue'

const isCollapsed = ref(false)
const toggleSidebar = () => {
isCollapsed.value = !isCollapsed.value
}
const route = useRoute()
const router = useRouter()

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
    const res = await fetch('https://localhost:3000/user/delete', {
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
  const response = await fetch("https://localhost:3000/user/all", {
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
    const resp = await fetch("https://localhost:3000/user/role", {
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
  const resp = await fetch("https://localhost:3000/user/ban/site", {
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
onMounted(() => {
  checkIfAdmin();
})

</script>
<style scoped>
.navBar {
  grid-column: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 20px;
  background-color: var(--vt-c-dark-grey);
  border-right: 5px solid var(--vt-c-red);
  min-height: calc(100vh - 5rem);
  position: fixed;
  top: 5rem;
  left: 0;
  width: 30vh;
  box-sizing: border-box;

  button {
    margin:1rem;
    padding: 5px 0;
    background: transparent;
    border: none;
    box-shadow: none;
    color: var(--vt-c-warm-white);
    text-align: left;
    font-size: 1rem;
    cursor: pointer;
    min-width: 110px;
  }

  button:hover, button.active {
    background-color: rgba(255, 255, 255, 0.2);
    color: var(--vt-c-white);
  }
}

/* Stack vertically on small screens 
@media (max-width: 730px) {
  .navBar {
    flex-direction: column;
    align-items: stretch; /* Makes each button fill full width 
  }

  button {
    width: 100%;
    margin: 5px 0; /* Space between stacked buttons 
  }

}*/

.accountMain {
  grid-column: 2;
  padding: 40px;
}

.menu-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  left: 0px;
}

.logo {
  font-size: 1.4rem;
  margin-bottom: 2rem;
}
.sidebar.collapsed .logo {
  display: none;
}
/* Adjust grid layout when collapsed */
.sidebar.collapsed + .accountMain {
  grid-column: 2 / 3;
}


@media (max-width: 768px) {
  .main-grid {
    grid-template-columns: 1fr; /* Hide sidebar by default */
  }

  .sidebar {
    position: fixed;
    top: 60px; /* topbar height */
    left: 0;
    height: calc(100vh - 60px);
    width: 250px;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 10;
  }

  .sidebar.collapsed {
    transform: translateX(0); /* Slide in when toggled */
  }

  .accountMain {
    padding: 1.5rem;
  }
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

.popup {
  background: #222;
  padding: 20px;
  width: 320px;
  border-radius: 10px;
  box-shadow: 0 0 10px black;
  color: white;
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