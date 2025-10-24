<script setup>
const props = defineProps({
  msg: {
    type: String,
    required: true,
  },
  navigateToHome: {
    type: Function,
    required: false,
  }
})

import { checkLoginCredentials } from '../lib/dataHelper.js';

/*
function ResetPassword(){
  const email = document.querySelector("input[name='email']").value;
  console.log("ResetPassword() called with:", email);
  // Here you would typically send this data to your backend to handle password reset
  // For now, we'll just close the modal
  document.getElementById('id02').style.display='none';
  window.alert(`Password reset link sent to ${email}! (This is a placeholder alert.)`);
}


function NewUser() {
  const username = document.querySelector("input[name='uname']").value;
  const password = document.querySelector("input[name='pword']").value;
  const email = document.querySelector("input[name='RecoveryEmail']").value;
  console.log("NewUser() called with:", username, password, email);
  // Here you would typically send this data to your backend to create the new user
  // For now, we'll just close the modal
  document.getElementById('id01').style.display='none';
  window.alert(`New user ${username} created! (This is a placeholder alert.)`);
}
**/

async function NavigatorLogin() {
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const results = await checkLoginCredentials(username, password);

  if (results === null) {
    window.alert('Failed Login');
    return;
  }
  else {navigateToHome();}


  console.log("NavigatorLogin() called with:", username, password);

  

  // if (validateUsername(username, password)) {
  //   // Credentials are valid → redirect
  //   navigateToHome(); // Change this to the page you want
  // } else {
  //   // Invalid credentials
  //     console.log("Invalid credentials");

  //   window.alert('Failed Login');
  // }
}
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
      <button @click="NavigatorLogin()">Login</button>
      <br>
      <br></br>
      <button onclick="document.getElementById('id01').style.display='block'" style="width:auto; ">Sign Up</button>
      <br>
      <button onclick="document.getElementById('id02').style.display='block'" style="width:auto;">Forgot Password</button>
    </div>
    
    
    <div id="id01" class=modal>
      <div class=popup>
        <p>Pick a Username, Password and recovery email for your account.</p>
        <br>
        <input type="text" placeholder="Enter Username" name="uname">
        <br>
        <input type="text" placeholder="Enter Password" name="pword">
        <br>
        <input type="text" placeholder="Enter Recovery Email" name="RecoveryEmail">
        <br>
        <br>
        <button type="button" onclick="document.getElementById('id01').style.display='none'">Cancel</button>
        <button @click="NewUser()"> Submit </button>
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
        <button @click="ResetPassword()">Submit</button>
      </div>
    </div>
    
  </div>

  
</template>
