<template>
    <div class="levelPage" v-sound>
        <div class="levelHeader">
            <h1>Class Level References</h1>
        </div>
        <div class="classGrid">
            <div class="classCard" @click="router.push('/LevelUp/levelTable')">
                <img alt="tome" :src=tomeRed class="tomeImg">
                <div class="classInfo">
                    <img alt="barbarian icon" src='../../assets/images/class/barbarian.svg'>
                    <h4>Barbarian</h4>
                </div>
            </div>

            <div class="classCard" @click="router.push('/LevelUp/levelTable')">
                <img alt="tome" :src=tomeYellow class="tomeImg">
                <div class="classInfo">
                    <img alt="bard icon" src='../../assets/images/class/bard.svg'>
                    <h4>Bard</h4>
                </div>
            </div>

            <div class="classCard" @click="router.push('/LevelUp/levelTable')">
                <img alt="tome" :src=tomeLightBlue class="tomeImg">
                <div class="classInfo">
                    <img alt="cleric icon" src='../../assets/images/class/cleric.svg'>
                    <h4>Cleric</h4>
                </div>
            </div>

            <div class="classCard" @click="router.push('/LevelUp/levelTable')">
                <img alt="tome" :src=tomeGreen class="tomeImg">
                <div class="classInfo">
                    <img alt="druid icon" src='../../assets/images/class/druid.svg'>
                    <h4>Druid</h4>
                </div>
            </div>

            <div class="classCard" @click="router.push('/LevelUp/levelTable')">
                <img alt="tome" :src=tomeTeal class="tomeImg">
                <div class="classInfo">
                    <img alt="fighter icon" src='../../assets/images/class/fighter.svg'>
                    <h4>Fighter</h4>
                </div>
            </div>

            <div class="classCard" @click="router.push('/LevelUp/levelTable')">
                <img alt="tome" :src=tomeWhite class="tomeImg">
                <div class="classInfo">
                    <img alt="monk icon" src='../../assets/images/class/monk.svg'>
                    <h4>Monk</h4>
                </div>
            </div>

            <div class="classCard" @click="router.push('/LevelUp/levelTable')">
                <img alt="tome" :src=tomeOrange class="tomeImg">
                <div class="classInfo">
                    <img alt="paladin icon" src='../../assets/images/class/paladin.svg'>
                    <h4>Paladin</h4>
                </div>
            </div>

            <div class="classCard" @click="router.push('/LevelUp/levelTable')">
                <img alt="tome" :src=tomePurple class="tomeImg">
                <div class="classInfo">
                    <img alt="ranger icon" src='../../assets/images/class/ranger.svg'>
                    <h4>Ranger</h4>
                </div>
            </div>

            <div class="classCard" @click="router.push('/LevelUp/levelTable')">
                <img alt="tome" :src=tomeBlack class="tomeImg">
                <div class="classInfo">
                    <img alt="rogue icon" src='../../assets/images/class/rogue.svg'>
                    <h4>Rogue</h4>
                </div>
            </div>

            <div class="classCard" @click="router.push('/LevelUp/levelTable')">
                <img alt="tome" :src=tomeFruitPunch class="tomeImg">
                <div class="classInfo">
                    <img alt="sorcere icon" src='../../assets/images/class/sorcerer.svg'>
                    <h4>Sorcerer</h4>
                </div>
            </div>

            <div class="classCard" @click="router.push('/LevelUp/levelTable')">
                <img alt="tome" :src=tomeBlue class="tomeImg">
                <div class="classInfo">
                    <img alt="warlock icon" src='../../assets/images/class/warlock.svg'>
                    <h4>Warlock</h4>
                </div>
            </div>

            <div class="classCard" @click="router.push('/LevelUp/levelTable')">
                <img alt="tome" :src=tomeBrown class="tomeImg">
                <div class="classInfo">
                    <img alt="wiazard icon" src='../../assets/images/class/wizard.svg'>
                    <h4>Wizard</h4>
                </div>
            </div>

            <div class="classCard" @click="router.push('/LevelUp/levelTable')">
                <img alt="tome" :src=tomeGrey class="tomeImg">
                <div class="classInfo">
                    <img alt="artificer icon" src='../../assets/images/class/artificer.svg'>
                    <h4>Artificer</h4>
                </div>
            </div>

        </div>
        <div class="copyright">
            <a href="https://github.com/intrinsical/tw-dnd/tree/main/icons" target="_blank" rel="noopener">Intrinsical's D&D 5e Icon Set</a> by 
            <a href="https://github.com/intrinsical" target="_blank" rel="noopener">David Kor Kian Wei</a> is licensed under 
            <a href="https://creativecommons.org/licenses/by-sa/4.0/?ref=chooser-v1" target="_blank" rel="noopener">Creative Commons Attribution-ShareAlike 4.0 International</a>.
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
.levelPage {
    position: relative;
}

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

.classInfo img {
    padding: 9px 0px;
}

@keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
}

.copyright {
    position: absolute;
    margin: auto;
    bottom: -4rem;
    margin: 10px;
    display: inline;
    font-size: 0.7rem;
    align-items: center;
}

a, .copyright {
    color: #585751;
}
</style>