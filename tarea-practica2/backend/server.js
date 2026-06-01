const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post('/categorias', async (req, res) => {
    const { nombre, descripcion } = req.body;
    
    if (!nombre) {
        return res.status(400).json({ error: 'El campo nombre es obligatorio' });
    }
    
    try {
        const [result] = await db.query(
            'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
            [nombre, descripcion || null]
        );
        
        const [nuevaCategoria] = await db.query(
            'SELECT * FROM categorias WHERE id = ?',
            [result.insertId]
        );
        
        res.status(201).json({
            message: 'Categoría creada exitosamente',
            categoria: nuevaCategoria[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/categorias', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categorias ORDER BY id ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/categorias/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const [categoria] = await db.query(
            'SELECT * FROM categorias WHERE id = ?',
            [id]
        );
        
        if (categoria.length === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }
        
        const [productos] = await db.query(
            'SELECT * FROM productos WHERE categoria_id = ?',
            [id]
        );
        
        res.json({
            ...categoria[0],
            productos: productos
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.patch('/categorias/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    
    if (!nombre && !descripcion) {
        return res.status(400).json({ error: 'Debe enviar al menos un campo para actualizar' });
    }
    
    try {
        const [existe] = await db.query('SELECT * FROM categorias WHERE id = ?', [id]);
        if (existe.length === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }
        
        const campos = [];
        const valores = [];
        
        if (nombre) {
            campos.push('nombre = ?');
            valores.push(nombre);
        }
        if (descripcion) {
            campos.push('descripcion = ?');
            valores.push(descripcion);
        }
        
        valores.push(id);
        
        await db.query(
            `UPDATE categorias SET ${campos.join(', ')}, updatedAt = CURRENT_TIMESTAMP() WHERE id = ?`,
            valores
        );
        
        const [categoriaActualizada] = await db.query(
            'SELECT * FROM categorias WHERE id = ?',
            [id]
        );
        
        res.json({
            message: 'Categoría actualizada exitosamente',
            categoria: categoriaActualizada[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/categorias/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const [existe] = await db.query('SELECT * FROM categorias WHERE id = ?', [id]);
        if (existe.length === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }
        
        await db.query('DELETE FROM productos WHERE categoria_id = ?', [id]);
        
        await db.query('DELETE FROM categorias WHERE id = ?', [id]);
        
        res.json({
            message: 'Categoría y sus productos eliminados exitosamente',
            categoria_eliminada: existe[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(``);
    console.log(`═══════════════════════════════════════════════`);
    console.log(`📚 PRÁCTICA N°2 - NODE.JS + EXPRESS + MYSQL`);
    console.log(`═══════════════════════════════════════════════`);
    console.log(`📡 Servidor: http://localhost:${PORT}`);
    console.log(``);
    console.log(`📌 ENDPOINTS DISPONIBLES:`);
    console.log(`   POST   /categorias      - Crear categoría`);
    console.log(`   GET    /categorias      - Listar todas`);
    console.log(`   GET    /categorias/:id  - Obtener por ID`);
    console.log(`   PATCH  /categorias/:id  - Actualizar`);
    console.log(`   DELETE /categorias/:id  - Eliminar (con productos)`);
    console.log(`═══════════════════════════════════════════════`);
});