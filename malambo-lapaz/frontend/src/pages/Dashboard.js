import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Modal, Button, Form, Table, Tab, Tabs } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const API_URL = 'http://localhost:3000/api';

function Dashboard() {
  const [stats, setStats] = useState({ totalVentas: 0, totalCompras: 0, ventasPorMes: [] });
  const [productos, setProductos] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductoModal, setShowProductoModal] = useState(false);
  const [showEventoModal, setShowEventoModal] = useState(false);
  const [showClaseModal, setShowClaseModal] = useState(false);
  const [editandoProducto, setEditandoProducto] = useState(null);
  const [editandoEvento, setEditandoEvento] = useState(null);
  const [editandoClase, setEditandoClase] = useState(null);
  const [activeTab, setActiveTab] = useState('estadisticas');
  
  const [productoForm, setProductoForm] = useState({
    nombre: '', precio: '', descripcion: '', imagen: '', stock: '', categoria: ''
  });
  
  const [eventoForm, setEventoForm] = useState({
    nombre: '', fecha: '', lugar: '', precio: '', descripcion: '', imagen: '', capacidad: ''
  });

  const [claseForm, setClaseForm] = useState({
    nombre: '', categoria: '', nivel: '', descripcion: '', instructor: '', 
    duracion: '', max_alumnos: '', precio: '', horario: '', dia: '', imagen: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: token };
      
      const [statsRes, productosRes, eventosRes, inscripcionesRes, clasesRes] = await Promise.all([
        axios.get(`${API_URL}/compras/estadisticas`, { headers }),
        axios.get(`${API_URL}/productos`, { headers }),
        axios.get(`${API_URL}/eventos`, { headers }),
        axios.get(`${API_URL}/inscripciones`, { headers }),
        axios.get(`${API_URL}/clases`, { headers })
      ]);
      
      setStats(statsRes.data);
      setProductos(productosRes.data);
      setEventos(eventosRes.data);
      setInscripciones(inscripcionesRes.data);
      setClases(clasesRes.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModalProducto = (producto = null) => {
    if (producto) {
      setEditandoProducto(producto.id);
      setProductoForm({
        nombre: producto.nombre,
        precio: producto.precio,
        descripcion: producto.descripcion || '',
        imagen: producto.imagen || '',
        stock: producto.stock || 10,
        categoria: producto.categoria || 'general'
      });
    } else {
      setEditandoProducto(null);
      setProductoForm({ nombre: '', precio: '', descripcion: '', imagen: '', stock: '', categoria: '' });
    }
    setShowProductoModal(true);
  };

  const guardarProducto = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: token };
      
      if (editandoProducto) {
        await axios.put(`${API_URL}/productos/${editandoProducto}`, productoForm, { headers });
        alert('✅ Producto actualizado correctamente');
      } else {
        await axios.post(`${API_URL}/productos`, productoForm, { headers });
        alert('✅ Producto creado correctamente');
      }
      setShowProductoModal(false);
      cargarDatos();
    } catch (error) {
      alert('❌ Error al guardar el producto');
      console.error(error);
    }
  };

  const eliminarProducto = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: token };
        await axios.delete(`${API_URL}/productos/${id}`, { headers });
        alert('✅ Producto eliminado');
        cargarDatos();
      } catch (error) {
        alert('❌ Error al eliminar');
      }
    }
  };

  const abrirModalEvento = (evento = null) => {
    if (evento) {
      setEditandoEvento(evento.id);
      setEventoForm({
        nombre: evento.nombre,
        fecha: evento.fecha,
        lugar: evento.lugar,
        precio: evento.precio,
        descripcion: evento.descripcion || '',
        imagen: evento.imagen || '',
        capacidad: evento.capacidad || 100
      });
    } else {
      setEditandoEvento(null);
      setEventoForm({ nombre: '', fecha: '', lugar: '', precio: '', descripcion: '', imagen: '', capacidad: '' });
    }
    setShowEventoModal(true);
  };

  const guardarEvento = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: token };
      
      if (editandoEvento) {
        await axios.put(`${API_URL}/eventos/${editandoEvento}`, eventoForm, { headers });
        alert('✅ Evento actualizado correctamente');
      } else {
        await axios.post(`${API_URL}/eventos`, eventoForm, { headers });
        alert('✅ Evento creado correctamente');
      }
      setShowEventoModal(false);
      cargarDatos();
    } catch (error) {
      alert('❌ Error al guardar el evento');
      console.error(error);
    }
  };

  const eliminarEvento = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este evento?')) {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: token };
        await axios.delete(`${API_URL}/eventos/${id}`, { headers });
        alert('✅ Evento eliminado');
        cargarDatos();
      } catch (error) {
        alert('❌ Error al eliminar');
      }
    }
  };

  const abrirModalClase = (clase = null) => {
    if (clase) {
      setEditandoClase(clase.id);
      setClaseForm({
        nombre: clase.nombre,
        categoria: clase.categoria,
        nivel: clase.nivel,
        descripcion: clase.descripcion || '',
        instructor: clase.instructor,
        duracion: clase.duracion,
        max_alumnos: clase.max_alumnos || 15,
        precio: clase.precio,
        horario: clase.horario,
        dia: clase.dia,
        imagen: clase.imagen || ''
      });
    } else {
      setEditandoClase(null);
      setClaseForm({
        nombre: '', categoria: '', nivel: '', descripcion: '', instructor: '', 
        duracion: '', max_alumnos: '', precio: '', horario: '', dia: '', imagen: ''
      });
    }
    setShowClaseModal(true);
  };

  const guardarClase = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: token };
      
      if (editandoClase) {
        await axios.put(`${API_URL}/clases/${editandoClase}`, claseForm, { headers });
        alert('✅ Clase actualizada correctamente');
      } else {
        await axios.post(`${API_URL}/clases`, claseForm, { headers });
        alert('✅ Clase creada correctamente');
      }
      setShowClaseModal(false);
      cargarDatos();
    } catch (error) {
      alert('❌ Error al guardar la clase');
      console.error(error);
    }
  };

  const eliminarClase = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta clase?')) {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: token };
        await axios.delete(`${API_URL}/clases/${id}`, { headers });
        alert('✅ Clase eliminada');
        cargarDatos();
      } catch (error) {
        alert('❌ Error al eliminar');
      }
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  const generarReportePDF = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: token };
      const res = await axios.get(`${API_URL}/reportes/ventas`, { headers });
      alert(`✅ Reporte generado: ${res.data.filename}`);
    } catch (error) {
      alert('❌ Error al generar el reporte');
    }
  };

  const chartData = {
    labels: stats.ventasPorMes?.map(item => item.mes) || [],
    datasets: [{
      label: 'Ventas (Bs.)',
      data: stats.ventasPorMes?.map(item => item.total) || [],
      borderColor: '#c9a03d',
      backgroundColor: 'rgba(201,160,61,0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: 'white' } },
      title: { display: true, text: 'Ventas por Mes', color: 'white' }
    },
    scales: { x: { ticks: { color: 'white' } }, y: { ticks: { color: 'white' } } }
  };

  if (loading) {
    return (
      <div style={{ marginTop: '100px', textAlign: 'center' }}>
        <div className="spinner-border text-warning" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <section style={{
        height: '30vh',
        position: 'relative',
        backgroundImage: 'url("https://images.unsplash.com/photo-1507676184212-d2ab4e0f12a6?w=1600")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        marginTop: '76px'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: '300', color: 'white', letterSpacing: '4px' }}>PANEL ADMINISTRATIVO</h1>
            <div style={{ width: '60px', height: '2px', background: '#c9a03d', margin: '20px auto' }} />
          </div>
        </div>
      </section>

      <Container className="my-5">
        <Row className="mb-5">
          <Col md={3} className="mb-4">
            <div style={{ background: '#111', borderRadius: '15px', padding: '25px', textAlign: 'center', border: '1px solid rgba(201,160,61,0.2)' }}>
              <i className="fas fa-boliviano" style={{ fontSize: '2.5rem', color: '#c9a03d' }}></i>
              <h4 className="mt-2" style={{ color: 'white' }}>Total Ventas</h4>
              <h2 style={{ color: '#c9a03d' }}>Bs. {stats.totalVentas?.toLocaleString() || 0}</h2>
            </div>
          </Col>
          <Col md={3} className="mb-4">
            <div style={{ background: '#111', borderRadius: '15px', padding: '25px', textAlign: 'center', border: '1px solid rgba(201,160,61,0.2)' }}>
              <i className="fas fa-shopping-cart" style={{ fontSize: '2.5rem', color: '#c9a03d' }}></i>
              <h4 className="mt-2" style={{ color: 'white' }}>Transacciones</h4>
              <h2 style={{ color: '#c9a03d' }}>{stats.totalCompras || 0}</h2>
            </div>
          </Col>
          <Col md={3} className="mb-4">
            <div style={{ background: '#111', borderRadius: '15px', padding: '25px', textAlign: 'center', border: '1px solid rgba(201,160,61,0.2)' }}>
              <i className="fas fa-boxes" style={{ fontSize: '2.5rem', color: '#c9a03d' }}></i>
              <h4 className="mt-2" style={{ color: 'white' }}>Productos</h4>
              <h2 style={{ color: '#c9a03d' }}>{productos.length}</h2>
            </div>
          </Col>
          <Col md={3} className="mb-4">
            <div style={{ background: '#111', borderRadius: '15px', padding: '25px', textAlign: 'center', border: '1px solid rgba(201,160,61,0.2)' }}>
              <i className="fas fa-calendar" style={{ fontSize: '2.5rem', color: '#c9a03d' }}></i>
              <h4 className="mt-2" style={{ color: 'white' }}>Eventos</h4>
              <h2 style={{ color: '#c9a03d' }}>{eventos.length}</h2>
            </div>
          </Col>
          <Col md={3} className="mb-4">
            <div style={{ background: '#111', borderRadius: '15px', padding: '25px', textAlign: 'center', border: '1px solid rgba(201,160,61,0.2)' }}>
              <i className="fas fa-graduation-cap" style={{ fontSize: '2.5rem', color: '#c9a03d' }}></i>
              <h4 className="mt-2" style={{ color: 'white' }}>Inscripciones</h4>
              <h2 style={{ color: '#c9a03d' }}>{inscripciones.length}</h2>
            </div>
          </Col>
          <Col md={3} className="mb-4">
            <div style={{ background: '#111', borderRadius: '15px', padding: '25px', textAlign: 'center', border: '1px solid rgba(201,160,61,0.2)' }}>
              <i className="fas fa-chalkboard-user" style={{ fontSize: '2.5rem', color: '#c9a03d' }}></i>
              <h4 className="mt-2" style={{ color: 'white' }}>Clases</h4>
              <h2 style={{ color: '#c9a03d' }}>{clases.length}</h2>
            </div>
          </Col>
        </Row>

        {stats.ventasPorMes?.length > 0 && (
          <Row className="mb-5">
            <Col>
              <div style={{ background: '#111', padding: '25px', borderRadius: '15px', border: '1px solid rgba(201,160,61,0.2)' }}>
                <Line data={chartData} options={chartOptions} />
              </div>
            </Col>
          </Row>
        )}

        <Row className="mb-4">
          <Col className="text-end">
            <button onClick={generarReportePDF} className="btn-gold" style={{ padding: '10px 25px' }}>
              <i className="fas fa-file-pdf me-2"></i>Generar Reporte PDF
            </button>
          </Col>
        </Row>

        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
          <Tab eventKey="estadisticas" title={<span style={{ color: activeTab === 'estadisticas' ? '#c9a03d' : 'white' }}>📊 Estadísticas</span>}>
            <div style={{ padding: '20px', background: '#111', borderRadius: '15px' }}>
              <h4 style={{ color: '#c9a03d' }}>Resumen del negocio</h4>
              <Row>
                <Col md={6}>
                  <p><strong>💰 Ganancia total:</strong> Bs. {stats.totalVentas?.toLocaleString() || 0}</p>
                  <p><strong>🛍️ Ventas realizadas:</strong> {stats.totalCompras || 0}</p>
                </Col>
                <Col md={6}>
                  <p><strong>📦 Productos activos:</strong> {productos.length}</p>
                  <p><strong>🎫 Eventos activos:</strong> {eventos.length}</p>
                  <p><strong>📝 Inscripciones:</strong> {inscripciones.length}</p>
                  <p><strong>📚 Clases activas:</strong> {clases.length}</p>
                </Col>
              </Row>
              <button onClick={cerrarSesion} className="btn-outline-gold mt-3" style={{ padding: '10px 25px' }}>
                <i className="fas fa-sign-out-alt me-2"></i>Cerrar Sesión
              </button>
            </div>
          </Tab>

          <Tab eventKey="productos" title="📦 Productos">
            <div style={{ padding: '20px', background: '#111', borderRadius: '15px' }}>
              <div className="text-end mb-3">
                <button onClick={() => abrirModalProducto()} className="btn-gold" style={{ padding: '8px 20px' }}>
                  <i className="fas fa-plus me-2"></i>Nuevo Producto
                </button>
              </div>
              <Table hover style={{ color: 'white' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #c9a03d' }}>
                    <th>ID</th><th>Nombre</th><th>Precio</th><th>Stock</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map(p => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.nombre}</td>
                      <td style={{ color: '#c9a03d' }}>Bs. {p.precio}</td>
                      <td>{p.stock || 10}</td>
                      <td>
                        <button onClick={() => abrirModalProducto(p)} style={{ background: '#c9a03d', border: 'none', padding: '5px 12px', borderRadius: '5px', marginRight: '5px', cursor: 'pointer' }}>✏️</button>
                        <button onClick={() => eliminarProducto(p.id)} style={{ background: '#ff1744', border: 'none', padding: '5px 12px', borderRadius: '5px', cursor: 'pointer', color: 'white' }}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Tab>

          <Tab eventKey="eventos" title="🎫 Eventos">
            <div style={{ padding: '20px', background: '#111', borderRadius: '15px' }}>
              <div className="text-end mb-3">
                <button onClick={() => abrirModalEvento()} className="btn-gold" style={{ padding: '8px 20px' }}>
                  <i className="fas fa-plus me-2"></i>Nuevo Evento
                </button>
              </div>
              <Table hover style={{ color: 'white' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #c9a03d' }}>
                    <th>ID</th><th>Nombre</th><th>Fecha</th><th>Lugar</th><th>Precio</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {eventos.map(e => (
                    <tr key={e.id}>
                      <td>{e.id}</td>
                      <td>{e.nombre}</td>
                      <td>{new Date(e.fecha).toLocaleDateString()}</td>
                      <td>{e.lugar}</td>
                      <td style={{ color: '#c9a03d' }}>Bs. {e.precio}</td>
                      <td>
                        <button onClick={() => abrirModalEvento(e)} style={{ background: '#c9a03d', border: 'none', padding: '5px 12px', borderRadius: '5px', marginRight: '5px', cursor: 'pointer' }}>✏️</button>
                        <button onClick={() => eliminarEvento(e.id)} style={{ background: '#ff1744', border: 'none', padding: '5px 12px', borderRadius: '5px', cursor: 'pointer', color: 'white' }}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Tab>

          <Tab eventKey="clases" title="📚 Clases">
            <div style={{ padding: '20px', background: '#111', borderRadius: '15px' }}>
              <div className="text-end mb-3">
                <button onClick={() => abrirModalClase()} className="btn-gold" style={{ padding: '8px 20px' }}>
                  <i className="fas fa-plus me-2"></i>Nueva Clase
                </button>
              </div>
              <Table hover style={{ color: 'white' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #c9a03d' }}>
                    <th>ID</th><th>Nombre</th><th>Categoría</th><th>Instructor</th><th>Precio</th><th>Horario</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clases.map(c => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td>{c.nombre}</td>
                      <td>{c.categoria}</td>
                      <td>{c.instructor}</td>
                      <td style={{ color: '#c9a03d' }}>Bs. {c.precio}</td>
                      <td>{c.horario} ({c.dia})</td>
                      <td>
                        <button onClick={() => abrirModalClase(c)} style={{ background: '#c9a03d', border: 'none', padding: '5px 12px', borderRadius: '5px', marginRight: '5px', cursor: 'pointer' }}>✏️</button>
                        <button onClick={() => eliminarClase(c.id)} style={{ background: '#ff1744', border: 'none', padding: '5px 12px', borderRadius: '5px', cursor: 'pointer', color: 'white' }}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Tab>

          <Tab eventKey="inscripciones" title="📝 Inscripciones">
            <div style={{ padding: '20px', background: '#111', borderRadius: '15px' }}>
              <div className="text-end mb-3">
                <button className="btn-gold" style={{ padding: '8px 20px' }} onClick={() => window.location.href='/#clases'}>
                  <i className="fas fa-plus me-2"></i>Nueva Inscripción
                </button>
              </div>
              <Table hover style={{ color: 'white' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #c9a03d' }}>
                    <th>ID</th><th>Nombre</th><th>Email</th><th>Clase</th><th>Instructor</th><th>Precio</th><th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {inscripciones.map(i => (
                    <tr key={i.id}>
                      <td>{i.id}</td>
                      <td>{i.nombre}</td>
                      <td>{i.email}</td>
                      <td>{i.clase_nombre}</td>
                      <td>{i.instructor || '-'}</td>
                      <td style={{ color: '#c9a03d' }}>Bs. {i.precio}</td>
                      <td>{new Date(i.fecha_inscripcion).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Tab>
        </Tabs>
      </Container>

      <Modal show={showProductoModal} onHide={() => setShowProductoModal(false)} centered>
        <Modal.Header closeButton style={{ background: '#111', borderBottom: '2px solid #c9a03d' }}>
          <Modal.Title style={{ color: '#c9a03d' }}>{editandoProducto ? 'Editar Producto' : 'Nuevo Producto'}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#111' }}>
          <Form>
            <Form.Group className="mb-3"><Form.Label style={{ color: '#c9a03d' }}>Nombre</Form.Label><Form.Control type="text" value={productoForm.nombre} onChange={(e) => setProductoForm({...productoForm, nombre: e.target.value})} style={{ background: '#1a1a1a', border: 'none', color: 'white' }} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label style={{ color: '#c9a03d' }}>Precio (Bs.)</Form.Label><Form.Control type="number" value={productoForm.precio} onChange={(e) => setProductoForm({...productoForm, precio: e.target.value})} style={{ background: '#1a1a1a', border: 'none', color: 'white' }} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label style={{ color: '#c9a03d' }}>Descripción</Form.Label><Form.Control as="textarea" rows={2} value={productoForm.descripcion} onChange={(e) => setProductoForm({...productoForm, descripcion: e.target.value})} style={{ background: '#1a1a1a', border: 'none', color: 'white' }} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label style={{ color: '#c9a03d' }}>URL Imagen</Form.Label><Form.Control type="text" value={productoForm.imagen} onChange={(e) => setProductoForm({...productoForm, imagen: e.target.value})} style={{ background: '#1a1a1a', border: 'none', color: 'white' }} /></Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ background: '#111' }}>
          <Button variant="secondary" onClick={() => setShowProductoModal(false)}>Cancelar</Button>
          <Button onClick={guardarProducto} style={{ background: '#c9a03d', border: 'none', color: '#000' }}>Guardar</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEventoModal} onHide={() => setShowEventoModal(false)} centered>
        <Modal.Header closeButton style={{ background: '#111', borderBottom: '2px solid #c9a03d' }}>
          <Modal.Title style={{ color: '#c9a03d' }}>{editandoEvento ? 'Editar Evento' : 'Nuevo Evento'}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#111' }}>
          <Form>
            <Form.Group className="mb-3"><Form.Label style={{ color: '#c9a03d' }}>Nombre</Form.Label><Form.Control type="text" value={eventoForm.nombre} onChange={(e) => setEventoForm({...eventoForm, nombre: e.target.value})} style={{ background: '#1a1a1a', border: 'none', color: 'white' }} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label style={{ color: '#c9a03d' }}>Fecha</Form.Label><Form.Control type="date" value={eventoForm.fecha} onChange={(e) => setEventoForm({...eventoForm, fecha: e.target.value})} style={{ background: '#1a1a1a', border: 'none', color: 'white' }} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label style={{ color: '#c9a03d' }}>Lugar</Form.Label><Form.Control type="text" value={eventoForm.lugar} onChange={(e) => setEventoForm({...eventoForm, lugar: e.target.value})} style={{ background: '#1a1a1a', border: 'none', color: 'white' }} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label style={{ color: '#c9a03d' }}>Precio (Bs.)</Form.Label><Form.Control type="number" value={eventoForm.precio} onChange={(e) => setEventoForm({...eventoForm, precio: e.target.value})} style={{ background: '#1a1a1a', border: 'none', color: 'white' }} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label style={{ color: '#c9a03d' }}>Descripción</Form.Label><Form.Control as="textarea" rows={2} value={eventoForm.descripcion} onChange={(e) => setEventoForm({...eventoForm, descripcion: e.target.value})} style={{ background: '#1a1a1a', border: 'none', color: 'white' }} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label style={{ color: '#c9a03d' }}>URL Imagen</Form.Label><Form.Control type="text" value={eventoForm.imagen} onChange={(e) => setEventoForm({...eventoForm, imagen: e.target.value})} style={{ background: '#1a1a1a', border: 'none', color: 'white' }} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label style={{ color: '#c9a03d' }}>Capacidad</Form.Label><Form.Control type="number" value={eventoForm.capacidad} onChange={(e) => setEventoForm({...eventoForm, capacidad: e.target.value})} style={{ background: '#1a1a1a', border: 'none', color: 'white' }} /></Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ background: '#111' }}>
          <Button variant="secondary" onClick={() => setShowEventoModal(false)}>Cancelar</Button>
          <Button onClick={guardarEvento} style={{ background: '#c9a03d', border: 'none', color: '#000' }}>Guardar</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showClaseModal} onHide={() => setShowClaseModal(false)} centered size="lg">
        <Modal.Header closeButton style={{ background: '#111', borderBottom: '2px solid #c9a03d' }}>
          <Modal.Title style={{ color: '#c9a03d' }}>{editandoClase ? 'Editar Clase' : 'Nueva Clase'}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#111' }}>
          <Form>
            <Row>
              <Col md={6}><Form.Group className="mb-2"><Form.Label style={{ color: '#c9a03d' }}>Nombre</Form.Label><Form.Control type="text" value={claseForm.nombre} onChange={(e) => setClaseForm({...claseForm, nombre: e.target.value})} style={{ background: '#1a1a1a', border: 'none', color: 'white' }} /></Form.Group></Col>
              <Col md={6}><Form.Group className="mb-2"><Form.Label style={{ color: '#c9a03d' }}>Categoría</Form.Label><Form.Control type="text" value={claseForm.categoria} onChange={(e) => setClaseForm({...claseForm, categoria: e.target.value})} style={{ background: '#1a1a1a', border: 'none', color: 'white' }} /></Form.Group></Col>
              <Col md={4}><Form.Group className="mb-2"><Form.Label style={{ color: '#c9a03d' }}>Nivel</Form.Label><Form.Control type="text" value={claseForm.nivel} onChange={(e) => setClaseForm({...claseForm, nivel: e.target.value})} style={{ background: '#1a1a1a', border: 'none', color: 'white' }} /></Form.Group></Col>
              <Col md={4}><Form.Group className="mb-2"><Form.Label style={{ color: '#c9a03d' }}>Instructor</Form.Label><Form.Control type="text" value={claseForm.instructor} onChange={(e) => setClaseForm({...claseForm, instructor: e.target.value})} style={{ background: '#1a1a1a', border: 'none', color: 'white' }} /></Form.Group></Col>
              <Col md={4}><Form.Group className="mb-2"><Form.Label style={{ color: '#c9a03d' }}>Precio (Bs.)</Form.Label><Form.Control type="number" value={claseForm.precio} onChange={(e) => setClaseForm({...claseForm, precio: e.target.value})} style={{ background: '#1a1a1a', border: 'none', color: 'white' }} /></Form.Group></Col>
              <Col md={6}><Form.Group className="mb-2"><Form.Label style={{ color: '#c9a03d' }}>Día</Form.Label><Form.Control type="text" value={claseForm.dia} onChange={(e) => setClaseForm({...claseForm, dia: e.target.value})} style={{ background: '#1a1a1a', border: 'none', color: 'white' }} /></Form.Group></Col>
              <Col md={6}><Form.Group className="mb-2"><Form.Label style={{ color: '#c9a03d' }}>Horario</Form.Label><Form.Control type="text" value={claseForm.horario} onChange={(e) => setClaseForm({...claseForm, horario: e.target.value})} style={{ background: '#1a1a1a', border: 'none', color: 'white' }} /></Form.Group></Col>
              <Col md={6}><Form.Group className="mb-2"><Form.Label style={{ color: '#c9a03d' }}>Duración</Form.Label><Form.Control type="text" value={claseForm.duracion} onChange={(e) => setClaseForm({...claseForm, duracion: e.target.value})} style={{ background: '#1a1a1a', border: 'none', color: 'white' }} /></Form.Group></Col>
              <Col md={6}><Form.Group className="mb-2"><Form.Label style={{ color: '#c9a03d' }}>Máx. Alumnos</Form.Label><Form.Control type="number" value={claseForm.max_alumnos} onChange={(e) => setClaseForm({...claseForm, max_alumnos: e.target.value})} style={{ background: '#1a1a1a', border: 'none', color: 'white' }} /></Form.Group></Col>
              <Col md={12}><Form.Group className="mb-2"><Form.Label style={{ color: '#c9a03d' }}>Descripción</Form.Label><Form.Control as="textarea" rows={2} value={claseForm.descripcion} onChange={(e) => setClaseForm({...claseForm, descripcion: e.target.value})} style={{ background: '#1a1a1a', border: 'none', color: 'white' }} /></Form.Group></Col>
              <Col md={12}><Form.Group className="mb-2"><Form.Label style={{ color: '#c9a03d' }}>URL Imagen</Form.Label><Form.Control type="text" value={claseForm.imagen} onChange={(e) => setClaseForm({...claseForm, imagen: e.target.value})} style={{ background: '#1a1a1a', border: 'none', color: 'white' }} /></Form.Group></Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ background: '#111' }}>
          <Button variant="secondary" onClick={() => setShowClaseModal(false)}>Cancelar</Button>
          <Button onClick={guardarClase} style={{ background: '#c9a03d', border: 'none', color: '#000' }}>Guardar</Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .btn-gold { background: #c9a03d; padding: 8px 20px; border-radius: 30px; color: #000; text-decoration: none; font-weight: 600; border: none; cursor: pointer; }
        .btn-outline-gold { background: transparent; border: 1.5px solid #c9a03d; padding: 10px 25px; border-radius: 30px; color: #c9a03d; cursor: pointer; }
        .btn-outline-gold:hover { background: #c9a03d; color: #000; }
      `}</style>
    </>
  );
}

export default Dashboard;