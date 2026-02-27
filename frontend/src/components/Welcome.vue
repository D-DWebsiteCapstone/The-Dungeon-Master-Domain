<template>

    <div class="welcomeTutorial">
        <div class="modal" v-if="showWelcome">
            <div class="welcomeContainer">
                <div class="tutorialtxt">
                    <h2 v-if="currentStep === 0">Welcome, traveler, to the D&D Campaign Manager!</h2>
                    <p>{{ tutorialMessages[currentStep] }}</p>
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

const showWelcome = ref(true)
const welcome = ref(false)
const currentStep = ref(0)

// Fun sequential messages
const tutorialMessages = [
  "","I'll be walking you through all you need to know to get started on the DM Domain!",
  "We worship the Rat Squirrel",
  "Chim Chimney is very important to us.",
  "If you have a problem, talk to Connor in IT.",
  "If you want to get nothing done, say anything to Damien.",
  "Never try to type 'Ruh Roh' or Melissa will have a seizure",
  "Make it a goal to be as distracting and chaotic as possible and we'll all have a good time."
]

function startTutorialSequence() {
  currentStep.value = 0
  showWelcome.value = true
}

function nextTutorialStep() {
  if (currentStep.value < tutorialMessages.length - 1) {
    currentStep.value++
  }
}

function cancelTutorial() {
  showWelcome.value = false
  currentStep.value = 0
}

</script>

<style scoped>

h2 {
    font-size: 1rem;
    color: var(--vt-c-navy);
}

p {
    padding-bottom: 5px;
    font-size: 0.75rem;
}

.popupButton {
    font-size: 0.7rem;
}

.tutorialtxt {
    justify-content: center;
    align-items: center;
}

.buttonContainer {
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
    font-size: 0.75rem;
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

</style>