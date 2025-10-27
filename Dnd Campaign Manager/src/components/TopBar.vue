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

    <div class="topbar">
        <img alt="Mascot" src="../assets/Rat-Squirrel.png" width = "75" height="75"/> 
        <h1>The <div class= DM> DM </div> Domain</h1>
        
        <!-- Profile Picture specific to user -->
        <button class="topbar-button" onclick="window.location.href='/'">Account</button>
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
