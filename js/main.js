/* Evolvix Global — interacción mínima y funcional, sin animación decorativa */

(function () {
  'use strict';

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var isOpen = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', String(!isOpen));
      toggle.setAttribute('aria-expanded', String(!isOpen));
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.setAttribute('data-open', 'false');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 4);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
