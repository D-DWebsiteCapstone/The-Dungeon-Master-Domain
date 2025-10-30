<template>

  <nav class="navBar">
    <button 
      @click="router.push('/campaign')" 
      :class="{ active: route.path === '/campaign' }"
    >
      Home
    </button>

    <button 
      @click="router.push('/Recaps')" 
      :class="{ active: route.path === '/Recaps' }"
    >
      Recaps
    </button>

    <button 
      @click="router.push('/Maps')" 
      :class="{ active: route.path === '/Maps' }"
    >
      Maps
    </button>

    <button 
      @click="router.push('/CampaignCharacters')" 
      :class="{ active: route.path === '/CampaignCharacters' }"
    >
      Character
    </button>

    <button 
      @click="router.push('/Rules')" 
      :class="{ active: route.path === '/Rules' }"
    >
      Rules
    </button>

    <button 
      @click="router.push('/Members')" 
      :class="{ active: route.path === '/Members' }"
    >
      Members
    </button>
  </nav>

  <div class="campaign-page">
    <h1>Welcome to Your Campaign!</h1>
    <p>You’ve entered campaign code:</p>
    <div class="campaign-code">{{ campaignId }}</div>

  
    <p>
      This is your unique campaign page.  
      Later you can display DM/player content, maps, or character sheets here.
    </p>

  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import '../assets/base.css';

const route = useRoute()
const router = useRouter()

// get the campaign code from the URL (/campaign/:id)
const campaignId = route.params.id

</script>

<style scoped>
.navBar {
  display: flex;
  justify-content: space-evenly; /* Even spacing across the full width */
  background-color: var(--vt-c-red);
  padding: 10px;
  width: 100%;
}

button {
  flex: 1; /* Each button gets equal width */
  margin: 0 5px;
  padding: 10px 0;
  background: transparent;
  border: none;
  color: var(--vt-c-black);
  font-size: 1rem;
  cursor: pointer;
}

button:hover, button.active {
  background-color: rgba(255, 255, 255, 0.2);
  color: var(--vt-c-white);
}

/* Stack vertically on small screens */
@media (max-width: 730px) {
  .navBar {
    flex-direction: column;
    align-items: stretch; /* Makes each button fill full width */
  }

  button {
    width: 100%;
    margin: 5px 0; /* Space between stacked buttons */
  }
}
</style>