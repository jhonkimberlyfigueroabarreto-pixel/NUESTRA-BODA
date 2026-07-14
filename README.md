# Organizador de Bodas - Kimberly & Jhon

Este proyecto es una plataforma interactiva y elegante diseñada para la organización y distribución de invitados en mesas para la boda de **Kimberly y Jhon**.

---

## 💾 Permanencia en AI Studio Build

¡Tu proyecto **ya está guardado de manera permanente** en tu espacio de trabajo de Google AI Studio Build! 
* **Guardado Automático**: Cada cambio realizado se guarda de forma instantánea. No hay riesgo de perder tu trabajo.
* **Acceso Futuro**: Puedes cerrar esta pestaña con total tranquilidad. Para volver a abrir y seguir editando tu proyecto en el futuro, simplemente accede a tu panel de **Google AI Studio Build** (https://ai.studio/build), selecciona este espacio de trabajo y continúa justo donde lo dejaste.

---

## 🚀 Guías de Despliegue e Integración

Hemos incluido archivos de configuración listos para producción para que puedas alojar tu aplicación en cualquier plataforma.

### 1. 🐙 Conectar y Guardar en GitHub
Para llevar este código a tu cuenta de GitHub, tienes dos opciones:

#### Opción A: Desde la interfaz de AI Studio (Recomendado)
1. Abre el menú de **Settings / Ajustes** en la esquina superior de la interfaz de AI Studio.
2. Selecciona **Export to GitHub** (Exportar a GitHub).
3. Conecta tu cuenta y crea un nuevo repositorio. ¡El código se subirá de forma automática!

#### Opción B: Usando Git en tu terminal local (si descargas el ZIP)
Si descargas el proyecto como archivo ZIP, descomprímelo y ejecuta lo siguiente en tu terminal:
```bash
git init
git add .
git commit -m "Initial commit: Wedding Planner App"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

---

### 2. ⚡ Desplegar en Netlify
Este proyecto ya cuenta con un archivo `netlify.toml` preconfigurado para compilar la aplicación y manejar el enrutamiento de la SPA sin errores 404.

1. Inicia sesión en [Netlify](https://www.netlify.com/).
2. Haz clic en **Add new site** > **Import an existing project**.
3. Conecta tu cuenta de **GitHub** y selecciona el repositorio de este proyecto.
4. Netlify detectará automáticamente la configuración del archivo `netlify.toml`:
   * **Build Command**: `npm run build`
   * **Publish Directory**: `dist`
5. Haz clic en **Deploy** y ¡listo! Tu aplicación estará en línea con HTTPS gratuito.

---

### 3. 🔥 Desplegar en Firebase Hosting
Hemos incluido el archivo `firebase.json` que redirige de forma segura todas las rutas a `index.html`.

Para desplegarlo de forma manual desde tu máquina:
1. Instala las herramientas de Firebase de forma global (si aún no las tienes):
   ```bash
   npm install -g firebase-tools
   ```
2. Inicia sesión en tu cuenta de Firebase:
   ```bash
   firebase login
   ```
3. Inicializa el proyecto en la carpeta raíz:
   ```bash
   firebase init hosting
   ```
   * Selecciona tu proyecto existente de Firebase.
   * Cuando te pregunte por el directorio público, escribe `dist`.
   * Cuando pregunte si deseas configurar como una Single Page Application, selecciona `Yes` (el instalador respetará nuestro `firebase.json`).
4. Compila la aplicación y despliega:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

---

## 🛠️ Desarrollo Local

Si deseas correr este proyecto de forma local en tu computadora:

1. Asegúrate de tener instalado [Node.js](https://nodejs.org/).
2. Instala las dependencias en la raíz del proyecto:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo local:
   ```bash
   npm run dev
   ```
4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.
