<script setup>

import { useRoute, useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { sounds } from '../buttonSounds.js';
import { fetchProfilePic } from '../lib/dataHelper.js'

const route = useRoute()
const router = useRouter()

const showflash = ref(false)
// Profile picture handling
const defaultProfilePic = new URL('../assets/images/pawn.png', import.meta.url).href
const profilePicUrl = ref('')
const profilePicSrc = computed(() => profilePicUrl.value || defaultProfilePic)

// Handle profile picture load error
function onProfilePicError() {
  profilePicUrl.value = defaultProfilePic
}

// Load profile picture on component mount
onMounted(async () => {
  try {
    const result = await fetchProfilePic()
    profilePicUrl.value = result?.profilePic || defaultProfilePic
  } catch (error) {
    console.error('Failed to load top bar profile picture:', error)
    profilePicUrl.value = defaultProfilePic
  }
})

function homeButton(){
    router.push('/Home')
}
function accountButton(){
    router.push('/Account')
}

// Flash image function
function flashImage() {
  // 1/20 chance
  if (Math.random() < 0.05) {
    
    sounds.yoda.currentTime = 0; // restart if already playing
    sounds.yoda.play();

    showflash.value = true

  setTimeout(() => {
    showflash.value = false
  }, 300)
}
}
</script>

<template> 
    <div>

      <div v-sound class=topbar>
          <div class=left>
            <button class =invisibleButton @click = "homeButton()">
            <img  alt="Mascot" src="../assets//images/home.png" width = "35" height="35"/> 
            </button>
          </div>
          <div class =center>
            <h1>The <button class = DMButton @click="flashImage()">DM</button> Domain</h1>
          </div>
          <div class=right>
            <button class = invisibleButton @click = "accountButton()">
              <img class="circle-image" :src="profilePicSrc" @error="onProfilePicError" alt="profile picture" width = "36" height="35" .circle-image/>
              <!-- <img class=settingsButton alt="Settings" src="../assets/images/pawn.png" width = "36" height="35"/> -->
            </button>
          </div>
        </div>                  


        <transition name = "fade"> 
            <div v-if="showflash" class="flashBang">
                <img class = flashImage src = "../assets/images/Boo.png" />
            </div>
        </transition> 

    </div>
</template>

<style scoped>

.DMButton{
  color: var(--vt-c-red);
  display: inline;
  padding-left: 10px;
  padding-right: 10px;
  padding-bottom: 8px;
  justify-content: center;
  align-items: center;
  font-family: "Eagle Lake", serif;
  font-weight: 400;
  font-size: 2rem;
  background-color: transparent;
  background-image: none;
  border: none;
  cursor: pointer;
  box-shadow: none;
  transition: all 0.2s ease-in-out;
}

.DMButton:hover {
  color: var(--vt-c-red);
  display: inline;
  text-shadow:
  0 0 6px rgba(160, 48, 34, 0.6),     /*inner*/
  0 0 12px rgba(212, 175, 55, 0.4),   /*middle*/
  0 0 20px rgba(212, 175, 55, 0.3);   /*outer*/
  animation: emberPulse 3s infinite ease-in-out;
}

button {
  margin-bottom: 0px;
  margin-top: 10px;
  padding:0px;
  color: var(--vt-c-warm-white);
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 200px;
}

button:hover {
  color: var(--vt-c-red);
}

.left{
  display: flex;
  width: 60px;
  margin-left: 10px;
  justify-content: left;
  align-items: left;
  position:relative;
}

.center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  margin: 0;

}

.right{
  display: flex;
  width: 80px;
  margin-right: 30px;
  justify-content: right;
  align-items: right;
  position:relative;
  white-space: nowrap;
  overflow:auto;
  text-overflow: ellipsis;
}

.flashBang {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: top;
  justify-content: center;
  z-index: 999;
}

.flashImage {
  top: 0px;
  left: 0px;
  width: 1200px; /* adjust */
  z-index: 1000;
}

/* Instant appear */
.fade-enter-active {
  transition: none; /* no transition for entering */
}
.fade-enter-from {
  opacity: 1; /* start fully visible */
}

/* Slow fade out */
.fade-leave-active {
  transition: opacity .75s ease; /* slow fade-out, adjust 1s as needed */
}
.fade-leave-to {
  opacity: 0;
}

.settingsButton {
  margin-bottom: 5px;
  margin-left: 20px;
  border: 1px solid var(--vt-c-bronze);
  border-radius: 50%;
}


@media (max-width: 750px) {
  .right {
    max-width: 150px;
    margin-right: 15px;
  }

  .left{
    margin-left: 5px;
  }

  button {
    font-size: 0.75rem;
  }

  h1{
    font-size: 1.5rem;
  }

  .DMButton{
    font-size: 1.57rem;
  }

}

@media (max-width: 580px) {
  .right {
    max-width: 100px;
    margin-right: 10px;
  }

  h1{
    font-size: 1.2rem;
  }

  .DMButton{
    font-size: 1.4rem;
  }

}

@media (max-width: 450px) {
  .right {

    margin-right: 5px;
    width: 60px;

    .invisibleButton{
      width: 30px;
    }

    .settingsButton {
      display: flex;
    }
  }
}

@media (max-width: 300px) {
  .left {
    margin-left: 0px;

  }
}
</style>
