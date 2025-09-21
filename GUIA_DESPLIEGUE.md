# Guía Completa para Desplegar tu Aplicación en la Nube (Gratis)

Esta guía te llevará paso a paso para desplegar tu portafolio en servicios gratuitos y dejarlo 100% funcional.

**El plan es el siguiente:**
1.  **Código Fuente:** Usaremos **GitHub** para almacenar y gestionar tu código.
2.  **Base de Datos (PostgreSQL):** Usaremos **Neon** para alojar tu base de datos PostgreSQL en la nube.
3.  **Backend (Node.js/Express):** Usaremos **Render** para alojar tu servidor de Node.js.
4.  **Frontend (React/Vite):** Usaremos **Vercel** para alojar tu aplicación de React.

---

### Paso 1: Subir tu Proyecto a GitHub

1.  **Ve a GitHub:** Entra en [github.com](https://github.com) y crea una cuenta si no la tienes.
2.  **Crea un Repositorio Nuevo:**
    *   Haz clic en el botón "New" o ve a [github.com/new](https://github.com/new).
    *   Dale un nombre a tu repositorio (ej. `coleccion-arte-portfolio`).
    *   Asegúrate de que sea **Público** para que los reclutadores puedan verlo.
    *   **NO** inicialices con un `README` o `.gitignore` (ya hemos creado el nuestro).
    *   Haz clic en "Create repository".
3.  **Conecta tu Proyecto Local con GitHub:**
    *   Abre una terminal en la raíz de tu proyecto (`D:\Proyectos\coleccion-arte-api - Copy`).
    *   Ejecuta los siguientes comandos **uno por uno**, reemplazando la URL con la de tu repositorio:

    ```bash
    # Inicializa git en tu proyecto (si no lo has hecho)
    git init

    # Añade todos los archivos para ser rastreados (respetará el .gitignore)
    git add .

    # Crea tu primer commit (un registro de los cambios)
    git commit -m "Initial commit: Proyecto listo para despliegue"

    # Cambia el nombre de la rama principal a 'main' (práctica estándar)
    git branch -M main

    # Conecta tu repositorio local con el de GitHub (COPIA LA URL DE TU REPO)
    git remote add origin https://github.com/tu-usuario/tu-repositorio.git

    # Sube tu código a GitHub
    git push -u origin main
    ```

¡Listo! Tu código ya está en GitHub.

---

### Paso 2: Configurar la Base de Datos en Neon

1.  **Crea una cuenta en Neon:** Ve a [neon.tech](https://neon.tech) y regístrate (puedes usar tu cuenta de GitHub).
2.  **Crea un Proyecto Nuevo:**
    *   Dale un nombre a tu proyecto (ej. `arte-db`).
    *   Selecciona la versión más reciente de PostgreSQL.
    *   Elige la región gratuita más cercana a ti.
3.  **Obtén la URL de Conexión:**
    *   Una vez creado el proyecto, busca la sección "Connection Details" o similar.
    *   Copia la URL de conexión que se ve así: `postgres://user:password@host:port/dbname`. **Esta URL es tu secreto más importante.**
4.  **Crea las Tablas:**
    *   Dentro de Neon, busca el **SQL Editor**.
    *   Copia **todo el contenido** del script SQL que te di en el archivo `guia_db.txt`.
    *   Pega el script en el editor de Neon y ejecútalo. Esto creará todas tus tablas en la base de datos en la nube.

---

### Paso 3: Desplegar el Backend en Render

1.  **Crea una cuenta en Render:** Ve a [render.com](https://render.com) y regístrate con tu cuenta de GitHub.
2.  **Crea un Nuevo Servicio Web:**
    *   En tu Dashboard, haz clic en "New" -> "Web Service".
    *   Conecta tu cuenta de GitHub y selecciona el repositorio que creaste.
3.  **Configura el Servicio:**
    *   **Name:** Dale un nombre único (ej. `coleccion-arte-api`).
    *   **Region:** Elige una región gratuita (ej. `Oregon` o `Frankfurt`).
    *   **Branch:** Asegúrate de que sea `main`.
    *   **Root Directory:** Déjalo en blanco (usará la raíz del proyecto).
    *   **Runtime:** Render debería detectar que es `Node`.
    *   **Build Command:** `npm install`
    *   **Start Command:** `node index.js`
    *   **Instance Type:** Elige el plan **Free**.
4.  **Añade las Variables de Entorno (¡MUY IMPORTANTE!):**
    *   Busca la sección "Environment" o "Advanced".
    *   Aquí debes añadir los "Secret Files" o variables que tu `index.js` necesita. Estas reemplazan a tu archivo `.env` local.
    *   Haz clic en "Add Environment Variable".
    *   Añade las siguientes variables:
        *   `DB_USER`: El usuario de tu base de datos Neon.
        *   `DB_HOST`: El host de Neon.
        *   `DB_DATABASE`: El nombre de la base de datos en Neon.
        *   `DB_PASSWORD`: La contraseña de Neon.
        *   `DB_PORT`: El puerto de Neon.
        *   `JWT_SECRET`: Un secreto para tus tokens (puedes inventar una frase larga y compleja).
5.  **Despliega:**
    *   Haz clic en "Create Web Service".
    *   Render empezará a construir y desplegar tu aplicación. Puedes ver el progreso en los logs.
    *   Una vez desplegado, Render te dará una URL pública para tu backend (ej. `https://coleccion-arte-api.onrender.com`). **Cópiala.**

---

### Paso 4: Desplegar el Frontend en Vercel

1.  **Crea una cuenta en Vercel:** Ve a [vercel.com](https://vercel.com) y regístrate con tu cuenta de GitHub.
2.  **Crea un Nuevo Proyecto:**
    *   En tu Dashboard, haz clic en "Add New..." -> "Project".
    *   Importa el repositorio de GitHub que creaste.
3.  **Configura el Proyecto:**
    *   Vercel es muy bueno detectando proyectos de React/Vite. Debería autoconfigurar casi todo.
    *   **Root Directory:** ¡Importante! Haz clic en "Edit" y selecciona `coleccion-arte-ui` de la lista. Esto le dice a Vercel que el frontend está en esa subcarpeta.
    *   Verifica que el "Framework Preset" sea `Vite`.
4.  **Añade la Variable de Entorno:**
    *   Expande la sección "Environment Variables".
    *   Añade una nueva variable:
        *   **Name:** `VITE_API_URL`
        *   **Value:** La URL de tu backend desplegado en Render (la que copiaste en el paso anterior). Ej: `https://coleccion-arte-api.onrender.com`
5.  **Despliega:**
    *   Haz clic en "Deploy".
    *   Vercel construirá y desplegará tu frontend. Al finalizar, te dará la URL pública de tu portafolio (ej. `https://tu-proyecto.vercel.app`).

---

### Paso 5: Configuración Final y ¡Listo!

1.  **CORS:** El código de tu backend (`app.use(cors())`) es bastante permisivo, por lo que no deberías tener problemas de CORS. Si los tuvieras, tendrías que configurar CORS en `index.js` para permitir explícitamente peticiones desde tu URL de Vercel.
2.  **Prueba todo:**
    *   Abre la URL de Vercel.
    *   Crea un nuevo usuario administrador (ya que la base de datos de Neon está vacía).
    *   Inicia sesión, añade obras, edita, elimina y genera un PDF para asegurarte de que todo funciona.

¡Felicidades! Ahora tienes un proyecto full-stack funcional en tu portafolio para que cualquier reclutador pueda verlo y probarlo.
