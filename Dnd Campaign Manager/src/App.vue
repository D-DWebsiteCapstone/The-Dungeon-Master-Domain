<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from './lib/supabaseClient'
import Home from './components/Home.vue'
import Login from './components/Login.vue'

import { useRouter } from 'vue-router'

const router = useRouter()
const users = ref([])
const current = ref('Login')

const fetchItems = async () => {
  try {
    const { data, error: fetchError } = await supabase
      .from('Users') // Replace 'your_table_name' with your actual table name
      .select('*'); // Select all columns, or specify specific columns like 'id, name'

    if (fetchError) {
      throw fetchError;
    }
    items.value = data;
  } catch (err) {
    error.value = err.message;
    console.error('Error fetching data:', err);
  }
};

async function navigateToHome() {
  current.value = 'Home';
  //router.push('/Home');
} 

async function getUser() {
  const { data } = await supabase.from('Users').select()
  users.value = data
}

onMounted(() => {
   getUser()
   //JS METHOD TO FETCH DATA
})
</script>

<template>
<div>
    <component :is="current === 'Login' ? Login : Home" @Login="navigateToHome" />

    <!-- <ul v-if="current === 'home'">
      <li v-for="u in users" :key="u.userid">{{ u.username }}</li>
    </ul> -->
  </div>
</template>

<!-- <style scoped>
.box1 {
  text-align: center;
  left: 50%;
  margin: auto;
  width: 50%;
  height: 200px;
  background-color: lightblue;
}

.box2 {
  text-align: center;
  left: 500%;
  width: 400px;
  height: 170px;
  background-color: White;
  border: 4px Black;
}

.box3 {
  text-align: center;
  left: 50%;
  width: 400px;
  height: 170px;
  background-color: White;
  border: 4px Black;
}

.modal {
  display: none;
  /* Hidden by default */
  position: fixed;
  /* Stay in place */
  z-index: 1;
  /* Sit on top */
  left: 0;
  top: 0;
  width: 100%;
  /* Full width */
  height: 100%;
  /* Full height */
  overflow: auto;
  /* Enable scroll if needed */
  background-color: rgb(0, 0, 0);
  /* Fallback color */
  background-color: rgba(0, 0, 0, 0.4);
  /* Black w/ opacity */
  padding-top: 60px;
}

.LoginPage {
  left: 50%;  

}
</style> -->
