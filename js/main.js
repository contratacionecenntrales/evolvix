/* Evolvix Global — interacción mínima y funcional, sin animación decorativa */

/* Sin backend: los formularios envían por mailto. buildMailtoUrl queda
   expuesto para poder testearlo sin disparar una navegación real. */
window.EvolvixMailto = {
  serializeForm: function (form) {
    var lines = [];
    form.querySelectorAll('input[name], select[name], textarea[name]').forEach(function (field) {
      var value = (field.value || '').trim();
      if (!value) return;
      var label = field.id ? form.querySelector('label[for="' + field.id + '"]') : null;
      var key = label ? label.textContent.trim() : field.name;
      lines.push(key + ': ' + value);
    });
    return lines.join('\n');
  },

  buildUrl: function (form) {
    var to = form.getAttribute('data-mailto-to') || '';
    var subject = form.getAttribute('data-mailto-subject') || '';
    var subjectField = form.querySelector('[data-subject-field]');
    if (subjectField && subjectField.value) {
      subject += (subject ? ' — ' : '') + subjectField.value;
    }
    var body = window.EvolvixMailto.serializeForm(form);
    return (
      'mailto:' + to +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body)
    );
  }
};

(function () {
  'use strict';

  document.querySelectorAll('form[data-mailto-to]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      window.location.href = window.EvolvixMailto.buildUrl(form);
    });
  });

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

  var langSelect = document.getElementById('lang-select');
  if (langSelect) {
    langSelect.addEventListener('change', function () {
      if (langSelect.value) {
        window.location.href = langSelect.value;
      }
    });
  }
})();
