import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Modal, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

function Home() {
  const [showModal, setShowModal] = useState(false);
  const [claseSeleccionada, setClaseSeleccionada] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    edad: '',
    mensaje: ''
  });
  const [clases, setClases] = useState([]);
  const [loadingClases, setLoadingClases] = useState(true);
  const [generarPDF, setGenerarPDF] = useState(false);

  const profesores = [
    {
      nombre: "Carmiña Valencia",
      rol: "Directora & Ballet folclórico argentino",
      descripcion: "Formada en el Instituto Nacional de Danza. 25 años de experiencia en danza clásica, contemporánea y folclórica.",
      imagen: "/images/prof1.jpeg"
    },
    {
      nombre: "Miguel Angel Erazo",
      rol: "Malambo & Folclore",
      descripcion: "Campeón nacional de malambo 5 años consecutivos. Ha llevado nuestra danza a más de 20 países.",
      imagen: "/images/porf2.jpeg"
    },
    {
      nombre: "Luz Ballesteros",
      rol: "Danza Contemporánea, Jazz Dance",
      descripcion: "Egresada de la Universidad de Danza de Buenos Aires. Premio Konex 2018 a mejor bailarina.",
      imagen: "/images/prof3.jpeg"
    },
    {
      nombre: "Anghee Torrez",
      rol: "Danza folclórica argentina",
      descripcion: "Coreógrafa internacional con más de 15 años de experiencia en danzas folclóricas.",
      imagen: "/images/prof4.jpeg"
    }
  ];

  const horarios = [
    { dia: "Lunes", hora: "09:00 - 09:45", clase: "Baby Ballet Inicial", nivel: "Baby Ballet", instructor: "Luz Ballesteros", salon: "Sala Pequeña", duracion: "45 min", precio: "150 Bs." },
    { dia: "Lunes", hora: "17:00 - 18:00", clase: "Ballet Clásico Nivel I", nivel: "Ballet Clásico", instructor: "Luz Ballesteros", salon: "Sala Principal", duracion: "60 min", precio: "200 Bs." },
    { dia: "Lunes", hora: "18:00 - 19:15", clase: "Danza Contemporánea", nivel: "Danza Contemporánea", instructor: "Luz Ballesteros", salon: "Sala Contemporánea", duracion: "75 min", precio: "190 Bs." },
    { dia: "Martes", hora: "17:00 - 18:15", clase: "Ballet Clásico Nivel II", nivel: "Ballet Clásico", instructor: "Luz Ballesteros", salon: "Sala Principal", duracion: "75 min", precio: "220 Bs." },
    { dia: "Miércoles", hora: "18:00 - 19:30", clase: "Ballet Avanzado", nivel: "Ballet Avanzado", instructor: "Luz Ballesteros", salon: "Sala Principal", duracion: "90 min", precio: "250 Bs." },
    { dia: "Jueves", hora: "18:00 - 19:00", clase: "Malambo Intermedio", nivel: "Malambo", instructor: "Miguel Angel Erazo", salon: "Sala Principal", duracion: "60 min", precio: "180 Bs." },
    { dia: "Viernes", hora: "18:00 - 19:00", clase: "Folclore Argentino", nivel: "Folclore Argentino", instructor: "Anghee Torrez", salon: "Sala Principal", duracion: "60 min", precio: "190 Bs." }
  ];

  const disciplinas = [
    { nombre: "Ballet Clásico", icono: "fa-shoe-prints", color: "#c9a03d", descripcion: "Técnica europea de alto nivel, desde iniciación hasta formación profesional." },
    { nombre: "Malambo", icono: "fa-boot", color: "#8b6914", descripcion: "Zapateo folclórico argentino con pasión boliviana." },
    { nombre: "Danza Contemporánea", icono: "fa-music", color: "#d4af37", descripcion: "Expresión libre con técnicas modernas y fusión." },
    { nombre: "Jazz Dance", icono: "fa-drum", color: "#b8860b", descripcion: "Ritmo, energía y técnica en una disciplina dinámica." }
  ];

  const noticias = [
    {
      id: 1,
      titulo: "Gran Gala Anual de Malambo",
      fecha: "15 de Diciembre, 2026",
      descripcion: "Una noche mágica con los mejores bailarines de Bolivia y Argentina.",
      imagen: "/images/gala.jpeg"
    },
    {
      id: 2,
      titulo: "Nuevos Horarios de Clases",
      fecha: "2 de junio, 2026",
      descripcion: "Ampliamos nuestra oferta con nuevos horarios matutinos y vespertinos.",
      imagen: "/images/gala3.jpeg"
    },
    {
      id: 3,
      titulo: "Campeonato Nacional de Malambo",
      fecha: "5 de julio, 2026",
      descripcion: "Nuestros alumnos participarán en el campeonato nacional.",
      imagen: "/images/gala1.jpeg"
    }
  ];

  // ========== CARGAR CLASES DESDE LA BASE DE DATOS ==========
  const cargarClases = async () => {
    try {
      const res = await axios.get(`${API_URL}/clases`);
      setClases(res.data);
    } catch (error) {
      console.error('Error al cargar clases:', error);
    } finally {
      setLoadingClases(false);
    }
  };

  useEffect(() => {
    cargarClases();
  }, []);

  const abrirModal = (clase) => {
    setClaseSeleccionada(clase);
    setGenerarPDF(false);
    setShowModal(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(`${API_URL}/inscripciones`, {
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        edad: formData.edad,
        clase_id: claseSeleccionada.id,
        clase_nombre: claseSeleccionada.nombre,
        instructor: claseSeleccionada.instructor,
        precio: parseFloat(claseSeleccionada.precio)
      });
      
      if (response.data.success) {
        if (generarPDF) {
          const pdfRes = await axios.post(`${API_URL}/reportes/comprobante`, {
            tipo: 'inscripcion',
            cliente: { nombre: formData.nombre, email: formData.email, telefono: formData.telefono },
            inscripcion: {
              clase_nombre: claseSeleccionada.nombre,
              instructor: claseSeleccionada.instructor,
              horario: claseSeleccionada.horario,
              precio: claseSeleccionada.precio
            },
            inscripcion_id: response.data.id
          });
          window.open(`${API_URL}/reportes/descargar/${pdfRes.data.filename}`, '_blank');
        }

        let mensajePDF = generarPDF ? '\n📄 Se ha generado tu comprobante PDF' : '';
        
        alert(`✅ ¡Inscripción exitosa!\n\nClase: ${claseSeleccionada.nombre}\nNombre: ${formData.nombre}\nEmail: ${formData.email}\n\nTe contactaremos pronto.${mensajePDF}`);
        
        setShowModal(false);
        setFormData({ nombre: '', email: '', telefono: '', edad: '', mensaje: '' });
        setGenerarPDF(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al registrar la inscripción. Intenta nuevamente.');
    }
  };

  if (loadingClases) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Cargando clases...</span>
        </div>
        <p className="mt-3">Cargando clases...</p>
      </div>
    );
  }

  return (
    <>
      {/* HERO SECTION */}
      <section style={{
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        marginTop: '0'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url("/images/oficial.jpeg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.6)'
        }} />
        <div style={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '0 20px'
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(10px)',
            padding: '40px 60px',
            borderRadius: '20px',
            border: '1px solid rgba(212,175,55,0.3)'
          }}>
            <p style={{
              color: '#c9a03d',
              letterSpacing: '4px',
              fontSize: '0.9rem',
              marginBottom: '20px'
            }}>DESDE 1995</p>
            <h1 style={{
              fontSize: '5rem',
              fontWeight: '300',
              letterSpacing: '8px',
              color: 'white',
              marginBottom: '20px'
            }}>
              MALAMBO
            </h1>
            <p style={{
              fontSize: '1.2rem',
              letterSpacing: '6px',
              color: '#c9a03d',
              marginBottom: '30px'
            }}>
              BALLET | LA PAZ, BOLIVIA
            </p>
            <p style={{
              maxWidth: '600px',
              color: 'rgba(255,255,255,0.8)',
              marginBottom: '40px'
            }}>
              Pasión, tradición y excelencia en danza. Formamos bailarines con técnica y alma.
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="#clases" className="btn-gold">Ver Clases</a>
              <a href="#horarios" className="btn-outline-gold">Ver Horarios</a>
            </div>
          </div>
        </div>
        
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          zIndex: 3
        }}>
          <p style={{ color: '#c9a03d', fontSize: '0.8rem', marginBottom: '5px' }}>DESCUBRE</p>
          <div style={{
            width: '1px',
            height: '50px',
            background: 'linear-gradient(180deg, #c9a03d, transparent)',
            margin: '0 auto'
          }} />
        </div>
      </section>

      {/* DISCIPLINAS */}
      <section id="disciplinas" style={{ padding: '100px 0', background: '#0a0a0a' }}>
        <Container>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <p style={{ color: '#c9a03d', letterSpacing: '3px', fontSize: '0.8rem' }}>NUESTRA OFERTA</p>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '300', color: 'white' }}>Disciplinas</h2>
            <div style={{ width: '60px', height: '2px', background: '#c9a03d', margin: '20px auto' }} />
          </div>
          <Row>
            {disciplinas.map((d, i) => (
              <Col md={3} key={i} className="mb-4">
                <div className="glass-card" style={{
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(10px)',
                  padding: '30px',
                  borderRadius: '15px',
                  textAlign: 'center',
                  border: '1px solid rgba(212,175,55,0.2)',
                  transition: 'all 0.3s',
                  height: '100%'
                }}>
                  <i className={`fas ${d.icono}`} style={{ fontSize: '3rem', color: '#c9a03d', marginBottom: '20px' }}></i>
                  <h4 style={{ color: 'white', marginBottom: '15px' }}>{d.nombre}</h4>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>{d.descripcion}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CLASES - SECCIÓN PRINCIPAL */}
      <section id="clases" style={{ padding: '100px 0', background: '#050505' }}>
        <Container>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <p style={{ color: '#c9a03d', letterSpacing: '3px', fontSize: '0.8rem' }}>PROGRAMA ACADÉMICO</p>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '300', color: 'white' }}>Clases & Disciplinas</h2>
            <div style={{ width: '60px', height: '2px', background: '#c9a03d', margin: '20px auto' }} />
            <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '600px', margin: '0 auto' }}>
              Programas diseñados para todos los niveles, desde baby ballet hasta formación profesional
            </p>
          </div>
          <Row>
            {clases.map(clase => (
              <Col lg={4} md={6} key={clase.id} className="mb-4">
                <div className="clase-card" style={{
                  background: '#111',
                  borderRadius: '15px',
                  overflow: 'hidden',
                  transition: 'all 0.4s',
                  height: '100%',
                  border: '1px solid rgba(212,175,55,0.1)'
                }}>
                  <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                    <img src={clase.imagen} alt={clase.nombre} style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s'
                    }} />
                    <div style={{
                      position: 'absolute',
                      top: '15px',
                      left: '15px',
                      background: '#c9a03d',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      color: '#000'
                    }}>
                      {clase.nivel}
                    </div>
                  </div>
                  <div style={{ padding: '25px' }}>
                    <p style={{ color: '#c9a03d', fontSize: '0.75rem', letterSpacing: '2px', marginBottom: '10px' }}>{clase.categoria}</p>
                    <h4 style={{ color: 'white', marginBottom: '15px', fontSize: '1.2rem' }}>{clase.nombre}</h4>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '20px', lineHeight: 1.6 }}>{clase.descripcion}</p>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}><i className="fas fa-user"></i> {clase.instructor}</span>
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}><i className="fas fa-clock"></i> {clase.duracion}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}><i className="fas fa-users"></i> Máx. {clase.max_alumnos}</span>
                        <span style={{ color: '#c9a03d', fontWeight: 'bold' }}>Bs. {clase.precio}/mes</span>
                      </div>
                    </div>
                    <button
                      onClick={() => abrirModal(clase)}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: '1px solid #c9a03d',
                        padding: '12px',
                        borderRadius: '30px',
                        color: '#c9a03d',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#c9a03d';
                        e.target.style.color = '#000';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.color = '#c9a03d';
                      }}
                    >
                      INSCRIBIRME
                    </button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* HORARIOS */}
      <section id="horarios" style={{ padding: '100px 0', background: '#0a0a0a' }}>
        <Container>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <p style={{ color: '#c9a03d', letterSpacing: '3px', fontSize: '0.8rem' }}>CALENDARIO</p>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '300', color: 'white' }}>Horarios de Clases</h2>
            <div style={{ width: '60px', height: '2px', background: '#c9a03d', margin: '20px auto' }} />
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: '#111',
              borderRadius: '15px',
              overflow: 'hidden'
            }}>
              <thead>
                <tr style={{ background: '#c9a03d' }}>
                  <th style={{ padding: '15px', textAlign: 'left', color: '#000' }}>DÍA</th>
                  <th style={{ padding: '15px', textAlign: 'left', color: '#000' }}>HORA</th>
                  <th style={{ padding: '15px', textAlign: 'left', color: '#000' }}>CLASE</th>
                  <th style={{ padding: '15px', textAlign: 'left', color: '#000' }}>NIVEL</th>
                  <th style={{ padding: '15px', textAlign: 'left', color: '#000' }}>INSTRUCTOR</th>
                  <th style={{ padding: '15px', textAlign: 'left', color: '#000' }}>PRECIO</th>
                </tr>
              </thead>
              <tbody>
                {horarios.map((h, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px 15px', color: 'white' }}>{h.dia}</td>
                    <td style={{ padding: '12px 15px', color: '#c9a03d' }}>{h.hora}</td>
                    <td style={{ padding: '12px 15px', color: 'rgba(255,255,255,0.8)' }}>{h.clase}</td>
                    <td style={{ padding: '12px 15px', color: 'rgba(255,255,255,0.6)' }}>{h.nivel}</td>
                    <td style={{ padding: '12px 15px', color: 'rgba(255,255,255,0.6)' }}>{h.instructor}</td>
                    <td style={{ padding: '12px 15px', color: '#c9a03d', fontWeight: 'bold' }}>{h.precio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      {/* NOSOTROS */}
      <section id="nosotros" style={{ padding: '100px 0', background: '#050505' }}>
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <img
                src="/images/nosotros.jpeg"
                alt="Historia"
                style={{ width: '100%', borderRadius: '15px' }}
              />
            </Col>
            <Col lg={6}>
              <p style={{ color: '#c9a03d', letterSpacing: '3px', fontSize: '0.8rem', marginBottom: '20px' }}>NUESTRA HISTORIA</p>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '300', color: 'white', marginBottom: '30px' }}>Un legado de danza y tradición</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: '20px' }}>
                Fundado en <strong>1995</strong> en la ciudad de La Paz, Bolivia, <strong>Malambo Ballet</strong> nació con el sueño de fusionar la tradición del malambo argentino con la riqueza cultural boliviana.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: '20px' }}>
                Con <strong>más de 28 años de experiencia</strong>, hemos formado a cientos de bailarines que hoy brillan en escenarios de Bolivia, Argentina, Chile y Estados Unidos.
              </p>
              <div style={{
                background: 'rgba(212,175,55,0.1)',
                padding: '20px',
                borderRadius: '10px',
                borderLeft: '3px solid #c9a03d'
              }}>
                <i className="fas fa-quote-left" style={{ color: '#c9a03d', marginRight: '10px' }}></i>
                <span style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.8)' }}>"La danza es el lenguaje del alma, y en Malambo Ballet, enseñamos a hablar con el corazón"</span>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* PROFESORES */}
      <section id="profesores" style={{ padding: '100px 0', background: '#0a0a0a' }}>
        <Container>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <p style={{ color: '#c9a03d', letterSpacing: '3px', fontSize: '0.8rem' }}>NUESTRO EQUIPO</p>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '300', color: 'white' }}>Profesores</h2>
            <div style={{ width: '60px', height: '2px', background: '#c9a03d', margin: '20px auto' }} />
            <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '600px', margin: '0 auto' }}>
              Conoce a nuestros instructores, artistas con amplia trayectoria y pasión por la enseñanza
            </p>
          </div>
          <Row>
            {profesores.map((prof, idx) => (
              <Col lg={3} md={6} key={idx} className="mb-4">
                <div style={{
                  background: '#111',
                  borderRadius: '15px',
                  overflow: 'hidden',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                  border: '1px solid rgba(201,160,61,0.2)'
                }}>
                  <div style={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    margin: '30px auto 20px',
                    border: '3px solid #c9a03d'
                  }}>
                    <img 
                      src={prof.imagen} 
                      alt={prof.nombre}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ padding: '0 20px 30px' }}>
                    <h4 style={{ color: 'white', marginBottom: '5px' }}>{prof.nombre}</h4>
                    <p style={{ color: '#c9a03d', fontSize: '0.85rem', marginBottom: '15px' }}>{prof.rol}</p>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', lineHeight: 1.6 }}>{prof.descripcion}</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '15px' }}>
                      <i className="fab fa-instagram" style={{ color: '#c9a03d', cursor: 'pointer' }}></i>
                      <i className="fab fa-facebook" style={{ color: '#c9a03d', cursor: 'pointer' }}></i>
                      <i className="fab fa-linkedin" style={{ color: '#c9a03d', cursor: 'pointer' }}></i>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* NOTICIAS */}
      <section id="noticias" style={{ padding: '100px 0', background: '#0a0a0a' }}>
        <Container>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <p style={{ color: '#c9a03d', letterSpacing: '3px', fontSize: '0.8rem' }}>ACTUALIDAD</p>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '300', color: 'white' }}>Noticias & Eventos</h2>
            <div style={{ width: '60px', height: '2px', background: '#c9a03d', margin: '20px auto' }} />
          </div>
          <Row>
            {noticias.map(noticia => (
              <Col md={4} key={noticia.id} className="mb-4">
                <div style={{
                  background: '#111',
                  borderRadius: '15px',
                  overflow: 'hidden',
                  transition: 'all 0.3s',
                  height: '100%'
                }}>
                  <img src={noticia.imagen} alt={noticia.titulo} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                  <div style={{ padding: '25px' }}>
                    <p style={{ color: '#c9a03d', fontSize: '0.75rem', marginBottom: '10px' }}>{noticia.fecha}</p>
                    <h4 style={{ color: 'white', marginBottom: '15px', fontSize: '1.1rem' }}>{noticia.titulo}</h4>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', lineHeight: 1.6 }}>{noticia.descripcion}</p>
                    <button className="btn-outline-gold" style={{ marginTop: '15px', padding: '8px 20px', fontSize: '0.8rem' }}>Leer más</button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* MODAL INSCRIPCIÓN */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton style={{ background: '#111', borderBottom: '2px solid #c9a03d' }}>
          <Modal.Title style={{ color: '#c9a03d' }}>Inscribirme a {claseSeleccionada?.nombre}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#111' }}>
          <div style={{ background: '#0a0a0a', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
            <Row>
              <Col md={6}><p><strong>📅 Horario:</strong> {claseSeleccionada?.horario}</p></Col>
              <Col md={6}><p><strong>👨‍🏫 Instructor:</strong> {claseSeleccionada?.instructor}</p></Col>
              <Col md={6}><p><strong>⏱️ Duración:</strong> {claseSeleccionada?.duracion}</p></Col>
              <Col md={6}><p><strong>💰 Precio:</strong> <span style={{ color: '#c9a03d' }}>Bs. {claseSeleccionada?.precio}</span></p></Col>
            </Row>
          </div>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#c9a03d' }}>Nombre Completo</Form.Label>
                  <Form.Control type="text" name="nombre" value={formData.nombre} onChange={handleChange} required style={{ background: '#1a1a1a', border: 'none', color: 'white' }} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#c9a03d' }}>Email</Form.Label>
                  <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required style={{ background: '#1a1a1a', border: 'none', color: 'white' }} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#c9a03d' }}>Teléfono</Form.Label>
                  <Form.Control type="tel" name="telefono" value={formData.telefono} onChange={handleChange} style={{ background: '#1a1a1a', border: 'none', color: 'white' }} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#c9a03d' }}>Edad</Form.Label>
                  <Form.Control type="number" name="edad" value={formData.edad} onChange={handleChange} style={{ background: '#1a1a1a', border: 'none', color: 'white' }} />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox"
                id="generarPDF"
                label="📄 Generar comprobante PDF de mi inscripción"
                checked={generarPDF}
                onChange={(e) => setGenerarPDF(e.target.checked)}
                style={{ color: '#c9a03d' }}
              />
            </Form.Group>

            <div className="text-end">
              <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">Cancelar</Button>
              <Button type="submit" style={{ background: '#c9a03d', border: 'none', color: '#000' }}>Confirmar Inscripción</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <style>{`
        .btn-gold {
          background: #c9a03d;
          padding: 12px 35px;
          border-radius: 30px;
          color: #000;
          text-decoration: none;
          font-weight: 600;
          letter-spacing: 1px;
          transition: all 0.3s;
          display: inline-block;
        }
        .btn-gold:hover {
          background: #d4af37;
          transform: translateY(-3px);
          color: #000;
        }
        .btn-outline-gold {
          background: transparent;
          border: 1.5px solid #c9a03d;
          padding: 12px 35px;
          border-radius: 30px;
          color: #c9a03d;
          text-decoration: none;
          font-weight: 600;
          letter-spacing: 1px;
          transition: all 0.3s;
          display: inline-block;
        }
        .btn-outline-gold:hover {
          background: #c9a03d;
          color: #000;
          transform: translateY(-3px);
        }
        .glass-card:hover, .clase-card:hover {
          transform: translateY(-10px);
          border-color: #c9a03d !important;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        section {
          animation: fadeIn 0.8s ease-out;
        }
      `}</style>
    </>
  );
}

export default Home;