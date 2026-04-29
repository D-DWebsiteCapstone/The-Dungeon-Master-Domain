<template>
    <div class="levelPage" v-sound>
        <div class="levelHeader">
            <h1>Class Level References</h1>
        </div>
        <div class="classGrid">
            <div class="classCard" @click="router.push('/LevelUp/Barbarian')">
                <img alt="tome" :src=tomeRed class="tomeImg">
                <div class="classInfo">
                    <!-- img of class icon -->
                    <h4>Barbarian</h4>
                </div>
            </div>

            <div class="classCard" @click="router.push('/LevelUp/Bard')">
                <img alt="tome" :src=tomeYellow class="tomeImg">
                <div class="classInfo">
                    <!-- img of class icon -->
                    <h4>Bard</h4>
                </div>
            </div>

            <div class="classCard" @click="router.push('/LevelUp/Cleric')">
                <img alt="tome" :src=tomeLightBlue class="tomeImg">
                <div class="classInfo">
                    <!-- img of class icon -->
                    <h4>Cleric</h4>
                </div>
            </div>

            <div class="classCard" @click="router.push('/LevelUp/Druid')">
                <img alt="tome" :src=tomeGreen class="tomeImg">
                <div class="classInfo">
                    <!-- img of class icon -->
                    <h4>Druid</h4>
                </div>
            </div>

            <div class="classCard" @click="router.push('/LevelUp/Fighter')">
                <img alt="tome" :src=tomeTeal class="tomeImg">
                <div class="classInfo">
                    <!-- img of class icon -->
                    <h4>Fighter</h4>
                </div>
            </div>

            <div class="classCard" @click="router.push('/LevelUp/Monk')">
                <img alt="tome" :src=tomeWhite class="tomeImg">
                <div class="classInfo">
                    <!-- img of class icon -->
                    <h4>Monk</h4>
                </div>
            </div>

            <div class="classCard" @click="router.push('/LevelUp/Paladin')">
                <img alt="tome" :src=tomeOrange class="tomeImg">
                <div class="classInfo">
                    <!-- img of class icon -->
                    <h4>Paladin</h4>
                </div>
            </div>

            <div class="classCard" @click="router.push('/LevelUp/Ranger')">
                <img alt="tome" :src=tomePurple class="tomeImg">
                <div class="classInfo">
                    <!-- img of class icon -->
                    <h4>Ranger</h4>
                </div>
            </div>

            <div class="classCard" @click="router.push('/LevelUp/Rogue')">
                <img alt="tome" :src=tomeBlack class="tomeImg">
                <div class="classInfo">
                    <!-- img of class icon -->
                    <h4>Rogue</h4>
                </div>
            </div>

            <div class="classCard" @click="router.push('/LevelUp/Sorcerer')">
                <img alt="tome" :src=tomeFruitPunch class="tomeImg">
                <div class="classInfo">
                    <!-- img of class icon -->
                    <h4>Sorcerer</h4>
                </div>
            </div>

            <div class="classCard" @click="router.push('/LevelUp/Warlock')">
                <img alt="tome" :src=tomeBlue class="tomeImg">
                <div class="classInfo">
                    <!-- img of class icon -->
                    <h4>Warlock</h4>
                </div>
            </div>

            <div class="classCard" @click="router.push('/LevelUp/Wizard')">
                <img alt="tome" :src=tomeBrown class="tomeImg">
                <div class="classInfo">
                    <!-- img of class icon -->
                    <h4>Wizard</h4>
                </div>
            </div>

            <div class="classCard" @click="router.push('/LevelUp/Artificer')">
                <img alt="tome" :src=tomeGrey class="tomeImg">
                <div class="classInfo">
                    <!-- img of class icon -->
                    <h4>Artificer</h4>
                </div>
            </div>

        </div>
    </div>
</template>
<script setup>

import { useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'

import { sounds } from '../../buttonSounds.js';

import tomeBrown from '../../assets/images/tomes/tomeBrown.png'
import tomeRed from '../../assets/images/tomes/tomeRed.png'
import tomeBlue from '../../assets/images/tomes/tomeBlue.png'
import tomeGreen from '../../assets/images/tomes/tomeGreen.png'
import tomePurple from '../../assets/images/tomes/tomePurple.png'
import tomeWhite from '../../assets/images/tomes/tomeWhite.png'

import tomeYellow from '../../assets/images/tomes/tomeYellow.png'
import tomeBlack from '../../assets/images/tomes/tomeBlack.png'
import tomeTeal from '../../assets/images/tomes/tomeTeal.png'
import tomeOrange from '../../assets/images/tomes/tomeOrange.png'
import tomeGrey from '../../assets/images/tomes/tomeGrey.png'
import tomeLightGreen from '../../assets/images/tomes/tomeLightGreen.png'
import tomeLightBlue from '../../assets/images/tomes/tomeLightBlue.png'
import tomeFruitPunch from '../../assets/images/tomes/tomeFruitPunch.png'

const router = useRouter()
const route = useRoute()

</script>


<style scoped>

.levelHeader {
    margin: 0 0 5rem 0;
}

.classGrid {
    display: grid;
    align-items: center;
    justify-content: center;
    width: 100%;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 3.5rem;
    animation: fadeUp 0.55s ease both;
}

.classCard {
    display: flex;
    position: relative;
    margin: auto;
    height: 196px;
    width: 260px;
    box-shadow: 0 4px 10px 4px rgba(217, 204, 139, 0.495);
    transition: transform 0.15s ease, box-shadow 0.2s ease, filter 0.2s ease;

}

.classCard:hover {
    cursor: pointer;
    transform: translateY(-5px);
    box-shadow: 0 4px 15px 4px rgba(232, 215, 130, 0.678);
    filter: brightness(1.1);
}

.tomeImg {
    position: absolute;
    top: -2px;
    left: -5px;
    width: 270px;
    height: 200px;
}

.classInfo {
    position: absolute;
    width: 266px;
    height: 90%;
    top: 7px;
    left: -3px;
    padding: 10px 32px;
}

@keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
}
</style>