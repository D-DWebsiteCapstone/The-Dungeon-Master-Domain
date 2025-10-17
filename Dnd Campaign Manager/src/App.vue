<script setup>
import { ref, onMounted } from 'vue'
//import { supabase } from './lib/supabaseClient'
import Home from './components/Home.vue'
import Login from './components/Login.vue'
import TopBar from './components/TopBar.vue'
import { useRouter } from 'vue-router'

// --- State variables ---
const router = useRouter()
const users = ref([])
const current = ref('Login')
const testResult = ref(null)
const items = ref([])
const error = ref(null)

// --- Navigation helper ---
async function navigateToHome() {
  current.value = 'Home'
  router.push('/Home')
}

/*
// Example: Fetching data from Supabase (currently unused)
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

// Example: Getting all users (currently unused)
async function getUser() {
  const { data } = await supabase.from('Users').select()
  users.value = data
}

// onMounted(() => {
//   getUser()
// })
*/

const testUsername = 'Damien'
const testPassword = 'VerysecurePa55w.rd'
</script>

<template>
  <TopBar />

  <div>
    <!-- Dev navigation buttons -->
    <button @click="router.push('/Home')">Go to Home</button>
    <button @click="router.push('/Login')">Go to Login</button>

    <!-- Vue Router renders the current view here -->
    <router-view />
  </div>
</template>

