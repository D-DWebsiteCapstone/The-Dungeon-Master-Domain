<script setup>
defineProps({
  navigateToHome: {
    type: Function,
    required: false,
  }
})
async function homeButton(){
    try {
    await props.navigateToHome()
    } catch (err) {
    console.error('navigateToHome failed', err)
    }
}
</script>
<template> 

    <div class="topbarlogin">
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
</style>