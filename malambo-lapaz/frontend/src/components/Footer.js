import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaInstagram, FaFacebook, FaWhatsapp } from 'react-icons/fa';

function Footer() {
  return (
    <footer style={{
      background: '#0a0a0a',
      padding: '50px 0 30px',
      marginTop: '60px',
      borderTop: '1px solid rgba(255,23,68,0.3)'
    }}>
      <Container>
        <Row>
          <Col md={4}>
            <h3 style={{ color: '#ff1744' }}>Malambo La Paz</h3>
            <p>Pasión, fuerza y tradición argentina desde 1995.</p>
          </Col>
          <Col md={4}>
            <h4>Contacto</h4>
            <p>Av. Corrientes 1234, CABA<br />info@malambolapaz.com</p>
          </Col>
          <Col md={4}>
            <h4>Seguinos</h4>
            <FaInstagram size={30} style={{ margin: '0 10px' }} />
            <FaFacebook size={30} style={{ margin: '0 10px' }} />
            <FaWhatsapp size={30} style={{ margin: '0 10px' }} />
          </Col>
        </Row>
        <hr />
        <p className="text-center">&copy; 2025 Malambo La Paz</p>
      </Container>
    </footer>
  );
}

export default Footer;