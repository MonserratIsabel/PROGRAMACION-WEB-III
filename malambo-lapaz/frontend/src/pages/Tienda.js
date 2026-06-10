import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Modal, Button, Form, Badge } from 'react-bootstrap';
import { FaShoppingCart, FaTrash, FaCreditCard, FaQrcode, FaMoneyBillWave, FaHome, FaBuilding } from 'react-icons/fa';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Ciudades de Bolivia (9 departamentos)
const ciudadesBolivia = [
  { value: 'la_paz', label: 'La Paz', costo_envio: 0 },
  { value: 'santa_cruz', label: 'Santa Cruz', costo_envio: 15 },
  { value: 'cochabamba', label: 'Cochabamba', costo_envio: 10 },
  { value: 'sucre', label: 'Sucre', costo_envio: 12 },
  { value: 'potosi', label: 'Potosí', costo_envio: 18 },
  { value: 'tarija', label: 'Tarija', costo_envio: 14 },
  { value: 'oruro', label: 'Oruro', costo_envio: 10 },
  { value: 'beni', label: 'Beni (Trinidad)', costo_envio: 20 },
  { value: 'pando', label: 'Pando (Cobija)', costo_envio: 25 }
];

function Tienda() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carrito, setCarrito] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [metodoPago, setMetodoPago] = useState('tarjeta');
  const [tipoEntrega, setTipoEntrega] = useState('domicilio');
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState('la_paz');
  const [costoEnvio, setCostoEnvio] = useState(0);
  const [generarPDF, setGenerarPDF] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    punto_encuentro: ''
  });

  useEffect(() => {
    cargarProductos();
    const carritoGuardado = localStorage.getItem('carrito_malambo');
    if (carritoGuardado) {
      setCarrito(JSON.parse(carritoGuardado));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('carrito_malambo', JSON.stringify(carrito));
  }, [carrito]);

  useEffect(() => {
    const ciudad = ciudadesBolivia.find(c => c.value === ciudadSeleccionada);
    setCostoEnvio(ciudad ? ciudad.costo_envio : 0);
  }, [ciudadSeleccionada]);

  const cargarProductos = async () => {
    try {
      const res = await axios.get(`${API_URL}/productos`);
      setProductos(res.data);
    } catch (error) {
      console.error('Error:', error);
      setProductos([
        { id: 1, nombre: "Bota de Cuero Artesanal", precio: 129.99, imagen: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400", stock: 10 },
        { id: 2, nombre: "Sombrero Gaucho Premium", precio: 79.99, imagen: "https://images.unsplash.com/photo-1521305916504-4a1121188589?w=400", stock: 20 },
        { id: 3, nombre: "Remera Oficial Malambo", precio: 39.99, imagen: "https://images.unsplash.com/photo-1503342219980-2c3f3689e12d?w=400", stock: 50 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const agregarAlCarrito = (producto, cantidad = 1) => {
    const existente = carrito.find(item => item.id === producto.id);
    if (existente) {
      setCarrito(carrito.map(item =>
        item.id === producto.id
          ? { ...item, cantidad: item.cantidad + cantidad }
          : item
      ));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: cantidad }]);
    }
    alert(`✨ ${producto.nombre} agregado al carrito`);
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const actualizarCantidad = (id, nuevaCantidad) => {
    if (nuevaCantidad < 1) {
      eliminarDelCarrito(id);
    } else {
      setCarrito(carrito.map(item =>
        item.id === id ? { ...item, cantidad: nuevaCantidad } : item
      ));
    }
  };

  const subtotal = () => {
    return carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  };

  const totalCarrito = () => {
    let total = subtotal();
    if (tipoEntrega === 'domicilio') {
      total += costoEnvio;
    }
    return total.toFixed(2);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const finalizarCompra = async () => {
    if (!formData.nombre || !formData.email) {
      alert('❌ Por favor completa nombre y email');
      return;
    }

    if (tipoEntrega === 'domicilio' && !formData.direccion) {
      alert('❌ Por favor ingresa tu dirección de envío');
      return;
    }

    if (tipoEntrega === 'oficina' && !formData.punto_encuentro) {
      alert('❌ Por favor selecciona un punto de encuentro');
      return;
    }

    const ciudad = ciudadesBolivia.find(c => c.value === ciudadSeleccionada);
    
    const compra = {
      cliente: formData.nombre,
      email: formData.email,
      telefono: formData.telefono,
      ciudad: ciudad.label,
      tipo_entrega: tipoEntrega,
      direccion: tipoEntrega === 'domicilio' ? formData.direccion : formData.punto_encuentro,
      productos: carrito,
      subtotal: subtotal(),
      costo_envio: tipoEntrega === 'domicilio' ? costoEnvio : 0,
      total: totalCarrito(),
      metodo_pago: metodoPago,
      fecha: new Date().toISOString()
    };

    try {
      const compraRes = await axios.post(`${API_URL}/compras`, {
        cliente: formData.nombre,
        total: totalCarrito(),
        detalle: JSON.stringify(compra)
      });

      if (generarPDF) {
        const pdfRes = await axios.post(`${API_URL}/reportes/comprobante`, {
          tipo: 'compra',
          cliente: { nombre: formData.nombre, email: formData.email, telefono: formData.telefono },
          productos: carrito,
          total: totalCarrito(),
          compra_id: compraRes.data.id,
          direccion: tipoEntrega === 'domicilio' ? formData.direccion : formData.punto_encuentro,
          tipo_entrega: tipoEntrega,
          ciudad: ciudad.label
        });
        window.open(`${API_URL}/reportes/descargar/${pdfRes.data.filename}`, '_blank');
      }

      let mensajePago = '';
      if (metodoPago === 'tarjeta') {
        mensajePago = '💳 Se ha enviado un enlace de pago a tu correo electrónico';
      } else if (metodoPago === 'qr') {
        mensajePago = '📱 Escanea el código QR que aparece en pantalla para pagar';
      } else {
        mensajePago = '💵 Pagarás en efectivo al recibir el producto';
      }

      let mensajeEntrega = '';
      if (tipoEntrega === 'domicilio') {
        mensajeEntrega = `🚚 Envío a domicilio: ${formData.direccion}, ${ciudad.label} (Costo: Bs. ${costoEnvio})`;
      } else {
        mensajeEntrega = `🏢 Retiro en oficina: ${formData.punto_encuentro}, ${ciudad.label} (Sin costo de envío)`;
      }

      let mensajePDF = generarPDF ? '\n📄 Se ha generado tu comprobante PDF' : '';

      alert(`✅ ¡COMPRA EXITOSA!\n\n` +
        `📦 Resumen de tu pedido:\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `${carrito.map(p => `• ${p.nombre} x${p.cantidad} = Bs. ${(p.precio * p.cantidad).toFixed(2)}`).join('\n')}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `💰 SUBTOTAL: Bs. ${subtotal().toFixed(2)}\n` +
        `${tipoEntrega === 'domicilio' ? `🚚 ENVÍO: Bs. ${costoEnvio}\n` : ''}` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `💵 TOTAL: Bs. ${totalCarrito()}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `${mensajeEntrega}\n` +
        `💳 Método de pago: ${metodoPago === 'tarjeta' ? 'Tarjeta' : metodoPago === 'qr' ? 'Código QR' : 'Efectivo'}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `${mensajePago}${mensajePDF}\n\n` +
        `📧 Te enviamos un correo con los detalles a ${formData.email}\n` +
        `📞 Te contactaremos al ${formData.telefono || 'tu número'}.\n\n` +
        `🎭 ¡Gracias por apoyar a Malambo La Paz!`);

      setCarrito([]);
      localStorage.removeItem('carrito_malambo');
      setShowCheckout(false);
      setShowCart(false);
      setFormData({ nombre: '', email: '', telefono: '', direccion: '', punto_encuentro: '' });
      setTipoEntrega('domicilio');
      setCiudadSeleccionada('la_paz');
      setGenerarPDF(false);

    } catch (error) {
      alert('❌ Error al procesar la compra. Intenta nuevamente.');
    }
  };

  const generarQR = () => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Malambo%20La%20Paz%20-%20Pago%20Bs.${totalCarrito()}`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <div className="spinner-border text-warning" role="status"></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  return (
    <>
      <div style={{
        height: '40vh',
        backgroundImage: 'url("https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        marginTop: '76px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: 'white', fontSize: '4rem', textShadow: '0 0 10px black' }}>TIENDA OFICIAL</h1>
          <p style={{ color: '#c9a03d' }}>Vestite con la pasión del malambo</p>
          <p style={{ color: '#fff', fontSize: '0.9rem' }}>🇧🇴 Envíos a toda Bolivia</p>
        </div>
      </div>

      <button
        onClick={() => setShowCart(true)}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          background: '#c9a03d',
          border: 'none',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          color: '#000',
          fontSize: '1.5rem',
          cursor: 'pointer',
          zIndex: 100,
          boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <FaShoppingCart />
        {carrito.length > 0 && (
          <Badge style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            background: '#ff1744',
            color: 'white',
            borderRadius: '50%',
            width: '22px',
            height: '22px',
            fontSize: '0.7rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {carrito.reduce((s, i) => s + i.cantidad, 0)}
          </Badge>
        )}
      </button>

      <Container className="my-5">
        <Row>
          {productos.filter(p => p.activo !== 0).map(producto => (
            <Col md={3} key={producto.id} className="mb-4">
              <div style={{
                background: '#111',
                borderRadius: '15px',
                overflow: 'hidden',
                transition: 'transform 0.3s',
                border: '1px solid rgba(201,160,61,0.3)',
                height: '100%'
              }}>
                <img 
                  src={producto.imagen || 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400'} 
                  alt={producto.nombre}
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                />
                <div style={{ padding: '15px' }}>
                  <h4 style={{ color: '#c9a03d', fontSize: '1rem' }}>{producto.nombre}</h4>
                  <p style={{ color: '#aaa', fontSize: '0.8rem' }}>{producto.descripcion?.substring(0, 60)}...</p>
                  <p style={{ color: '#c9a03d', fontWeight: 'bold', fontSize: '1.2rem' }}>Bs. {producto.precio}</p>
                  <button 
                    onClick={() => agregarAlCarrito(producto, 1)}
                    style={{
                      width: '100%',
                      background: '#c9a03d',
                      border: 'none',
                      padding: '8px',
                      borderRadius: '30px',
                      color: '#000',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    AGREGAR AL CARRITO
                  </button>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>

      <Modal show={showCart} onHide={() => setShowCart(false)} size="lg" centered>
        <Modal.Header closeButton style={{ background: '#111', borderBottom: '2px solid #c9a03d' }}>
          <Modal.Title style={{ color: '#c9a03d' }}><FaShoppingCart /> Mi Carrito</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#111' }}>
          {carrito.length === 0 ? (
            <p className="text-center" style={{ color: '#aaa', padding: '40px' }}>🛒 Tu carrito está vacío</p>
          ) : (
            <>
              {carrito.map(item => (
                <div key={item.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '15px',
                  borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <div style={{ flex: 2 }}>
                    <h5 style={{ color: '#c9a03d' }}>{item.nombre}</h5>
                    <p style={{ color: '#aaa', fontSize: '0.85rem' }}>Bs. {item.precio} c/u</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button onClick={() => actualizarCantidad(item.id, item.cantidad - 1)} style={{ background: '#333', border: 'none', width: '30px', borderRadius: '5px', color: 'white', cursor: 'pointer' }}>-</button>
                    <span style={{ color: 'white', minWidth: '30px', textAlign: 'center' }}>{item.cantidad}</span>
                    <button onClick={() => actualizarCantidad(item.id, item.cantidad + 1)} style={{ background: '#333', border: 'none', width: '30px', borderRadius: '5px', color: 'white', cursor: 'pointer' }}>+</button>
                    <button onClick={() => eliminarDelCarrito(item.id)} style={{ background: 'none', border: 'none', color: '#ff1744', cursor: 'pointer', marginLeft: '10px' }}><FaTrash /></button>
                  </div>
                  <div style={{ minWidth: '80px', textAlign: 'right' }}>
                    <span style={{ color: '#c9a03d', fontWeight: 'bold' }}>Bs. {(item.precio * item.cantidad).toFixed(2)}</span>
                  </div>
                </div>
              ))}
              <div style={{ padding: '20px', textAlign: 'right', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <h4 style={{ color: '#c9a03d' }}>Subtotal: Bs. {subtotal().toFixed(2)}</h4>
                <Button 
                  onClick={() => {
                    setShowCart(false);
                    setShowCheckout(true);
                  }}
                  className="btn-gold mt-3"
                  style={{ background: '#c9a03d', border: 'none', color: '#000', padding: '10px 30px' }}
                >
                  Proceder al Pago
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>

      <Modal show={showCheckout} onHide={() => setShowCheckout(false)} size="lg" centered>
        <Modal.Header closeButton style={{ background: '#111', borderBottom: '2px solid #c9a03d' }}>
          <Modal.Title style={{ color: '#c9a03d' }}>Finalizar Compra</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#111' }}>
          <div style={{ background: '#0a0a0a', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
            <h5 style={{ color: '#c9a03d' }}>Resumen de tu pedido:</h5>
            {carrito.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.nombre} x{item.cantidad}</span>
                <span>Bs. {(item.precio * item.cantidad).toFixed(2)}</span>
              </div>
            ))}
            <hr style={{ borderColor: '#333' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal:</span>
              <span>Bs. {subtotal().toFixed(2)}</span>
            </div>
            {tipoEntrega === 'domicilio' && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Envío ({ciudadesBolivia.find(c => c.value === ciudadSeleccionada)?.label}):</span>
                <span>Bs. {costoEnvio}</span>
              </div>
            )}
            <hr style={{ borderColor: '#333' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>Total:</span>
              <span style={{ color: '#c9a03d' }}>Bs. {totalCarrito()}</span>
            </div>
          </div>

          <Form>
            <h5 style={{ color: '#c9a03d', marginBottom: '15px' }}>Datos de Contacto</h5>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre completo *</Form.Label>
                  <Form.Control type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required style={{ background: '#1a1a1a', border: 'none', color: 'white' }} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control type="email" name="email" value={formData.email} onChange={handleInputChange} required style={{ background: '#1a1a1a', border: 'none', color: 'white' }} />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono / WhatsApp</Form.Label>
                  <Form.Control type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange} placeholder="Ej: 78912345" style={{ background: '#1a1a1a', border: 'none', color: 'white' }} />
                </Form.Group>
              </Col>
            </Row>

            <h5 style={{ color: '#c9a03d', marginBottom: '15px' }}>📍 Ciudad</h5>
            <Form.Group className="mb-3">
              <Form.Select 
                value={ciudadSeleccionada} 
                onChange={(e) => setCiudadSeleccionada(e.target.value)}
                style={{ background: '#1a1a1a', border: 'none', color: 'white' }}
              >
                {ciudadesBolivia.map(ciudad => (
                  <option key={ciudad.value} value={ciudad.value}>
                    {ciudad.label} {ciudad.costo_envio > 0 ? `(Envío: Bs. ${ciudad.costo_envio})` : '(Envío gratis)'}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <h5 style={{ color: '#c9a03d', marginBottom: '15px' }}>🚚 Tipo de Entrega</h5>
            <Row className="mb-4">
              <Col md={6}>
                <div 
                  onClick={() => setTipoEntrega('domicilio')}
                  style={{
                    background: tipoEntrega === 'domicilio' ? '#c9a03d' : '#1a1a1a',
                    padding: '15px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    color: tipoEntrega === 'domicilio' ? '#000' : '#fff'
                  }}
                >
                  <FaHome size={24} />
                  <p className="mt-2 mb-0">🚚 A domicilio</p>
                  <small className={tipoEntrega === 'domicilio' ? 'text-dark' : 'text-muted'}>Con costo de envío</small>
                </div>
              </Col>
              <Col md={6}>
                <div 
                  onClick={() => setTipoEntrega('oficina')}
                  style={{
                    background: tipoEntrega === 'oficina' ? '#c9a03d' : '#1a1a1a',
                    padding: '15px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    color: tipoEntrega === 'oficina' ? '#000' : '#fff'
                  }}
                >
                  <FaBuilding size={24} />
                  <p className="mt-2 mb-0">🏢 Retiro en oficina</p>
                  <small className={tipoEntrega === 'oficina' ? 'text-dark' : 'text-muted'}>Sin costo de envío</small>
                </div>
              </Col>
            </Row>

            {tipoEntrega === 'domicilio' ? (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Dirección de envío *</Form.Label>
                  <Form.Control type="text" name="direccion" value={formData.direccion} onChange={handleInputChange} placeholder="Calle, número, zona" required style={{ background: '#1a1a1a', border: 'none', color: 'white' }} />
                </Form.Group>
                <div style={{ background: '#0a0a0a', padding: '10px', borderRadius: '10px', marginBottom: '20px' }}>
                  <p className="mb-0 small">🚚 El costo de envío varía según tu ciudad</p>
                </div>
              </>
            ) : (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Punto de encuentro *</Form.Label>
                  <Form.Select 
                    name="punto_encuentro" 
                    value={formData.punto_encuentro} 
                    onChange={handleInputChange}
                    required
                    style={{ background: '#1a1a1a', border: 'none', color: 'white' }}
                  >
                    <option value="">Selecciona un punto de encuentro</option>
                    <option value="Obelisco - Centro de La Paz">📍 Obelisco - Centro de La Paz</option>
                    <option value="Estudio Malambo La Paz (Sede Central)">🏢 Estudio Malambo La Paz (Sede Central) - Av. 16 de Julio</option>
                    <option value="Mercado de las Brujas">🪶 Mercado de las Brujas</option>
                    <option value="Plaza del Estudiante">📚 Plaza del Estudiante</option>
                    <option value="Teleférico Línea Roja - Estación Central">🚠 Teleférico Línea Roja - Estación Central</option>
                  </Form.Select>
                </Form.Group>
                <div style={{ background: '#0a0a0a', padding: '10px', borderRadius: '10px', marginBottom: '20px' }}>
                  <p className="mb-0 small">🏢 Horario de oficina: Lunes a Viernes 9:00 - 18:00</p>
                </div>
              </>
            )}

            <h5 style={{ color: '#c9a03d', marginBottom: '15px' }}>💳 Método de Pago</h5>
            <Row className="mb-4">
              <Col md={4}>
                <div onClick={() => setMetodoPago('tarjeta')} style={{ background: metodoPago === 'tarjeta' ? '#c9a03d' : '#1a1a1a', padding: '15px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', color: metodoPago === 'tarjeta' ? '#000' : '#fff' }}>
                  <FaCreditCard size={24} /><p className="mt-2 mb-0">Tarjeta</p>
                </div>
              </Col>
              <Col md={4}>
                <div onClick={() => setMetodoPago('qr')} style={{ background: metodoPago === 'qr' ? '#c9a03d' : '#1a1a1a', padding: '15px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', color: metodoPago === 'qr' ? '#000' : '#fff' }}>
                  <FaQrcode size={24} /><p className="mt-2 mb-0">Código QR</p>
                </div>
              </Col>
              <Col md={4}>
                <div onClick={() => setMetodoPago('efectivo')} style={{ background: metodoPago === 'efectivo' ? '#c9a03d' : '#1a1a1a', padding: '15px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', color: metodoPago === 'efectivo' ? '#000' : '#fff' }}>
                  <FaMoneyBillWave size={24} /><p className="mt-2 mb-0">Efectivo</p>
                </div>
              </Col>
            </Row>

            {metodoPago === 'qr' && (
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <img src={generarQR()} alt="QR de pago" style={{ width: '150px', background: 'white', padding: '10px', borderRadius: '10px' }} />
                <p className="mt-2 small">Escanea el código QR para pagar</p>
              </div>
            )}

            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox"
                id="generarPDF"
                label="📄 Generar comprobante PDF de mi compra"
                checked={generarPDF}
                onChange={(e) => setGenerarPDF(e.target.checked)}
                style={{ color: '#c9a03d' }}
              />
            </Form.Group>

            <div className="text-end">
              <Button variant="secondary" onClick={() => setShowCheckout(false)} className="me-2">Cancelar</Button>
              <Button onClick={finalizarCompra} style={{ background: '#c9a03d', border: 'none', color: '#000' }}>Confirmar Compra</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Tienda;