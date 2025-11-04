<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

function homeButton(){
    router.push('/Home')
}
</script>

<template> 

    <div class="topbar">
        <button @click = "homeButton()">
        <img alt="Mascot" src="../assets/Rat-Squirrel.png" width = "55" height="55"/> 
        </button>
        <div class ="center">
        <h1>The <div class = dm>DM</div> Domain</h1>
        </div>
        <button>Account</button>

    </div>
</template>

<style scoped>
.dm {
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
    0 0 6px rgba(160, 48, 34, 0.6),     /*inner*/
    0 0 12px rgba(212, 175, 55, 0.4),   /*middle*/
    0 0 20px rgba(212, 175, 55, 0.3);   /*outer*/
    animation: emberPulse 3s infinite ease-in-out;
}



button {
    background-color: transparent;
    background-image: none;
    border: none;
    cursor: pointer;
    margin-left: 10px;
    margin-right: 20px;
    padding:0px;
    box-shadow: none;
    min-width:fit-content;
    color: var(--vt-c-warm-white);
}

button:hover {
    color: var(--vt-c-red);
}

</style>
