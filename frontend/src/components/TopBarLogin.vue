<template> 

    <div class="topbarLogin">
        <img alt="Mascot" src="../assets/dmd.png" width = "70" height="70"/> 
        
        <div class ="center">
        <h1>The <div class = "dm">DM</div> Domain</h1>
        </div>

    </div>
</template>

<style scoped>

.topbarLogin {
    height: 70px;
}

.dm {
    color: var(--vt-c-red);
    display: inline;
    padding-left: 15px;
    padding-right: 15px;
}

.dm:hover {
    color: var(--vt-c-red);
    display: inline;
    /* padding-left: 20px;
    padding-right: 20px; */
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

@media (max-width: 640px) {
    h1{
        font-size: 2rem;
    }

    img {
        height: 50px;
        width: 50px;
    }
}

@media (max-width: 450px) {
    h1 {
        font-size: 1.7rem;
    }

    .dm {
        padding-left: 10px;
        padding-right: 10px;
    }

    .topbarLogin {
        padding: 10px 2px;
    }

    img {
        width: 50px;
        height: 50px;
    }
}

</style>
