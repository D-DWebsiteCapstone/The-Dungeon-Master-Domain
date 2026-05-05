<template>
  <div class="navigator">
  <header class="campaignHeader">
    <button class="hamburger" @click="toggleSidebar">
        ☰
    </button>
  </header>

  <div 
    v-if="sidebarOpen && isMobile"
    class="modal"
    @click="sidebarOpen = false"
  ></div>

  <div class="campaignLayout" :class="{ 'sidebar-collapsed': !sidebarOpen }">
    <aside v-sound  class="sidebar" :class="{ open: sidebarOpen }" @click.stop>
      <button
        @click="() => { handleNavClick(); router.push(`/campaign/${campaignId}`)}"
        :class="{ active: route.path === `/campaign/${campaignId}` }"
      >Overview</button>
      <button
        @click="() => { handleNavClick();  router.push(`/campaign/${campaignId}/rules`)}"
        :class="{ active: route.path.includes('/rules') }"
      >Rules</button>
      <button
        @click="() => { handleNavClick(); router.push(`/campaign/${campaignId}/recaps`)}"
        :class="{ active: route.path.includes('/recaps') }"
      >Recaps</button>
      <button
        @click="() => { handleNavClick();  router.push(`/campaign/${campaignId}/maps`)}"
        :class="{ active: route.path.includes('/maps') }"
      >Maps</button>
      <button
        @click="() => { handleNavClick();  router.push(`/campaign/${campaignId}/characters`)}"
        :class="{ active: route.path.includes('/characters') }"
      >Characters</button>
      <button
        @click="() => { handleNavClick();  router.push(`/campaign/${campaignId}/npcs`)}"
        :class="{ active: route.path.includes('/npcs') }"
      >NPCs</button>
      <button
        @click="() => { handleNavClick();  router.push(`/campaign/${campaignId}/messages`)}"
        :class="{ active: route.path.includes('/messages') }"
      >Messages</button>
      <button
        @click="() => { handleNavClick();  router.push(`/campaign/${campaignId}/tools`)}"
        :class="{ active: route.path.includes('/tools') }"
      >DM Screen</button>
      <button
        @click="() => { handleNavClick();  router.push(`/campaign/${campaignId}/members`)}"
        :class="{ active: route.path.includes('/members') }"
      >Members</button>
      <button @click="() => {handleNavClick(); router.push(`/campaign/${campaignId}/invites`)}"
        :class="{ active: route.path.includes('/invites')}"
      >Invites</button>
    </aside>
  </div>
  </div>
</template>
  
<script setup>
  import { useRoute, useRouter } from 'vue-router'
  import { ref, onMounted } from 'vue'
  
  const props = defineProps({
    campaignId: {
      type: String,
      required: true
    }
  })
  
  const route = useRoute()
  const router = useRouter()

  const handleNavClick = () => {
    console.log('nav clicked', {
      isMobile: isMobile.value,
      before: sidebarOpen.value
    })

    if (isMobile.value) {
      sidebarOpen.value = false
      console.log('closing sidebar')
    }
  }

  function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}

  const isMobile = ref(false)
  const sidebarOpen = ref(true)

  function updateMobile() {
    isMobile.value = window.innerWidth <= 550
  }

  onMounted(() => {
    updateMobile()
    sidebarOpen.value = !isMobile.value
  })

</script>

<style scoped>
.navigator {
  position: sticky;
  top: 5px;
  min-height: 100%;
  max-width: 230px;
}

.campaignHeader {
  align-items: left;
  height: 10px;
}

.hamburger {
  display: none;
  position: relative;
  top: 0px;
  left: 0;
  font-size: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #fff;
}

.sidebar {
  position: relative;
  top: 0px;
  left: 0;
  min-height: calc(92vh - 110px);
  width: 200px;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 5px;
  background: rgba(59, 41, 24, 0.5);
  border: 2px solid #7a5a30;
  border-radius: 8px;
  overflow: hidden;
  transition: width 0.3s, padding 0.3s;
}

.campaignLayout.sidebar-collapsed .sidebar {
  padding: 0;
  width: 0;
}

.sidebar button {
  flex: 1;
  background: transparent;
  box-shadow: none;
  border: none;
  text-decoration: none;
  padding: 0.6rem 1rem;
  border-radius: 5px;
  font-family: 'Cinzel', 'serif';
  font-size: 1rem;
  letter-spacing: 1px;
  text-align: left;
  color: white;
  transition: background 0.2s;
}

.sidebar button:hover, .sidebar button.active {
  background: rgba(255,255,255,0.2);
}

@media (max-width: 550px) {

  .hamburger{
    display: block;
  }

  .navigator {
    z-index: 78;
  }

  .modal {
    z-index: 79;
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

}

</style>