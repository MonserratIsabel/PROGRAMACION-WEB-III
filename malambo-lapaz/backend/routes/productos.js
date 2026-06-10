const express = require('express');
const router = express.Router();
const db = require('../db');

// ========== OBTENER TODOS LOS PRODUCTOS ==========
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM productos ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========== OBTENER UN PRODUCTO POR ID ==========
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM productos WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== CREAR NUEVO PRODUCTO ==========
router.post('/', async (req, res) => {
    const { nombre, precio, descripcion, imagen, stock, categoria } = req.body;
    
    // Validar campos requeridos
    if (!nombre || !precio) {
        return res.status(400).json({ message: 'Nombre y precio son requeridos' });
    }
    
    try {
        const [result] = await db.query(
            `INSERT INTO productos (nombre, precio, descripcion, imagen, stock, categoria) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [nombre, precio, descripcion || '', imagen || '', stock || 10, categoria || 'general']
        );
        
        res.status(201).json({ 
            id: result.insertId, 
            nombre, 
            precio, 
            descripcion, 
            imagen, 
            stock, 
            categoria,
            message: 'Producto creado exitosamente'
        });
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========== ACTUALIZAR PRODUCTO ==========
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, descripcion, imagen, stock, categoria } = req.body;
    
    try {
        // Verificar si el producto existe
        const [exist] = await db.query('SELECT id FROM productos WHERE id = ?', [id]);
        if (exist.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        
        await db.query(
            `UPDATE productos 
             SET nombre = ?, precio = ?, descripcion = ?, imagen = ?, stock = ?, categoria = ? 
             WHERE id = ?`,
            [nombre, precio, descripcion, imagen, stock, categoria, id]
        );
        
        res.json({ message: 'Producto actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========== ELIMINAR PRODUCTO ==========
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const [result] = await db.query('DELETE FROM productos WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;