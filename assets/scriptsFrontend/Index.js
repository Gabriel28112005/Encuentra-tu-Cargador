// Lógica de la pantalla de login y gestión de geolocalización.

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  const formularioLogin        = document.getElementById('formularioLogin');
  const entradaNombreUsuario   = document.getElementById('nombreUsuario');
  const entradaContrasena      = document.getElementById('contrasena');
  const botonAcceder           = document.getElementById('botonAcceder');
  const textoBoton             = document.getElementById('textoBoton');
  const cargadorBoton          = document.getElementById('cargadorBoton');
  const alertaError            = document.getElementById('alertaError');
  const textoError             = document.getElementById('textoError');
  const errorNombreUsuario     = document.getElementById('errorNombreUsuario');
  const errorContrasena        = document.getElementById('errorContrasena');
  const botonMostrarContrasena = document.getElementById('botonMostrarContrasena');

  // Modal de geolocalización
  const fondoModalGeo   = document.getElementById('fondoModalGeo');
  const panelPermiso    = document.getElementById('panelPermiso');
  const panelError      = document.getElementById('panelError');
  const botonAceptarGeo = document.getElementById('botonAceptarGeo');
  const botonDenegarGeo = document.getElementById('botonDenegarGeo');
  const botonReintentar = document.getElementById('botonReintentar');

  /**
   * Muestra u oculta un elemento usando la clase oculto.
   * @param {HTMLElement} elemento - Elemento a mostrar/ocultar
   * @param {boolean} visible - true para mostrar, false para ocultar
   */

  function alternarVisibilidad(elemento, visible) {
    if (visible) {
      elemento.classList.remove('oculto');
    } else {
      elemento.classList.add('oculto');
    }
  }

  /**
   * Marca un campo como inválido mostrando su mensaje de error.
   * @param {HTMLInputElement} entrada - Campo de entrada
   * @param {HTMLElement} elementoError - Elemento de mensaje de error
   */

  function marcarCampoInvalido(entrada, elementoError) {
    entrada.classList.add('campo-invalido');
    alternarVisibilidad(elementoError, true);
  }

  /**
   * Limpia el estado de error de un campo.
   * @param {HTMLInputElement} entrada - Campo de entrada
   * @param {HTMLElement} elementoError - Elemento de mensaje de error
   */

  function limpiarCampoError(entrada, elementoError) {
    entrada.classList.remove('campo-invalido');
    alternarVisibilidad(elementoError, false);
  }

  /**
   * Muestra el mensaje de error global del formulario.
   * @param {string} mensaje - Texto del error a mostrar
   */

  function mostrarAlertaError(mensaje) {
    textoError.textContent = mensaje;
    alternarVisibilidad(alertaError, true);
  }

  /**
   * Oculta el mensaje de error global del formulario.
   */

  function ocultarAlertaError() {
    alternarVisibilidad(alertaError, false);
  }

  /**
   * Activa o desactiva el estado de carga del botón de login.
   * @param {boolean} cargando - true para mostrar spinner
   */

  function establecerEstadoCarga(cargando) {
    botonAcceder.disabled = cargando;
    alternarVisibilidad(textoBoton, !cargando);
    alternarVisibilidad(cargadorBoton, cargando);
  }

  /**
   * Obtiene el userAgent del navegador para registrar el tipo de dispositivo.
   * Compatible con Chrome, Firefox, Safari y Edge.
   * @returns {string} - Cadena descriptiva del dispositivo
   */

  function obtenerTipoDispositivo() {
    return navigator.userAgent || 'Desconocido';
  }

  // Validación del formulario

  /**
   * Valida los campos del formulario de login.
   * @returns {boolean} - true si el formulario es válido
   */

  function validarFormulario() {
    let formularioValido = true;

    if (entradaNombreUsuario.value.trim() === '') {
      marcarCampoInvalido(entradaNombreUsuario, errorNombreUsuario);
      formularioValido = false;
    } else {
      limpiarCampoError(entradaNombreUsuario, errorNombreUsuario);
    }

    if (entradaContrasena.value.trim() === '') {
      marcarCampoInvalido(entradaContrasena, errorContrasena);
      formularioValido = false;
    } else {
      limpiarCampoError(entradaContrasena, errorContrasena);
    }

    return formularioValido;
  }

  // Mostrar/ocultar contraseña
  const iconoOjoAbierto = document.getElementById('iconoOjoAbierto');
  const iconoOjoTachado = document.getElementById('iconoOjoTachado');

  botonMostrarContrasena.addEventListener('click', (evento) => {
    evento.preventDefault();
    evento.stopPropagation();

    const contrasenaOculta = entradaContrasena.type === 'password';

    // Si estaba oculta, mostrarla; si estaba visible, ocultarla
    entradaContrasena.type = contrasenaOculta ? 'text' : 'password';

    // Cuando la contraseña es visible se muestra el ojo tachado. Cuando la contraseña está oculta se muestra el ojo abierto
    alternarVisibilidad(iconoOjoAbierto, !contrasenaOculta);
    alternarVisibilidad(iconoOjoTachado, contrasenaOculta);

    botonMostrarContrasena.setAttribute(
      'aria-label',
      contrasenaOculta ? 'Ocultar contraseña' : 'Mostrar contraseña'
    );
  });

  //Limpiar errores al escribir en los campos del formulario:
  entradaNombreUsuario.addEventListener('input', () => {
    limpiarCampoError(entradaNombreUsuario, errorNombreUsuario);
    ocultarAlertaError();
  });

  entradaContrasena.addEventListener('input', () => {
    limpiarCampoError(entradaContrasena, errorContrasena);
    ocultarAlertaError();
  });

  // Envio del formulario del login
  formularioLogin.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    ocultarAlertaError();

    if (!validarFormulario()) return;

    establecerEstadoCarga(true);

    const credenciales = {
      nombreUsuario:   entradaNombreUsuario.value.trim(),
      contrasena:      entradaContrasena.value.trim(),
      tipoDispositivo: obtenerTipoDispositivo()
    };

    try {
      const respuesta = await fetch('http://localhost:3000/api/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(credenciales)
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        mostrarAlertaError(datos.mensaje || 'Usuario o contraseña incorrectos.');
        establecerEstadoCarga(false);
        return;
      }

      // Login correcto: guardar datos de sesión en localStorage
      localStorage.setItem('token',         datos.token);
      localStorage.setItem('rol',           datos.rol);
      localStorage.setItem('nombreUsuario', datos.nombreUsuario);

      establecerEstadoCarga(false);

      /*
        El modal de geolocalización solo se muestra para el rol usuario ya que es el único que necesita el mapa. 
        El administrador y el técnico se redirigen directamente a su panel sin necesidad de ubicación.
      */

      if (datos.rol === 'usuario') {
        mostrarModalGeolocalizacion();
      } else {
        redirigirSegunRol();
      }

    } catch (error) {
      mostrarAlertaError('No se pudo conectar con el servidor. Inténtalo de nuevo.');
      establecerEstadoCarga(false);
    }
  });

  //Modal de geolocalización

  // Muestra el modal de solicitud de geolocalización.
  function mostrarModalGeolocalizacion() {
    alternarVisibilidad(panelPermiso, true);
    alternarVisibilidad(panelError, false);
    alternarVisibilidad(fondoModalGeo, true);
  }

  // Solicita la geolocalización al navegador.
  function solicitarGeolocalizacion() {
    if (!navigator.geolocation) {
      mostrarErrorGeolocalizacion();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        const { latitude, longitude } = posicion.coords;
        localStorage.setItem('latitud',  latitude);
        localStorage.setItem('longitud', longitude);
        redirigirSegunRol();
      },
      () => {
        mostrarErrorGeolocalizacion();
      },
      {
        enableHighAccuracy: true,
        timeout:            10000,
        maximumAge:         0
      }
    );
  }

  // Muestra el panel de error cuando se deniega la ubicación.
  function mostrarErrorGeolocalizacion() {
    alternarVisibilidad(panelPermiso, false);
    alternarVisibilidad(panelError, true);
  }

  // Redirige al usuario según su rol almacenado en localStorage.
  function redirigirSegunRol() {
    const rol = localStorage.getItem('rol');
    switch (rol) {
      case 'administrador':
        window.location.href = 'html/Admin.html';
        break;
      case 'tecnico':
        window.location.href = 'html/Tecnico.html';
        break;
      default:
        window.location.href = 'html/Mapa.html';
        break;
    }
  }

  // Eventos del modal
  botonAceptarGeo.addEventListener('click', solicitarGeolocalizacion);

  botonDenegarGeo.addEventListener('click', mostrarErrorGeolocalizacion);

  botonReintentar.addEventListener('click', () => {
    alternarVisibilidad(panelPermiso, true);
    alternarVisibilidad(panelError, false);
  });

  // 

  /*
  Comprobación de sesión activa al cargar la página:
    - Para los roles "administrador" y "tecnico" se requiere tener el token
    - Para el rol "usuario" se necesita, además del token, la geolocalización
  
  */

  const token    = localStorage.getItem('token');
  const rol      = localStorage.getItem('rol');
  const latitud  = localStorage.getItem('latitud');
  const longitud = localStorage.getItem('longitud');

  if (token && rol) {
    if (rol === 'usuario') {
      if (latitud && longitud) {
        redirigirSegunRol();
      }
    } else {
      redirigirSegunRol();
    }
  }

}); // Fin DOMContentLoaded