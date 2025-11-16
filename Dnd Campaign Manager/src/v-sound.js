import { playSound } from './buttonSounds.js';

export default {
  mounted(el) {
    el.addEventListener('click', (event) => {
      const button = event.target.closest('button')
      if (!button || button.hasAttribute('data-no-vsound')) return

      // Check if the button has a special sound
      const soundName = button.getAttribute('data-sound') || 'default'
      playSound(soundName)
    })
  }
}