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


//Make functions to pull character information from the backend to charcater.js

export async function getCharacterById(id) {
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/characters/character/${id}`);
        if (response.status === 200) {
            const result = await response.json();
            return result.character;
        } else {
            throw new Error('Character request failed with status ' + response.status);
        }
    } catch (error) {
        console.error('Error during character request:', error);
        return null;
    }
}

export async function getCharacterByName(name) {
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/characters/character/${name}`);
        if (response.status === 200) {
            const result = await response.json();
            return result.character;
        } else {
            throw new Error('Character request failed with status ' + response.status);
        }
    } catch (error) {
        console.error('Error during character request:', error);
        return null;
    }
}

export async function getCharacterByImage(image) {
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/characters/character/${image}`);
        if (response.status === 200) {
            const result = await response.json();
            return result.character;
        } else {
            throw new Error('Character request failed with status ' + response.status);
        }
    } catch (error) {
        console.error('Error during character request:', error);
        return null;
    }
}

export async function getCharacterByBackstory(backstory) {
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/characters/character/${backstory}`);
        if (response.status === 200) {
            const result = await response.json();
            return result.character;
        } else {
            throw new Error('Character request failed with status ' + response.status);
        }
    } catch (error) {
        console.error('Error during character request:', error);
        return null;
    }
}