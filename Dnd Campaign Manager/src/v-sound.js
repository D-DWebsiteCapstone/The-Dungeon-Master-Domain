import { playSound } from './buttonSounds.js';

// export default {
//   mounted(el, binding) {
//     el.addEventListener('click', () => {
//       playSound(binding.value); // binding.value = sound name
//     });
//   },
// };

// export default {
//   mounted(el, binding) {
//     // Determine default sound for this container (optional)
//     const defaultSoundName = binding.value || 'default';

//     // Listen for clicks **inside this element**
//     el.addEventListener('click', (event) => {
//       // Check if clicked element has its own override
//       const specialSound = event.target.dataset.sound;
      
//       if (specialSound) {
//         playSound(specialSound);
//       } else {
//         playSound(defaultSoundName);
//       }
//     });
//   },
// };

// export default {
//   mounted(el) {
//     // Store listener reference so we can remove later
//     const handler = (event) => {
//       const button = event.target.closest('button'); // Find closest button ancestor
//       if (!button || !el.contains(button)) return; // Ignore clicks outside buttons in this container

//       const soundName = button.dataset.sound || 'default';
//       playSound(soundName);
//     };

//     el.addEventListener('click', handler);

//     // Save the handler so we can remove it in unmounted
//     el._vSoundHandler = handler;
//   },

//   unmounted(el) {
//     if (el._vSoundHandler) {
//       el.removeEventListener('click', el._vSoundHandler);
//       delete el._vSoundHandler;
//     }
//   },
// };

// export default {
//   mounted(el) {
//     el.addEventListener('click', (event) => {
//       const button = event.target.closest('button')
//       if (!button) return

//       // Check if the button has a special sound
//       const soundName = button.getAttribute('data-sound') || 'default'

//       playSound(soundName)
//     })
//   }
// }

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