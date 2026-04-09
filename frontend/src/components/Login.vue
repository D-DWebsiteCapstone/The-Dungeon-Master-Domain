<script setup>

defineProps({
  msg: {
    type: String,
    required: false,
  },
  navigateToHome: {
    type: Function,
    required: false,
  }
})
// Frontend routing imports
import {useRouter} from 'vue-router';
import {ref, onMounted, nextTick} from 'vue';
// Sound Imports
import { sounds } from '../buttonSounds.js';
// hosting API fetch helper
import { apiFetch } from '../lib/api'

const users = ref([]);
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
async function navigateToHome(username) {
  current.value = 'Login';
  setCookie(username);
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

  localStorage.setItem('authToken', result.token);
  localStorage.setItem('username', result.user.username);
  document.cookie = "session=active; path=/";

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

// function setCookie(username) {
//   document.cookie = "username=" + username;
// }
// //get cookie using the name of the cookie
// function getCookie(cname) {
//   let name = cname + "=";
//   let decodedCookie = decodeURIComponent(document.cookie);
//   let ca = decodedCookie.split(';');
//   for(let i = 0; i < ca.length; i++) {
//     let c = ca[i];
//     while(c.charAt(0) == ' ') {
//       c = c.substring(1);
//     }
//     if(c.indexOf(name) == 0) {
//       return c.substring(name.length, c.length);
//     }
//   }
//   return "";
// }

// function checkCookie() {
//   let username = getCookie("username");
//   if (username != "") {
//     router.push('/Home');
//   }
// }

// Modal handlers

function openForgotPass() {
  forgotPassModal.value = true;
}
function openSignUp() {
  signUpModal.value = true;
}

// this is the google login stuff. WE NEED THIS!!!!!!!!!
const googleBtn = ref(null);
const discordBtn = ref(null);

function loginWithDiscord() {
  window.location.href = "https://discord.com/oauth2/authorize?client_id=1488942146244448406&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fuser%2Fdiscord%2Fcallback&scope=identify"
}

//this allows the google button to be there on first load
onMounted(async () => {
  const token = localStorage.getItem('authToken');
  const hasSession = document.cookie.split('; ').find(row => row.startsWith('session='));

  const urlParams = new URLSearchParams(window.location.search)
  const discordToken = urlParams.get('token');
  if(discordToken) {
    localStorage.setItem('authToken', discordToken)
    document.cookie = "session=active; path=/";

    const discordPayload = JSON.parse(atob(token.spliit('.')[1]))
    localStorage.setItem('username', discordPayload.username)
    router.push('/Home')
  } else {
    router.push('/')
  }
  if (token && hasSession) {
    router.push('/Home');
    return;
  }
  await nextTick()
  await waitForGoogle()

  //google button stuff
  if (!window.google) {
    console.error("Google script not loaded")
    return
  }

  google.accounts.id.initialize({
    client_id: "812526800082-kphkn27aalckafulgu3kgaoti517vv8g.apps.googleusercontent.com",
    callback: handleCredentialResponse
  })

  google.accounts.id.renderButton(
    googleBtn.value,
    {
      theme: "outline",
      size: "large",
      text: "signin_with",
      shape: "rectangular",
      logo_alignment: "left"
    }
  )
});

function waitForGoogle(timeout =  10000) {
  return new Promise((resolve, reject) => {
    if (window.google) return resolve()

    const interval = setInterval(() => {
      if (window.google) {
        clearInterval(interval)
        resolve()
      }
    }, 100)

    setTimeout(() => {
      clearInterval(interval)
      reject(new Error("Google GSI script failed to load in time"))
    }, timeout)
  })
}

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

    if(!result.token || !result.user?.username) {
      alert("Login failed: Incomplete response from server")
    }

    localStorage.setItem('authToken', result.token);
    localStorage.setItem('username', result.user.username);
    localStorage.setItem('role', result.user.role)

    document.cookie = "session=active; path=/";
    router.push('/Home');
    
  } catch (err) {
    console.error("Google Login Failed:", err);
    alert("Google Login failed");
  }
}


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
      <div ref="googleBtn"></div>
    </form>
    

    <!-- END OF GOOGLE STUFF -->

    <!-- DISCORD STUFF -->

      <div class="box2">
        <button class="parchmentButton" @click="loginWithDiscord">
          Login With discord
        </button>
      </div>

    <!-- End of discord stuff -->

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

<style scoped>
p {
  font-size: 0.85rem;
}

</style>
