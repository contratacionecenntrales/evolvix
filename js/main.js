/* Evolvix Global — interacción mínima y funcional, sin animación decorativa */

/* Sin backend: los formularios envían por mailto. buildMailtoUrl queda
   expuesto para poder testearlo sin disparar una navegación real. */
window.EvolvixMailto = {
  serializeForm: function (form) {
    var lines = [];
    form.querySelectorAll('input[name], select[name], textarea[name]').forEach(function (field) {
      if (field.type === 'file') return; // mailto: no puede transportar adjuntos
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

/* Envío real vía Web3Forms (https://web3forms.com), con adjuntos (CV)
   incluidos — sin necesidad de backend propio. Se configura en un único
   sitio: sustituye el valor de abajo por tu access key gratuita de
   Web3Forms. Mientras no se configure, los formularios siguen
   funcionando exactamente como antes (mailto:). Si Web3Forms fallara
   (red caída, key inválida...), el formulario de contacto recurre a
   mailto automáticamente; el de candidaturas, al llevar un adjunto que
   mailto no puede transportar, muestra un aviso en vez de recurrir a
   mailto en silencio (para no perder el CV sin que el candidato lo sepa).
*/
window.EvolvixForms = {
  accessKey: 'REPLACE_WITH_YOUR_WEB3FORMS_ACCESS_KEY',
  endpoint: 'https://api.web3forms.com/submit',
};

(function () {
  'use strict';

  /* Marca cada campo como "tocado" al perder el foco, para mostrar el
     estado inválido (borde rojo) solo tras la interacción del usuario,
     nunca en un formulario recién cargado y vacío. */
  document.querySelectorAll('.form-field input, .form-field select, .form-field textarea').forEach(
    function (field) {
      field.addEventListener('blur', function () {
        field.classList.add('touched');
      });
    }
  );

  /* Resalta el enlace de navegación de la página actual (útil sobre
     todo para "Talento", que es una página aparte; los anclajes de una
     sola página no se marcan para no requerir scroll-spy). */
  var currentPath = window.location.pathname.replace(/\/index\.html$/, '/');
  document.querySelectorAll('.nav-links a').forEach(function (link) {
    if (link.hash) return;
    if (link.pathname.replace(/\/index\.html$/, '/') === currentPath) {
      link.setAttribute('aria-current', 'page');
    }
  });

  document.querySelectorAll('form[data-mailto-to]').forEach(function (form) {
    var statusEl = form.querySelector('[data-form-status]');
    var submitBtn = form.querySelector('button[type="submit"]');
    var fileField = form.querySelector('input[type="file"]');

    var setStatus = function (state) {
      if (!statusEl) return;
      if (!state) {
        statusEl.hidden = true;
        return;
      }
      var text = statusEl.getAttribute('data-status-' + state);
      statusEl.textContent = text || '';
      statusEl.hidden = !text;
      statusEl.setAttribute('data-state', state);
    };

    var buildSubject = function () {
      var subject = form.getAttribute('data-mailto-subject') || '';
      var subjectField = form.querySelector('[data-subject-field]');
      if (subjectField && subjectField.value) {
        subject += (subject ? ' — ' : '') + subjectField.value;
      }
      return subject;
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var key = window.EvolvixForms.accessKey;
      var configured = key && key.indexOf('REPLACE_WITH') !== 0;

      if (!configured) {
        window.location.href = window.EvolvixMailto.buildUrl(form);
        return;
      }

      var formData = new FormData(form);
      formData.set('access_key', key);
      formData.set('subject', buildSubject());

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');
      }
      setStatus('sending');

      fetch(window.EvolvixForms.endpoint, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      })
        .then(function (res) {
          return res
            .json()
            .catch(function () {
              return {};
            })
            .then(function (data) {
              return { ok: res.ok, data: data };
            });
        })
        .then(function (result) {
          if (result.ok && result.data && result.data.success) {
            setStatus('success');
            form.reset();
          } else if (fileField) {
            setStatus('error');
          } else {
            window.location.href = window.EvolvixMailto.buildUrl(form);
          }
        })
        .catch(function () {
          if (fileField) {
            setStatus('error');
          } else {
            window.location.href = window.EvolvixMailto.buildUrl(form);
          }
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.removeAttribute('aria-busy');
          }
        });
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

  /* Red de nodos animada del hero oscuro (canvas.hero-network). No-op
     en páginas sin esa sección (talento.html, legal.html). Se detiene
     fuera de vista, con la pestaña oculta o si el usuario prefiere
     menos movimiento (en ese caso dibuja un único fotograma estático). */
  var heroCanvas = document.querySelector('.hero-network');
  if (heroCanvas && heroCanvas.getContext) {
    var heroSection = heroCanvas.closest('.hero');
    var ctx = heroCanvas.getContext('2d');
    var particles = [];
    var rafId = null;
    var running = false;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    var seedParticles = function (w, h) {
      var count = Math.min(70, Math.max(24, Math.round((w * h) / 16000)));
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
        });
      }
    };

    var resize = function () {
      var rect = heroSection.getBoundingClientRect();
      heroCanvas.width = Math.max(1, Math.round(rect.width * dpr));
      heroCanvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedParticles(rect.width, rect.height);
    };

    var drawFrame = function () {
      var rect = heroSection.getBoundingClientRect();
      var w = rect.width;
      var h = rect.height;
      ctx.clearRect(0, 0, w, h);

      var linkDist = 140;
      for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
          var dx = particles[a].x - particles[b].x;
          var dy = particles[a].y - particles[b].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < linkDist) {
            var alpha = (1 - dist / linkDist) * 0.35;
            ctx.strokeStyle = 'rgba(64, 210, 200, ' + alpha.toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }

      for (var i = 0; i < particles.length; i++) {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(120, 235, 220, 0.55)';
        ctx.arc(particles[i].x, particles[i].y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    var step = function () {
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        var rect = heroSection.getBoundingClientRect();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > rect.width) p.vx *= -1;
        if (p.y < 0 || p.y > rect.height) p.vy *= -1;
        p.x = Math.max(0, Math.min(rect.width, p.x));
        p.y = Math.max(0, Math.min(rect.height, p.y));
      }
      drawFrame();
      if (running) rafId = window.requestAnimationFrame(step);
    };

    var start = function () {
      if (running) return;
      if (reduceMotion) {
        drawFrame();
        return;
      }
      running = true;
      step();
    };

    var stop = function () {
      running = false;
      if (rafId) window.cancelAnimationFrame(rafId);
    };

    resize();
    start();

    var resizeTimer;
    window.addEventListener(
      'resize',
      function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 150);
      },
      { passive: true }
    );

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else start();
    });

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && !document.hidden) start();
            else stop();
          });
        },
        { threshold: 0.05 }
      );
      io.observe(heroSection);
    }
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
