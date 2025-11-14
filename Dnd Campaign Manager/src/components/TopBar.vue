<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'

const route = useRoute()
const router = useRouter()

const showflash = ref(false)

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
    showflash.value = true

  setTimeout(() => {
    showflash.value = false
  }, 300)
}
}
</script>

<template> 
    <div>

            <div class=topbar>
                <button class =invisibleButton @click = "homeButton()">
                <img  alt="Mascot" src="../assets/Rat-Squirrel.png" width = "55" height="55"/> 
                </button>
                <div class =center>
                <h1>The <button class = DMButton @click="flashImage()">DM</button> Domain</h1>
                </div>
                <button class = invisibleButton @click = "accountButton()">Account</button>
            </div>


        <transition name = "fade"> 
            <div v-if="showflash" class="flashBang">
                <img class = flashImage src = "../assets/Boo.png" />
            </div>
        </transition> 

    </div>
</template>

<style scoped>
/* .dm {
    color: var(--vt-c-red);
    display: inline;
    padding-left: 15px;
    padding-right: 15px;
}
 .dm:hover {
    color: var(--vt-c-red);
    display: inline;
    padding-left: 15px;
    padding-right: 15px;
    text-shadow:
    0 0 6px rgba(160, 48, 34, 0.6),   
    0 0 12px rgba(212, 175, 55, 0.4),  
    0 0 20px rgba(212, 175, 55, 0.3);  
    animation: emberPulse 3s infinite ease-in-out;
} */

.DMButton{
    color: var(--vt-c-red);
    display: inline;
    padding-left: 10px;
    padding-right: 0px;
    padding-bottom: 5px;
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
    /* min-width:fit-content; */
    transition: all 0.2s ease-in-out;
}

.DMButton:hover {
    color: var(--vt-c-red);
    display: inline;
    /* padding-left: 15px;
    padding-right: 15px; */
    text-shadow:
    0 0 6px rgba(160, 48, 34, 0.6),     /*inner*/
    0 0 12px rgba(212, 175, 55, 0.4),   /*middle*/
    0 0 20px rgba(212, 175, 55, 0.3);   /*outer*/
    animation: emberPulse 3s infinite ease-in-out;
}

button {
    margin-left: 10px;
    margin-right: 20px;
    margin-bottom: 5px;
    margin-top: 10px;
    padding:0px;
    color: var(--vt-c-warm-white);
}

button:hover {
    color: var(--vt-c-red);
}

.center {
  margin:auto;
}

.flashBang {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
}

.flashImage {
    top:-50px;
    left:0;
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
</style>
