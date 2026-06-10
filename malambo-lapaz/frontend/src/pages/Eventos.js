import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Modal, Button, Form, Badge } from 'react-bootstrap';
import { FaMapMarkerAlt, FaCalendarAlt, FaTicketAlt, FaWhatsapp, FaQrcode, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Ubicaciones reales de La Paz - Bolivia
const ubicacionesLaPaz = [
  { value: 'teatro_roma', label: 'Teatro Roma - Av. 16 de Julio (El Prado)', capacidad: 500 },
  { value: 'teatro_municipal', label: 'Teatro Municipal Alberto Saavedra Pérez - Plaza del Estudiante', capacidad: 800 },
  { value: 'plaza_obelisco', label: 'Plaza del Obelisco - Centro de La Paz', capacidad: 2000 },
  { value: 'cine_monje', label: 'Cine Monje Campero - Zona Central', capacidad: 300 },
  { value: 'espacio_simbiosis', label: 'Espacio Simbiosis - Calle 21, Calacoto', capacidad: 250 },
  { value: 'auditorio_gobierno', label: 'Auditorio Municipal - Av. Montes', capacidad: 400 },
  { value: 'casa_cultura', label: 'Casa de la Cultura - Calle Mercado', capacidad: 350 },
  { value: 'teatro_al_aire', label: 'Teatro al Aire Libre - Parque Urbano Central', capacidad: 1500 }
];

function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [metodoPago, setMetodoPago] = useState('tarjeta');
  const [cantidadEntradas, setCantidadEntradas] = useState(1);
  const [generarPDF, setGenerarPDF] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    ci: '',
    comentario: ''
  });

  useEffect(() => {
    cargarEventos();
  }, []);

  const cargarEventos = async () => {
    try {
      const res = await axios.get(`${API_URL}/eventos`);
      setEventos(res.data);
    } catch (error) {
      console.error('Error:', error);
      setEventos([
        { id: 1, nombre: "Festival Nacional de Malambo 2025", fecha: "2025-12-15", lugar: "Teatro Roma - Av. 16 de Julio", precio: 150, descripcion: "El evento más importante del año. Participan los mejores bailarines de todo el país.", imagen: "/images/gala.jpeg", capacidad: 500 },
        { id: 2, nombre: "Noche de Tambores", fecha: "2025-12-20", lugar: "Plaza del Obelisco", precio: 80, descripcion: "Una noche mágica con percusión y bailes tradicionales al aire libre.", imagen: "/images/gala3.jpeg", capacidad: 2000 },
        { id: 3, nombre: "Gala Anual Malambo La Paz", fecha: "2025-12-30", lugar: "Teatro Municipal", precio: 250, descripcion: "La presentación más elegante del año. Cena incluida.", imagen: "/images/gala1.jpeg", capacidad: 800 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const abrirCheckout = (evento) => {
    setEventoSeleccionado(evento);
    setCantidadEntradas(1);
    setGenerarPDF(false);
    setShowCheckout(true);
  };

  const finalizarCompra = async () => {
    if (!formData.nombre || !formData.email || !formData.ci) {
      alert('❌ Por favor completa todos los campos obligatorios (Nombre, Email, CI)');
      return;
    }

    const total = eventoSeleccionado.precio * cantidadEntradas;

    const compra = {
      evento: eventoSeleccionado.nombre,
      fecha: new Date(eventoSeleccionado.fecha).toLocaleDateString('es-ES'),
      lugar: eventoSeleccionado.lugar,
      cliente: formData.nombre,
      email: formData.email,
      telefono: formData.telefono,
      ci: formData.ci,
      cantidad: cantidadEntradas,
      precio_unitario: eventoSeleccionado.precio,
      total: total,
      metodo_pago: metodoPago,
      comentario: formData.comentario
    };

    try {
      const compraRes = await axios.post(`${API_URL}/compras`, {
        cliente: formData.nombre,
        total: total,
        detalle: JSON.stringify(compra)
      });

      if (generarPDF) {
        const pdfRes = await axios.post(`${API_URL}/reportes/comprobante`, {
          tipo: 'evento',
          cliente: { nombre: formData.nombre, email: formData.email, telefono: formData.telefono },
          evento: {
            nombre: eventoSeleccionado.nombre,
            fecha: eventoSeleccionado.fecha,
            lugar: eventoSeleccionado.lugar
          },
          cantidad: cantidadEntradas,
          total: total,
          compra_id: compraRes.data.id
        });
        window.open(`${API_URL}/reportes/descargar/${pdfRes.data.filename}`, '_blank');
      }

      let mensajePago = '';
      let instrucciones = '';

      if (metodoPago === 'tarjeta') {
        mensajePago = '💳 Se ha enviado un enlace de pago a tu correo electrónico';
        instrucciones = 'Recibirás un correo con el link seguro de pago. Las entradas se enviarán a tu email después de confirmar el pago.';
      } else if (metodoPago === 'qr') {
        mensajePago = '📱 Escanea el código QR para pagar';
        instrucciones = 'Presenta el comprobante de pago en la entrada del evento junto con tu CI.';
      } else {
        mensajePago = '💵 Pagarás en efectivo en la entrada del evento';
        instrucciones = 'Llega con 30 minutos de anticipación para realizar el pago y recoger tus entradas.';
      }

      let mensajePDF = generarPDF ? '\n📄 Se ha generado tu comprobante PDF' : '';

      alert(`✅ ¡COMPRA EXITOSA!\n\n` +
        `🎟️ DETALLES DE TU COMPRA:\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📌 Evento: ${eventoSeleccionado.nombre}\n` +
        `📅 Fecha: ${new Date(eventoSeleccionado.fecha).toLocaleDateString('es-ES')}\n` +
        `📍 Lugar: ${eventoSeleccionado.lugar}\n` +
        `🎫 Cantidad: ${cantidadEntradas} entrada(s)\n` +
        `💰 Precio unitario: Bs. ${eventoSeleccionado.precio}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `💵 TOTAL A PAGAR: Bs. ${total}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 Datos del comprador:\n` +
        `   Nombre: ${formData.nombre}\n` +
        `   CI: ${formData.ci}\n` +
        `   Email: ${formData.email}\n` +
        `   Teléfono: ${formData.telefono || 'No registrado'}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `💳 Método de pago: ${metodoPago === 'tarjeta' ? 'Tarjeta' : metodoPago === 'qr' ? 'Código QR' : 'Efectivo'}\n` +
        `${mensajePago}${mensajePDF}\n\n` +
        `📋 INSTRUCCIONES:\n${instrucciones}\n\n` +
        `🎭 ¡Gracias por apoyar la cultura y tradición boliviana!\n` +
        `🇧🇴 Malambo La Paz - Pasión, fuerza y tradición argentina con corazón boliviano`);

      setShowCheckout(false);
      setFormData({ nombre: '', email: '', telefono: '', ci: '', comentario: '' });
      setCantidadEntradas(1);
      setGenerarPDF(false);

    } catch (error) {
      alert('❌ Error al procesar la compra. Intenta nuevamente.');
    }
  };

  const generarQR = () => {
    const total = eventoSeleccionado?.precio * cantidadEntradas || 0;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Malambo%20La%20Paz%20-%20Evento:%20${encodeURIComponent(eventoSeleccionado?.nombre || '')}%20-%20Monto:Bs.${total}%20-%20CI:${formData.ci}`;
  };

  const getUbicacionInfo = (lugar) => {
    const ubicacion = ubicacionesLaPaz.find(u => u.label === lugar);
    return ubicacion || { capacidad: 0 };
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <div className="spinner-border text-warning" role="status"></div>
        <p>Cargando eventos...</p>
      </div>
    );
  }

  return (
    <>
      <div style={{
        height: '50vh',
        backgroundImage: 'url("/images/gala.jpeg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        marginTop: '76px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)'
        }} />
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <h1 style={{ color: 'white', fontSize: '4rem', textShadow: '0 0 10px black' }}>🎭 EVENTOS</h1>
          <p style={{ color: '#c9a03d', fontSize: '1.2rem' }}>Viví la magia del malambo en La Paz, Bolivia</p>
          <p style={{ color: 'white', fontSize: '0.9rem' }}>🇧🇴 Todos los eventos se realizan en la ciudad de La Paz</p>
        </div>
      </div>

      <Container className="my-5">
        <Row>
          {eventos.filter(e => e.activo !== 0).map(evento => {
            const ubicacionInfo = getUbicacionInfo(evento.lugar);
            return (
              <Col lg={4} md={6} key={evento.id} className="mb-4">
                <div style={{
                  background: '#111',
                  borderRadius: '15px',
                  overflow: 'hidden',
                  transition: 'transform 0.3s',
                  border: '1px solid rgba(201,160,61,0.3)',
                  height: '100%'
                }}>
                  <img 
                    src={evento.imagen || 'https://images.unsplash.com/photo-1507676184212-d2ab4e0f12a6?w=500'} 
                    alt={evento.nombre}
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '20px' }}>
                    <Badge style={{ background: '#c9a03d', color: '#000', marginBottom: '10px' }}>
                      {new Date(evento.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </Badge>
                    <h3 style={{ color: '#c9a03d', fontSize: '1.3rem', marginTop: '10px' }}>{evento.nombre}</h3>
                    <p style={{ margin: '10px 0' }}>
                      <FaMapMarkerAlt style={{ color: '#c9a03d', marginRight: '5px' }} />
                      {evento.lugar}
                    </p>
                    <p style={{ margin: '5px 0' }}>
                      <FaCalendarAlt style={{ color: '#c9a03d', marginRight: '5px' }} />
                      {new Date(evento.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} hs
                    </p>
                    <p style={{ margin: '5px 0 15px 0' }}>
                      <FaTicketAlt style={{ color: '#c9a03d', marginRight: '5px' }} />
                      Capacidad: {ubicacionInfo.capacidad} personas
                    </p>
                    <p style={{ color: '#c9a03d', fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '15px' }}>
                      Bs. {evento.precio}
                    </p>
                    <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '20px' }}>
                      {evento.descripcion}
                    </p>
                    <button 
                      onClick={() => abrirCheckout(evento)}
                      style={{
                        width: '100%',
                        background: '#c9a03d',
                        border: 'none',
                        padding: '12px',
                        borderRadius: '30px',
                        color: '#000',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      COMPRAR ENTRADA
                    </button>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
        {eventos.length === 0 && (
          <div className="text-center" style={{ padding: '50px' }}>
            <p>No hay eventos disponibles en este momento.</p>
            <p>🇧🇴 Pronto anunciaremos nuevas fechas en La Paz</p>
          </div>
        )}
      </Container>

      <Modal show={showCheckout} onHide={() => setShowCheckout(false)} size="lg" centered>
        <Modal.Header closeButton style={{ background: '#111', borderBottom: '2px solid #c9a03d' }}>
          <Modal.Title style={{ color: '#c9a03d' }}>Comprar Entradas</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#111' }}>
          <div style={{ background: '#0a0a0a', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
            <h5 style={{ color: '#c9a03d' }}>{eventoSeleccionado?.nombre}</h5>
            <p><FaCalendarAlt /> {eventoSeleccionado && new Date(eventoSeleccionado.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><FaMapMarkerAlt /> {eventoSeleccionado?.lugar}</p>
            <hr style={{ borderColor: '#333' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Precio por entrada:</span>
              <span style={{ color: '#c9a03d' }}>Bs. {eventoSeleccionado?.precio}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <span>Cantidad:</span>
              <div>
                <button 
                  onClick={() => setCantidadEntradas(Math.max(1, cantidadEntradas - 1))}
                  style={{ background: '#333', border: 'none', width: '30px', borderRadius: '5px', color: 'white', cursor: 'pointer' }}
                >-</button>
                <span style={{ margin: '0 15px' }}>{cantidadEntradas}</span>
                <button 
                  onClick={() => setCantidadEntradas(Math.min(20, cantidadEntradas + 1))}
                  style={{ background: '#333', border: 'none', width: '30px', borderRadius: '5px', color: 'white', cursor: 'pointer' }}
                >+</button>
              </div>
            </div>
            <hr style={{ borderColor: '#333' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>Total:</span>
              <span style={{ color: '#c9a03d', fontSize: '1.2rem' }}>Bs. {(eventoSeleccionado?.precio * cantidadEntradas) || 0}</span>
            </div>
          </div>

          <Form>
            <h5 style={{ color: '#c9a03d', marginBottom: '15px' }}>Datos del Comprador</h5>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre completo *</Form.Label>
                  <Form.Control type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required style={{ background: '#1a1a1a', border: 'none', color: 'white' }} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Número de CI *</Form.Label>
                  <Form.Control type="text" name="ci" value={formData.ci} onChange={handleInputChange} required placeholder="Ej: 1234567 LP" style={{ background: '#1a1a1a', border: 'none', color: 'white' }} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control type="email" name="email" value={formData.email} onChange={handleInputChange} required style={{ background: '#1a1a1a', border: 'none', color: 'white' }} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono / WhatsApp</Form.Label>
                  <Form.Control type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange} placeholder="Ej: 78912345" style={{ background: '#1a1a1a', border: 'none', color: 'white' }} />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Comentario (opcional)</Form.Label>
                  <Form.Control as="textarea" rows={2} name="comentario" value={formData.comentario} onChange={handleInputChange} placeholder="¿Alguna preferencia o consulta?" style={{ background: '#1a1a1a', border: 'none', color: 'white' }} />
                </Form.Group>
              </Col>
            </Row>

            <h5 style={{ color: '#c9a03d', marginBottom: '15px' }}>Método de Pago</h5>
            <Row className="mb-4">
              <Col md={4}>
                <div 
                  onClick={() => setMetodoPago('tarjeta')}
                  style={{
                    background: metodoPago === 'tarjeta' ? '#c9a03d' : '#1a1a1a',
                    padding: '15px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    color: metodoPago === 'tarjeta' ? '#000' : '#fff'
                  }}
                >
                  <FaCreditCard size={24} />
                  <p className="mt-2 mb-0">Tarjeta</p>
                </div>
              </Col>
              <Col md={4}>
                <div 
                  onClick={() => setMetodoPago('qr')}
                  style={{
                    background: metodoPago === 'qr' ? '#c9a03d' : '#1a1a1a',
                    padding: '15px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    color: metodoPago === 'qr' ? '#000' : '#fff'
                  }}
                >
                  <FaQrcode size={24} />
                  <p className="mt-2 mb-0">Código QR</p>
                </div>
              </Col>
              <Col md={4}>
                <div 
                  onClick={() => setMetodoPago('efectivo')}
                  style={{
                    background: metodoPago === 'efectivo' ? '#c9a03d' : '#1a1a1a',
                    padding: '15px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    color: metodoPago === 'efectivo' ? '#000' : '#fff'
                  }}
                >
                  <FaMoneyBillWave size={24} />
                  <p className="mt-2 mb-0">Efectivo</p>
                </div>
              </Col>
            </Row>

            {metodoPago === 'qr' && (
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <img src={generarQR()} alt="QR de pago" style={{ width: '150px', background: 'white', padding: '10px', borderRadius: '10px' }} />
                <p className="mt-2 small">Escanea el código QR para pagar</p>
              </div>
            )}

            {metodoPago === 'efectivo' && (
              <div style={{ background: '#0a0a0a', padding: '10px', borderRadius: '10px', marginBottom: '20px', textAlign: 'center' }}>
                <p className="mb-0">💵 Pagarás en la entrada del evento. Presenta tu CI al ingresar.</p>
              </div>
            )}

            {metodoPago === 'tarjeta' && (
              <div style={{ background: '#0a0a0a', padding: '10px', borderRadius: '10px', marginBottom: '20px', textAlign: 'center' }}>
                <p className="mb-0">💳 Recibirás un enlace seguro a tu correo para pagar con tarjeta.</p>
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
              <Button onClick={finalizarCompra} style={{ background: '#c9a03d', border: 'none', color: '#000' }}>
                Confirmar Compra
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Eventos;