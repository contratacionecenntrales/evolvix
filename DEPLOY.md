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
index.html
legal.html
robots.txt
sitemap.xml
assets/
css/
js/
.well-known/
  └─ security.txt
```

No subas `.git/` ni `DEPLOY.md` — no son necesarios en el servidor.

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

## 6. Checklist tras publicar

- [ ] `https://www.evolvixglobal.es` carga con el candado verde (SSL activo)
- [ ] `http://www.evolvixglobal.es` redirige automáticamente a `https://`
- [ ] `https://evolvixglobal.es` (sin www) redirige a `https://www...`
- [ ] El menú móvil, los anclajes del menú y los enlaces del footer funcionan
- [ ] `https://www.evolvixglobal.es/legal.html` carga correctamente
- [ ] Una URL inventada (ej. `/no-existe`) muestra la página 404 personalizada
- [ ] Comprobar cabeceras de seguridad en
      [securityheaders.com](https://securityheaders.com) → debería dar nota A/A+
- [ ] Comprobar el certificado en
      [ssllabs.com/ssltest](https://www.ssllabs.com/ssltest/) → debería dar A/A+
- [ ] Dar de alta `sitemap.xml` en
      [Google Search Console](https://search.google.com/search-console)

## 7. Seguridad — buenas prácticas continuas

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
