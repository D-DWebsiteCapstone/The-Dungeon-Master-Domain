<script setup>
</script>

<template>


    <img alt="Mascot" src="./assets/Rat-Squirrel.png" width = "225" height="225"/> 
    <h1>Welcome to the Dungeon Masters Domain</h1>
    <p>Log in to reclaim your character sheet and continue your quest. Sign up to inscribe your name in the Great Ledger and forge your legend from scratch.Choose wisely, for every great tale begins with a single click...And remember—fortune favors the bold. Enter, if you dare.</p>

    <div class="box1">
      <p>Username</p>
      <input type="text" id="username" name="username">
      <br>
      <p>Password</p>
      <input type="password" id="password" name="password">
      <br>
      <br>
      <input type="submit" value="Login">
      <br>
      <br></br>
      <button onclick="document.getElementById('id01').style.display='block'" style="width:auto; ">Sign Up</button>
      <button onclick="document.getElementById('id02').style.display='block'" style="width:auto;">Forgot Password</button>
    </div>
    
    
    
    <div id="id01" class=modal>
      <div class=box2>
        <p>Pick a Username and Password for your account.</p>
        <br>
        <input type="text" placeholder="Enter Username" name="uname">
        <br><br>
        <input type="text" placeholder="Enter Password" name="uname">
        <br>
        <br>
        <button type="button" onclick="document.getElementById('id01').style.display='none'">Cancel</button>
        <button> Submit </button>
      </div>
    </div>

    

    <div id="id02" class=modal>
      <div class=box3>
        <p> If you forgot your password that sucks good luck remembering </p>
        <button type="button" onclick="document.getElementById('id02').style.display='none'">Cancel</button>
      </div>
    </div>
    


  
</template>

<!-- <style scoped>
.box1 {
  text-align: center;
  left: 50%;
  margin: auto;
  width: 50%;
  height: 200px;
  background-color: lightblue;
}

.box2 {
  text-align: center;
  left: 500%;
  width: 400px;
  height: 170px;
  background-color: White;
  border: 4px Black;
}

.box3 {
  text-align: center;
  left: 50%;
  width: 400px;
  height: 170px;
  background-color: White;
  border: 4px Black;
}

.modal {
  display: none;
  /* Hidden by default */
  position: fixed;
  /* Stay in place */
  z-index: 1;
  /* Sit on top */
  left: 0;
  top: 0;
  width: 100%;
  /* Full width */
  height: 100%;
  /* Full height */
  overflow: auto;
  /* Enable scroll if needed */
  background-color: rgb(0, 0, 0);
  /* Fallback color */
  background-color: rgba(0, 0, 0, 0.4);
  /* Black w/ opacity */
  padding-top: 60px;
}

.LoginPage {
  left: 50%;  

}
</style> -->
