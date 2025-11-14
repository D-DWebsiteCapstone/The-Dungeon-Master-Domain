<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

function homeButton(){
    router.push('/Home')
}
function accountButton(){
    router.push('/Account')
}
</script>

<template> 

    <div class="topbar">
        <button class ="invisibleButton" @click = "homeButton()">
        <img  alt="Mascot" src="../assets/Rat-Squirrel.png" width = "55" height="55"/> 
        </button>
        <div class ="center">
        <h1>The <button class = DMButton>DM</button> Domain</h1>
        </div>
        <button class = "invisibleButton" @click = "accountButton()">Account</button>
    </div>

</template>

<style scoped>
.dm {
    color: var(--vt-c-red);
    display: inline;
    padding-left: 15px;
    padding-right: 15px;
}

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

.dm:hover {
    color: var(--vt-c-red);
    display: inline;
    padding-left: 15px;
    padding-right: 15px;
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
</style>
