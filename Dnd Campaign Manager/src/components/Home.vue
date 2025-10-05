<template>
      <h1>The Dungeon Master's Domain</h1>

      <div class="Greetings">
        <h2>Welcome Traveler!</h2>
        <p>To begin on your adventure, please chools a path forward:</p>
      </div>

      <div class="ChoosePath">
        <button onclick="document.getElementById('id03').style.display='block'" style="width:auto; ">Create Campaign</button>
        <button onclick="document.getElementById('id04').style.display='block'" style="width:auto;">Join Campaign</button>
      </div>

      <div class="Greetings">
        <h2> Your Campaigns </h2>
      </div>
      <br>

      <div class="CampaignBoxesSpacing">  
        <div class="CampaignBoxes">Campaign 1</div>
        <div class="CampaignBoxes">Campaign 2</div>
        <div class="CampaignBoxes">Campaign 3</div>
        <div class="CampaignBoxes">Campaign 4</div>
      </div>

      <div id="id03" class=modal>
        <div class=popup>
          <p>Name your Campaign.</p>
          <input type="text" placeholder="Enter Campaign Name" name="cname">
          <br>
          <p>Generate a code for your players.</p>
          <button> Generate Code </button>
          <br>
          <br>
          <button type="button" onclick="document.getElementById('id03').style.display='none'">Cancel</button>
          <button> Submit </button>
        </div>
      </div>

      <div id="id04" class=modal>
        <div class=popup>
          <br>
          <p>Enter the code provided by your Dungeon Master to join their campaign.</p>
          <br>
          <input type="text" placeholder="Enter Campaign Code" name="ccode">
          <br>
          <br>
          <button type="button" onclick="document.getElementById('id04').style.display='none'">Cancel</button>
        </div>
      </div>
    </template>

    <!-- <script>
    export default {
      name: 'Home',
      // Component logic goes here
    };
    </script> -->