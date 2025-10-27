<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from './lib/supabaseClient'
import Home from './components/Home.vue'
import Login from './components/Login.vue'

//import { testlogin } from '../../src/Functions.js'

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
    <!-- <component :is="current === 'Login' ? Login : Home" @Login="navigateToHome" /> -->
    <button @click="current = 'Home'">Go to Home</button>
  <component :is="current === 'Login' ? Login : Home" :navigateToHome="navigateToHome" />
    <!-- <ul v-if="current === 'home'">
      <li v-for="u in users" :key="u.userid">{{ u.username }}</li>
    </ul> -->
    <!-- <div style="margin-top: 12px;">
      <strong>testlogin:</strong>
      <pre v-if="testResult">{{ JSON.stringify(testResult, null, 2) }}</pre>
      <p v-else>Loading testlogin...</p>
    </div> -->
  </div>
</template>
