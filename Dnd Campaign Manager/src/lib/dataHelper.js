/*
* Backend connection to pull from the routes grabbing information from the database
*/

export async function checkLoginCredentials(username, password) {
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.status === 200) {
            const result = await response.json();
            return result;
        } else {
            throw new Error('Login request failed with status ' + response.status);
        }
    } catch (error) {
        console.error('Error during login request:', error);
        return null;
    }
}
