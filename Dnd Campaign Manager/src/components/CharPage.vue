<script>
export default {
  methods: {
    //This will be the javascript functions for the character page

    //Start making functions for picture 
    //Can make this into an async function. 
    previewImage(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      const img = document.getElementById('photoPreviewImg');
      const previewText = document.getElementById('photoPreviewText');

      reader.onload = function(e) {
        img.src = e.target.result;
        img.style.display = 'block';
        previewText.style.display = 'none';
      }

      if (file) {
        reader.readAsDataURL(file);
      } else {
        img.src = '';
        img.style.display = 'none';
        previewText.style.display = 'block';
      }
    },

    //Make a function for displaying the cards in certain ways using if statements maybe with using an 
    //Invisible table
    //the idea would be that case 1: if there no cards show a message "No Characters Created Yet"
    //if there is one card orientate to the middle of the page etc.
    //if there is two cards align them side by side etc. still towards the middle of the page
    //if there are three cards align them in a row still centered

    displayCards() {
      // Fetch character data from database (not implemented yet)
      const characters = []; // This should be replaced with actual data fetching logic

      const table = document.querySelector('table');
      table.innerHTML = ''; // Clear existing content

      if (characters.length === 0) {
        const row = table.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 5;
        cell.innerText = 'No Characters Created Yet';
        cell.style.textAlign = 'center';
      } else {
        let row;
        characters.forEach((char, index) => {
          if (index % 5 === 0) {
            row = table.insertRow();
          }
          const cell = row.insertCell();
          cell.innerText = char.name; // Placeholder for character card
          // Additional character details can be added here
        });
      }
    }
    ,
    closeModal() {
      // hide modal
      const modal = document.getElementById('makeChar')
      if (modal) modal.style.display = 'none'
      // reset form fields and preview
      this.resetForm()
    },
    resetForm() {
      const nameInput = document.querySelector('input[name="cname"]')
      const backstory = document.querySelector('textarea[name="cbackstory"]')
      const fileInput = document.querySelector('input[name="cphoto"]')
      const img = document.getElementById('photoPreviewImg')
      const previewText = document.getElementById('photoPreviewText')

      if (nameInput) nameInput.value = ''
      if (backstory) backstory.value = ''
      if (fileInput) fileInput.value = ''
      if (img) img.src = ''
      if (img) img.style.display = 'none'
      if (previewText) previewText.style.display = 'inline'
    }
  }
}
</script>


<template>
  <h1>Character Page</h1>
    <p>This is your character page where your characters for campaigns will be shown on cards.</p>

    <!-- Make a button to add a new character have it connected
     to popup for character creation.-->
    <button onclick="document.getElementById('makeChar').style.display='block'" style="width:auto; ">Add</button>

<!--I want to make the cards appear here. Will be within a invisible table-->
  <table style="width:100%; border:none;">
  </table>


    <!-- Have code for popup card here CHARACTER CREATION -->
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
            <br></br>
            <input type="file" name="cphoto" accept="image/*" @change="previewImage">
            <!-- Set up some way to show a small preview window for photo -->
             
            <div id="photoPreview" class="photo-preview">
                <img id="photoPreviewImg" src="" alt="Photo Preview" />
                <span id="photoPreviewText">No Photo Selected</span>
            </div>

            <!-- Backstory Description -->
            <label for="cbackstory"><br>Backstory </br></label>
            <textarea style="width:100%; height:100px;" placeholder="Enter Backstory" name="cbackstory" required></textarea>

            <br>
            <!-- Confirm Button -->
            <button type="submit">Confirm </button>

            <!-- Cancel Button NOT FINISHED-->
            <button type="button" class="cancelbtn" onclick="closeModal('0001')">Cancel</button>
        </div>
    </div>

    <!-- Edit character popup - pulls from the database with preloaded information to edit -->
    <div id="editChar" class = "modal">
        <div class="popup">
           <label for="cname">Character Name </label>
          

            <!-- Character Photo Upload -->
            <label for="cphoto"><br>Character Photo </br></label>
            <br></br>
            <input type="file" name="cphoto" accept="image/*" @change="previewImage">
            <!-- Set up some way to show a small preview window for photo -->
             
            <div id="photoPreview" class="photo-preview">
                <img id="photoPreviewImg" src="" alt="Photo Preview" />
                <span id="photoPreviewText">No Photo Selected</span>
            </div>

            <!-- Backstory Description -->
            <label for="cbackstory"><br>Backstory </br></label>
            <textarea style="width:100%; height:100px;" placeholder="Enter Backstory" name="cbackstory" required></textarea>

            <br>
            <!-- Confirm Button -->
            <button type="submit">Confirm </button>

            <!-- Cancel Button NOT FINISHED-->
            <button type="button" class="cancelbtn" onclick="closeModal('0001')">Cancel</button>
        </div>

    </div>


    <!-- Display character popup - shows character details preloaded from database-->
  <div id="displayChar" class = "modal">
        <div class="popup">
          
          <!-- Character Name -->
            <label for="cname">Character Name </label>
            <input type="text" placeholder="Enter Character Name" name="cname" required>

            <!-- Character Photo Upload -->
            <label for="cphoto"><br>Character Photo </br></label>
            <br></br>
            <input type="file" name="cphoto" accept="image/*" @change="previewImage">
            <!-- Set up some way to show a small preview window for photo -->
             
            <div id="photoPreview" class="photo-preview">
                <img id="photoPreviewImg" src="" alt="Photo Preview" />
                <span id="photoPreviewText">No Photo Selected</span>
            </div>

            <!-- Backstory Description -->
            <label for="cbackstory"><br>Backstory </br></label>
            <textarea style="width:100%; height:100px;" placeholder="Enter Backstory" name="cbackstory" required></textarea>

            <br>

            <!-- Cancel Button NOT FINISHED-->
            <button type="button" class="cancelbtn" onclick="closeModal('0001')">Cancel</button>
        </div>
    </div>
</template>

<style scoped>
/* Photo preview styling */
.photo-preview {
  margin-top: 10px;
  padding: 10px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  text-align: center;
  background-color: #f9f9f9;
  max-width: 200px;
}

#photoPreviewImg {
  max-width: 100%;
  max-height: 150px;
  border-radius: 4px;
  display: none; /* Hide initially */
}

#photoPreviewText {
  color: #666;
  font-style: italic;
}

/* Modal basic styling */
.modal {
  display: none;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.4);
}

</style>