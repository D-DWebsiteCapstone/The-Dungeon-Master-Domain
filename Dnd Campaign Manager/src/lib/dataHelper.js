/*
* Backend connection to pull from the routes grabbing information from the database
*/

export async function checkLoginCredentials(username, password) {
    console.log("checkLoginCredentials() called with:", username, password);
    try {
        //const response = await fetch(`${process.env.BACKEND_URL}/user/login`, {
        const response = await fetch("https://localhost:3000/user/login", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.status === 200) {
            const result = await response.json();
            console.log("Login successful:", result);
            return result;
        } else {
            console.log("Login Failed:", result);
            throw new Error('Login request failed with status ' + response.status);
        }
    } catch (error) {
        console.error('Error during login request:', error);
        return null;
    }
}

export async function recap(campaignId, userId){
    console.log('recap function called with userId ' + userId + ' and campaignId ' + campaignId);
    try{
       const response = await fetch("https://localhost:3000/data/campaign/notes", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaignId, userId })
        }); 

        if (response.status === 200) {
            const result = await response.json();
            console.log("Recap Opened:", result);
            return result;
        } else {
            console.log("Recap Did Not Opern REEEEEEEEE!:", result);
            throw new Error('Recap request failed with status ' + response.status);
        }
    }
    catch (error){
        console.error('Error during login request:', error);
        throw new Error('failed');
        return null;
    }
}

