const express = require('express');
const router = express.Router();
const db = require('../db');

// ========== REGISTRAR UNA NUEVA COMPRA ==========
router.post('/', async (req, res) => {
    const { cliente, total, detalle } = req.body;
    
    try {
        const [result] = await db.query(
            'INSERT INTO compras (cliente, total, detalle) VALUES (?, ?, ?)',
            [cliente || 'Usuario anónimo', total || 0, JSON.stringify(detalle || {})]
        );
        
        res.status(201).json({ 
            id: result.insertId, 
            message: '✅ Compra registrada exitosamente' 
        });
    } catch (error) {
        console.error('Error al registrar compra:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========== OBTENER TODAS LAS COMPRAS ==========
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM compras ORDER BY fecha DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== ESTADÍSTICAS PARA EL DASHBOARD ==========
router.get('/estadisticas', async (req, res) => {
    try {
        // Total de ventas
        const [totalVentas] = await db.query('SELECT SUM(total) as total FROM compras');
        
        // Total de transacciones
        const [totalCompras] = await db.query('SELECT COUNT(*) as count FROM compras');
        
        // Ventas por mes (últimos 6 meses)
        const [ventasPorMes] = await db.query(`
            SELECT 
                DATE_FORMAT(fecha, '%Y-%m') as mes,
                SUM(total) as total,
                COUNT(*) as cantidad
            FROM compras 
            WHERE fecha >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(fecha, '%Y-%m')
            ORDER BY mes ASC
        `);
        
        // Producto más vendido (si hay detalle)
        const [productoMasVendido] = await db.query(`
            SELECT 
                detalle,
                COUNT(*) as veces
            FROM compras 
            WHERE detalle IS NOT NULL
            GROUP BY detalle
            ORDER BY veces DESC
            LIMIT 1
        `);
        
        res.json({
            totalVentas: totalVentas[0].total || 0,
            totalCompras: totalCompras[0].count || 0,
            ventasPorMes: ventasPorMes || [],
            productoMasVendido: productoMasVendido[0] || null
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========== VENTAS POR RANGO DE FECHAS ==========
router.get('/ventas-por-fecha', async (req, res) => {
    const { desde, hasta } = req.query;
    
    try {
        let query = 'SELECT * FROM compras WHERE 1=1';
        const params = [];
        
        if (desde) {
            query += ' AND fecha >= ?';
            params.push(desde);
        }
        if (hasta) {
            query += ' AND fecha <= ?';
            params.push(hasta);
        }
        
        query += ' ORDER BY fecha DESC';
        
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;