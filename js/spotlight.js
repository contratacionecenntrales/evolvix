/* Adaptación vanilla del efecto "Spotlight": una mancha de luz que sigue
   al puntero dentro de [data-spotlight]. Sin React ni framer-motion —
   posiciona el elemento .spotlight con left/top directos; el CSS ya
   desactiva el efecto en touch o con prefers-reduced-motion. */
(function () {
  'use strict';

  function initSpotlight(container) {
    var dot = container.querySelector('.spotlight');
    if (!dot) return;

    container.addEventListener('pointermove', function (e) {
      var rect = container.getBoundingClientRect();
      dot.style.left = e.clientX - rect.left - dot.offsetWidth / 2 + 'px';
      dot.style.top = e.clientY - rect.top - dot.offsetHeight / 2 + 'px';
      dot.classList.add('is-visible');
    });

    container.addEventListener('pointerleave', function () {
      dot.classList.remove('is-visible');
    });
  }

  document.querySelectorAll('[data-spotlight]').forEach(initSpotlight);
})();
