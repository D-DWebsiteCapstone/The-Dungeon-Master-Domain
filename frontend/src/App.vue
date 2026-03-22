<script setup>
import { ref, onMounted } from 'vue'
import Footer from './components/Footer.vue'
import Home from './components/Home.vue'
import Login from './components/Login.vue'

//import { testlogin } from '../../src/Functions.js'

import { useRouter, useRoute } from 'vue-router'
import TopBarLogin from './components/TopBarLogin.vue'
import TopBar from './components/TopBar.vue'
import TroubleTicket from './components/TroubleTicket.vue'
import SupportChat from './components/SupportChat.vue'
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

</script>

<template>
  <div v-if="route.name === 'Login'"></div>
  <div v-else><TroubleTicket/><SupportChat/> </div>
  
  <!-- Show login top bar only on the login page -->
  <TopBarLogin v-if="route.name === 'Login'" />
  
  <!-- Show normal top bar everywhere else -->
  <TopBar v-else />



  <!-- Main content -->

  <router-view />
  <Footer />
</template>
