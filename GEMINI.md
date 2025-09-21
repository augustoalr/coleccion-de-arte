## Project Overview

This project is a web application for managing an art collection. It consists of a Node.js/Express backend and a React frontend.

**Backend:**

*   **Framework:** Express.js
*   **Database:** PostgreSQL
*   **Authentication:** JWT (JSON Web Tokens)
*   **Key Features:**
    *   **CRUD Operations:** Comprehensive management for artworks, authors, and locations.
    *   **Role-Based Access Control (RBAC):** Manages user permissions with roles like `admin`, `editor`, `lector`, and `conservador`.
    *   **Auditing:** Logs all significant changes (creations, updates, deletions) in a dedicated `historial_cambios` table.
    *   **File Management:** Handles image uploads with `multer` and performs on-the-fly optimization to WEBP/JPEG formats using `sharp`.
    *   **Reporting:** Generates complex, multi-page PDF and DOCX documents for artwork records, including technical details, movement history, and conservation reports, using `puppeteer` and `docx`.
    *   **Artwork History:** Manages movement records and conservation reports for each piece.

**Frontend:**

*   **Framework:** React
*   **Build Tool:** Vite
*   **UI Library:** Material-UI (MUI)
*   **Key Features:**
    *   **Dashboard:** Displays key statistics about the collection.
    *   **Artwork Catalog:** Allows users to browse, search, and filter artworks.
    *   **Detailed View:** Provides a comprehensive view for each artwork, including its data, movement history, and conservation reports.
    *   **Data Entry Forms:** Utilizes multi-step (`Stepper`) and tabbed (`Tabs`) forms for creating and editing artworks.
    *   **Admin Panel:** A dedicated section for administrators to manage:
        *   Users (create, delete, change roles).
        *   Storage/Exhibition Locations.
        *   System Backups.
        *   View the complete audit history.
    *   **Protected Routes:** Implements role-based access to different sections of the application.

## Building and Running

**Backend:**

1.  Install dependencies: `npm install`
2.  Create a `.env` file with the database connection details (see `.env.example` for reference).
3.  Run the server: `npm start` or `node index.js`

**Frontend:**

1.  Navigate to the `coleccion-arte-ui` directory: `cd coleccion-arte-ui`
2.  Install dependencies: `npm install`
3.  Run the development server: `npm run dev`
4.  Build for production: `npm run build`

## Development Conventions

*   The backend follows a standard Node.js/Express project structure.
*   The frontend is a standard Vite/React application.
*   The code uses modern JavaScript features (ES6+).
*   The project uses ESLint for code linting.

---

### Resumen de la Solución al Problema de Regresión en el Formulario de Obras

**Problema Identificado:**
Se detectó una regresión en el componente `FormularioObra.jsx` donde, al avanzar al paso 3 del `Stepper`, el formulario se enviaba automáticamente al renderizar el botón "Guardar Obra" (con `type="submit"`), sin necesidad de un clic explícito. Esto provocaba un envío prematuro de datos incompletos, resultando en errores en el backend, como una violación de `NOT NULL` en la columna `nombre` de la tabla `autores`.

**Causa Raíz:**
El comportamiento se debía a un bug conocido en React y Material-UI (`MUI`) relacionado con el renderizado condicional de un botón con `type="submit"` dentro de un `Stepper`. Al cambiar de "Siguiente" (`type="button"`) a "Guardar Obra" (`type="submit"`), React interpretaba el re-render como un evento `submit` automático, especialmente influenciado por la transición entre pasos.

**Solución Implementada:**
1. **Asignación de `key` Dinámico:** Se añadió un `key` dinámico al botón (`key={activeStep === steps.length - 1 ? 'submit' : 'next'}`) para forzar a React a tratar los botones como componentes distintos al cambiar de paso, evitando el auto-submit.
2. **Prevención de Envío con Enter:** Se implementó un manejador `onKeyDown` en los `TextField` del paso 3 para prevenir que la tecla Enter dispare el envío accidentalmente.
3. **Mantenimiento de `type="button":** Se aseguró que los botones "Anterior" y "Siguiente" tuvieran `type="button"` explícito para evitar cualquier bubbling no deseado.

**Resultado:**
Con estos cambios, el formulario dejó de enviarse automáticamente al llegar al paso 3. El envío solo ocurre ahora al hacer clic explícito en "Guardar Obra", permitiendo que los datos se completen correctamente antes de la solicitud al backend. Las validaciones existentes en `handleSubmit` (e.g., chequeo de campos obligatorios como `autor_nombre` y `titulo`) aseguran que no se envíen datos inválidos.

**Pruebas Realizadas:**
- Se verificó que al avanzar al paso 3 sin interactuar, el formulario no se enviaba.
- Se confirmó que interactuar con campos (e.g., seleccionar una fecha) y presionar Enter no desencadenaba el envío.
- Se probó el envío exitoso tras completar los campos y hacer clic en "Guardar Obra".

**Notas Adicionales:**
Este fix resolvió la regresión sin requerir cambios en el backend, preservando la lógica existente en el endpoint `/api/obras`. Se recomienda documentar esta solución para futuros mantenimientos y realizar pruebas regresivas periódicas al modificar el `Stepper` o los botones.