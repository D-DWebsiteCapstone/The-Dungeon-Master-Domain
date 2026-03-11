<template>
    
    <div v-sound class="accountPage">

        <div class="divider">
            <img src="../../assets/images/divider-left-long.png" alt="divider image">
            <div class="dividerh2"><h2>Tutorial</h2></div>
            <img src="../../assets/images/divider-right-long.png" alt="divider image">
        </div>

        <div class="supportTutorial">

           <p>If you would like to reenable the tutorial that was shown upon your first login,
            please select the "enable" option below."</p>
 
        </div>

        <div class="divider">
            <img src="../../assets/images/divider-left-long.png" alt="divider image">
            <div class="dividerh2"><h2>Help</h2></div>
            <img src="../../assets/images/divider-right-long.png" alt="divider image">
        </div>

        <div class="supportTicket">
            <p>If you need any assistance, please fill out a support ticket which can be found by clicking 
            on the notepad in the bottom right corner of the webpage. Our dev team will get right on it!</p>

        </div>
  
    </div>

</template>

<style scoped>

.accountPage {
  padding: 0;
  margin: 0;
  align-items: top;
}

.supportTicket {
    align-items: center;
    justify-content: center;
    margin-left: 1rem;
    margin-top: 1rem;
    width: 90%;
    border: 1px solid var(--vt-c-bronze);
    border-radius: 8px;
    padding: 2rem;
}

.supportTutorial {
    align-items: center;
    justify-content: center;
    margin-left: 1rem;
    margin-top: 1rem;
    width: 90%;
    border: 1px solid var(--vt-c-bronze);
    border-radius: 8px;
    padding: 2rem;
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
  margin-left: 20px;
  margin-right: 20px;
}

</style>