<template>
    
    <div v-sound class="accountPage">
        
        <div class="divider">
            <img src="../../assets/images/divider-left-long.png" alt="divider image" style="margin-left: 25px;">
            <div class="dividerh2"><h2>Discord</h2></div>
            <img src="../../assets/images/divider-right-long.png" alt="divider image" style="margin-right: 25px;">
        </div>

        <p>Link your Discord account to your profile.</p>
  
    </div>

</template>

<style scoped>
.parchmentButton {
  width: 260px;
}

.accountPage {
  padding: 0;
  margin: 0;
  align-items: top;
}


.dividerh2 {
  display: inline;
  width: 25%;
  margin: auto;
  /* margin: 10px; */
}

.divider{
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 3vh;
}

img {
  max-width: 28%;
  margin-left: 10px;
  margin-right: 10px;
}
</style>