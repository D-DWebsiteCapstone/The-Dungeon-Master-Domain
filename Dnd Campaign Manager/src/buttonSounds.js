import defaultClick from './assets/sounds/defaultClick.ogg';
import defaultClick2 from './assets/sounds/defaultClick2.ogg'
import legoYoda from './assets/sounds/lego-yoda.mp3';
import magicSound from './assets/sounds/sparkle.wav'


// Preload all sounds
export const sounds = {
    default: new Audio(defaultClick2),
    yoda: new Audio(legoYoda),
    sparkle: new Audio(magicSound),
};

// Load all sounds into memory to prevent delay
Object.values(sounds).forEach(audio => audio.load());

// Play function
export function playSound(name = 'default') {
    const audio = sounds[name] || sounds.default;
    audio.currentTime = 0; // rewind to start
    audio.play();
}
