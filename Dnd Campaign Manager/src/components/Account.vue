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

    <!-- Delete confirmation modal -->
    <div class="modal" v-if="showDeleteConfirm" :style="{ display: 'flex' }">
      <div class="popup">
        <p>Are you sure you want to permanently delete your account? This action cannot be undone.</p>
        <button @click="confirmDelete" :disabled="isDeleting">Yes, delete my account</button>
        <button @click="showDeleteConfirm = false" :disabled="isDeleting">Cancel</button>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import '../assets/base.css';
import { ref } from 'vue'

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

// Delete account state and handler
const showDeleteConfirm = ref(false)
const isDeleting = ref(false)

async function confirmDelete() {
  if (isDeleting.value) return
  isDeleting.value = true
  const token = localStorage.getItem('authToken')
  if (!token) {
    // Not logged in — redirect to login
    router.push('/Login')
    return
  }

  try {
    const res = await fetch('https://localhost:3000/user/delete', {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (res.ok) {
      // account deleted — remove auth and redirect
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
</style>