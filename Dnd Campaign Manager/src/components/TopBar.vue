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
        <img alt="Mascot" src="../assets/Rat-Squirrel.png" width = "75" height="75"/> 
        </button>
        <div class ="center">
        <h1>The <div class = dm>DM</div> Domain</h1>
        </div>

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
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
}
</style>
