<template>
  <h1>Character Page</h1>
    <p>This is your character page where your characters for campaigns will be shown on cards.</p>

    <!-- Make a button to add a new character have it connected
     to popup for character creation.-->
    <button onclick="document.getElementById('makeChar').style.display='block'" style="width:auto; ">Add</button>
    
  
    <div class="CharacterCardsSpacing">  
      <div class="CharacterCards">Character 1</div>
      <div class="CharacterCards">Character 2</div>
      <div class="CharacterCards">Character 3</div>
      <div class="CharacterCards">Character 4</div>
    </div>

    <!-- Have code for popup card here -->
    <div id="makeChar" class = "modal">
        <div class="popup">
            <p>Character Creation<br>
                Create your magnificent character</p>
            <!--Here will begin the parts of the character that will be customizable -->

            <!-- Character Name -->
            <label for="cname">Character Name </label>
            <input type="text" placeholder="Enter Character Name" name="cname" required>

            <!-- Character Photo Upload -->
            <label for="cphoto"><br>Character Photo </br></label>
            <input type="file" name="cphoto" accept="image/*">

            <!-- Backstory Description -->
            <label for="cbackstory"><br>Backstory </br></label>
            <textarea placeholder="Enter Backstory" name="cbackstory" required></textarea>

            <br>
            <!-- Confirm Button -->
            <button type="submit">Confirm </button>

            <!-- Cancel Button NOT FINISHED-->
            <button type="button" class="cancelbtn" onclick="closeModal('0001')">Cancel</button>
        </div>

    </div>

    
</template>