<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

function homeButton(){
    router.push('/Home')
}
function loginButton(){
    router.push('/Login')
}
function accountButton(){
    router.push('/Account')
}
</script>

<template> 

    <div class="topbar">
        <button @click = "homeButton()" style = "background: none; border: none; padding: 0; cursor: pointer;">
        <img alt="Mascot" src="../assets/Rat-Squirrel.png" width = "75" height="75"/> 
        </button>
        <div class ="center">
        <h1>The <div class = dm>DM</div> Domain</h1>
        </div>
        <!-- <button @click = "accountButton()">Account</button> -->
         <button @click = "loginButton()">Login</button>

    </div>
</template>

<style scoped>
.dm {
    color: var(--vt-c-red);
    display: inline;
    padding-left: 10px;
    padding-right: 10px;
}

</style>
