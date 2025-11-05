<template>
 <nav class="navBar">
    <button @click="router.push('/My Information')" :class="{ active: route.path === '/AccountInfo' }">Home</button>
    <button @click="router.push('/Subscription')" :class="{ active: route.path === '/Subscription' }">Recaps</button>
    <button @click="router.push('/History')" :class="{ active: route.path === '/History' }">Maps</button>
  </nav>

  <div class="AccountPage">
    <h1>The Ancient Texts</h1>

    <p>
      The secret texts of this page holds your account settings, your subscription details, 
      the rich lore of your campaign history, and the sacred logout button.
    </p>

    <button @click="router.push('/Login')">LOGOUT</button>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import '../assets/base.css';

const route = useRoute()
const router = useRouter()

</script>
<style scoped>
.navBar {
  display: flex;
  justify-content: space-evenly; /* Even spacing across the full width */
  background-color: var(--vt-c-red);
  padding: 10px;
  width: 100%;

  button {
    flex: 1; /* Each button gets equal width */
    margin: 0 5px;
    padding: 5px 0;
    background: transparent;
    border: none;
    color: var(--vt-c-black);
    font-size: 1rem;
    cursor: pointer;
    min-width: 150px;
  }

  button:hover, button.active {
    background-color: rgba(255, 255, 255, 0.2);
    color: var(--vt-c-white);
  }
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