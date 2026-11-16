import { autocompletarDatos, inicializarFormulario } from "./perfil-datos.js";
import { inicializarFormulario as inicializarFormularioMediosPago } from "./perfil-medios-pago.js";

const mailLogueado = localStorage.getItem("usuarioLogueado");

if (!mailLogueado) {
    window.location.href = "./login.html";
} else {
    // Datos del usuario en el menú lateral
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuarioActual = usuarios.find(u => u.correo === mailLogueado);

    const perfilNombre = document.getElementById("perfil-nombre");
    const perfilCorreo = document.getElementById("perfil-correo");

    if (perfilNombre && usuarioActual) {
        perfilNombre.textContent = usuarioActual.nombre + " " + usuarioActual.apellido;
    }
    if (perfilCorreo) perfilCorreo.textContent = mailLogueado;

    function marcarSeccionActiva(urlArchivo) {
        document.querySelectorAll(".menu-usuario [data-seccion]").forEach(boton => {
            const activa = boton.dataset.seccion === urlArchivo;
            boton.classList.toggle("activo", activa);
            if (activa) {
                boton.setAttribute("aria-current", "true");
            } else {
                boton.removeAttribute("aria-current");
            }
        });
    }

    function cargarContenido(urlArchivo) {
        const contenedorMain = document.querySelector(".c-perfil");

        marcarSeccionActiva(urlArchivo);

        fetch(urlArchivo)
            .then(res => {
                if (!res.ok) notificar("No se pudo cargar la sección!");
                return res.text();
            })
            .then(htmlSeccion => {
                contenedorMain.innerHTML = htmlSeccion;

                if (document.getElementById("formPerfil")) {
                    autocompletarDatos();
                    inicializarFormulario();
                }

                if (document.getElementById("form-medios-pago")) {
                    inicializarFormularioMediosPago();
                }
            })
    }

    window.cargarContenido = cargarContenido;

    // Al entrar se muestra directamente la sección de datos personales
    cargarContenido("perfil-datos.html");
}
