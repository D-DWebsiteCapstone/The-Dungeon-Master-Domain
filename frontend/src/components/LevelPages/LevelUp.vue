<template>
    <div class="levelPage" v-sound>
        <div class="levelHeader">
            <h1>Class Level References</h1>
        </div>
        <div class="classGrid">
            <div class="classCard" @click="router.push('/LevelUp/Barbarian')">
                <img alt="tome" :src=tomeBrown class="tomeImg">
                <div class="classInfo">
                    <!-- img of class icon -->
                    <h4>Class</h4>
                </div>
            </div>

            <div class="classCard">
                <img alt="tome" :src=tomeRed class="tomeImg">
                <div class="classInfo">
                    <!-- img of class icon -->
                    <h4>Class</h4>
                </div>
            </div>

            <div class="classCard">
                <img alt="tome" :src=tomeBlue class="tomeImg">
                <div class="classInfo">
                    <!-- img of class icon -->
                    <h4>Class</h4>
                </div>
            </div>

            <div class="classCard">
                <img alt="tome" :src=tomeGreen class="tomeImg">
                <div class="classInfo">
                    <!-- img of class icon -->
                    <h4>Class</h4>
                </div>
            </div>

            <div class="classCard">
                <img alt="tome" :src=tomePurple class="tomeImg">
                <div class="classInfo">
                    <!-- img of class icon -->
                    <h4>Class</h4>
                </div>
            </div>

            <div class="classCard">
                <img alt="tome" :src=tomeWhite class="tomeImg">
                <div class="classInfo">
                    <!-- img of class icon -->
                    <h4>Class</h4>
                </div>
            </div>

            <div class="classCard">
                <img alt="tome" :src=tomeBrown class="tomeImg">
                <div class="classInfo">
                    <!-- img of class icon -->
                    <h4>Class</h4>
                </div>
            </div>

            <div class="classCard">
                <img alt="tome" :src=tomeRed class="tomeImg">
                <div class="classInfo">
                    <!-- img of class icon -->
                    <h4>Class</h4>
                </div>
            </div>

            <div class="classCard">
                <img alt="tome" :src=tomeBlue class="tomeImg">
                <div class="classInfo">
                    <!-- img of class icon -->
                    <h4>Class</h4>
                </div>
            </div>

            <div class="classCard">
                <img alt="tome" :src=tomeGreen class="tomeImg">
                <div class="classInfo">
                    <!-- img of class icon -->
                    <h4>Class</h4>
                </div>
            </div>

            <div class="classCard">
                <img alt="tome" :src=tomePurple class="tomeImg">
                <div class="classInfo">
                    <!-- img of class icon -->
                    <h4>Class</h4>
                </div>
            </div>

            <div class="classCard">
                <img alt="tome" :src=tomeWhite class="tomeImg">
                <div class="classInfo">
                    <!-- img of class icon -->
                    <h4>Class</h4>
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

const router = useRouter()
const route = useRoute()

</script>


<style scoped>

.levelHeader{
    margin: 0 0 5rem 0;
}

.classGrid {
    display: grid;
    grid-template-columns: repeat(3, minmax(200px, 1fr));
    gap: 4rem;
}

.classCard {
    position: relative;
}

.tomeImg {
    width: 270px;
    height: 200px;
}

.classInfo {
    position: absolute;
    width: 266px;
    height: 90%;
    top: 5px;
    left: 2px;
    padding: 10px 32px;
}


</style>