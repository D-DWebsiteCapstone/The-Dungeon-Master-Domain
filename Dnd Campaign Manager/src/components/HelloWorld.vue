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
  <h1>Welcome to the Dungeon Masters Domain</h1>
  <br></br>
    <div class="box1">
      <p>Username</p>
      <input type="text" placeholder="Enter Username" id="username" name="username">
      <br>
      <p>Password</p>
      <input type="password" placeholder="Enter Password" id="password" name="password">
      <br>
      <br>
      <!--<button onclick="window.alert('Failed Login')">Login</button>-->
      <button>Login</button>
      <br>
      <br></br>
      <button onclick="document.getElementById('id01').style.display='block'" style="width:auto; ">Sign Up</button>
      <button onclick="document.getElementById('id02').style.display='block'" style="width:auto;">Forgot Password</button>
    </div>
    
    
    
    <div id="id01" class=modal>
      <div class=box2>
        <p>Pick a Username and Password for your account.</p>
        <br>
        <input type="text" placeholder="Enter Username" name="uname">
        <br><br>
        <input type="text" placeholder="Enter Password" name="pword">
        <br>
        <br>
        <button type="button" onclick="document.getElementById('id01').style.display='none'">Cancel</button>
        <button> Submit </button>
      </div>
    </div>

    

    <div id="id02" class=modal>
      <div class=box3>
        <p> If you forgot your password that sucks good luck remembering </p>
        <button type="button" onclick="document.getElementById('id02').style.display='none'">Cancel</button>
      </div>
    </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
