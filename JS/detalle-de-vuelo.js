const avionData = [
    { fila: 1, izq: ["1A", "1B", "1C", "1D"], pasillo: "P", der: ["1E", "1F", "1G", "1H"] },
    { fila: 2, izq: ["2A", "2B", "2C", "2D"], pasillo: "A", der: ["2E", "2F", "2G", "2H"] },
    { fila: 3, izq: ["3A", "3B", "3C", "3D"], pasillo: "S", der: ["3E", "3F", "3G", "3H"] },
    { fila: 4, izq: ["4A", "4B", "4C", "4D"], pasillo: "I", der: ["4E", "4F", "4G", "4H"] },
    { fila: 5, izq: ["5A", "5B", "5C", "5D"], pasillo: "L", der: ["5E", "5F", "5G", "5H"] },
    { fila: 6, izq: ["6A", "6B", "6C", "6D"], pasillo: "L", der: ["6E", "6F", "6G", "6H"] },
    { fila: 7, izq: ["7A", "7B", "7C", "7D"], pasillo: "O", der: ["7E", "7F", "7G", "7H"] }
];

const container = document.querySelector(".asiento-container");

const vuelo = JSON.parse(localStorage.getItem("vueloSeleccionado"));

if (!vuelo) {
    notificar("Debe seleccionar un vuelo primero.");
    window.location.href = "./busqueda.html";
} else {
    const claveAsientos = "asientos_" + vuelo.numeroVuelo;

    const asientosOcupados = JSON.parse(localStorage.getItem(claveAsientos)) || [];

    let asientosSeleccionados = JSON.parse(localStorage.getItem("asientosSeleccionados")) || [];

    function obtenerCantidadPasajeros() {
        const busqueda = JSON.parse(localStorage.getItem("busqueda"));

        return busqueda?.pasajeros || 1;
    }

    function renderAvion() {
        avionData.forEach(function (fila) {
            const numero = document.createElement("div");

            numero.className = "numero";
            numero.textContent = fila.fila;

            container.appendChild(numero);

            fila.izq.forEach(crearAsiento);

            const pasillo = document.createElement("div");

            pasillo.className = "pasillo";
            pasillo.textContent = fila.pasillo;

            container.appendChild(pasillo);

            fila.der.forEach(crearAsiento);
        });
    }

    function continuarCheckout() {
        const asientos = JSON.parse(localStorage.getItem("asientosSeleccionados")) || [];

        const cantidadPasajeros = obtenerCantidadPasajeros();

        if (asientos.length !== cantidadPasajeros) {
            notificar("Debe seleccionar " + cantidadPasajeros + " asiento(s)");
            return;
        }

        window.location.href = "./checkout.html";
    }

    // El botón "Continuar" llama a esta función desde el atributo onclick
    window.continuarCheckout = continuarCheckout;

    // =========================
    // RESUMEN EN VIVO
    // Muestra los asientos elegidos y cuántos faltan.
    // =========================

    function actualizarResumenAsientos() {
        const cantidadPasajeros = obtenerCantidadPasajeros();
        const elegidos = document.getElementById("asientos-elegidos");
        const ayuda = document.getElementById("ayuda-asientos");

        if (elegidos) {
            elegidos.textContent =
                asientosSeleccionados.length > 0
                    ? asientosSeleccionados.join(", ")
                    : "—";
        }

        if (ayuda) {
            const faltan = cantidadPasajeros - asientosSeleccionados.length;

            if (faltan > 0) {
                ayuda.textContent =
                    "Elegí " + faltan + (faltan === 1 ? " asiento" : " asientos") +
                    (asientosSeleccionados.length > 0 ? " más." : ".") +
                    " Tocá un asiento disponible para seleccionarlo.";
                ayuda.classList.remove("completo");
            } else {
                ayuda.textContent = "¡Listo! Ya elegiste todos tus asientos.";
                ayuda.classList.add("completo");
            }
        }
    }

    function marcarAsiento(svg, id, seleccionado) {
        svg.classList.toggle("seleccionado", seleccionado);
        svg.classList.toggle("disponible", !seleccionado);
        svg.setAttribute("aria-pressed", String(seleccionado));
        svg.setAttribute(
            "aria-label",
            "Asiento " + id + (seleccionado ? ", seleccionado" : ", disponible")
        );
    }

    function crearAsiento(id) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

        svg.setAttribute("viewBox", "0 0 24 24");

        svg.innerHTML =
            `<title>Asiento ${id}</title><path d="M4,18v3h3v-3h10v3h3v-6H4V18z M19,10h3v3h-3V10z M2,10h3v3H2V10z M17,13H7V5c0-1.1,0.9-2,2-2h6c1.1,0,2,0.9,2,2V13z"/>`;

        svg.classList.add("svg");

        if (asientosOcupados.includes(id)) {
            svg.classList.add("ocupado");
            svg.setAttribute("role", "img");
            svg.setAttribute("aria-label", "Asiento " + id + ", ocupado");
        } else {
            svg.setAttribute("role", "button");
            svg.setAttribute("tabindex", "0");

            marcarAsiento(svg, id, asientosSeleccionados.includes(id));

            function alternarAsiento() {
                const cantidadPasajeros = obtenerCantidadPasajeros();

                // Si ya estaba seleccionado
                if (asientosSeleccionados.includes(id)) {
                    asientosSeleccionados = asientosSeleccionados.filter(function (asiento) {
                        return asiento !== id;
                    });

                    localStorage.setItem("asientosSeleccionados", JSON.stringify(asientosSeleccionados));

                    marcarAsiento(svg, id, false);
                    actualizarResumenAsientos();

                    return;
                }

                // Control de cantidad máxima
                if (asientosSeleccionados.length >= cantidadPasajeros) {
                    notificar("Solo puede seleccionar " + cantidadPasajeros + " asiento(s)");

                    return;
                }

                // Seleccionar asiento
                asientosSeleccionados.push(id);

                localStorage.setItem("asientosSeleccionados", JSON.stringify(asientosSeleccionados));

                marcarAsiento(svg, id, true);
                actualizarResumenAsientos();
            }

            svg.addEventListener("click", alternarAsiento);

            // Permite elegir asientos con el teclado
            svg.addEventListener("keydown", function (e) {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    alternarAsiento();
                }
            });
        }

        container.appendChild(svg);
    }

    renderAvion();
    actualizarResumenAsientos();

    // =========================
    // DATOS DEL VUELO
    // =========================

    const cantidadPasajeros = obtenerCantidadPasajeros();

    document.getElementById("ruta-vuelo").textContent = vuelo.origen + " → " + vuelo.destino;

    document.getElementById("horario-vuelo").textContent = vuelo.horarioSalida + " - " + vuelo.horarioLlegada;

    document.getElementById("tipo-vuelo").textContent = ATERRIZARG.nombreAerolinea(vuelo.aerolinea);

    const fechaVuelo = document.getElementById("fecha-vuelo");
    if (fechaVuelo) fechaVuelo.textContent = vuelo.fechaSalida;

    const detallePrecio = document.getElementById("detalle-precio");
    if (detallePrecio) {
        detallePrecio.textContent =
            "U$D " + vuelo.precio + " × " + cantidadPasajeros +
            (cantidadPasajeros === 1 ? " pasajero" : " pasajeros");
    }

    document.getElementById("precio-vuelo").textContent = "Total: U$D " + vuelo.precio * cantidadPasajeros;
}
