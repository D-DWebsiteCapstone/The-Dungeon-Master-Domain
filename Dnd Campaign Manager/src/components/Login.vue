<script setup>

defineProps({
  msg: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <!-- <ul>
    <li v-for="u in users" :key="u.userid">{{ u.username }}</li>
  </ul> -->
  <div class="login">
    <p>Log in to reclaim your character sheet and continue your quest. Sign up to inscribe your name in the Great Ledger and forge your legend from scratch. Choose wisely, for every great tale begins with a single click...And remember, fortune favors the bold. Enter, if you dare.</p>
    <br>
    <br>

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
      <div class=popup>
        <p>Pick a Username and Password for your account.</p>
        <br>
        <input type="text" placeholder="Enter Username" name="uname">
        <br>
        <input type="text" placeholder="Enter Password" name="pword">
        <br>
        <br>
        <button type="button" onclick="document.getElementById('id01').style.display='none'">Cancel</button>
        <button> Submit </button>
      </div>
    </div>

    

    <div id="id02" class=modal>
      <div class=popup>
        <p>Enter your email and we will send you a link to reset your password</p>
        <br>
        <input type="text" placeholder="Enter Email" name="email">
        <br>
        <br>
        <button type="button" onclick="document.getElementById('id02').style.display='none'">Cancel</button>
      </div>
    </div>
    
  </div>

  
</template>
