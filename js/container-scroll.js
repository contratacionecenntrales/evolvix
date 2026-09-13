/* Adaptación vanilla del efecto "ContainerScroll" (Aceternity UI): una
   tarjeta que se endereza (rotateX) y escala mientras el usuario recorre
   el alto del contenedor [data-container-scroll], con el título
   desplazándose hacia arriba. Sin React ni framer-motion: se recalcula
   con la posición de scroll real del contenedor. */
(function () {
  'use strict';

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function initContainerScroll(root) {
    var header = root.querySelector('.cs-header');
    var card = root.querySelector('.cs-card');
    if (!header || !card) return;

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var mobileQuery = window.matchMedia('(max-width: 768px)');
    var ticking = false;

    function progress() {
      var rect = root.getBoundingClientRect();
      var total = rect.height - window.innerHeight;
      if (total <= 0) return 1;
      return clamp(-rect.top / total, 0, 1);
    }

    function apply(p) {
      var scaleRange = mobileQuery.matches ? [0.7, 0.9] : [1.05, 1];
      var rotate = lerp(20, 0, p);
      var scale = lerp(scaleRange[0], scaleRange[1], p);
      var translate = lerp(0, -100, p);
      header.style.transform = 'translateY(' + translate + 'px)';
      card.style.transform = 'rotateX(' + rotate + 'deg) scale(' + scale + ')';
    }

    function update() {
      ticking = false;
      apply(progress());
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    if (reduceMotion) {
      // Estado de reposo final, sin animación continua.
      var restScale = mobileQuery.matches ? 0.9 : 1;
      header.style.transform = 'translateY(-100px)';
      card.style.transform = 'rotateX(0deg) scale(' + restScale + ')';
      return;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  document.querySelectorAll('[data-container-scroll]').forEach(initContainerScroll);
})();
