# Práctica N°2 - Soluciones


## Ejercicio 1 - POST /categorias

**Código:**
```javascript

app.post('/categorias', async (req, res) => {
    const { nombre, descripcion } = req.body;
    const [result] = await db.query(
        'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
        [nombre, descripcion]
    );
    res.status(201).json({ id: result.insertId, nombre, descripcion });
});
```

**Thunder Client:**
- Método: `POST`
- URL: `http://localhost:3000/categorias`
- Body (JSON):
```json
{
    "nombre": "Electrónica",
    "descripcion": "Dispositivos electrónicos"
}
```

---

## Ejercicio 2 - GET /categorias

**Código:**
```javascript
app.get('/categorias', async (req, res) => {
    const [rows] = await db.query('SELECT * FROM categorias');
    res.json(rows);
});
```

**Thunder Client:**
- Método: `GET`
- URL: `http://localhost:3000/categorias`
- Body: Nada

---

## Ejercicio 3 - GET /categorias/:id

**Código:**
```javascript
app.get('/categorias/:id', async (req, res) => {
    const { id } = req.params;
    const [categoria] = await db.query('SELECT * FROM categorias WHERE id = ?', [id]);
    const [productos] = await db.query('SELECT * FROM productos WHERE categoria_id = ?', [id]);
    res.json({ ...categoria[0], productos });
});
```

**Thunder Client:**
- Método: `GET`
- URL: `http://localhost:3000/categorias/1`
- Body: Nada

---

## Ejercicio 4 - PATCH /categorias/:id

**Código:**
```javascript
app.patch('/categorias/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    await db.query(
        'UPDATE categorias SET nombre = ?, descripcion = ? WHERE id = ?',
        [nombre, descripcion, id]
    );
    res.json({ message: 'Actualizada' });
});
```

**Thunder Client:**
- Método: `PATCH`
- URL: `http://localhost:3000/categorias/1`
- Body (JSON):
```json
{
    "nombre": "Electrónica Premium",
    "descripcion": "Lo mejor en tecnología"
}
```

---

## Ejercicio 5 - DELETE /categorias/:id

**Código:**
```javascript
app.delete('/categorias/:id', async (req, res) => {
    const { id } = req.params;
    await db.query('DELETE FROM productos WHERE categoria_id = ?', [id]);
    await db.query('DELETE FROM categorias WHERE id = ?', [id]);
    res.json({ message: 'Eliminada' });
});
```

**Thunder Client:**
- Método: `DELETE`
- URL: `http://localhost:3000/categorias/3`
- Body: Nada

---

