<script setup>
import { ref, onMounted } from 'vue'
// import { supabase } from './lib/supabaseClient'
import { useRouter } from 'vue-router'
import TopBar from './components/TopBar.vue';

// These imports are no longer directly used because <router-view> handles routing
// import Home from './components/Home.vue'
// import Login from './components/Login.vue'

// import { testlogin } from '../Backend/src/oldFiles/Functions.js'

const router = useRouter()
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
  <TopBar />
<div>
    <!-- Optional dev/test button -->
    <button @click="router.push('/Home')">Go to Home</button>
    <button @click="router.push('/Login')">Go to Login</button>
    <!-- This is the key: Vue Router renders the active component here -->
    <router-view />
  </div>
</template>
