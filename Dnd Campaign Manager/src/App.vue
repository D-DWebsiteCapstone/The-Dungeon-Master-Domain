<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from './lib/supabaseClient'

const users = ref([])

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

/*async function getUser() {
  const { data } = await supabase.from('Users').select()
  users.value = data
}*/

onMounted(() => {
   //getUser()
})
</script>

<template>
  <ul>
    <!---<li v-for="u in users" :key="u.userid">{{ u.username }}</li>--->
  </ul>
</template>