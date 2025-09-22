<script setup>
</script>

<template>
  <div class=LoginPage>
    <h1>Welcome to the Dungeon Masters Domain</h1>
    <div class="box1">
      <p>Username</p>
      <input type="text" id="username" name="username">
      <br>
      <p>Password</p>
      <input type="password" id="password" name="password">
      <br>
      <br>
      <input type="submit" value="Login">
    </div>

    <button onclick="document.getElementById('id01').style.display='block'" style="width:auto;">Sign Up</button>

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

    <button onclick="document.getElementById('id02').style.display='block'" style="width:auto;">Forgot Password</button>

    <div id="id02" class=modal>
      <div class=box3>
        <p> If you forgot your password that sucks go fuck yourself </p>
        <button type="button" onclick="document.getElementById('id02').style.display='none'">Cancel</button>
      </div>
    </div>


  </div>
</template>

<style scoped>
.box1 {
  text-align: center;
  
  margin: auto;
  width: 50%;
  height: 200px;
  background-color: lightblue;
  padding: 10px;
  margin: 10px;
}

.box2 {
  width: 400px;
  height: 170px;
  background-color: White;
  border: 4px Black;
  padding: 10px;
  margin: 10px;
}

.box3 {
  width: 400px;
  height: 170px;
  background-color: White;
  border: 4px Black;
  padding: 10px;
  margin: 10px;
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
  

}
</style>
