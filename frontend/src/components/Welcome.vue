<template>

    <div class="welcomeTutorial">

        <div class="modal" v-if="showWelcome">
            <img  alt="Mascot" src="../assets/Rat-Squirrel.png" width = "55" height="55"/>
            <div class="welcomeContainer">
                <div class="tutorialtxt">
                    <!-- <h2 v-if="currentStep === 0"></h2> -->
                    <p>{{ displayedText }}</p>
                </div>
                <div class="buttonContainer">
                    <button class = "popupButton" v-if="currentStep < tutorialMessages.length - 1" @click="nextTutorialStep">Continue</button>
                    <button class = "popupButton" v-else @click="disableTutorial" :disabled="welcome">Disable Tutorial</button>
                    <button class = "popupButton" @click="cancelTutorial" :disabled="welcome">Close</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref} from 'vue'
import { onMounted } from 'vue'

onMounted(() => {
  typeMessage(tutorialMessages[currentStep.value])
})

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
  }, 58) // speed (lower = faster)
}

// Fun sequential messages
const tutorialMessages = [
  "Welcome, traveler, to the DM Domain! I'm your guide, Rat Squirrel.",
  "I'll be walking you through all you need to know to get started on the website.",
  "We worship the Rat Squirrel.",
  "Chim Chimney is very important to us.",
  "If you have a problem, talk to Connor in IT.",
  "If you want to get nothing done, say anything to Damien.",
  "Never try to type 'Ruh Roh' or Melissa will have a seizure.",
  "Make it a goal to be as distracting and chaotic as possible and we'll all have a good time. Enjoy!"
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

function cancelTutorial() {
  showWelcome.value = false
  currentStep.value = 0
}

</script>

<style scoped>

img {
    position: absolute;
    top: 0;
    left: 0;
    margin-top: 7px;
    margin-left:10px;

}

h2 {
    font-size: 1rem;
    color: var(--vt-c-navy);
}

p {
    padding-bottom: 5px;
    font-size: 0.8rem;

}

.popupButton {
    font-size: 0.8rem;
}

.tutorialtxt {
    justify-content: center;
    align-items: center;
}

.buttonContainer {
    display: inline-flex;
    position: absolute;
    bottom: 10px;
}

/* Box with tutorial message */
.welcomeContainer {
    position:fixed;
    width: 350px;
    height: 200px;
    top: 10%;
    left: 5%;
    padding: 10px;
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



@media(max-width: 750px) {
    img {
        margin-left: 7px;
    }
}

@media (max-width: 400px) {
    .welcomeContainer {
        width: 90%;
    }

    .popupButton {
        min-width: 40px !important;
        margin: 0 !important;
        /* padding: 0 !important; */

    }
}

</style>