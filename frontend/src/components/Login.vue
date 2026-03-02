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
// Backend Route Imports
import { checkLoginCredentials } from '../lib/dataHelper.js';
// Frontend routing imports
import {useRouter} from 'vue-router';
import {ref} from 'vue';
// Sound Imports
import { sounds } from '../buttonSounds.js';
// hosting API fetch helper
import { apiFetch } from '../lib/api'

const router = useRouter();
const current = ref('Login');
const forgotPassModal = ref(false);
const signUpModal = ref(false);

// Password reset handler
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

// Home Page routing
async function navigateToHome() {
  current.value = 'Login';
  router.push('/Home');
}

// Login handler
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

// Account creation sound effect
async function NewUserSound() {
  sounds.sparkle.currentTime=0
  sounds.sparkle.play()
  NewUser()
}

// Account creation handler
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


// Modal handlers
function openForgotPass() {
  forgotPassModal.value = true;
}
function openSignUp() {
  signUpModal.value = true;
}


// this is the google login stuff. WE NEED THIS!!!!!!!!!
async function handleCredentialResponse(response) {
  const idToken = response.credential;

  try {
    const res = await apiFetch('/user/google-login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json' },
      body: JSON.stringify({token: idToken})
    });

    const result = await res.json();

    if(!result.valid) {
      alert(result.message);
      return;
    }


    localStorage.setItem('authToken', result.token);
    localStorage.setItem('username', result.user.username);
    localStorage.setItem('userId', result.user.id);

    router.push('/Home');
    
  } catch (err) {
    console.error("Google Login Failed:", err);
    alert("Google Login failed");
  }
  

  console.log("Encoded JWT ID token: " + response.credential);

    //WE DO NOT WANT THIS FOREVER!!!!!!!! THIS IS TEMPORARY
    const decoded = jwt_decode(response.credential);
    console.log("Decoded payload: ", decoded);
  }
window.handleCredentialResponse = handleCredentialResponse;


</script>


<template>
  <ul>
    <li v-for="u in users" :key="u.userid">{{ u.username }}</li>
  </ul>
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

    <!-- 
   THIS IS ALL THE GOOGLE STUFF
    -->
    
    <form class="box2" @submit.prevent="NavigatorLogin">
      <div
        id="g_id_onload"
        data-client_id="812526800082-kphkn27aalckafulgu3kgaoti517vv8g.apps.googleusercontent.com"
        data-callback="handleCredentialResponse"
        data-auto_prompt="false">
      </div>
      <div
        class="g_id_signin"
        data-type="standard"
        data-size="large"
        data-theme="outline"
        data-text="sign_in_with"
        data-shape="rectangular"
        data-logo-alignment="left">
      </div>

    </form>
    

    <!-- END OF GOOGLE STUFF -->

    <div v-if="signUpModal" id="signUp" class=modal>
      <div class=popup>
      <div class="popuptxt">
        <p>Pick a Username, Password, and Recovery Email for your account.</p>
        <br>
        <input type="text" placeholder="Enter Username" name="uname">
        <br>
        <input type="password" placeholder="Enter Password" name="pword">
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
