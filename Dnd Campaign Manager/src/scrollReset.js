export default {
  mounted(el) {
    // Find the scrollable inner element
    const scrollTarget =
      el.querySelector('.popuptxt') || el.querySelector('.popup') || el;

    const observer = new MutationObserver(() => {
      // Detect when modal becomes visible
      if (el.style.display !== 'none') {
        scrollTarget.scrollTop = 0;
      }
    });

    observer.observe(el, {
      attributes: true,
      attributeFilter: ['style']
    });

    el._scrollResetObserver = observer;
  },

  unmounted(el) {
    if (el._scrollResetObserver) {
      el._scrollResetObserver.disconnect();
      delete el._scrollResetObserver;
    }
  }
};

