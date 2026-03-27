<script setup>

import { useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'
import { sounds } from '../buttonSounds.js';
const router = useRouter()

</script>

<template>
<nav class="navBar" v-sound>
    <button class="invisibleButton">Barbarian</button>
    <button class="invisibleButton">Bard</button>
    <button class="invisibleButton">Cleric</button>
    <button class="invisibleButton">Druid</button>
    <button class="invisibleButton">Fighter</button>
    <button class="invisibleButton">Monk</button>
    <button class="invisibleButton">Paladin</button>
    <button class="invisibleButton">Ranger</button>
    <button class="invisibleButton">Rogue</button>
    <button class="invisibleButton">Sorcerer</button>
    <button class="invisibleButton">Warlock</button>
    <button class="invisibleButton">Wizard</button>
    <button class="invisibleButton">Artificer</button>
</nav>

<div class="toolsPage" v-sound>
    <p>This will be divided by D&D class. Each tab will give the level up information for that class. </p>
    <!-- Put all html content within this div -->
</div>

</template>

<style scoped>

.navBar {
    gap: 1px;

    button {
        font-size: 0.8rem;
        margin: 0;
        padding: 0 4px;
        min-width: 70px;
    }
}


</style>