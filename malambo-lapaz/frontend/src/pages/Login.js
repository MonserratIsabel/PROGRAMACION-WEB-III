import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Tab, Tabs } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaValue] = useState('MALAMBO2025');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registroData, setRegistroData] = useState({ nombre: '', email: '', password: '', confirmPassword: '' });
  const [fortaleza, setFortaleza] = useState('');
  const navigate = useNavigate();

  const evaluarFortaleza = (pass) => {
    let puntos = 0;
    if (pass.length >= 8) puntos++;
    if (/[A-Z]/.test(pass)) puntos++;
    if (/[a-z]/.test(pass)) puntos++;
    if (/[0-9]/.test(pass)) puntos++;
    if (/[^A-Za-z0-9]/.test(pass)) puntos++;
    
    if (puntos <= 2) return { nivel: 'débil', color: '#ff1744' };
    if (puntos <= 4) return { nivel: 'intermedia', color: '#ffa500' };
    return { nivel: 'fuerte', color: '#00c853' };
  };

  const handlePasswordChange = (e) => {
    const pass = e.target.value;
    setRegistroData({ ...registroData, password: pass });
    const resultado = evaluarFortaleza(pass);
    setFortaleza(resultado.nivel);
  };

  const handleRegistro = async () => {
    if (registroData.password !== registroData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    try {
      const res = await axios.post(`${API_URL}/auth/registro`, {
        nombre: registroData.nombre,
        email: registroData.email,
        password: registroData.password
      });
      
      alert(`✅ Registro exitoso!\nFortaleza de contraseña: ${res.data.fuerza_password}`);
      setRegistroData({ nombre: '', email: '', password: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Error en el registro');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password, captcha });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
        alert('✅ ¡Login exitoso!');
        navigate('/dashboard');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section style={{
        height: '40vh',
        backgroundImage: 'url("https://images.unsplash.com/photo-1507676184212-d2ab4e0f12a6?w=1600")',
        backgroundSize: 'cover',
        marginTop: '76px'
      }}>
        <div style={{
          background: 'rgba(0,0,0,0.7)',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '4rem', fontWeight: '300', color: 'white' }}>ACCESO</h1>
            <div style={{ width: '60px', height: '2px', background: '#c9a03d', margin: '20px auto' }} />
          </div>
        </div>
      </section>

      <Container className="my-5 py-4">
        <Row className="justify-content-center">
          <Col md={6}>
            <div style={{ background: '#111', padding: '40px', borderRadius: '20px', border: '1px solid rgba(201,160,61,0.2)' }}>
              <Tabs defaultActiveKey="login" className="mb-4">
                <Tab eventKey="login" title={<span style={{ color: '#c9a03d' }}>Iniciar Sesión</span>}>
                  {error && <Alert variant="danger">{error}</Alert>}
                  
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: '#c9a03d' }}>Email</Form.Label>
                      <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ background: '#1a1a1a', border: 'none', color: 'white' }} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: '#c9a03d' }}>Contraseña</Form.Label>
                      <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ background: '#1a1a1a', border: 'none', color: 'white' }} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: '#c9a03d' }}>CAPTCHA</Form.Label>
                      <div style={{ background: '#1a1a1a', padding: '10px', borderRadius: '10px', textAlign: 'center', marginBottom: '10px' }}>
                        <strong style={{ color: '#c9a03d', fontSize: '1.2rem' }}>{captchaValue}</strong>
                      </div>
                      <Form.Control type="text" placeholder="Escribe el código de arriba" value={captcha} onChange={(e) => setCaptcha(e.target.value)} required style={{ background: '#1a1a1a', border: 'none', color: 'white' }} />
                    </Form.Group>

                    <Button type="submit" disabled={loading} className="btn-gold w-100" style={{ padding: '12px' }}>
                      {loading ? 'Verificando...' : 'Ingresar'}
                    </Button>
                  </Form>
                </Tab>

                <Tab eventKey="registro" title={<span style={{ color: '#c9a03d' }}>Registrarse</span>}>
                  {error && <Alert variant="danger">{error}</Alert>}
                  
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: '#c9a03d' }}>Nombre Completo</Form.Label>
                      <Form.Control type="text" value={registroData.nombre} onChange={(e) => setRegistroData({ ...registroData, nombre: e.target.value })} required style={{ background: '#1a1a1a', border: 'none', color: 'white' }} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: '#c9a03d' }}>Email</Form.Label>
                      <Form.Control type="email" value={registroData.email} onChange={(e) => setRegistroData({ ...registroData, email: e.target.value })} required style={{ background: '#1a1a1a', border: 'none', color: 'white' }} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: '#c9a03d' }}>Contraseña</Form.Label>
                      <Form.Control type="password" value={registroData.password} onChange={handlePasswordChange} required style={{ background: '#1a1a1a', border: 'none', color: 'white' }} />
                      {fortaleza && (
                        <div className="mt-2">
                          <span>Fortaleza: </span>
                          <span style={{ color: evaluarFortaleza(registroData.password).color, fontWeight: 'bold' }}>{fortaleza}</span>
                          <div style={{ height: '5px', background: '#333', borderRadius: '5px', marginTop: '5px' }}>
                            <div style={{ width: fortaleza === 'débil' ? '33%' : fortaleza === 'intermedia' ? '66%' : '100%', height: '5px', background: evaluarFortaleza(registroData.password).color, borderRadius: '5px' }} />
                          </div>
                        </div>
                      )}
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: '#c9a03d' }}>Confirmar Contraseña</Form.Label>
                      <Form.Control type="password" value={registroData.confirmPassword} onChange={(e) => setRegistroData({ ...registroData, confirmPassword: e.target.value })} required style={{ background: '#1a1a1a', border: 'none', color: 'white' }} />
                    </Form.Group>

                    <Button onClick={handleRegistro} className="btn-gold w-100" style={{ padding: '12px' }}>
                      Registrarse
                    </Button>
                  </Form>
                </Tab>
              </Tabs>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Login;