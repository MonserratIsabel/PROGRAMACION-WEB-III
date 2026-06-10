import React, { useState, useEffect } from 'react';
import { Container, Table, Spinner } from 'react-bootstrap';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

function Logs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }
        
        axios.get(`${API_URL}/logs`, {
            headers: { Authorization: token }
        })
        .then(res => {
            setLogs(res.data);
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <div className="text-center mt-5">Cargando...</div>;
    }

    return (
        <Container className="my-5" style={{ marginTop: '100px' }}>
            <h2 className="text-center mb-4" style={{ color: '#c9a03d' }}>
                📋 Registro de Accesos
            </h2>
            <Table striped bordered hover variant="dark">
                <thead>
                    <tr style={{ background: '#c9a03d', color: '#000' }}>
                        <th>Email</th>
                        <th>Evento</th>
                        <th>IP</th>
                        <th>Navegador</th>
                        <th>Fecha y Hora</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map(log => (
                        <tr key={log.id}>
                            <td>{log.usuario_email}</td>
                            <td>
                                {log.evento === 'ingreso' && '🟢 Ingreso'}
                                {log.evento === 'salida' && '🔴 Salida'}
                                {log.evento === 'intento_fallido' && '🟡 Intento fallido'}
                            </td>
                            <td>{log.ip || '-'}</td>
                            <td>{log.browser || '-'}</td>
                            <td>{new Date(log.fecha_hora).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
}

export default Logs;