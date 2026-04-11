 // Gestión de notificaciones en tiempo real mediante WebSockets. Se incluye en todas las páginas que necesiten recibir notificaciones.

'use strict';

document.addEventListener('DOMContentLoaded', () => {

    const rol           = localStorage.getItem('rol');
    const nombreUsuario = localStorage.getItem('nombreUsuario');

    if (!rol || !nombreUsuario) return;

    // Conexión WebSocket: Se conecta al servidor pasando el rol como parámetro para que el servidor registre al cliente en el grupo correcto.
    const ws = new WebSocket(`ws://localhost:3000?rol=${rol}`);

    ws.addEventListener('open', () => {
        console.log('WebSocket conectado.');
    });

    ws.addEventListener('message', (evento) => {
        try {
            const datos = JSON.parse(evento.data);
            manejarNotificacion(datos);
        } catch (error) {
            console.error('Error al procesar notificación:', error.message);
        }
    });

    ws.addEventListener('close', () => {
        console.log('WebSocket desconectado.');
    });

    ws.addEventListener('error', (error) => {
        console.error('Error en WebSocket:', error);
    });

    // Manejo de notificación recibida 
    function manejarNotificacion(datos) {
        if (datos.tipo === 'incidencia') {
            mostrarToast(
                `Incidencia en ${datos.nombreCargador}`,
                `${datos.mensaje} - Reportado por ${datos.reportadoPor}`,
                'advertencia'
            );
        }
    }

    // Muestra de un mensaje emergente de notificación
       
    function mostrarToast(titulo, mensaje, tipo) {
        let contenedor = document.getElementById('contenedorToasts');
        if (!contenedor) {
            contenedor = document.createElement('div');
            contenedor.id = 'contenedorToasts';
            contenedor.style.cssText = `
                position: fixed;
                top: 70px;
                right: 16px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 8px;
                max-width: 320px;
            `;
            document.body.appendChild(contenedor);
        }

        const toast = document.createElement('div');
        const colorFondo  = tipo === 'advertencia' ? '#FAEEDA' : '#EAF3DE';
        const colorBorde  = tipo === 'advertencia' ? '#854F0B' : '#3B6D11';
        const colorTitulo = tipo === 'advertencia' ? '#633806' : '#27500A';
        const colorTexto  = tipo === 'advertencia' ? '#854F0B' : '#3B6D11';

        toast.style.cssText = `
            background-color: ${colorFondo};
            border: 1px solid ${colorBorde};
            border-radius: 10px;
            padding: 12px 14px;
            font-family: 'Outfit', sans-serif;
            animation: entradaToast 0.3s ease;
        `;

        toast.innerHTML = `
            <div style="font-size:13px;font-weight:600;color:${colorTitulo};margin-bottom:4px;">
                ${titulo}
            </div>
            <div style="font-size:12px;color:${colorTexto};line-height:1.5;">
                ${mensaje}
            </div>
        `;

        if (!document.getElementById('estilosToast')) {
            const estilo = document.createElement('style');
            estilo.id = 'estilosToast';
            estilo.textContent = `
                @keyframes entradaToast {
                    from { opacity: 0; transform: translateX(20px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
            `;
            document.head.appendChild(estilo);
        }

        contenedor.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity    = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    window.mostrarToast = mostrarToast;

});