import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

// Asumiendo que la imagen está en la carpeta 'public'
import logo from "/logo-2.png";

export const Footer = () => {
  return (
    <>
      <div className="footer" id="footer">
        <div className="mapa_sitio">
          <h4 id="mapa-de-sitio">Mapa del sitio</h4>
          <ul className="lista">
            <li>
              <a
                href="https://passusips.com/index"
                target="_blank"
                rel="noopener noreferrer"
              >
                Inicio
              </a>
            </li>
            <li>
              <a
                href="https://passusips.com/nosotros-quienes-somos"
                target="_blank"
                rel="noopener noreferrer"
              >
                Conócenos
              </a>
            </li>
            <li>
              <a
                href="https://passusips.com/servicios_passusIPS"
                target="_blank"
                rel="noopener noreferrer"
              >
                Passus IPS
              </a>
            </li>
            <li>
              <a
                href="https://passusips.com/servicios_passus_divertido"
                target="_blank"
                rel="noopener noreferrer"
              >
                Passus Bienestar
              </a>
            </li>
            <li>
              <a
                href="https://passusips.com/derechos-deberes"
                target="_blank"
                rel="noopener noreferrer"
              >
                Derechos y deberes
              </a>
            </li>
            <li>
              <a
                href="https://passusips.com/preguntas-frecuentes"
                target="_blank"
                rel="noopener noreferrer"
              >
                Preguntas frecuentes
              </a>
            </li>
            <li>
              <a
                href="https://passusips.com/trabaja-nosotros"
                target="_blank"
                rel="noopener noreferrer"
              >
                Trabaja con nosotros
              </a>
            </li>
            <li>
              <a
                href="https://passusips.com/contactanos"
                target="_blank"
                rel="noopener noreferrer"
              >
                Contáctenos
              </a>
            </li>
            <li>
              <img src={logo} className="img-logo" alt="Logo PQRS" />
            </li>
          </ul>
        </div>

        <div className="servicios">
          <h4>Servicios</h4>
          <ul className="lista">
            <li>
              <a
                href="https://passusips.com/servicios_passusIPS"
                target="_blank"
                rel="noopener noreferrer"
              >
                Passus IPS
              </a>
            </li>
            <li>
              <a
                href="https://passusips.com/servicios_passus_divertido"
                target="_blank"
                rel="noopener noreferrer"
              >
                Passus Bienestar
              </a>
            </li>
            <li style={{ marginTop: "20px" }}>
              <p className="footer_passus">
                Somos una entidad especializada en salud y bienestar, enfocada
                en rehabilitación terapéutica integral, con un equipo altamente
                calificado y espacios diseñados para brindar atención de
                calidad.
              </p>
            </li>
          </ul>
        </div>

        <div className="sedes">
          <h4>Sedes</h4>
          <ul className="lista">
            <li>
              <a
                href="https://passusips.com/sede-bogota-cedritos"
                target="_blank"
                rel="noopener noreferrer"
              >
                Bogotá Norte
              </a>
            </li>
            <li>
              <a
                href="https://passusips.com/sede-bogota-veraguas"
                target="_blank"
                rel="noopener noreferrer"
              >
                Bogotá Centro
              </a>
            </li>
            <li>
              <a
                href="https://passusips.com/sede-bogota-americas-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                Bogotá Sur - Rehabilitación
              </a>
            </li>
            <li>
              <a
                href="https://passusips.com/sede-bogota-americas-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                Bogotá Sur - Hidroterapia
              </a>
            </li>
            <li>
              <a
                href="https://passusips.com/sede-chia"
                target="_blank"
                rel="noopener noreferrer"
              >
                Chía - Cundinamarca
              </a>
            </li>
            <li>
              <a
                href="https://passusips.com/sede-florencia"
                target="_blank"
                rel="noopener noreferrer"
              >
                Florencia - Caquetá
              </a>
            </li>
            <li>
              <a
                href="https://passusips.com/sede-ibague"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ibagué - Tolima
              </a>
            </li>
          </ul>
        </div>

        <div className="contactanos-redes">
          <h4>Contáctanos</h4>
          <ul>
            <li>
              <a
                href="https://passusips.com/contactanos"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fas fa-phone"></i>
              </a>
            </li>
            <li>
              <Link
                href="https://passusips.com/contactanos"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-whatsapp"></i>
              </Link>
            </li>
            <li>
              <Link
                href="https://passusips.com/contactanos"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fas fa-envelope"></i>
              </Link>
            </li>
          </ul>

          <h4>Redes Sociales</h4>
          <ul>
            <li>
              <a
                href="https://www.instagram.com/passusipscolombia/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-tiktok"></i>
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/passusipscolombia/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-instagram"></i>
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/passuscolombia/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-facebook"></i>
              </a>
            </li>
            <li>
              <a
                href="https://www.youtube.com/@passuscolombia1519"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-youtube"></i>
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/in/passuscolombia/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-linkedin"></i>
              </a>
            </li>
          </ul>
          <img
            src="./logo_supersalud.png     "
            className="img-super-salud"
            alt="Superintendencia Nacional de Salud"
          />
        </div>
      </div>

      <div className="copy" id="copy">
        <p id="copy_footer">
          &copy; 2019 - {new Date().getFullYear()} Todos los derechos reservados
          |
          <a
            href="https://passusips.com/estados-financieros"
            target="_blank"
            rel="noopener noreferrer"
            className="link-estados-financieros"
          >
            Estados Financieros
          </a>
        </p>
      </div>
    </>
  );
};
