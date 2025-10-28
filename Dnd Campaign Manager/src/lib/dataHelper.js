/*
* Backend connection to pull from the routes grabbing information from the database
*/

export async function checkLoginCredentials(username, password) {
    try {
        //const response = await fetch(`${process.env.BACKEND_URL}/user/login`, {
        const response = await fetch("https://localhost:3000/user/login", {
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

// Navigation helper function
export async function navigateToHome() {
  current.value = 'Login';
  router.push('/Home');
}
