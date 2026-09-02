/* Evolvix Global — loader de entrada, revelado en scroll, contador de
   cifras y menú de pantalla completa. Capa de interacción añadida sobre
   js/main.js; no sustituye su lógica (mailto, año, selector de idioma). */

(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');

  /* La CSP del sitio no incluye 'unsafe-inline' en style-src, así que los
     desplazamientos/retardos de cada elemento se pasan por atributos
     data-ty (px) y data-d (ms) en el HTML y se aplican aquí como
     propiedades personalizadas vía JS — eso no lo restringe la CSP. */
  document.querySelectorAll('[data-ty], [data-d]').forEach(function (el) {
    var ty = el.getAttribute('data-ty');
    var d = el.getAttribute('data-d');
    if (ty !== null) el.style.setProperty('--ty', ty + 'px');
    if (d !== null) el.style.setProperty('--d', d + 'ms');
  });

  /* Elementos por encima del pliegue quedan geométricamente "visibles" para
     IntersectionObserver aunque el loader los tape visualmente; sin esto
     su animación de entrada terminaría oculta detrás del loader. */
  var introReady = false;
  var readyCallbacks = [];
  function onReady(cb) {
    if (introReady) cb();
    else readyCallbacks.push(cb);
  }

  /* ======================================================================
     LOADER DE ENTRADA
     Si algo falla (rAF no disponible/limitado), un watchdog fuerza el
     final para no dejar nunca la página bloqueada tras la pantalla negra.
     ====================================================================== */
  (function runLoader() {
    var loader = document.getElementById('loader');
    if (!loader) {
      document.documentElement.classList.add('ready');
      introReady = true;
      readyCallbacks.forEach(function (cb) {
        cb();
      });
      return;
    }
    var fill = document.getElementById('loader-fill');
    var count = document.getElementById('loader-count');
    var FILL_MS = 1100;
    var finished = false;

    document.documentElement.style.overflow = 'hidden';

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function finish() {
      if (finished) return;
      finished = true;
      clearTimeout(watchdog);
      loader.classList.add('exit');
      setTimeout(function () {
        document.documentElement.classList.add('ready');
        document.documentElement.style.removeProperty('overflow');
        loader.remove();
        introReady = true;
        readyCallbacks.forEach(function (cb) {
          cb();
        });
      }, 650);
    }

    var watchdog = setTimeout(finish, FILL_MS + 2000);
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var t = Math.min(1, (ts - start) / FILL_MS);
      var progress = Math.round(easeInOutCubic(t) * 100);
      if (fill) fill.style.width = progress + '%';
      if (count) count.textContent = String(progress).padStart(3, '0');
      if (t < 1) requestAnimationFrame(step);
      else finish();
    }
    requestAnimationFrame(step);
  })();

  /* ======================================================================
     REVELADO AL HACER SCROLL
     [data-reveal] se anima a sí mismo; [data-reveal-lines] solo dispara
     la clase .revealed para animar sus .line-inner/.word-inner internos.
     Se activa solo cuando el loader ha terminado: si no, un elemento ya
     visible al cargar (p. ej. el hero) se revelaría oculto tras el loader.
     ====================================================================== */
  onReady(function () {
    var revealTargets = document.querySelectorAll('[data-reveal], [data-reveal-lines]');
    if ('IntersectionObserver' in window) {
      var revealIO = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
              revealIO.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
      );
      revealTargets.forEach(function (el) {
        revealIO.observe(el);
      });
    } else {
      revealTargets.forEach(function (el) {
        el.classList.add('revealed');
      });
    }

    /* ---- Contador de cifras ---- */
    function animateCount(el) {
      var raw = el.getAttribute('data-target') || '0';
      var target = parseFloat(raw);
      var suffix = el.getAttribute('data-suffix') || '';
      var decimals = (raw.split('.')[1] || '').length;
      var pad = parseInt(el.getAttribute('data-pad') || '0', 10);
      var dur = 1400;
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = target * eased;
        var text = decimals ? val.toFixed(decimals) : String(Math.round(val));
        if (pad && !decimals) text = text.padStart(pad, '0');
        el.textContent = text + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    var countEls = document.querySelectorAll('[data-target]');
    if ('IntersectionObserver' in window) {
      var countIO = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              countIO.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      countEls.forEach(function (el) {
        countIO.observe(el);
      });
    } else {
      countEls.forEach(function (el) {
        el.textContent = (el.getAttribute('data-target') || '') + (el.getAttribute('data-suffix') || '');
      });
    }
  });

  /* ======================================================================
     MENÚ DE PANTALLA COMPLETA
     ====================================================================== */
  var overlay = document.getElementById('nav-menu-overlay');
  if (overlay) {
    var openMenu = function () {
      overlay.hidden = false;
      requestAnimationFrame(function () {
        overlay.classList.add('open');
      });
      document.documentElement.style.overflow = 'hidden';
    };
    var closeMenu = function () {
      overlay.classList.remove('open');
      document.documentElement.style.removeProperty('overflow');
      setTimeout(function () {
        overlay.hidden = true;
      }, 500);
    };
    document.querySelectorAll('[data-open-menu]').forEach(function (btn) {
      btn.addEventListener('click', openMenu);
    });
    overlay.querySelectorAll('[data-close-menu], .navmenu-nav a').forEach(function (el) {
      el.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeMenu();
    });
  }
})();
