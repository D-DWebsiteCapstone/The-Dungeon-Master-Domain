<script setup>

defineProps({
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
import {useRouter} from 'vue-router';
import {ref} from 'vue';
const router = useRouter();
const current = ref('Login');
//const router = useRouter();

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
async function ResetPassword() {
  const email = document.querySelector("input[name='email']").value;

  if (!email) {
    window.alert('Please enter your email.');
    return;
  }

  try {
    const response = await fetch('https://localhost:3000/user/request-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const result = await response.json();
    window.alert(result.message);
    document.getElementById('id02').style.display = 'none';
  } catch (err) {
    console.error('Reset request failed:', err);
    window.alert('An error occurred. Please try again later.');
  }
};

async function navigateToHome() {
  current.value = 'Login';
  router.push('/Home');
}

async function NavigatorLogin() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const response = await fetch('https://localhost:3000/user/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const result = await response.json();

  if (!result.valid) {
    window.alert(result.message);
    return;
  }

  // Store token in localStorage
  localStorage.setItem('authToken', result.token);
  // Store user id for convenience (optional) if returned by server
  if (result.user && result.user.id) {
    localStorage.setItem('userId', result.user.id);
  }

  // Redirect
  router.push('/Home');
}

async function NewUser() {
  const username = document.querySelector("input[name='uname']").value;
  const password = document.querySelector("input[name='pword']").value;
  const email = document.querySelector("input[name='RecoveryEmail']").value;

  const response = await fetch('https://localhost:3000/user/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });

  const result = await response.json();
  window.alert(result.message);
  document.getElementById('id01').style.display='none';
};

</script>

<template>
  <!-- <ul>
    <li v-for="u in users" :key="u.userid">{{ u.username }}</li>
  </ul> -->
  <div class="login" v-sound>
    <p>Login to reclaim your character sheet and continue your quest. 
      <br>Sign up to inscribe your name in the Great Ledger and forge your legend from scratch.
      <br>Choose wisely, for every great tale begins with a single click...And remember, fortune favors the bold. Enter, if you dare.</p>
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
      <button class="parchmentButton" @click="NavigatorLogin()">Login</button>
      <br>
      <button class="parchmentButton" onclick="document.getElementById('id01').style.display='block'">Sign Up</button>
      <br>
      <button class = "linkButton" onclick="document.getElementById('id02').style.display='block'">Forgot Password</button>
    </div>
    
    
    <div id="id01" class=modal>
      <div class=popup>
      <div class="popuptxt">
        <p>Pick a Username, Password and recovery email for your account.</p>
        <br>
        <input type="text" placeholder="Enter Username" name="uname">
        <br>
        <input type="text" placeholder="Enter Password" name="pword">
        <br>
        <input type="text" placeholder="Enter Recovery Email" name="RecoveryEmail">
        <br>
        <br>
        <button class = "popupButton" @click="NewUser()"> Submit </button>
        <button class = "popupButton" type="button" onclick="document.getElementById('id01').style.display='none'">Cancel</button>
      </div>
      </div>
    </div>

    

    <div id="id02" class=modal>
      <div class=popup>
      <div class="popuptxt">
        <p>Enter your email and we will send you a link to reset your password</p>
        <br>
        <input type="text" placeholder="Enter Email" name="email">
        <br>
        <br>
        <button class = "popupButton" @click="ResetPassword()">Submit</button>
        <button class = "popupButton" type="button" onclick="document.getElementById('id02').style.display='none'">Cancel</button>
      </div>
    </div>
    </div>
  </div>

  
</template>

<style scoped>


</style>