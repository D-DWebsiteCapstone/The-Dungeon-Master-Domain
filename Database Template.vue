<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from './lib/supabaseClient'

//Holds the data pulled from the database
const users = ref([])

//Makes sure that data is being pulled from the database correctly Copy and paste for each table.
const fetchItems = async () => {
  try {
    const { data, error: fetchError } = await supabase
      .from('your_table_name') // Replace 'your_table_name' with your actual table name
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

//Test Query method to pull from the user table in database
/*async function getUser() {
  const { data } = await supabase.from('Users').select()
  users.value = data
}*/

onMounted(() => {
   //getUser() add whatever query method you want to run on page load here
})
</script>

<template>
  <ul>
    <!--<li v-for="u in users" :key="u.userid">{{ u.username }}</li> Outputs the results of the query in a list-->
  </ul>
</template>