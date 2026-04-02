/**
 * RutasProtegidas.js
 * Protección de páginas según token y rol almacenado en localStorage.
 * Este script debe incluirse en todas las páginas HTML protegidas.
 * Encuentra tu Cargador — Informática II
 * Autores: Gabriel Kaakedjian, Gabriel Peña
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

    // ═══════════════════════════════════════════════════════════
    // OBTENER DATOS DE SESIÓN DEL LOCALSTORAGE
    // ═══════════════════════════════════════════════════════════
    const token    = localStorage.getItem('token');
    const rol      = localStorage.getItem('rol');
    const latitud  = localStorage.getItem('latitud');
    const longitud = localStorage.getItem('longitud');

    // ═══════════════════════════════════════════════════════════
    // COMPROBAR QUE HAY SESIÓN ACTIVA
    // Si no hay token o rol, redirigir al login
    // ═══════════════════════════════════════════════════════════
    if (!token || !rol) {
        window.location.href = '../Index.html';
        return;
    }

    // ═══════════════════════════════════════════════════════════
    // COMPROBAR QUE EL ROL TIENE ACCESO A ESTA PÁGINA
    // Se obtiene el rol permitido del atributo data-rol del body
    // Ejemplo: <body data-rol="administrador">
    // ═══════════════════════════════════════════════════════════
    const rolRequerido = document.body.getAttribute('data-rol');

    if (rolRequerido && rol !== rolRequerido) {
        // El usuario no tiene el rol necesario, redirigir según su rol
        redirigirSegunRol(rol);
        return;
    }

    // ═══════════════════════════════════════════════════════════
    // COMPROBAR QUE HAY GEOLOCALIZACIÓN (solo para Mapa.html)
    // ═══════════════════════════════════════════════════════════
    const requiereGeo = document.body.getAttribute('data-geo');

    if (requiereGeo === 'true' && (!latitud || !longitud)) {
        window.location.href = '../Index.html';
        return;
    }

    // ═══════════════════════════════════════════════════════════
    // FUNCIÓN AUXILIAR — REDIRIGIR SEGÚN ROL
    // ═══════════════════════════════════════════════════════════
    function redirigirSegunRol(rolUsuario) {
        switch (rolUsuario) {
            case 'administrador':
                window.location.href = '../html/Admin.html';
                break;
            case 'tecnico':
                window.location.href = '../html/Tecnico.html';
                break;
            default:
                window.location.href = '../html/Mapa.html';
                break;
        }
    }

    // ═══════════════════════════════════════════════════════════
    // FUNCIÓN GLOBAL — CERRAR SESIÓN
    // Disponible en todas las páginas que incluyan este script
    // ═══════════════════════════════════════════════════════════
    window.cerrarSesion = async function () {
        try {
            await fetch('http://localhost:3000/api/logout', {
                method:  'POST',
                headers: {
                    'Content-Type':  'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Error al cerrar sesión:', error.message);
        } finally {
            // Limpiar localStorage y redirigir al login
            localStorage.removeItem('token');
            localStorage.removeItem('rol');
            localStorage.removeItem('nombreUsuario');
            localStorage.removeItem('latitud');
            localStorage.removeItem('longitud');
            window.location.href = '../Index.html';
        }
    };

});