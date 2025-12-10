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
import { sounds } from '../buttonSounds.js';
import { apiFetch } from '../lib/api'
const router = useRouter();
const current = ref('Login');
const forgotPassModal = ref(false);
const signUpModal = ref(false);

async function ResetPassword() {
  const email = document.querySelector("input[name='email']").value;

  if (!email) {
    window.alert('Please enter your email.');
    return;
  }

  try {
    const response = await apiFetch('/user/request-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const result = await response.json();
    window.alert(result.message);
    forgotPassModal.value = false;
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

  const response = await apiFetch('/user/login', {
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
  // Store user id for convenience if returned by server
  if (result.user && result.user.id) {
    localStorage.setItem('userId', result.user.id);
  }
  // Store username so other pages can use it to scope requests
  if (result.user && result.user.username) {
    localStorage.setItem('username', result.user.username);
  }

  // Redirect
  router.push('/Home');
}

async function NewUserSound() {
  sounds.sparkle.currentTime=0
  sounds.sparkle.play()
  NewUser()
}

async function NewUser() {
  const username = document.querySelector("input[name='uname']").value;
  const password = document.querySelector("input[name='pword']").value;
  const email = document.querySelector("input[name='RecoveryEmail']").value;

  const response = await apiFetch('/user/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });

  const result = await response.json();
  window.alert(result.message);
  signUpModal.value = false;
};



function openForgotPass() {
  forgotPassModal.value = true;
}
function openSignUp() {
  signUpModal.value = true;
}
</script>

<template>
  <!-- <ul>
    <li v-for="u in users" :key="u.userid">{{ u.username }}</li>
  </ul> -->
  <div class="login" v-sound>
    <p>Login to reclaim your characters and continue your quest. 
      <br>Sign up to inscribe your name in the Great Ledger and forge your legend from scratch.
      <br>Choose wisely, for every great tale begins with a single click...And remember, fortune favors the bold. Enter, if you dare.</p>
    <br>
    <br>

    <form class="box1" @submit.prevent="NavigatorLogin">
      <p>Username</p>
      <input type="text" placeholder="Enter Username" id="username" name="username">
      <br>
      <p>Password</p>
      <input type="password" placeholder="Enter Password" id="password" name="password">
      <br>
      <br>
      <!--<button onclick="window.alert('Failed Login')">Login</button>-->
      <button class="parchmentButton" type="submit">Login</button>
      <br>
      <button class="parchmentButton" type="button" @click="openSignUp">Sign Up</button>
      <br>
      <button class = "linkButton" type="button" @click="openForgotPass">Forgot Password</button>
    </form>
    
    
    <div v-if="signUpModal" id="signUp" class=modal>
      <div class=popup>
      <div class="popuptxt">
        <p>Pick a Username, Password, and Recovery Email for your account.</p>
        <br>
        <input type="text" placeholder="Enter Username" name="uname">
        <br>
        <input type="text" placeholder="Enter Password" name="pword">
        <br>
        <input type="text" placeholder="Enter Recovery Email" name="RecoveryEmail">
        <br>
        <br>
        <button class = "popupButton" @click="NewUserSound()"> Submit </button>
        <button class = "popupButton" type="button" @click="signUpModal = false">Cancel</button>
      </div>
      </div>
    </div>

    

    <div v-if="forgotPassModal" id="forgotPass" class=modal>
      <div class=popup>
      <div class="popuptxt">
        <p>Enter your email and we will send you a link to reset your password</p>
        <br>
        <input type="text" placeholder="Enter Email" name="email">
        <br>
        <br>
        <button class = "popupButton" @click="ResetPassword()">Submit</button>
        <button class = "popupButton" type="button" @click="forgotPassModal = false">Cancel</button>
      </div>
    </div>
    </div>
  </div>

  
</template>
