<template>
    
    <div v-sound class="accountPage">

        <div class="divider">
            <img src="../../assets/images/dividers/divider-left-long.png" alt="divider image" style="margin-left: 25px;">
            <div class="dividerh2"><h2>Tutorial</h2></div>
            <img src="../../assets/images/dividers/divider-right-long.png" alt="divider image" style="margin-right: 25px;">
        </div>

        <div class="supportTutorial">

           <p>If you would like to reenable the tutorial that was shown upon your first login,
            please select the "enable" option below."</p>
            <div class="radio-group">
                <div class=option1><label class="custom-radio">
                <input type="radio" name="tutorial" value="true" >
                <span class="radio-mark"></span>
                Enabled
                </label></div>

                <div class=option2><label class="custom-radio">
                <input type="radio" name="tutorial" value="false" >
                <span class="radio-mark"></span>
                Disabled
                </label></div>
            </div>
 
        </div>

        <div class="divider">
            <img src="../../assets/images/dividers/divider-left-long.png" alt="divider image" style="margin-left: 25px;">
            <div class="dividerh2"><h2>Report</h2></div>
            <img src="../../assets/images/dividers/divider-right-long.png" alt="divider image" style="margin-right: 25px;">
        </div>

        <div class="supportTicket">
            <p>If you need any assistance, please fill out a support ticket which can be found by clicking 
            on the notepad in the bottom left corner of the webpage. Our dev team will get right on it!</p>

        </div>
  
    </div>

</template>

<style scoped>

.accountPage {
  padding: 0;
  margin: 0;
  align-items: top;
  min-height: 700px;
  max-width: 1300px;
  margin: auto;

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
    backdrop-filter: blur(2px);
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
    backdrop-filter: blur(2px);
}

.dividerh2 {
  display: inline;
  width: 25%;
  margin: auto;
}

.divider{
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 3vh;
}

img {
  max-width: 28%;
  margin-left: 0px;
  margin-right: 0px;
}

.radio-group {
    display: inline-flex;
    margin-top: 1rem;
}

.radio-mark {
    border: 1px solid var(--vt-c-golden);
}

.radio-mark::after {
    background: var(--vt-c-golden);
}

.custom-radio input[type="radio"]:checked + .radio-mark {
  border-color: var(--vt-c-golden);
}

@media (max-width: 850px) {
    .divider h2 {
        font-size: 1.5rem;
    }
}

@media (max-width: 700px) {
    .dividerh2 {
        font-size: 1.2rem;
        width: fit-content;
        margin: 5px auto;
    }
    .divider h2 {
        font-size: 1.2rem;
    }
}

@media (max-width: 650px) {
    .divider {
        display: block;
        img{
            display: none;
        }
    }

    .supportTutorial, .supportTicket {
        padding: 16px 10px;
        margin-left: 0;
    }
}

@media (max-width: 550px) {
    .divider {
        display: inline-flex;
        img{
            display:flex;
            width: 25%;
        }
    }
}

@media (max-width:450px) {
    .radio-group {
        display: block;
    }
}

</style>