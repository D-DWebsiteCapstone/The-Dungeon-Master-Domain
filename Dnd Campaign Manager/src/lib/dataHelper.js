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

// Navigation helper function
