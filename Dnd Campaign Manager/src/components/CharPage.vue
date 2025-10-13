<template>
  <h1>Character Page</h1>
    <p>This is your character page where your characters for campaigns will be shown on cards.</p>

    <!-- Make a button to add a new character NOT FINSISHED.-->
    <button @click="addCharacter">Add Character</button>


    <div class="CharacterCardsSpacing">  
      <div class="CharacterCards">Character 1</div>
      <div class="CharacterCards">Character 2</div>
      <div class="CharacterCards">Character 3</div>
      <div class="CharacterCards">Character 4</div>
    </div>

    <!-- Have code for popup card here -->

    <div id="0001" class = "modal">
        <div class="popup">
            <p>Character Creation<br>
                Create your magnificent character</p>
            <!--Here will begin the parts of the 
            character that will be customizable -->

            <!-- Character Name -->
            <label for="cname"><b>Character Name</b></label>
            <input type="text" placeholder="Enter Character Name" name="cname" required>

            <!-- Character Photo Upload -->
            <label for="cphoto"><b>Character Photo</b></label>
            <input type="file" name="cphoto" accept="image/*">

            <!-- Backstory Description -->
            <label for="cbackstory"><b>Backstory</b></label>
            <textarea placeholder="Enter Backstory" name="cbackstory" required></textarea>

            <!-- Confirm Button -->
            <button type="submit">Confirm</button>

            <!-- Cancel Button NOT FINISHED-->
            <button type="button" class="cancelbtn" onclick="closeModal('0001')">Cancel</button>
        </div>

    </div>

    
</template>