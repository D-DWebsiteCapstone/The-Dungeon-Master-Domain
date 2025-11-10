<template> 

    <div class="topbarLogin">
        <img alt="Mascot" src="../assets/Rat-Squirrel.png" width = "55" height="55"/> 
        
        <div class ="center">
        <h1>The <div class = "dm">DM</div> Domain</h1>
        </div>

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

.center {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
}
</style>
