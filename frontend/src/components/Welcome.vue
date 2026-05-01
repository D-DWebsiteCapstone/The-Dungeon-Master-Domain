<template>

  <div class="welcomeTutorial">

    <div class="modal" v-if="showWelcome">
      <img class="ratSquirrel"  alt="Mascot" src="../assets/Rat-Squirrel-Outline.png" width = "55" height="55"/>
      <div class="welcomeContainer">
        <button class = "invisibleButton close" @click="closeTutorial" :disabled="welcome">X</button>
        <img class="speechArrow"alt="speechArrow" src="../assets/images/miscImages/Arrow-Paper.png" width = "45" height="35"/>
          <div class="tutorialtxt" @click="skipTyping">
              <p>{{ displayedText }}</p>
          </div>
          <div class="buttonContainer">
              <button class = "invisibleButton back" v-if="currentStep > 0" @click="lastTutorialStep">
                <img class="arrowimg " alt="backArrow" src="../assets/images/icons/arrow-back.png">
              </button>
              <button class = "invisibleButton next" v-if="currentStep < tutorialMessages.length - 1" @click="nextTutorialStep">
                <img class="arrowimg " alt="nextArrow" src="../assets/images/icons/arrow-next.png">
              </button>
              <button class = "popupButton disable" v-else @click="cancelTutorial" :disabled="welcome">Disable Tutorial</button>
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

// typing effect variables
const displayedText = ref('')
let typingInterval = null
const isTyping = ref(false)
const currentFullMessage = ref('')

function typeMessage(message) {
  clearInterval(typingInterval)
  displayedText.value = ''
  let index = 0
  isTyping.value = true
  currentFullMessage.value = message

  typingInterval = setInterval(() => {
    if (index < message.length) {
      displayedText.value += message[index]
      index++
    } else {
      clearInterval(typingInterval)
      isTyping.value = false
    }
  }, 50) // speed (lower = faster)
}

function skipTyping() {
  if (!isTyping.value) return

  clearInterval(typingInterval)
  displayedText.value = currentFullMessage.value
  isTyping.value = false
}

// Fun sequential messages
const tutorialMessages = [
  "Welcome, traveler, to the DM Domain! I'll be your guide, Rat Squirrel.",
  "I'll be walking you through all you need to know to get started on the website...",
  "To begin, you can create a new campaign, join a preexisting campaign, or create some characters!",
  "To create a campaign, click the 'Create Campaign' button and enter a name. Then, you can give the join code to your players.",
  "If you want to join a campaign, click the 'Join Campaign' button and enter the code given to you by your DM.",
  "Once you're in a campaign, a card for it will appear in the 'Your Campaigns' section at the bottom of the page. Click on it to go to that campaign's home page.",
  "When a campaign session is scheduled, it will appear on your home page calendar and the information for it will appear in the 'upcoming Sessions' table. Click the session in the table to go to the campaign's home page.",
  "You can click me at any time to open a chat box where you can ask me questions about D&D!",
  " If you have any questions, go to your account page located in the upper right corner. There is a Help section there with more information.",
  "That's all you need to know to get started! Feel free to explore the website and check out the features. Happy adventuring!"
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

function lastTutorialStep() {
  if (currentStep.value > 0) {
    currentStep.value--
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
  margin-bottom: 15px;
  margin-right: 6px;
}

.speechArrow {
  position: absolute;
  bottom: -35px;
  right: -5px;
  margin-right: 5%;

}

h2 {
  font-size: 1rem;
  color: var(--vt-c-navy);
}

p {
  padding-bottom: 10px;
  font-size: 0.8rem;
}

.popupButton {
  font-size: 0.8rem;
  margin-top: 40px;
  width: fit-content;
}

.disable {
  position: absolute;
  bottom: 0px;
  left: 30%;
}

.close{
  position: absolute;
  top: 8px;
  right: 6px;
  height: 7px;
  width: 8px;
  color: var(--vt-c-red);
}

.arrowimg {
  height: 35px;
  width: 35px;
}

.back {
  position: absolute;
  left: 15px;
  bottom: 0px;
}

.next {
  position: absolute;
  right: 15px;
  bottom: 0px;
}

.tutorialtxt {
  justify-content: center;
  align-items: center;

}

.buttonContainer {
  display: inline-flex;
  position: absolute;
  width: 100%;
  height: 30px;
  bottom: 5px;
}

/* Box with tutorial message */
.welcomeContainer {
    position:fixed;
    width: 350px;
    height: 200px;
    bottom: 12%;
    right: 5%;
    padding: 10px;
    padding-top:0;
    display: flex;
    flex-direction: column;
    justify-content:center;
    align-items: center;
    border: 2px solid var(--vt-c-bronze);
    border-radius: 16px;
    background-color: var(--vt-c-parchment);

    background: radial-gradient(
      circle at center, rgba(229, 195, 144, 0.669) 50%, /* center */ rgba(0, 0, 0, 0)  100% /* outside */), 
      url('../assets/PaperTextureCalm.png'
    );

    color: var(--vt-c-navy);
    font-size: 0.8rem;
    text-shadow:
      0 1px 0 rgba(255, 255, 255, 0.3),
      0 2px 2px rgba(0, 0, 0, 0.15);
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
    overflow: hidden;
  }

  .popupButton {
    min-width: 40px !important;
    margin: 0 !important;
  }

  p {
    font-size: 0.70rem;
  }

    .speechArrow {
    margin-right: 15%;
  }
}

@media (max-width: 300px) {
  .speechArrow {
    margin-right: 25%;
  }

  p {
    font-size: 0.65rem;
  }

  .tutorialtxt {
    margin-top: 14px;
  }

  .buttonContainer {
    bottom: -2px;
  }

  .close {
    top: 1px;
    right: 0px;
  }
}
</style>