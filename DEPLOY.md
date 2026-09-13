# Despliegue en Hostalia — Evolvix Global

Sitio 100% estático (HTML/CSS/JS, sin backend ni base de datos). No requiere
PHP ni ningún lenguaje de servidor: solo alojamiento web estándar con Apache.

## 1. Qué subir

Sube **el contenido** de esta carpeta (no la carpeta en sí) al directorio
raíz de tu hosting:

```
.htaccess          ← IMPORTANTE: es un archivo oculto, actívalo en tu cliente FTP
404.html
DEPLOY.md           (no hace falta subirlo, es solo para referencia)
index.html          (español — idioma por defecto)
legal.html
talento.html
robots.txt
sitemap.xml
assets/             (incluye assets/fonts/, la tipografía Inter autoalojada)
css/
js/
en/                  (inglés)
  ├─ index.html
  ├─ legal.html
  └─ talento.html
pt/                  (portugués)
  ├─ index.html
  ├─ legal.html
  └─ talento.html
fr/                  (francés)
  ├─ index.html
  ├─ legal.html
  └─ talento.html
de/                  (alemán)
  ├─ index.html
  ├─ legal.html
  └─ talento.html
ar/                  (árabe — RTL)
  ├─ index.html
  ├─ legal.html
  └─ talento.html
.well-known/
  └─ security.txt
```

No subas `.git/`, `DEPLOY.md` ni `i18n-src/` — no son necesarios en el
servidor. La carpeta `i18n-src/` contiene solo las plantillas y el script
Python usados para **generar** las 6 versiones de idioma; no es parte del
sitio publicado (y el `.htaccess` la bloquea igualmente por si se sube por
error). Si en el futuro hay que cambiar un texto, edítalo en
`i18n-src/build.py` y vuelve a ejecutar `python3 i18n-src/build.py` desde la
raíz del proyecto para regenerar todas las páginas.

## 2. Dónde subirlo (directorio raíz según tu panel)

Hostalia ofrece planes con panel **Plesk** o **cPanel** según el producto
contratado. Comprueba en tu panel cuál tienes y sube el contenido a:

- **Plesk** → carpeta `httpdocs/`
- **cPanel** → carpeta `public_html/`

Si el dominio principal de la cuenta ya es `evolvixglobal.es`, esa es la
carpeta raíz. Si el sitio va en un subdominio o dominio adicional, usa la
carpeta que Hostalia haya creado para ese dominio.

## 3. Subir los archivos por FTP/SFTP

1. En el panel de Hostalia, busca los datos de acceso FTP (usuario,
   contraseña, servidor). Usa **SFTP** si está disponible en vez de FTP
   sin cifrar.
2. Conéctate con un cliente como [FileZilla](https://filezilla-project.org/).
3. **Activa la opción de mostrar archivos ocultos** en tu cliente FTP —
   si no, no verás (ni subirás) el archivo `.htaccess`, que es el que
   aplica toda la configuración de seguridad.
4. Sube todo el contenido a `httpdocs/` o `public_html/`.
5. Confirma que `.htaccess` ha llegado al servidor (en FileZilla, activa
   "Ver > Mostrar archivos ocultos").

## 4. Activar el certificado SSL (HTTPS)

Antes o justo después de subir los archivos:

1. En el panel de Hostalia, activa el certificado **SSL gratuito
   (Let's Encrypt)** para `evolvixglobal.es` y `www.evolvixglobal.es`
   (ambos, el `.htaccess` redirige entre ellos).
2. Espera a que se emita (normalmente unos minutos).
3. El `.htaccess` incluido ya fuerza HTTPS automáticamente y redirige
   `evolvixglobal.es` → `www.evolvixglobal.es`. Si tu dominio principal
   es sin `www`, dímelo y te doy la línea a invertir.

## 5. Verificar que el `.htaccess` funciona

Hostalia ejecuta Apache con los módulos `mod_headers`, `mod_rewrite`,
`mod_deflate` y `mod_expires` activos de forma estándar, así que el
`.htaccess` debería funcionar sin tocar nada. Si al visitar el sitio ves un
error 500:

1. Es casi siempre por un módulo no disponible en tu plan concreto.
2. Comenta (con `#`) el bloque `<IfModule mod_headers.c>` correspondiente
   y prueba de nuevo, o contacta con soporte de Hostalia para que
   confirmen qué módulos tienes activos.

## 6. Formularios, reservas y candidaturas (sin backend)

El sitio no tiene servidor propio, pero el formulario de contacto y el de
candidaturas (`talento.html`) **sí envían el correo automáticamente**,
usando [Web3Forms](https://web3forms.com) (servicio gratuito de envío de
formularios sin backend propio, con soporte de adjuntos). No hace falta
tocar HTML: todo se configura en **un único sitio**.

### 6.1 Activar el envío real (clave de Web3Forms)

1. Ve a [web3forms.com](https://web3forms.com) y crea una cuenta gratuita
   con `info@evolvixglobal.es` (o el correo que quieras que reciba los
   envíos). El plan gratuito incluye adjuntos.
2. Copia el **Access Key** que te generan.
3. Abre `js/main.js` y sustituye esta línea (cerca del principio del
   archivo):
   ```js
   accessKey: 'REPLACE_WITH_YOUR_WEB3FORMS_ACCESS_KEY',
   ```
   por tu clave real:
   ```js
   accessKey: 'tu-access-key-real-aqui',
   ```
4. Sube el `js/main.js` actualizado al servidor. Es el único archivo que
   hay que tocar — los 12 formularios (contacto + candidaturas × 6
   idiomas) leen esta misma clave.

**Mientras no configures la clave**, los formularios siguen funcionando
exactamente como antes: al enviar, se abre el cliente de correo del
visitante con un `mailto:` dirigido a `info@evolvixglobal.es` (sin
adjuntos, ya que `mailto:` no puede transportarlos). En cuanto añadas la
clave, el envío pasa a hacerse directamente en segundo plano, con el CV
adjunto en el caso de candidaturas.

### 6.2 Cómo se comporta cada formulario

- **Formulario de contacto** (home, sección Contacto): con la clave
  configurada, se envía directamente por Web3Forms. Si el envío fallara
  (red caída, clave inválida...), recurre automáticamente a `mailto:`
  como red de seguridad — no se pierde el mensaje, solo cambia cómo sale.
- **Formulario de candidaturas** (`talento.html`): incluye un campo para
  adjuntar el CV (PDF/Word) que se envía junto con el resto de datos. Como
  `mailto:` no puede llevar el adjunto, si el envío por Web3Forms fallara
  se muestra un aviso en pantalla (en vez de recurrir a `mailto:` en
  silencio) para que el candidato sepa que debe reintentar o escribir
  directamente adjuntando el CV a mano.
- El campo `Motivo` / `Área de interés` se añade al asunto del correo en
  ambos casos, para poder filtrar de un vistazo.
- Revisa que `info@evolvixglobal.es` (o la bandeja que configures en
  Web3Forms) sea real y esté monitorizada antes de publicar.

### 6.3 Reserva de llamada

Es el widget de calendario de GoHighLevel (`software.metatok.ai`),
incrustado como `<iframe>`. La gestión de disponibilidad, notificaciones y
confirmaciones la controla directamente el panel de GoHighLevel — no hay
nada que mantener aquí aparte del propio embed.

### 6.4 CSP

El `.htaccess` autoriza explícitamente `software.metatok.ai` (widget de
reservas) y `api.web3forms.com` (envío de formularios) en las directivas
necesarias — son las únicas excepciones de terceros del sitio — y
`form-action` incluye `mailto:` para que el envío nativo funcione incluso
si JavaScript fallara. Si en el futuro cambias de proveedor de calendario
o de formularios, hay que actualizar esa cabecera con el nuevo dominio.

## 7. Rendimiento, SEO y accesibilidad (novedades)

- **Tipografía Inter autoalojada**: ya no se carga desde Google Fonts
  (`fonts.googleapis.com`/`fonts.gstatic.com`). Los archivos viven en
  `assets/fonts/` (dos `.woff2`, ~130 KB en total) y se referencian desde
  `css/tokens.css`. Esto evita una petición externa más (mejor
  rendimiento) y evita transmitir la IP del visitante a Google en cada
  carga de página (relevante de cara al RGPD). El `.htaccess` ya no
  necesita autorizar esos dominios en la CSP.
- **Meta datos para redes sociales y buscadores**: cada página de
  contenido (home, talento, legal, en los 6 idiomas) incluye ahora
  Open Graph, Twitter Card y datos estructurados `JSON-LD` (tipo
  `Organization`, con NIF, dirección y punto de contacto). Si en algún
  momento tienes una imagen de marca en formato horizontal (1200×630 px),
  sustitúyela por `assets/favicon.png` en las etiquetas `og:image` /
  `twitter:image` de cada página para una vista previa más cuidada al
  compartir enlaces.
- **Accesibilidad**: el enlace de navegación de la página actual se marca
  automáticamente (`aria-current="page"`), los campos de formulario
  inválidos solo se resaltan en rojo tras haber sido usados (nunca en un
  formulario recién cargado), y toda animación (incluida la red de nodos
  del hero y el brillo de los botones) respeta
  `prefers-reduced-motion` — se desactiva si el visitante lo tiene
  configurado en su sistema.

## 8. Checklist tras publicar

- [ ] `https://www.evolvixglobal.es` carga con el candado verde (SSL activo)
- [ ] `http://www.evolvixglobal.es` redirige automáticamente a `https://`
- [ ] `https://evolvixglobal.es` (sin www) redirige a `https://www...`
- [ ] El menú móvil, los anclajes del menú y los enlaces del footer funcionan
- [ ] `https://www.evolvixglobal.es/legal.html` carga correctamente
- [ ] `https://www.evolvixglobal.es/talento.html` carga correctamente y el
      enlace "Talento" del menú funciona en todas las páginas
- [ ] Access key de Web3Forms configurada en `js/main.js` (ver sección 6.1)
- [ ] El formulario de contacto envía el mensaje y muestra "Mensaje
      enviado"; si desactivas temporalmente la clave, comprueba que cae
      de vuelta a `mailto:` sin errores
- [ ] El formulario de candidaturas envía correctamente con el CV
      adjunto (revisa que llegue el archivo a la bandeja configurada)
- [ ] El widget "Reserva una llamada" carga el calendario de GoHighLevel
      (revisa la consola del navegador por si el dominio cambia y hay que
      actualizar el CSP)
- [ ] `https://www.evolvixglobal.es/en/`, `/pt/`, `/fr/`, `/de/` y `/ar/`
      cargan cada uno en su idioma
- [ ] `https://www.evolvixglobal.es/ar/` se muestra correctamente de derecha
      a izquierda (RTL)
- [ ] El desplegable de idioma del footer cambia de idioma manteniendo la
      misma página (home ↔ home, legal ↔ legal, talento ↔ talento)
- [ ] Una URL inventada (ej. `/no-existe`) muestra la página 404 personalizada
- [ ] Comprobar cabeceras de seguridad en
      [securityheaders.com](https://securityheaders.com) → debería dar nota A/A+
- [ ] Comprobar el certificado en
      [ssllabs.com/ssltest](https://www.ssllabs.com/ssltest/) → debería dar A/A+
- [ ] Dar de alta `sitemap.xml` en
      [Google Search Console](https://search.google.com/search-console)

## 9. Seguridad — buenas prácticas continuas

El `.htaccess` ya deja el sitio protegido a nivel de cabeceras HTTP
(HSTS, CSP, X-Frame-Options, X-Content-Type-Options, etc.), pero conviene
mantener también estas prácticas en el propio panel de Hostalia:

- **Contraseña del FTP y del panel**: usa una contraseña larga y única
  (gestor de contraseñas), y actívala solo cuando necesites subir cambios.
- **Verificación en dos pasos**: si Hostalia la ofrece para el panel de
  cliente, actívala.
- **Copias de seguridad**: activa las copias de seguridad automáticas del
  hosting (Hostalia suele ofrecerlas) además de conservar este repositorio
  Git como copia versionada del código fuente.
- **No subas nunca** `.git/`, archivos `.env`, credenciales o backups de
  base de datos a `httpdocs/`/`public_html/` — el `.htaccess` ya bloquea
  el acceso web a archivos ocultos y de configuración por si acaso, pero
  lo más seguro es no subirlos en absoluto.
- **`security.txt`**: ya publicado en `/.well-known/security.txt` con un
  contacto de seguridad, tal y como recomienda el estándar RFC 9116 —
  revísalo una vez al año (tiene fecha de caducidad).
- **Actualiza el contenido con cuidado**: cualquier cambio futuro en el
  HTML que añada scripts o estilos en línea (`<script>...</script>` o
  `style="..."`) requerirá también actualizar la cabecera
  `Content-Security-Policy` del `.htaccess`, o el navegador los bloqueará.
