<script setup>
import { ref, onMounted } from 'vue'
//import { supabase } from './lib/supabaseClient'
//import Home from './components/Home.vue'
//import Login from './components/Login.vue'

//import { testlogin } from '../../src/Functions.js'

import { useRouter, useRoute } from 'vue-router'
import TopBarLogin from './components/TopBarLogin.vue'
import TopBar from './components/TopBar.vue'
// These imports are no longer directly used because <router-view> handles routing
// import Home from './components/Home.vue'
// import Login from './components/Login.vue'

// import { testlogin } from '../Backend/src/oldFiles/Functions.js'

const router = useRouter()
const route = useRoute()
const users = ref([])
const current = ref('Login')
const testResult = ref(null)
const items = ref([])
const error = ref(null)

/*
const fetchItems = async () => {
  try {
    const { data, error: fetchError } = await supabase
      .from('Users')
      .select('*')

    if (fetchError) {
      throw fetchError
    }
    items.value = data
  } catch (err) {
    error.value = err.message
    console.error('Error fetching data:', err)
  }
}
*/

async function navigateToHome() {
  current.value = 'Home'
  router.push('/Home')
}

/*
async function getUser() {
  const { data } = await supabase.from('Users').select()
  users.value = data
}
*/

// onMounted(() => {
//   getUser()
// })

const testUsername = 'Damien'
const testPassword = 'VerysecurePa55w.rd'
</script>

<template>
<<<<<<< HEAD
  <TopBar />
<div>
    <!-- <button @click="router.push('/Home')">Go to Home</button> -->
    <!-- <button @click="router.push('/Login')">Go to Login</button> -->
=======
  <!-- Show login top bar only on the login page -->
  <TopBarLogin v-if="route.name === 'Login'" />
  
  <!-- Show normal top bar everywhere else -->
  <TopBar v-else />

  <!-- Temporary navigation buttons -->
  <div style="margin: 1rem 0;">
    <button @click="router.push('/Home')">Go to Home</button>
    <button @click="router.push('/Login')">Go to Login</button>
>>>>>>> dac90be798a7c7b9cf8d11fe97d04f008d52b895
  </div>

  <!-- Main content -->
  <router-view />
</template>