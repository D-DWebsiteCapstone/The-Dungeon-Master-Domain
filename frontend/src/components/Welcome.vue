<template>

  <div class="welcomeTutorial">

    <div class="modal" v-if="showWelcome">
      <img class="ratSquirrel"  alt="Mascot" src="../assets/Rat-Squirrel-Outline.png" width = "55" height="55"/>
      <div class="welcomeContainer">
        <img class="speechArrow"alt="speechArrow" src="../assets/images/SpeechArrow.png" width = "45" height="35"/>
          <div class="tutorialtxt">
              <p>{{ displayedText }}</p>
          </div>
          <div class="buttonContainer">
              <button class = "popupButton" v-if="currentStep < tutorialMessages.length - 1" @click="nextTutorialStep">Continue</button>
              <button class = "popupButton" v-else @click="cancelTutorial" :disabled="welcome">Disable Tutorial</button>
              <button class = "popupButton" @click="closeTutorial" :disabled="welcome">Close</button>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref} from 'vue'
import { onMounted } from 'vue'
import { disableTutorial } from '../lib/dataHelper';
import { jwtDecode } from "jwt-decode"

onMounted(() => {
  typeMessage(tutorialMessages[currentStep.value])
})

const token = localStorage.getItem("authToken")
const decoded = jwtDecode(token)
 
const userId = decoded.id 

const showWelcome = ref(true)
const welcome = ref(false)
const currentStep = ref(0)

// added
const displayedText = ref('')
let typingInterval = null

function typeMessage(message) {
  displayedText.value = ''
  let index = 0

  clearInterval(typingInterval)

  typingInterval = setInterval(() => {
    if (index < message.length) {
      displayedText.value += message[index]
      index++
    } else {
      clearInterval(typingInterval)
    }
  }, 50) // speed (lower = faster)
}

// Fun sequential messages
const tutorialMessages = [
  "Welcome, traveler, to the DM Domain! I'm your guide, Rat Squirrel.",
  "I'll be walking you through all you need to know to get started on the website...",
  "To begin, you can create a new campaign, join a preexisting campaign, or create some characters!",
  "To create a campaign, click the 'Create Campaign' button and enter a name. Then, you can give the join code to your players.",
  "If you want to join a campaign, click the 'Join Campaign' button and enter the code given to you by your DM.",
  "Once you're in a campaign, a card for the campaign will appear in the 'Your Campaigns' section at the bottom of the page. Click on it to go to that campaign's home page.",
  "When a campaign session is scheduled, it will appear on your home page calendar and the information for it will appear in the 'upcoming Sessions' table. Click it to go to the campaign's home page.",
  "That's all you need to know to get started! Feel free to explore the website and check out the features. If you have any questions, check out the help section on your account page located in the upper right. Happy adventuring!",
]

function startTutorialSequence() {
  currentStep.value = 0
  showWelcome.value = true
}

function nextTutorialStep() {
  if (currentStep.value < tutorialMessages.length - 1) {
    currentStep.value++
    typeMessage(tutorialMessages[currentStep.value])
  }
}

//
function closeTutorial() {
  showWelcome.value = false
  currentStep.value = 0
}

// disables the tutorial
function cancelTutorial() {
  disableTutorial(userId);
  showWelcome.value = false
  currentStep.value = 0
}

</script>

<style scoped>

.ratSquirrel {
  position: absolute;
  bottom: -3px;
  right: -3px;
  margin-bottom: 7px;
  margin-right: 6px;
}

.speechArrow {
  position: absolute;
  bottom: -35px;
  right: 0;
  margin-right: 5%;
  transform: rotate(180deg);
}

h2 {
  font-size: 1rem;
  color: var(--vt-c-navy);
}

p {
  padding-bottom: 20px;
  font-size: 0.8rem;
}

.popupButton {
  font-size: 0.8rem;
  margin-top: 40px;
  width: fit-content;
}

.tutorialtxt {
  justify-content: center;
  align-items: center;
}

.buttonContainer {
  display: inline-flex;
  position: absolute;
  bottom: 5px;
}

/* Box with tutorial message */
.welcomeContainer {
    position:fixed;
    width: 350px;
    height: 200px;
    bottom: 10%;
    right: 5%;
    padding: 10px;
    padding-top:0;
    display: flex;
    flex-direction: column;
    justify-content:center;
    align-items: center;
    color: var(--vt-c-navy);
    font-size: 0.8rem;
    border: 2px solid var(--vt-c-bronze);
    border-radius: 16px;
    background-color: var(--vt-c-golden);
}

/* Whole Component div */
.welcomeTutorial {
    display: flex;
    justify-content: center;
    align-items: center;
}

@media (max-width: 900px) {
  .speechArrow{
    margin-right: 10%;
  }
}

@media (max-width: 400px) {
  .welcomeContainer {
    width: 90%;
  }

  .popupButton {
    min-width: 40px !important;
    margin: 0 !important;
  }

  p {
    font-size: 0.75rem;
  }

    .speechArrow {
    margin-right: 15%;
  }
}

@media (max-width: 300px) {
  .speechArrow {
    margin-right: 25%;
  }
}

</style>