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
    padding-left: 10px;
    padding-right: 10px;
}

button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    padding-left: 10px;
    padding-right: 20px;
    padding-bottom:0px;
    padding-top:0px;
    box-shadow: none;
    min-width:fit-content;
    color: var(--vt-c-black);
}

button:hover {
    color: var(--vt-c-red);
}

</style>
