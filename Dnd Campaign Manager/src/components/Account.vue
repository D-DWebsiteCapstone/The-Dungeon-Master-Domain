<template>
<div class="accountPage">

<div class="accountMain">
    <h1>The Ancient Texts</h1>

    <p>
      The secret texts of this page holds your account settings, your subscription details, 
      the rich lore of your campaign history, and the sacred logout button.
    </p>

    <div class="editInfo">
      <h2>Edit Account Information</h2>
      <label for="username">Username:</label>
      <input type="text" id="username" name="username" value="CurrentUsername">
      <label for="password">Password:</label>
      <input type="password" id="password" name="password" value="********">
    </div>

    <button @click="router.push('/Login')">LOGOUT</button>
  </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import '../assets/base.css';
import { ref } from 'vue'

const route = useRoute()
const router = useRouter()

</script>
<style scoped>

.editInfo{
  margin: 1rem;
  display:inline-block;
}

</style>