
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authorize = require('./authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const puppeteer = require('puppeteer');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun } = require('docx');
//const axios = require('axios');



const app = express();
const PORT = 4000;

// --- Middlewares y Configuración ---
//app.use(cors());
const corsOptions = {

    origin: 'https://coleccion-de-arte.vercel.app/', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200 // Para navegadores antiguos que pueden tener problemas
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
const upload = multer({ dest: 'uploads/temp/' });
app.use('/uploads', express.static('uploads'));
app.use('/assets', express.static('assets'));


// Configuración de la conexión a la base de datos
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Verificar conexión a la base de datos al iniciar
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error fatal al conectar con la base de datos:', err);
    process.exit(1);
  } else {
    console.log('Conexión a la base de datos establecida correctamente.');
  }
});

// --- DEFINICIÓN DE ROLES ---
const allUsers = ['admin', 'editor', 'lector', 'conservador'];
const editorsAndAdmins = ['admin', 'editor'];
const canEditContent = ['admin', 'editor', 'conservador'];
const adminsOnly = ['admin'];

// --- FUNCIÓN PARA AUDITORÍA ---
const registrarAuditoria = async (accion, usuarioId, usuarioEmail, descripcion) => {
    try {
        const query = 'INSERT INTO historial_cambios (accion, usuario_id, usuario_email, descripcion) VALUES ($1, $2, $3, $4)';
        const descString = typeof descripcion === 'string' ? descripcion : JSON.stringify(descripcion);
        await pool.query(query, [accion, usuarioId, usuarioEmail, descString]);
    } catch (error) {
        console.error(`Error al registrar auditoría para acción "${accion}":`, error);
    }
};


// --- FUNCIÓN AUXILIAR PARA OPTIMIZAR IMAGEN (ACTUALIZADA) ---
const optimizarImagen = async (file) => {
    if (!file) return null;
    const finalUploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(finalUploadsDir)){
        fs.mkdirSync(finalUploadsDir, { recursive: true });
    }
    const baseName = Date.now();
    const webpName = `${baseName}.webp`;
    const jpegName = `${baseName}.jpeg`;
    const webpPath = path.join(finalUploadsDir, webpName);
    const jpegPath = path.join(finalUploadsDir, jpegName);
    const imageProcessor = sharp(file.path);
    await imageProcessor.clone().resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }).toFormat('webp', { quality: 80 }).toFile(webpPath);
    await imageProcessor.clone().resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }).toFormat('jpeg', { quality: 90 }).toFile(jpegPath);
    fs.unlinkSync(file.path);
    return `uploads/${webpName}`;
};


// --- INICIO DE LA SECCIÓN DE PLANTILLAS Y EXPORTACIÓN ---

// Plantilla para el encabezado de cada página del PDF
const generarEncabezadoHTML = (logoIzquierdoBase64, logoDerechoBase64) => `
  <header class="encabezado">
    <div class="encabezado-izquierda">
      <img src="${logoIzquierdoBase64}" alt="Logo Izquierdo" class="logo" />
      <div class="texto-encabezado">
        <p>Dirección de Patrimonio Cultural</p>
      </div>
    </div>
    <div class="encabezado-derecha">
       <img src="${logoDerechoBase64}" alt="Logo Derecho" class="logo" />
    </div>
  </header>
  <h1 class="titulo-principal">Ficha de Registro General</h1>
`;

// Plantilla para la sección principal de la ficha técnica
const generarFichaTecnicaHTML = async (obra) => {
    let imagenHtml = '<div class="caja-imagen"><p><em>Sin imagen disponible</em></p></div>';
    if (obra.url_imagen) {
        const imagePath = path.join(__dirname, obra.url_imagen);
        if (fs.existsSync(imagePath)) {
            // Convertir la imagen (probablemente webp) a un buffer JPEG en memoria
            const jpegBuffer = await sharp(imagePath).jpeg().toBuffer();
            const imageBase64 = `data:image/jpeg;base64,${jpegBuffer.toString('base64')}`;
            imagenHtml = `<div class="caja-imagen"><img src="${imageBase64}" alt="Fotografía de la obra" /></div>`;
        } else {
            imagenHtml = '<div class="caja-imagen"><p><em>Archivo de imagen no encontrado.</em></p></div>';
        }
    }

    // Función auxiliar para renderizar un campo de forma segura
    const renderField = (label, value) => `
        <div class="campo">
            <span class="label">${label}</span>
            <span class="valor">${value || 'N/A'}</span>
        </div>
    `;

    return `
      <section class="seccion-contenido">
        <div class="columna-texto">
          <div class="titulo-obra-container">
            <h2 class="titulo-obra">${obra.titulo || 'Sin Título'}</h2>
            <p class="autor-obra">${obra.autor_nombre || 'Autor Desconocido'}</p>
          </div>
          <hr class="separador">
          <div class="grid-campos">
            ${renderField('N° de Registro:', obra.numero_registro)}
            ${renderField('Categoría:', obra.categoria)}
            ${renderField('Fecha de Creación:', obra.fecha_creacion)}
            ${renderField('Dimensiones:', obra.dimensiones)}
            ${renderField('Técnica/Materiales:', obra.tecnica_materiales)}
            ${renderField('Estado de Conservación:', obra.estado_conservacion)}
            ${renderField('Estado Actual:', obra.estado)}
            ${renderField('Ubicación:', obra.ubicacion_nombre)}
          </div>
        </div>
        <div class="columna-imagen">
          ${imagenHtml}
        </div>
      </section>
    `;
};


const generarMovimientosHTML = (movimientos) => `
  <div class="seccion-adicional">
    <h2>Historial de Movimientos</h2>
    <table class="tabla">
      <thead><tr><th>Descripción</th><th>Desde</th><th>Hasta</th></tr></thead>
      <tbody>
        ${movimientos.map(mov => `
          <tr>
            <td>${mov.descripcion}</td>
            <td>${new Date(mov.fecha_desde).toLocaleDateString()}</td>
            <td>${mov.fecha_hasta ? new Date(mov.fecha_hasta).toLocaleDateString() : 'Presente'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
`;

const generarConservacionHTML = (informes) => `
  <div class="seccion-adicional">
    <h2>Informes de Conservación</h2>
    ${informes.map(inf => `
      <div class="informe">
        <p class="fecha-informe"><strong>Informe del ${new Date(inf.fecha_informe).toLocaleDateString()} por ${inf.usuario_email || 'N/A'}</strong></p>
        <p class="label-informe">Diagnóstico:</p>
        <p class="valor-largo">${inf.diagnostico || 'N/A'}</p>
        <p class="label-informe">Recomendaciones:</p>
        <p class="valor-largo">${inf.recomendaciones || 'Ninguna.'}</p>
      </div>
    `).join('')}
  </div>
`;

// --- RUTA UNIFICADA PARA EXPORTAR DOCUMENTOS ---

app.post('/api/exportar-documento', authorize(allUsers), async (req, res) => {
    const { ids, secciones, formato } = req.body;
    if (!ids || !ids.length || !secciones || !secciones.length) {
        return res.status(400).send('Faltan parámetros para la exportación.');
    }
    try {
        const obrasQuery = `SELECT o.*, a.nombre AS autor_nombre, u.nombre as ubicacion_nombre FROM obras o LEFT JOIN autores a ON o.autor_id = a.id LEFT JOIN ubicaciones u ON o.ubicacion_id = u.id WHERE o.id = ANY($1::int[])`;
        const movQuery = `SELECT * FROM movimientos WHERE obra_id = ANY($1::int[]) ORDER BY fecha_desde DESC`;
        const consQuery = `SELECT c.*, u.email AS usuario_email FROM conservacion c LEFT JOIN usuarios u ON c.usuario_id = u.id WHERE obra_id = ANY($1::int[]) ORDER BY fecha_informe DESC`;
        
        const [obrasResult, movResult, consResult] = await Promise.all([
            pool.query(obrasQuery, [ids]), pool.query(movQuery, [ids]), pool.query(consQuery, [ids])
        ]);
        const obrasData = obrasResult.rows;
        const movData = movResult.rows;
        const consData = consResult.rows;

        if (formato === 'pdf') {
           const logoIzquierdoPath = path.join(__dirname, 'assets', 'logo.png');
            const logoDerechoPath = path.join(__dirname, 'assets', 'logo-derecho.png');
            const logoIzquierdoBase64 = fs.existsSync(logoIzquierdoPath) ? `data:image/png;base64,${fs.readFileSync(logoIzquierdoPath, 'base64')}` : '';
            const logoDerechoBase64 = fs.existsSync(logoDerechoPath) ? `data:image/png;base64,${fs.readFileSync(logoDerechoPath, 'base64')}` : '';

            let finalHtml = `<html>
                <head>
                  <meta charset="UTF-8">
                  <style>
                    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
                    
                    body { 
                        font-family: 'Roboto', 'Helvetica', sans-serif; 
                        margin: 0;
                        background-color: #fff; /* Fondo blanco */
                        font-size: 10px;
                        color: #333;
                    }
                    .pagina { 
                        page-break-after: always; 
                        padding: 40px; /* Margen interno del contenido */
                    }
                    .pagina:last-child { page-break-after: avoid; }

                    /* Encabezado */
                    .encabezado {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        padding-bottom: 15px;
                        border-bottom: 2px solid #e0e0e0;
                        margin-bottom: 15px;
                    }
                    .encabezado-izquierda { display: flex; align-items: center; }
                    .logo { max-height: 60px; width: auto; }
                    .texto-encabezado { margin-left: 15px; font-size: 11px; color: #555; }
                    .titulo-principal {
                        text-align: center;
                        font-size: 20px;
                        font-weight: 700;
                        color: #2c3e50;
                        margin-bottom: 25px;
                        letter-spacing: 1px;
                    }

                    /* Contenido Principal */
                    .seccion-contenido { 
                        display: flex; 
                        gap: 30px; 
                        border: 1px solid #eaeaea;
                        border-radius: 8px;
                        padding: 25px;
                        background-color: #fdfdfd;
                    }
                    .columna-texto { flex: 1.8; }
                    .columna-imagen { flex: 1; }

                    .titulo-obra-container { margin-bottom: 15px; }
                    .titulo-obra { font-size: 24px; font-weight: 700; margin: 0; color: #34495e; }
                    .autor-obra { font-size: 16px; font-weight: 300; margin: 5px 0 0 0; color: #7f8c8d; }
                    .separador { border: 0; border-top: 1px solid #ecf0f1; margin: 20px 0; }

                    /* Grid de Campos */
                    .grid-campos {
                        display: grid;
                        grid-template-columns: 160px auto; /* Columna de etiqueta y valor */
                        gap: 12px;
                    }
                    .campo {
                        display: contents; /* Permite que los hijos se posicionen en el grid */
                    }
                    .label {
                        font-weight: 500;
                        color: #34495e;
                    }
                    .valor {
                        color: #555;
                    }
                    
                    /* Imagen */
                    .caja-imagen {
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        padding: 8px;
                        background-color: #fff;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 280px;
                    }
                    .caja-imagen img {
                        max-width: 100%;
                        max-height: 100%;
                        object-fit: contain;
                        border-radius: 4px;
                    }

                    /* Secciones Adicionales */
                    .seccion-adicional { margin-top: 30px; }
                    .seccion-adicional h2 { 
                        font-size: 16px; 
                        border-bottom: 1px solid #ccc; 
                        padding-bottom: 5px; 
                        margin-bottom: 15px;
                        color: #2c3e50;
                    }
                    .tabla { width: 100%; border-collapse: collapse; font-size: 10px; }
                    .tabla th, .tabla td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    .tabla th { background-color: #f2f2f2; font-weight: 500; }
                    
                    .informe { border-top: 1px solid #eee; padding-top: 10px; margin-top: 15px; }
                    .fecha-informe { font-weight: 700; color: #34495e; }
                    .label-informe { font-weight: 500; margin-top: 8px; }
                    .valor-largo { white-space: pre-wrap; margin-top: 4px; }
                  </style>
                </head>
                <body>
            `;
            for (const obra of obrasData) {
                finalHtml += `<div class="pagina">`;
                finalHtml += generarEncabezadoHTML(logoIzquierdoBase64, logoDerechoBase64);
                if (secciones.includes('ficha')) { finalHtml += await generarFichaTecnicaHTML(obra); }
                if (secciones.includes('movimientos')) {
                    const obraMovimientos = movData.filter(m => m.obra_id === obra.id);
                    if (obraMovimientos.length > 0) finalHtml += generarMovimientosHTML(obraMovimientos);
                }
                if (secciones.includes('conservacion')) {
                    const obraInformes = consData.filter(c => c.obra_id === obra.id);
                    if (obraInformes.length > 0) finalHtml += generarConservacionHTML(obraInformes);
                }
                finalHtml += `</div>`;
            }
            finalHtml += `</body></html>`;
            
            const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
            const page = await browser.newPage();
            await page.setContent(finalHtml, { waitUntil: 'networkidle0' });
            const pdfBuffer = await page.pdf({ format: 'LETTER', printBackground: true, margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' } });
            await browser.close();
            res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="informe_completo.pdf"' });
            res.send(pdfBuffer);

        } else if (formato === 'docx') {
            const docChildren = [];
            for (const obra of obrasData) {
                if (secciones.includes('ficha')) {
                    docChildren.push(new Paragraph({ text: obra.titulo, heading: HeadingLevel.HEADING_1 }));
                    docChildren.push(new Paragraph({ children: [new TextRun({ text: 'Autor: ', bold: true }), new TextRun(obra.autor_nombre || 'N/A')] }));
                    if (obra.url_imagen) {
                        const imagePath = path.join(__dirname, obra.url_imagen.replace('.webp', '.jpeg'));
                        if (fs.existsSync(imagePath)) {
                            docChildren.push(new Paragraph({
                                children: [ new ImageRun({ data: fs.readFileSync(imagePath), transformation: { width: 400, height: 300 } }) ],
                            }));
                        }
                    }
                }
                if (secciones.includes('movimientos')) {
                    const obraMovimientos = movData.filter(m => m.obra_id === obra.id);
                    if (obraMovimientos.length > 0) {
                        docChildren.push(new Paragraph({ text: 'Historial de Movimientos', heading: HeadingLevel.HEADING_2 }));
                        obraMovimientos.forEach(mov => {
                            docChildren.push(new Paragraph(`- ${mov.descripcion} (Desde: ${new Date(mov.fecha_desde).toLocaleDateString()})`));
                        });
                    }
                }
                if (secciones.includes('conservacion')) {
                     const obraInformes = consData.filter(c => c.obra_id === obra.id);
                     if (obraInformes.length > 0) {
                        docChildren.push(new Paragraph({ text: 'Informes de Conservación', heading: HeadingLevel.HEADING_2 }));
                        obraInformes.forEach(inf => {
                            docChildren.push(new Paragraph({ children: [new TextRun({ text: `Informe del ${new Date(inf.fecha_informe).toLocaleDateString()}:`, bold: true })]}));
                            docChildren.push(new Paragraph(inf.diagnostico || ''));
                        });
                     }
                }
                docChildren.push(new Paragraph({ text: "" }));
            }

            const doc = new Document({ sections: [{ children: docChildren }] });
            const buffer = await Packer.toBuffer(doc);
            res.set({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Content-Disposition': 'attachment; filename="informe_completo.docx"'});
            res.send(buffer);
        }

    } catch (err) {
        console.error("Error al generar documento:", err.message);
        if (!res.headersSent) {
            res.status(500).send('Error interno al generar el documento');
        }
    }
});

// --- NUEVAS RUTAS PARA OBTENER LISTAS  OFICINAS ---

// GET: Obtener todas las ubicaciones disponibles
app.get('/api/ubicaciones', authorize(allUsers), async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM ubicaciones ORDER BY nombre ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// GET: Obtener la lista de estados posibles (hardcodeada por ahora para simplicidad)
app.get('/api/estados', authorize(allUsers), (req, res) => {
    res.json([
        { id: 'En depósito', nombre: 'En depósito' },
        { id: 'En exhibición', nombre: 'En exhibición' },
        { id: 'En restauración', nombre: 'En restauración' },
        { id: 'En préstamo', nombre: 'En préstamo' },
        { id: 'En tránsito', nombre: 'En tránsito' },
        { id: 'Otro', nombre: 'Otro' },

    ]);
});

// --- RUTAS PARA OBRAS ---

app.post('/api/obras', authorize(editorsAndAdmins), upload.single('imagen'), async (req, res) => {
    try {
        const url_imagen_optimizada = await optimizarImagen(req.file);
        
        // Destructuring all fields from the new form structure
        const {
            // Step 1
            numero_registro, autor_nombre, titulo, fecha_creacion, categoria,
            tecnica_materiales, dimensiones, estado_conservacion, estado, ubicacion_id,
            // Step 2
            descripcion_montaje, observaciones_generales,
            // Step 3
            propietario_original, procedencia, ingreso_aprobado_por, valor_inicial, valor_usd, fecha_avaluo, registro_revisado_por
        } = req.body;

        // Automatic fields
        const registro_realizado_por = req.user.email;
        const fecha_realizacion = new Date();

        // Get/Create Autor ID
        let autorId;
        const autorResult = await pool.query('SELECT id FROM autores WHERE nombre ILIKE $1', [autor_nombre]);
        if (autorResult.rows.length > 0) {
            autorId = autorResult.rows[0].id;
        } else {
            const nuevoAutorResult = await pool.query('INSERT INTO autores (nombre) VALUES ($1) RETURNING id', [autor_nombre]);
            autorId = nuevoAutorResult.rows[0].id;
        }

        const obraQuery = `
            INSERT INTO obras (
                titulo, autor_id, estado, ubicacion_id, numero_registro, tecnica_materiales, 
                url_imagen, fecha_creacion, categoria, procedencia, propietario_original, dimensiones, 
                estado_conservacion, descripcion_montaje, observaciones_generales,
                ingreso_aprobado_por, valor_inicial, valor_usd, fecha_avaluo,
                registro_realizado_por, registro_revisado_por, fecha_realizacion
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
            ) RETURNING *`;
             
        
        const obraValues = [
            titulo, autorId, estado, ubicacion_id || null, numero_registro, tecnica_materiales,
            url_imagen_optimizada, fecha_creacion || null, categoria, procedencia, propietario_original, dimensiones,
            estado_conservacion, descripcion_montaje, observaciones_generales,
            ingreso_aprobado_por, valor_inicial || null, valor_usd || null, fecha_avaluo || null,
            registro_realizado_por, registro_revisado_por, fecha_realizacion
        ];

        const obraResult = await pool.query(obraQuery, obraValues);
        const nuevaObra = obraResult.rows[0];
        
        // Audit log (already improved)
        const auditDetailsResult = await pool.query('SELECT o.titulo, o.numero_registro, a.nombre as autor_nombre FROM obras o LEFT JOIN autores a ON o.autor_id = a.id WHERE o.id = $1', [nuevaObra.id]);
        const auditDetails = auditDetailsResult.rows[0];

        await registrarAuditoria('Creación de Obra', req.user.id, req.user.email, { 
            obraId: nuevaObra.id, 
            titulo: auditDetails.titulo,
            autor_nombre: auditDetails.autor_nombre,
            numero_registro: auditDetails.numero_registro
        });
        res.status(201).json(nuevaObra);
    } catch (err) {
        console.log(err)
        console.error("Error en POST /api/obras:", err.message);
        res.status(500).send('Error en el servidor al crear la obra');
    }
});

app.put('/api/obras/:id', authorize(editorsAndAdmins), upload.single('imagen'), async (req, res) => {
    try {
        const { id } = req.params;
        const newData = req.body;

        // 1. Obtener datos actuales de la obra y del autor
        const obraActualResult = await pool.query(
            `SELECT o.*, a.nombre as autor_nombre 
             FROM obras o 
             LEFT JOIN autores a ON o.autor_id = a.id 
             WHERE o.id = $1`, [id]
        );
        if (obraActualResult.rows.length === 0) {
            return res.status(404).send('Obra no encontrada');
        }
        const obraActual = obraActualResult.rows[0];

        // 2. Comparar y registrar cambios
        const cambios = [];
        const camposAComparar = [
            'titulo', 'estado', 'numero_registro', 'tecnica_materiales', 'categoria', 'procedencia', 'propietario_original',  'dimensiones',
            'estado_conservacion', 'descripcion_montaje', 'observaciones_generales',
            'ingreso_aprobado_por', 'valor_inicial', 'valor_usd', 'fecha_avaluo', 'registro_revisado_por', 'fecha_creacion'
        ];
        
        camposAComparar.forEach(campo => {
            const valorActual = obraActual[campo] != null ? obraActual[campo].toString() : '';
            const valorNuevo = newData[campo] != null ? newData[campo].toString() : '';
            if (valorActual !== valorNuevo) {
                cambios.push({ campo, anterior: valorActual, nuevo: valorNuevo });
            }
        });

        if (newData.autor_nombre && obraActual.autor_nombre !== newData.autor_nombre) {
             cambios.push({ campo: 'autor', anterior: obraActual.autor_nombre, nuevo: newData.autor_nombre });
        }
        
        let url_imagen;
        if (req.file) {
            url_imagen = await optimizarImagen(req.file);
            if (obraActual.url_imagen !== url_imagen) {
                cambios.push({ campo: 'imagen', anterior: obraActual.url_imagen, nuevo: url_imagen });
            }
        } else {
            url_imagen = obraActual.url_imagen;
        }

        let autorId;
        if (newData.autor_nombre) {
            const autorResult = await pool.query('SELECT id FROM autores WHERE nombre ILIKE $1', [newData.autor_nombre]);
            if (autorResult.rows.length > 0) {
                autorId = autorResult.rows[0].id;
            } else {
                const nuevoAutorResult = await pool.query('INSERT INTO autores (nombre) VALUES ($1) RETURNING id', [newData.autor_nombre]);
                autorId = nuevoAutorResult.rows[0].id;
            }
        } else {
            autorId = obraActual.autor_id;
        }

        const query = `
            UPDATE obras SET 
                titulo = $1, autor_id = $2, estado = $3, ubicacion_id = $4, numero_registro = $5, tecnica_materiales = $6, 
                url_imagen = $7, fecha_creacion = $8, categoria = $9, dimensiones = $10, 
                estado_conservacion = $11, descripcion_montaje = $12, observaciones_generales = $13,
                ingreso_aprobado_por = $14, valor_inicial = $15, valor_usd = $16, fecha_avaluo = $17,
                registro_revisado_por = $18, procedencia = $19, propietario_original = $20
            WHERE id = $21 RETURNING *`;
        
        const values = [
            newData.titulo,                 // $1
            autorId,                        // $2
            newData.estado,                 // $3
            newData.ubicacion_id || null,   // $4
            newData.numero_registro,        // $5
            newData.tecnica_materiales,     // $6
            url_imagen,                     // $7
            newData.fecha_creacion || null, // $8
            newData.categoria,              // $9
            newData.dimensiones,            // $10
            newData.estado_conservacion,    // $11
            newData.descripcion_montaje,    // $12
            newData.observaciones_generales,// $13
            newData.ingreso_aprobado_por,   // $14
            newData.valor_inicial || null,  // $15
            newData.valor_usd || null,      // $16
            newData.fecha_avaluo || null,   // $17
            newData.registro_revisado_por,  // $18
            newData.procedencia,            // $19
            newData.propietario_original,   // $20
            id
        ];
        await pool.query(query, values);

        if (cambios.length > 0) {
            const descripcionAuditoria = {
                obraId: id,
                titulo: newData.titulo || obraActual.titulo,
                cambios: cambios
            };
            await registrarAuditoria('Edición de Obra', req.user.id, req.user.email, descripcionAuditoria);
        }

        const finalResultQuery = `SELECT o.*, a.nombre AS autor_nombre, u.nombre as ubicacion_nombre FROM obras o LEFT JOIN autores a ON o.autor_id = a.id LEFT JOIN ubicaciones u ON o.ubicacion_id = u.id WHERE o.id = $1`;
        const finalResult = await pool.query(finalResultQuery, [id]);
        res.json(finalResult.rows[0]);

    } catch (err) {
        console.error("Error en PUT /api/obras/:id:", err.message);
        res.status(500).send('Error en el servidor al actualizar la obra');
    }
});



app.get('/api/obras', authorize(allUsers), async (req, res) => {
    try {
        const { search, page = 1, limit = 12 } = req.query;
        const offset = (page - 1) * limit;
        let baseQuery = `FROM obras o LEFT JOIN autores a ON o.autor_id = a.id LEFT JOIN ubicaciones u ON o.ubicacion_id = u.id`;
        const countParams = [];
        let whereClause = '';
        if (search) {
            whereClause = ` WHERE o.titulo ILIKE $1 OR a.nombre ILIKE $1 OR o.numero_registro ILIKE $1`;
            countParams.push(`%${search}%`);
        }
        const totalResult = await pool.query(`SELECT COUNT(o.*) AS total ${baseQuery}${whereClause}`, countParams);
        const totalObras = parseInt(totalResult.rows[0].total, 10);

        const dataParams = [...countParams];
        dataParams.push(limit, offset);

        const dataQuery = `SELECT o.*, a.nombre AS autor_nombre, u.nombre AS ubicacion_nombre ${baseQuery} ${whereClause} ORDER BY o.id DESC LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`;

        const obrasResult = await pool.query(dataQuery, dataParams);
        res.json({ obras: obrasResult.rows, totalObras: totalObras, totalPaginas: Math.ceil(totalObras / limit) });
    } catch (err) { console.error(err.message); res.status(500).send('Error en el servidor al obtener las obras'); }
});

app.get('/api/obras/:id', authorize(allUsers), async (req, res) => {
    try {
        const { id } = req.params;
        const query = `SELECT o.*, a.nombre AS autor_nombre, a.biografia AS autor_biografia, u.nombre AS ubicacion_nombre FROM obras o LEFT JOIN autores a ON o.autor_id = a.id LEFT JOIN ubicaciones u ON o.ubicacion_id = u.id WHERE o.id = $1`;
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Obra no encontrada' });
        res.json(result.rows[0]);
    } catch (err) { console.error(err.message); res.status(500).send('Error en el servidor al obtener la obra'); }
});




app.delete('/api/obras/:id', authorize(editorsAndAdmins), async (req, res) => {
    try {
        const { id } = req.params;
        // Primero obtenemos los detalles de la obra para la auditoría
        const obraParaEliminarResult = await pool.query('SELECT o.titulo, o.numero_registro, a.nombre as autor_nombre FROM obras o LEFT JOIN autores a ON o.autor_id = a.id WHERE o.id = $1', [id]);
        if (obraParaEliminarResult.rows.length === 0) {
            return res.status(404).json({ message: 'Obra no encontrada para eliminar.' });
        }
        const obraDetails = obraParaEliminarResult.rows[0];

        const result = await pool.query('DELETE FROM obras WHERE id = $1', [id]);
        if (result.rowCount > 0) {
            await registrarAuditoria('Eliminación de Obra', req.user.id, req.user.email, { 
                obraId: id, 
                titulo: obraDetails.titulo,
                autor_nombre: obraDetails.autor_nombre,
                numero_registro: obraDetails.numero_registro
            });
        }
        res.sendStatus(204);
    } catch (err) { console.error(err.message); res.status(500).send('Error en el servidor'); }
});


// RUTA PARA GESTIÓN DE UBICACIONES (OFICINAS)

// POST: Crear una nueva ubicación (solo para admins)
app.post('/api/ubicaciones', authorize(adminsOnly), async (req, res) => {
    try {
        const { nombre } = req.body;
        if (!nombre) {
            return res.status(400).send('El nombre es requerido.');
        }
        const result = await pool.query('INSERT INTO ubicaciones (nombre) VALUES ($1) RETURNING *', [nombre]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        if (err.code === '23505') { // Error de valor único duplicado
            return res.status(400).send('Esa ubicación ya existe.');
        }
        res.status(500).send('Error en el servidor');
    }
});

// PUT: Actualizar una ubicación (solo para admins)
app.put('/api/ubicaciones/:id', authorize(adminsOnly), async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;
        const result = await pool.query('UPDATE ubicaciones SET nombre = $1 WHERE id = $2 RETURNING *', [nombre, id]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// DELETE: Eliminar una ubicación (solo para admins)
app.delete('/api/ubicaciones/:id', authorize(adminsOnly), async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM ubicaciones WHERE id = $1', [id]);
        res.sendStatus(204);
    } catch (err) {
        // Manejar el caso en que la ubicación está en uso por una obra
        if (err.code === '23503') { // Error de violación de llave foránea
            return res.status(400).send('No se puede eliminar la ubicación porque está asignada a una o más obras.');
        }
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

//--- FIN RUTAS GESTIÓN UBICACIONES /OFICINAS ---

// --- RUTA PARA ESTADÍSTICAS DEL DASHBOARD ---
app.get('/api/dashboard/stats', authorize(allUsers), async (req, res) => {
    try {
        const [
            totalObrasResult,
            enDepositoResult,
            enExhibicionResult, // Cambiado de 'enOficinas' para ser más preciso
            enRestauracionResult,
            enOtroResult
        ] = await Promise.all([
            pool.query('SELECT COUNT(*) FROM obras'),
            pool.query("SELECT COUNT(*) FROM obras WHERE estado = 'En depósito'"),
            pool.query("SELECT COUNT(*) FROM obras WHERE estado = 'En exhibición'"),
            pool.query("SELECT COUNT(*) FROM obras WHERE estado = 'En restauración'"),
            pool.query("SELECT COUNT(*) FROM obras WHERE estado = 'Otro'"),
        ]);

        const stats = {
            totalObras: parseInt(totalObrasResult.rows[0].count, 10),
            enDeposito: parseInt(enDepositoResult.rows[0].count, 10),
            enExhibicion: parseInt(enExhibicionResult.rows[0].count, 10),
            enRestauracion: parseInt(enRestauracionResult.rows[0].count, 10),
            enOtro: parseInt(enOtroResult.rows[0].count, 10)
        };
        res.json(stats);
    } catch (err) {
        console.error("Error al obtener estadísticas del dashboard:", err.message);
        res.status(500).send('Error en el servidor');
    }
});


// --- RUTA PARA EXPORTACIÓN A PDF (VERSIÓN CORREGIDA) ---
app.post('/api/obras/exportar-pdf', authorize(allUsers), async (req, res) => {
    const { ids } = req.body;
    if (!ids || ids.length === 0) {
        return res.status(400).send('No se proporcionaron IDs de obras para exportar.');
    }
    try {
        const query = `
            SELECT o.*, a.nombre AS autor_nombre, u.nombre AS ubicacion_nombre
            FROM obras o 
            LEFT JOIN autores a ON o.autor_id = a.id
            LEFT JOIN ubicaciones u ON o.ubicacion_id = u.id
            WHERE o.id = ANY($1::int[])`;
        const obrasResult = await pool.query(query, [ids]);
        const obras = obrasResult.rows;

        const doc = new PDFDocument({ margin: 50, size: 'LETTER' }); // Tamaño Carta
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="fichas_tecnicas.pdf"');
        doc.pipe(res);

        for (const obra of obras) {
            // --- INICIO DEL DISEÑO DE LA PÁGINA ---

            // Coordenadas y dimensiones para el layout
            const margen = 50;
            const yStart = 30;
            let currentY = yStart;
            const xColumnaIzquierda = margen;
            const xColumnaDerecha = 350;

            // 1. ENCABEZADO
            const logoPath = path.join(__dirname, 'assets', 'logo.png');
        

            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, xColumnaIzquierda, currentY, { width: 200 });
            }
           
            doc.fontSize(10).font('Helvetica').text('Dirección de Patrimonio Cultural', xColumnaIzquierda, currentY + 30);
            doc.fontSize(16).font('Helvetica-Bold').text('Ficha de registro general', 0, currentY + 40, { align: 'center' });
            
            currentY += 120; // Espacio después del encabezado

            // 2. FOTOGRAFÍA (Columna Derecha)
            if (obra.url_imagen) {
                const imagePath = path.join(__dirname, obra.url_imagen.replace('.webp', '.jpeg'));
                if (fs.existsSync(imagePath)) {
                    doc.image(imagePath, xColumnaDerecha, currentY, { fit: [220, 300], align: 'center' });
                }
            }
            
            // 3. DATOS TÉCNICOS (Columna Izquierda)
            // Función auxiliar para escribir campo y valor
            const addField = (label, value) => {
                if (currentY > 700) { // Salto de página si el contenido es muy largo
                    doc.addPage({ margin: 50, size: 'LETTER' });
                    currentY = yStart;
                }
                doc.fontSize(11).font('Helvetica-Bold').text(label, xColumnaIzquierda, currentY);
                doc.font('Helvetica').text(value || 'N/A', xColumnaIzquierda + 120, currentY);
                currentY += 25; // Incrementar la posición Y para el siguiente campo
            };

            addField('N° de registro:', obra.numero_registro);
            addField('Autor:', obra.autor_nombre);
            addField('Título:', obra.titulo);
            addField('Fecha:', obra.fecha_creacion); // Asumiendo que tienes este campo
            addField('Categoría:', obra.categoria); // Asumiendo que tienes este campo
            addField('Técnica/Materiales:', obra.tecnica_materiales);
            addField('Medidas:', obra.dimensiones); // Asumiendo que tienes este campo
            addField('Procedencia:', obra.procedencia);
            addField('Fecha de ingreso:', obra.fecha_ingreso ? new Date(obra.fecha_ingreso).toLocaleDateString() : 'N/A');
            addField('Propietario original:', obra.propietario_original);
            addField('Dirección:', obra.direccion); // Asumiendo que tienes este campo
            addField('Ubicación:', obra.ubicacion_nombre); // Asumiendo que tienes este campo
            addField('Registro fotográfico:', `Digital, ${obra.fotografo || 'N/A'}`); // Asumiendo que tienes este campo

            // --- FIN DEL DISEÑO DE LA PÁGINA ---

            if (obras.indexOf(obra) < obras.length - 1) {
                doc.addPage();
            }
        }
        doc.end();
    } catch (err) {
        console.error("Error al generar PDF:", err.message);
        if (!res.headersSent) {
            res.status(500).send('Error interno al generar el PDF');
        }
    }
});



app.get('/api/obras/:obraId/movimientos', authorize(allUsers), async (req, res) => {
    try {
        const { obraId } = req.params;
        const result = await pool.query('SELECT * FROM movimientos WHERE obra_id = $1 ORDER BY fecha_desde DESC', [obraId]);
        res.json(result.rows);
    } catch (err) { console.error(err.message); res.status(500).send('Error en el servidor al obtener movimientos'); }
});

app.post('/api/obras/:obraId/movimientos', authorize(editorsAndAdmins), async (req, res) => {
    const client = await pool.connect();
    try {
        const { obraId } = req.params;
        // El frontend ahora envía 'ubicacion_id'
        const { fecha_desde, fecha_hasta, descripcion, registrado_por, ubicacion_id } = req.body;

        // Iniciar una transacción para asegurar que ambas operaciones (insertar y actualizar) se completen
        await client.query('BEGIN');

        // 1. Obtener el nombre de la ubicación para guardarlo como la descripción del movimiento
        const ubicacionResult = await client.query('SELECT nombre FROM ubicaciones WHERE id = $1', [ubicacion_id]);
        if (ubicacionResult.rows.length === 0) {
            throw new Error('La ubicación seleccionada no es válida.');
        }
        const descripcionMovimiento = ubicacionResult.rows[0].nombre;

        // 2. Insertar el nuevo movimiento en la tabla de movimientos
        const queryMovimiento = `INSERT INTO movimientos (obra_id, fecha_desde, fecha_hasta, descripcion, registrado_por) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
        const valuesMovimiento = [obraId, fecha_desde || null, fecha_hasta || null, descripcionMovimiento, registrado_por];
        const result = await client.query(queryMovimiento, valuesMovimiento);
        
        // 3. Actualizar la ubicación y el estado principal en la tabla de obras
        const nuevoEstado = descripcionMovimiento.toLowerCase().includes('depósito')
            ? 'En depósito'
            : descripcionMovimiento.toLowerCase().includes('exhibición')
                ? 'En exhibición'
                : 'Otro';
        await client.query('UPDATE obras SET ubicacion_id = $1, estado = $2, localizacion = $3 WHERE id = $4', [ubicacion_id, nuevoEstado, descripcion, obraId]);

        // Confirmar la transacción
        await client.query('COMMIT');
        
        const nuevoMovimiento = result.rows[0];

        // Fetch obra details for a richer audit log
        const obraDetailsResult = await pool.query('SELECT numero_registro, titulo FROM obras WHERE id = $1', [obraId]);
        const obraDetails = obraDetailsResult.rows[0] || {};

        await registrarAuditoria('Registro de Movimiento', req.user.id, req.user.email, { 
            obraId: obraId,
            titulo: obraDetails.titulo,
            numero_registro: obraDetails.numero_registro,
            movimientoId: nuevoMovimiento.id,
            descripcion: nuevoMovimiento.descripcion 
        });

        res.status(201).json(nuevoMovimiento);
    } catch (err) {
        await client.query('ROLLBACK'); // Revertir la transacción en caso de error
        console.error("Error al registrar movimiento:", err.message);
        res.status(500).send('Error en el servidor al registrar el movimiento');
    } finally {
        client.release(); // Liberar el cliente de vuelta al pool
    }
});


app.put('/api/movimientos/:id', authorize(editorsAndAdmins), async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha_desde, fecha_hasta, descripcion } = req.body;
        const query = `UPDATE movimientos SET fecha_desde = $1, fecha_hasta = $2, descripcion = $3 WHERE id = $4 RETURNING *`;
        const values = [fecha_desde, fecha_hasta, descripcion, id];
        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (err) { console.error(err.message); res.status(500).send('Error en el servidor al actualizar el movimiento'); }
});

app.delete('/api/movimientos/:id', authorize(editorsAndAdmins), async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM movimientos WHERE id = $1', [id]);
        res.sendStatus(204);
    } catch (err) { console.error(err.message); res.status(500).send('Error en el servidor al eliminar el movimiento'); }
});


app.get('/api/obras/:obraId/conservacion', authorize(allUsers), async (req, res) => {
    try {
        const { obraId } = req.params;
        const query = `
            SELECT conservacion.*, usuarios.email AS usuario_email 
            FROM conservacion 
            LEFT JOIN usuarios ON conservacion.usuario_id = usuarios.id
            WHERE obra_id = $1 
            ORDER BY fecha_informe DESC`;
        const result = await pool.query(query, [obraId]);
        res.json(result.rows);
    } catch (err) { console.error(err.message); res.status(500).send('Error al obtener informes de conservación'); }
});

app.post('/api/obras/:obraId/conservacion', authorize(canEditContent), async (req, res) => {
    try {
        const { obraId } = req.params;
        const { diagnostico, recomendaciones } = req.body;
        const usuario_id = req.user.id;
        const query = `INSERT INTO conservacion (obra_id, usuario_id, diagnostico, recomendaciones) VALUES ($1, $2, $3, $4) RETURNING *`;
        const values = [obraId, usuario_id, diagnostico, recomendaciones];
        const result = await pool.query(query, values);
        const nuevoInforme = result.rows[0];

        // Fetch obra details for a richer audit log
        const obraDetailsResult = await pool.query('SELECT numero_registro, titulo FROM obras WHERE id = $1', [obraId]);
        const obraDetails = obraDetailsResult.rows[0] || {};

        await registrarAuditoria('Registro de Conservación', req.user.id, req.user.email, { 
            obraId: obraId,
            titulo: obraDetails.titulo,
            numero_registro: obraDetails.numero_registro,
            informeId: nuevoInforme.id,
            diagnostico: diagnostico.substring(0, 50) + '...'
        });
        res.status(201).json(nuevoInforme);
    } catch (err) { console.error(err.message); res.status(500).send('Error al crear el informe de conservación'); }
});

app.put('/api/conservacion/:id', authorize(canEditContent), async (req, res) => {
    try {
        const { id } = req.params;
        const { diagnostico, recomendaciones } = req.body;
        const query = `UPDATE conservacion SET diagnostico = $1, recomendaciones = $2 WHERE id = $3 RETURNING *`;
        const values = [diagnostico, recomendaciones, id];
        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (err) { console.error(err.message); res.status(500).send('Error al actualizar el informe de conservación'); }
});

app.delete('/api/conservacion/:id', authorize(canEditContent), async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM conservacion WHERE id = $1', [id]);
        res.sendStatus(204);
    } catch (err) { console.error(err.message); res.status(500).send('Error al eliminar el informe de conservación'); }
});

// --- RUTA PARA HISTORIAL DE CAMBIOS ---
app.get('/api/historial', authorize(adminsOnly), async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 15;
        const offset = (page - 1) * limit;

        const totalResult = await pool.query('SELECT COUNT(*) FROM historial_cambios');
        const totalPages = Math.ceil(totalResult.rows[0].count / limit);

        const historialResult = await pool.query(
            `SELECT id, fecha, accion, descripcion, usuario_email 
             FROM historial_cambios
             ORDER BY fecha DESC 
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        res.json({
            historial: historialResult.rows.map(row => ({
                id: row.id,
                fecha: row.fecha,
                accion: row.accion,
                detalles: row.descripcion, // Mapear descripcion a detalles para el frontend
                email: row.usuario_email
            })),
            totalPages: totalPages,
            currentPage: page
        });
    } catch (err) {
        console.error('Error al obtener historial:', err.message);
        res.status(500).send('Error en el servidor al obtener el historial');
    }
});

app.get('/api/usuarios', authorize(adminsOnly), async (req, res) => {
    try {
        const result = await pool.query('SELECT id, email, rol FROM usuarios ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) { console.error(err.message); res.status(500).send('Error en el servidor'); }
});

app.put('/api/usuarios/:id/rol', authorize(adminsOnly), async (req, res) => {
    try {
        const { id } = req.params;
        const { rol } = req.body;
        const result = await pool.query('UPDATE usuarios SET rol = $1 WHERE id = $2 RETURNING id, email, rol', [rol, id]);
        const usuarioActualizado = result.rows[0];
                await registrarAuditoria('Cambio de Rol', req.user.id, req.user.email, { usuarioAfectadoId: usuarioActualizado.id, email: usuarioActualizado.email, nuevoRol: usuarioActualizado.rol });
        res.json(usuarioActualizado);
    } catch (err) { console.error(err.message); res.status(500).send('Error en el servidor'); }
});

app.delete('/api/usuarios/:id', authorize(adminsOnly), async (req, res) => {
    try {
        const { id } = req.params;
        if (id == req.user.id) {
            return res.status(400).send('Un administrador no se puede eliminar a sí mismo.');
        }
        // Obtener email para auditoría
        const userResult = await pool.query('SELECT email FROM usuarios WHERE id = $1', [id]);
        if (userResult.rows.length === 0) {
            return res.status(404).send('Usuario no encontrado.');
        }
        const emailParaAuditoria = userResult.rows[0].email;

        await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
        
                await registrarAuditoria('Eliminación de Usuario', req.user.id, req.user.email, { usuarioEliminadoId: id, email: emailParaAuditoria });

        res.sendStatus(204);
    } catch (err) { console.error(err.message); res.status(500).send('Error en el servidor'); }
});


app.post('/api/usuarios/registrar', authorize(adminsOnly), async (req, res) => {
    try {
        const { email, password, rol = 'lector' } = req.body;
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const query = 'INSERT INTO usuarios (email, password_hash, rol) VALUES ($1, $2, $3) RETURNING id, email, rol';
        const values = [email, password_hash, rol];
        const result = await pool.query(query, values);
        const nuevoUsuario = result.rows[0];
        // El registro de auditoría lo debe hacer el admin que está creando al usuario.
                await registrarAuditoria('Creación de Usuario', req.user.id, req.user.email, { usuarioCreadoId: nuevoUsuario.id, email: nuevoUsuario.email });
        res.status(201).json(nuevoUsuario);
    } catch (err) {
        console.error(err.message);
        if (err.code === '23505') return res.status(400).send('El correo electrónico ya está registrado.');
        res.status(500).send('Error en el servidor al registrar el usuario');
    }
});

app.post('/api/usuarios/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const userResult = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (userResult.rows.length === 0) return res.status(400).send('Credenciales inválidas.');
        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).send('Credenciales inválidas.');
        const payload = { id: user.id, email: user.email, rol: user.rol };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'secreto_super_secreto', { expiresIn: '1h' });
                await registrarAuditoria('Login', user.id, user.email, { email: user.email });
        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor al iniciar sesión');
    }
});

// --- NUEVA RUTA DE VERIFICACIÓN DE CONTRASEÑA MAESTRA ---
app.post('/api/admin/verify-master-password', authorize(editorsAndAdmins), async (req, res) => {
    try {
        const { masterPassword } = req.body;
        if (!masterPassword) {
            return res.status(400).send('No se proporcionó la contraseña maestra.');
        }

        const isMatch = await bcrypt.compare(masterPassword, process.env.MASTER_PASSWORD_HASH);

        if (!isMatch) {
            return res.status(401).send('Contraseña maestra incorrecta.');
        }

        res.json({ success: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor al verificar la contraseña.');
    }
});




app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});