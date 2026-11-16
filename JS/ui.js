// =================================
// UTILIDADES DE INTERFAZ COMPARTIDAS
// Notificaciones (reemplazan a alert), menú móvil y helpers de formato.
// Se carga en el <head> de todas las páginas, antes que el resto de los scripts.
// =================================
(function () {
    const DURACION_TOAST = 4500;
    const CLAVE_FLASH = "aterrizarg-flash";

    // Margen para detectar el patrón "notificar y redirigir": si la página empieza a
    // cambiar justo después de un aviso, se guarda para mostrarlo en la página siguiente.
    const MARGEN_REDIRECCION = 400;
    let ultimaNotificacion = null;

    function icono(nombre, claseExtra) {
        const clase = claseExtra ? "ico " + claseExtra : "ico";
        return `<svg class="${clase}" aria-hidden="true" focusable="false"><use href="#i-${nombre}"></use></svg>`;
    }

    function inferirTipo(mensaje) {
        if (/correctamente|éxito|guardad|bienvenid|registrad|aplicado/i.test(mensaje)) return "ok";
        if (/inválid|incorrect|no se pudo|error|vencida|no coinciden|ya existe|no es válido/i.test(mensaje)) return "error";
        return "info";
    }

    function obtenerRegion() {
        let region = document.querySelector(".toast-region");
        if (!region) {
            region = document.createElement("div");
            region.className = "toast-region";
            region.setAttribute("role", "status");
            region.setAttribute("aria-live", "polite");
            document.body.appendChild(region);
        }
        return region;
    }

    function cerrarToast(toast) {
        if (!toast.isConnected || toast.classList.contains("sale")) return;
        toast.classList.add("sale");
        setTimeout(function () {
            toast.remove();
        }, 320);
    }

    function mostrarToast(mensaje, tipo) {
        const toast = document.createElement("div");
        toast.className = "toast toast-" + tipo;

        const iconoTipo = tipo === "ok" ? "check" : "info";
        toast.innerHTML = `${icono(iconoTipo)}<span class="toast-texto"></span>
            <button type="button" class="toast-cerrar" aria-label="Cerrar aviso">${icono("x")}</button>`;
        toast.querySelector(".toast-texto").textContent = mensaje;
        toast.querySelector(".toast-cerrar").addEventListener("click", function () {
            cerrarToast(toast);
        });

        obtenerRegion().appendChild(toast);
        setTimeout(function () {
            cerrarToast(toast);
        }, DURACION_TOAST);
    }

    // notificar(mensaje) tiene la misma firma que alert(), pero no bloquea la página.
    // El tipo ("ok", "error" o "info") se deduce del texto si no se indica.
    window.notificar = function (mensaje, tipo) {
        const texto = String(mensaje);
        const tipoFinal = tipo || inferirTipo(texto);
        ultimaNotificacion = { mensaje: texto, tipo: tipoFinal, hora: Date.now() };

        if (document.body) {
            mostrarToast(texto, tipoFinal);
        } else {
            document.addEventListener("DOMContentLoaded", function () {
                mostrarToast(texto, tipoFinal);
            });
        }
    };

    window.addEventListener("beforeunload", function () {
        if (ultimaNotificacion && Date.now() - ultimaNotificacion.hora < MARGEN_REDIRECCION) {
            sessionStorage.setItem(CLAVE_FLASH, JSON.stringify(ultimaNotificacion));
        }
    });

    document.addEventListener("DOMContentLoaded", function () {
        // Notificación pendiente de la página anterior (por ejemplo, tras un redireccionamiento)
        const pendiente = sessionStorage.getItem(CLAVE_FLASH);
        if (pendiente) {
            sessionStorage.removeItem(CLAVE_FLASH);
            try {
                const datos = JSON.parse(pendiente);
                if (Date.now() - datos.hora < 15000) mostrarToast(datos.mensaje, datos.tipo);
            } catch (error) {
                console.error("No se pudo leer la notificación pendiente:", error);
            }
        }

        // Menú móvil
        const botonMenu = document.querySelector(".nav-toggle");
        const menu = document.getElementById("nav-principal");
        if (botonMenu && menu) {
            const cambiarMenu = function (abrir) {
                menu.classList.toggle("abierto", abrir);
                botonMenu.setAttribute("aria-expanded", String(abrir));
                botonMenu.setAttribute("aria-label", abrir ? "Cerrar menú" : "Abrir menú");
            };

            botonMenu.addEventListener("click", function () {
                cambiarMenu(!menu.classList.contains("abierto"));
            });

            document.addEventListener("click", function (e) {
                if (!menu.contains(e.target) && !botonMenu.contains(e.target)) cambiarMenu(false);
            });

            document.addEventListener("keydown", function (e) {
                if (e.key === "Escape" && menu.classList.contains("abierto")) {
                    cambiarMenu(false);
                    botonMenu.focus();
                }
            });
        }
    });

    // =================================
    // HELPERS DE FORMATO
    // =================================
    const codigosCiudad = {
        "Buenos Aires": "BUE",
        "Madrid": "MAD",
        "Lima": "LIM",
        "Miami": "MIA",
        "Río de Janeiro": "RIO",
        "Bariloche": "BRC",
        "Mendoza": "MDZ",
        "Puerto Iguazú": "IGR"
    };

    const nombresAerolinea = {
        "AerolineasArgentinas": "Aerolíneas Argentinas",
        "Flybondi": "Flybondi"
    };

    window.ATERRIZARG = {
        icono: icono,
        codigoCiudad: function (ciudad) {
            return codigosCiudad[ciudad] || String(ciudad || "").slice(0, 3).toUpperCase();
        },
        nombreAerolinea: function (aerolinea) {
            return nombresAerolinea[aerolinea] || aerolinea;
        },
        precio: function (monto) {
            return "U$D " + monto;
        }
    };
})();
