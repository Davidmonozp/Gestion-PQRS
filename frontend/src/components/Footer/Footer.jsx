import React from 'react';
import { Link } from 'react-router-dom'; 
import "./Footer.css";


// Asumiendo que la imagen está en la carpeta 'public'
import logo from '/logo-2.png';

export const Footer = () => {
    return (
        <>
            <div className="footer" id="footer">
                <div className="mapa_sitio">
                    <h4 id="mapa-de-sitio">Mapa del sitio</h4>
                    <ul className='lista'>
                        <li><Link to="/">Inicio</Link></li>
                        <li><Link to="/nosotros-quienes-somos">Conócenos</Link></li>
                        <li><Link to="/servicios_passusIPS">Passus IPS</Link></li>
                        <li><Link to="/servicios_passus_divertido">Passus Bienestar</Link></li>
                        <li><Link to="/derechos-deberes">Derechos y deberes</Link></li>
                        <li><Link to="/preguntas-frecuentes">Preguntas frecuentes</Link></li>
                        <li><Link to="/trabaja-nosotros">Trabaja con nosotros</Link></li>
                        <li><Link to="/contactanos">Contáctenos</Link></li>
                        <li><img src={logo} className="img-logo" alt="Logo PQRS" /></li>
                    </ul>
                </div>

                <div className="servicios">
                    <h4>Servicios</h4>
                    <ul className='lista'>
                        <li><Link to="/servicios_passusIPS">Passus IPS</Link></li>
                        <li><Link to="/servicios_passus_divertido">Passus Bienestar</Link></li>
                        <li style={{ marginTop: '20px' }}>
                            <p className="footer_passus">Somos una entidad especializada en salud y bienestar, enfocada en rehabilitación terapéutica integral, con un equipo altamente calificado y espacios diseñados para brindar atención de calidad.</p>
                        </li>
                    </ul>
                </div>

                <div className="sedes">
                    <h4>Sedes</h4>
                    <ul className='lista'>
                        <li><Link to="/sede-bogota-cedritos">Bogotá Norte</Link></li>
                        <li><Link to="/sede-bogota-veraguas">Bogotá Centro</Link></li>
                        <li><Link to="/sede-bogota-americas-1">Bogotá Sur - Rehabilitación</Link></li>
                        <li><Link to="/sede-bogota-americas-2">Bogotá Sur - Hidroterapia</Link></li>
                        <li><Link to="/sede-chia">Chía - Cundinamarca</Link></li>
                        <li><Link to="/sede-florencia">Florencia - Caquetá</Link></li>
                        <li><Link to="/sede-ibague">Ibagué - Tolima</Link></li>
                    </ul>
                </div>

                <div className="contactanos-redes">
                    <h4>Contáctanos</h4>
                    <ul>
                        <li><Link to="/contactanos"><i className="fas fa-phone"></i></Link></li>
                        <li><Link to="/contactanos"><i className="fab fa-whatsapp"></i></Link></li>
                        <li><Link to="/contactanos"><i className="fas fa-envelope"></i></Link></li>
                    </ul>

                    <h4>Redes Sociales</h4>
                    <ul>
                        <li><a href="https://www.instagram.com/passusipscolombia/" target="_blank" rel="noopener noreferrer"><i className="fab fa-tiktok"></i></a></li>
                        <li><a href="https://www.instagram.com/passusipscolombia/" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a></li>
                        <li><a href="https://www.facebook.com/passuscolombia/" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook"></i></a></li>
                        <li><a href="https://www.youtube.com/@passuscolombia1519" target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube"></i></a></li>
                        <li><a href="https://www.linkedin.com/in/passuscolombia/" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin"></i></a></li>
                    </ul>
                    <img src="./logo_supersalud.png     " className="img-super-salud" alt="Superintendencia Nacional de Salud" />
                </div>
            </div>

            <div className="copy" id="copy">
                <p id="copy_footer">
                    &copy; 2019 - {new Date().getFullYear()} Todos los derechos reservados |
                    <Link to="/estados-financieros" className="link-estados-financieros">Estados Financieros</Link>
                </p>
            </div>
        </>
    );
};