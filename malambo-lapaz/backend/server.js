const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const PDFDocument = require('pdfkit');
const DeviceDetector = require('device-detector-js');
const fs = require('fs');
const path = require('path');

const db = require('./db');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'malambo_secret_key_2025';

app.use(cors());
app.use(express.json());

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Demasiados intentos, espera 15 minutos' }
});

const getClientIP = (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
};

async function registrarLog(usuario_id, usuario_email, evento, ip, browser) {
    try {
        await db.query(
            'INSERT INTO logs_acceso (usuario_id, usuario_email, ip, evento, browser) VALUES (?, ?, ?, ?, ?)',
            [usuario_id, usuario_email, ip, evento, browser]
        );
    } catch (error) {
        console.error('Error al registrar log:', error);
    }
}

function evaluarFortalezaPassword(password) {
    let puntos = 0;
    if (password.length >= 8) puntos++;
    if (/[A-Z]/.test(password)) puntos++;
    if (/[a-z]/.test(password)) puntos++;
    if (/[0-9]/.test(password)) puntos++;
    if (/[^A-Za-z0-9]/.test(password)) puntos++;
    
    if (puntos <= 2) return 'débil';
    if (puntos <= 4) return 'intermedia';
    return 'fuerte';
}

// ========== REGISTRO ==========
app.post('/api/auth/registro', [
    body('nombre').notEmpty().withMessage('Nombre requerido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('Mínimo 6 caracteres')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    const { nombre, email, password } = req.body;
    const fuerza = evaluarFortalezaPassword(password);
    
    try {
        const [existe] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existe.length > 0) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await db.query(
            'INSERT INTO usuarios (nombre, email, password, fuerza_password) VALUES (?, ?, ?, ?)',
            [nombre, email, hashedPassword, fuerza]
        );
        
        res.json({ success: true, message: 'Usuario registrado exitosamente', fuerza_password: fuerza });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== LOGIN ==========
app.post('/api/auth/login', loginLimiter, async (req, res) => {
    const { email, password, captcha } = req.body;
    const ip = getClientIP(req);
    const deviceDetector = new DeviceDetector();
    const browser = deviceDetector.parse(req.headers['user-agent'])?.client?.name || 'Desconocido';
    
    try {
        if (captcha !== 'MALAMBO2025') {
            await registrarLog(null, email, 'intento_fallido', ip, browser);
            return res.status(401).json({ error: 'CAPTCHA incorrecto' });
        }
        
        const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ? AND activo = 1', [email]);
        if (usuarios.length === 0) {
            await registrarLog(null, email, 'intento_fallido', ip, browser);
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }
        
        const usuario = usuarios[0];
        const validPassword = await bcrypt.compare(password, usuario.password);
        if (!validPassword) {
            await registrarLog(usuario.id, email, 'intento_fallido', ip, browser);
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }
        
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, rol: usuario.rol },
            SECRET_KEY,
            { expiresIn: '24h' }
        );
        
        await registrarLog(usuario.id, email, 'ingreso', ip, browser);
        
        res.json({
            success: true,
            token,
            usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== CERRAR SESIÓN ==========
app.post('/api/auth/logout', async (req, res) => {
    const { usuario_id, usuario_email } = req.body;
    const ip = getClientIP(req);
    const deviceDetector = new DeviceDetector();
    const browser = deviceDetector.parse(req.headers['user-agent'])?.client?.name || 'Desconocido';
    
    await registrarLog(usuario_id, usuario_email, 'salida', ip, browser);
    res.json({ success: true });
});

// ========== VERIFICAR TOKEN ==========
const verificarToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'Acceso denegado' });
    try {
        const verified = jwt.verify(token, SECRET_KEY);
        req.usuario = verified;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
};

// ========== PRODUCTOS ==========
app.get('/api/productos', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM productos WHERE activo = 1 ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/productos', verificarToken, async (req, res) => {
    const { nombre, precio, descripcion, imagen, stock, categoria } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO productos (nombre, precio, descripcion, imagen, stock, categoria, activo) VALUES (?, ?, ?, ?, ?, ?, 1)',
            [nombre, precio, descripcion, imagen, stock || 10, categoria || 'general']
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/productos/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, descripcion, imagen, stock, categoria } = req.body;
    try {
        await db.query(
            'UPDATE productos SET nombre = ?, precio = ?, descripcion = ?, imagen = ?, stock = ?, categoria = ? WHERE id = ?',
            [nombre, precio, descripcion, imagen, stock, categoria, id]
        );
        res.json({ message: 'Producto actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/productos/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE productos SET activo = 0, eliminado_en = NOW() WHERE id = ?', [id]);
        res.json({ message: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== EVENTOS ==========
app.get('/api/eventos', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM eventos WHERE activo = 1 ORDER BY fecha ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/eventos/proximos', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM eventos WHERE activo = 1 AND fecha >= CURDATE() ORDER BY fecha ASC");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/eventos', verificarToken, async (req, res) => {
    const { nombre, fecha, lugar, precio, descripcion, imagen, capacidad } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO eventos (nombre, fecha, lugar, precio, descripcion, imagen, capacidad, activo) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
            [nombre, fecha, lugar, precio, descripcion, imagen, capacidad || 100]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/eventos/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    const { nombre, fecha, lugar, precio, descripcion, imagen, capacidad } = req.body;
    try {
        await db.query(
            'UPDATE eventos SET nombre = ?, fecha = ?, lugar = ?, precio = ?, descripcion = ?, imagen = ?, capacidad = ? WHERE id = ?',
            [nombre, fecha, lugar, precio, descripcion, imagen, capacidad, id]
        );
        res.json({ message: 'Evento actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/eventos/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE eventos SET activo = 0, eliminado_en = NOW() WHERE id = ?', [id]);
        res.json({ message: 'Evento eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== COMPRAS ==========
app.post('/api/compras', async (req, res) => {
    const { cliente, total, detalle } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO compras (cliente, total, detalle) VALUES (?, ?, ?)',
            [cliente, total, JSON.stringify(detalle || {})]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/compras', verificarToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM compras ORDER BY fecha DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/compras/estadisticas', verificarToken, async (req, res) => {
    try {
        const [totalVentas] = await db.query('SELECT SUM(total) as total FROM compras');
        const [totalCompras] = await db.query('SELECT COUNT(*) as count FROM compras');
        const [ventasPorMes] = await db.query(`
            SELECT DATE_FORMAT(fecha, '%Y-%m') as mes, SUM(total) as total 
            FROM compras 
            WHERE fecha >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(fecha, '%Y-%m')
            ORDER BY mes ASC
        `);
        res.json({
            totalVentas: totalVentas[0].total || 0,
            totalCompras: totalCompras[0].count || 0,
            ventasPorMes: ventasPorMes || []
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== REPORTE PDF (VERSIÓN SIMPLE Y SEGURA) ==========
app.get('/api/reportes/ventas', verificarToken, async (req, res) => {
    try {
        const [compras] = await db.query('SELECT * FROM compras ORDER BY fecha DESC');
        const [inscripciones] = await db.query('SELECT * FROM inscripciones ORDER BY fecha_inscripcion DESC');
        
        let totalCompras = 0;
        compras.forEach(c => totalCompras += parseFloat(c.total) || 0);
        
        let totalInscripciones = 0;
        inscripciones.forEach(i => totalInscripciones += parseFloat(i.precio) || 0);
        
        const reportesDir = path.join(__dirname, 'reportes');
        if (!fs.existsSync(reportesDir)) {
            fs.mkdirSync(reportesDir);
        }
        
        const filename = `reporte_${Date.now()}.pdf`;
        const filepath = path.join(reportesDir, filename);
        
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);
        
        doc.fontSize(18).text('MALAMBO LA PAZ', { align: 'center' });
        doc.fontSize(12).text('Reporte de Ventas', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text(`Generado: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown();
        
        doc.fontSize(12).text('RESUMEN GENERAL', { underline: true });
        doc.fontSize(11).text(`Total Ventas Productos: Bs. ${totalCompras.toFixed(2)}`);
        doc.text(`Total Inscripciones: Bs. ${totalInscripciones.toFixed(2)}`);
        doc.text(`TOTAL GENERAL: Bs. ${(totalCompras + totalInscripciones).toFixed(2)}`);
        doc.moveDown();
        
        doc.fontSize(12).text('VENTAS DE PRODUCTOS', { underline: true });
        if (compras.length === 0) {
            doc.text('No hay ventas registradas.');
        } else {
            compras.forEach(c => {
                doc.fontSize(9).text(`- ${c.cliente}: Bs. ${parseFloat(c.total).toFixed(2)} (${new Date(c.fecha).toLocaleDateString()})`);
            });
        }
        doc.moveDown();
        
        doc.fontSize(12).text('INSCRIPCIONES A CLASES', { underline: true });
        if (inscripciones.length === 0) {
            doc.text('No hay inscripciones registradas.');
        } else {
            inscripciones.forEach(i => {
                doc.fontSize(9).text(`- ${i.nombre}: ${i.clase_nombre} - Bs. ${parseFloat(i.precio).toFixed(2)}`);
            });
        }
        
        doc.end();
        
        stream.on('finish', () => {
            res.json({ success: true, filename, message: 'Reporte generado' });
        });
        
        stream.on('error', (err) => {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error al generar PDF' });
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========== LOGS ==========
app.get('/api/logs', verificarToken, async (req, res) => {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado' });
    }
    try {
        const [rows] = await db.query('SELECT * FROM logs_acceso ORDER BY fecha_hora DESC LIMIT 100');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== CATEGORÍAS ==========
app.post('/api/categorias', async (req, res) => {
    const { nombre, descripcion } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El campo nombre es obligatorio' });
    try {
        const [result] = await db.query('INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)', [nombre, descripcion || null]);
        const [nuevaCategoria] = await db.query('SELECT * FROM categorias WHERE id = ?', [result.insertId]);
        res.status(201).json(nuevaCategoria[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/categorias', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categorias ORDER BY id ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/categorias/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [categoria] = await db.query('SELECT * FROM categorias WHERE id = ?', [id]);
        if (categoria.length === 0) return res.status(404).json({ error: 'Categoría no encontrada' });
        const [productos] = await db.query('SELECT * FROM productos WHERE categoria_id = ?', [id]);
        res.json({ ...categoria[0], productos });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.patch('/api/categorias/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    try {
        const [existe] = await db.query('SELECT * FROM categorias WHERE id = ?', [id]);
        if (existe.length === 0) return res.status(404).json({ error: 'Categoría no encontrada' });
        if (nombre) await db.query('UPDATE categorias SET nombre = ? WHERE id = ?', [nombre, id]);
        if (descripcion) await db.query('UPDATE categorias SET descripcion = ? WHERE id = ?', [descripcion, id]);
        const [actualizada] = await db.query('SELECT * FROM categorias WHERE id = ?', [id]);
        res.json(actualizada[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/categorias/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [existe] = await db.query('SELECT * FROM categorias WHERE id = ?', [id]);
        if (existe.length === 0) return res.status(404).json({ error: 'Categoría no encontrada' });
        await db.query('DELETE FROM productos WHERE categoria_id = ?', [id]);
        await db.query('DELETE FROM categorias WHERE id = ?', [id]);
        res.json({ message: 'Categoría y sus productos eliminados exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== INSCRIPCIONES ==========
app.post('/api/inscripciones', async (req, res) => {
    console.log('📝 Llegó inscripción:', req.body);
    const { nombre, email, telefono, edad, clase_id, clase_nombre, instructor, precio } = req.body;
    if (!nombre || !email || !clase_id) {
        return res.status(400).json({ error: 'Faltan datos: nombre, email y clase_id son obligatorios' });
    }
    try {
        const [result] = await db.query(
            `INSERT INTO inscripciones (nombre, email, telefono, edad, clase_id, clase_nombre, instructor, precio) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [nombre, email, telefono || null, edad || null, clase_id, clase_nombre, instructor || null, precio]
        );
        res.status(201).json({ success: true, id: result.insertId });
    } catch (error) {
        console.error('Error al guardar:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/inscripciones', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM inscripciones ORDER BY fecha_inscripcion DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== CLASES ==========
app.get('/api/clases', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM clases WHERE activo = 1 ORDER BY id ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/clases/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM clases WHERE id = ? AND activo = 1', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Clase no encontrada' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/clases', verificarToken, async (req, res) => {
    const { nombre, categoria, nivel, descripcion, instructor, duracion, max_alumnos, precio, horario, dia, imagen } = req.body;
    try {
        const [result] = await db.query(
            `INSERT INTO clases (nombre, categoria, nivel, descripcion, instructor, duracion, max_alumnos, precio, horario, dia, imagen, activo) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [nombre, categoria, nivel, descripcion, instructor, duracion, max_alumnos, precio, horario, dia, imagen || '']
        );
        res.status(201).json({ id: result.insertId, message: 'Clase creada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/clases/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    const { nombre, categoria, nivel, descripcion, instructor, duracion, max_alumnos, precio, horario, dia, imagen } = req.body;
    try {
        await db.query(
            `UPDATE clases SET nombre = ?, categoria = ?, nivel = ?, descripcion = ?, instructor = ?, duracion = ?, max_alumnos = ?, precio = ?, horario = ?, dia = ?, imagen = ? WHERE id = ?`,
            [nombre, categoria, nivel, descripcion, instructor, duracion, max_alumnos, precio, horario, dia, imagen, id]
        );
        res.json({ message: 'Clase actualizada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/clases/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE clases SET activo = 0 WHERE id = ?', [id]);
        res.json({ message: 'Clase eliminada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== GENERAR COMPROBANTE PDF (CLIENTE) ==========
app.post('/api/reportes/comprobante', async (req, res) => {
    try {
        const { tipo, cliente, productos, total, compra_id, direccion, tipo_entrega, ciudad, evento, cantidad, inscripcion } = req.body;
        
        const doc = new PDFDocument({ margin: 50 });
        const filename = `comprobante_${Date.now()}.pdf`;
        const filepath = path.join(__dirname, 'reportes', filename);
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);
        
        doc.fontSize(20).font('Helvetica-Bold').text('MALAMBO LA PAZ', { align: 'center' });
        doc.fontSize(14).text('COMPROBANTE', { align: 'center' });
        doc.fontSize(10).text(`Fecha: ${new Date().toLocaleString('es-BO')}`, { align: 'center' });
        doc.moveDown();
        
        doc.fontSize(12).font('Helvetica-Bold').text('DATOS DEL CLIENTE', { underline: true });
        doc.fontSize(10).font('Helvetica');
        doc.text(`Nombre: ${cliente.nombre}`);
        doc.text(`Email: ${cliente.email}`);
        doc.text(`Teléfono: ${cliente.telefono || 'No registrado'}`);
        doc.moveDown();
        
        doc.fontSize(12).font('Helvetica-Bold').text('DETALLE', { underline: true });
        doc.moveDown(0.5);
        
        if (tipo === 'compra') {
            doc.text('COMPRA DE PRODUCTOS');
            productos.forEach(p => {
                doc.fontSize(10).font('Helvetica');
                doc.text(`• ${p.nombre} x${p.cantidad} = Bs. ${(p.precio * p.cantidad).toFixed(2)}`);
            });
            if (direccion) {
                doc.text(`Tipo de entrega: ${tipo_entrega === 'domicilio' ? 'A domicilio' : 'Retiro en oficina'}`);
                doc.text(`Dirección: ${direccion}`);
                if (ciudad) doc.text(`Ciudad: ${ciudad}`);
            }
            doc.moveDown();
            doc.fontSize(12).font('Helvetica-Bold').text(`TOTAL: Bs. ${total}`, { align: 'right' });
        } 
        else if (tipo === 'evento') {
            doc.text('COMPRA DE ENTRADA A EVENTO');
            doc.fontSize(10).font('Helvetica');
            doc.text(`Evento: ${evento.nombre}`);
            doc.text(`Fecha: ${new Date(evento.fecha).toLocaleDateString()}`);
            doc.text(`Lugar: ${evento.lugar}`);
            doc.text(`Cantidad: ${cantidad} entrada(s)`);
            doc.moveDown();
            doc.fontSize(12).font('Helvetica-Bold').text(`TOTAL: Bs. ${total}`, { align: 'right' });
        }
        else if (tipo === 'inscripcion') {
            doc.text('INSCRIPCIÓN A CLASE');
            doc.fontSize(10).font('Helvetica');
            doc.text(`Clase: ${inscripcion.clase_nombre}`);
            doc.text(`Instructor: ${inscripcion.instructor}`);
            doc.text(`Horario: ${inscripcion.horario}`);
            doc.text(`Precio: Bs. ${inscripcion.precio}`);
        }
        
        doc.moveDown();
        doc.fontSize(8).font('Helvetica').text('Este comprobante es válido como constancia.', { align: 'center' });
        doc.text('Malambo La Paz - Pasión, fuerza y tradición argentina', { align: 'center' });
        
        doc.end();
        
        stream.on('finish', () => {
            res.json({ success: true, filename });
        });
        
        stream.on('error', (err) => {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error al generar PDF' });
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========== DESCARGAR PDF ==========
app.get('/api/reportes/descargar/:filename', (req, res) => {
    const { filename } = req.params;
    const filepath = path.join(__dirname, 'reportes', filename);
    if (fs.existsSync(filepath)) {
        res.download(filepath);
    } else {
        res.status(404).json({ error: 'Archivo no encontrado' });
    }
});

// ========== INICIAR SERVIDOR ==========
app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('🎭 MALAMBO BALLET - BACKEND COMPLETO 🎭');
    console.log('═══════════════════════════════════════════════');
    console.log(`📡 Servidor: http://localhost:${PORT}`);
    console.log('✅ Eliminación lógica activada');
    console.log('✅ Logs de acceso activados');
    console.log('✅ Reportes PDF disponibles');
    console.log('═══════════════════════════════════════════════');
});