const express = require('express');
const router = express.Router();
const db = require('../db');

// ========== OBTENER TODOS LOS EVENTOS ==========
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM eventos ORDER BY fecha ASC');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener eventos:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========== OBTENER SOLO EVENTOS PRÓXIMOS ==========
router.get('/proximos', async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM eventos WHERE fecha >= CURDATE() ORDER BY fecha ASC"
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== OBTENER UN EVENTO POR ID ==========
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM eventos WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== CREAR NUEVO EVENTO ==========
router.post('/', async (req, res) => {
    const { nombre, fecha, lugar, precio, descripcion, imagen, capacidad } = req.body;
    
    if (!nombre || !fecha || !lugar || !precio) {
        return res.status(400).json({ message: 'Nombre, fecha, lugar y precio son requeridos' });
    }
    
    try {
        const [result] = await db.query(
            `INSERT INTO eventos (nombre, fecha, lugar, precio, descripcion, imagen, capacidad) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [nombre, fecha, lugar, precio, descripcion || '', imagen || '', capacidad || 100]
        );
        
        res.status(201).json({ 
            id: result.insertId,
            nombre, fecha, lugar, precio, descripcion, imagen, capacidad,
            message: 'Evento creado exitosamente'
        });
    } catch (error) {
        console.error('Error al crear evento:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========== ACTUALIZAR EVENTO ==========
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, fecha, lugar, precio, descripcion, imagen, capacidad } = req.body;
    
    try {
        const [exist] = await db.query('SELECT id FROM eventos WHERE id = ?', [id]);
        if (exist.length === 0) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }
        
        await db.query(
            `UPDATE eventos 
             SET nombre = ?, fecha = ?, lugar = ?, precio = ?, descripcion = ?, imagen = ?, capacidad = ? 
             WHERE id = ?`,
            [nombre, fecha, lugar, precio, descripcion, imagen, capacidad, id]
        );
        
        res.json({ message: 'Evento actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar evento:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========== ELIMINAR EVENTO ==========
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const [result] = await db.query('DELETE FROM eventos WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }
        
        res.json({ message: 'Evento eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar evento:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;