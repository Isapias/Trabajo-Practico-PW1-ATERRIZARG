// =================================
// CARGA DINÁMICA DE DESTINOS
// =================================
const destinos = [
    "Madrid",
    "Lima",
    "Miami",
    "Río de Janeiro",
    "Bariloche",
    "Mendoza",
    "Puerto Iguazú"
];

const selectDestino = document.getElementById("destino");

destinos.forEach(function (destino) {
    const option = document.createElement("option");
    option.value = destino;
    option.textContent = destino;
    selectDestino.appendChild(option);
});

// =================================
// VALIDACIÓN Y ENVÍO DEL FORMULARIO
// =================================
const formulario = document.querySelector(".buscador");

formulario.addEventListener("submit", function (e) {
    // 1. Captura de valores
    const destino = document.getElementById("destino").value;
    const pasajerosInput = document.getElementById("pasajeros").value;
    const clase = document.getElementById("clase").value;

    // Convertimos a número entero para validar correctamente
    const cantidadPasajeros = parseInt(pasajerosInput, 10);

    // 2. Validación de Destino
    if (destino === "") {
        notificar("Por favor, seleccione un destino válido para su vuelo.");
        selectDestino.focus();
        e.preventDefault();
        return;
    }

    // 3. Validación de Pasajeros
    // Verifica si está vacío (isNaN), si es menor a 1, o si pusieron decimales
    if (isNaN(cantidadPasajeros) || cantidadPasajeros < 1 || pasajerosInput.includes('.')) {
        notificar("Por favor, ingrese un número válido de pasajeros (mínimo 1).");
        document.getElementById("pasajeros").focus();
        e.preventDefault();
        return;
    }

    // 4. Validación de Clase
    if (clase === "") {
        notificar("Por favor, seleccione la clase en la que desea viajar.");
        document.getElementById("clase").focus();
        e.preventDefault();
        return;
    }

    // 5. Creación del objeto de búsqueda si todo está OK
    const busqueda = {
        origen: "Buenos Aires",
        destino: destino,
        pasajeros: cantidadPasajeros, // Guardado como número puro, no texto
        clase: clase
    };

    // 6. Almacenamiento
    localStorage.setItem("busqueda", JSON.stringify(busqueda));
    localStorage.removeItem("asientosSeleccionados");
});

// =================================
// DESTINOS POPULARES
// Tarjetas con foto y precio mínimo: al tocarlas se completa el buscador.
// =================================
const imagenesDestinos = {
    "Madrid": "./images/madrid.jpg",
    "Lima": "./images/lima.jpg",
    "Miami": "./images/miami.jpg",
    "Río de Janeiro": "./images/rio-de-janeiro.jpg",
    "Bariloche": "./images/bariloche.png",
    "Mendoza": "./images/mendoza.jpg",
    "Puerto Iguazú": "./images/puerto-iguazu.jpg"
};

const contenedorDestinos = document.getElementById("destinos-populares");

if (contenedorDestinos && typeof vuelos !== "undefined") {
    destinos.forEach(function (destino) {
        const preciosDelDestino = vuelos
            .filter(function (vuelo) {
                return vuelo.destino === destino;
            })
            .map(function (vuelo) {
                return vuelo.precio;
            });

        if (preciosDelDestino.length === 0) return;

        const precioMinimo = Math.min.apply(null, preciosDelDestino);

        const card = document.createElement("button");
        card.type = "button";
        card.className = "destino-card";
        card.setAttribute("aria-label", "Buscar vuelos a " + destino + ", desde U$D " + precioMinimo);
        card.innerHTML = `
            <img src="${imagenesDestinos[destino]}" alt="" loading="lazy">
            <span class="destino-info">
                <span class="destino-nombre">${destino}</span>
                <span class="destino-precio">desde <strong class="mono">U$D ${precioMinimo}</strong></span>
            </span>
            <span class="destino-flecha">${ATERRIZARG.icono("arrow-right")}</span>
        `;

        card.addEventListener("click", function () {
            selectDestino.value = destino;
            formulario.scrollIntoView({ behavior: "smooth", block: "center" });
            formulario.classList.remove("resaltado");
            // Fuerza el reinicio de la animación si se elige otro destino
            void formulario.offsetWidth;
            formulario.classList.add("resaltado");

            const clase = document.getElementById("clase");
            (clase.value === "" ? clase : formulario.querySelector("button[type='submit']")).focus({ preventScroll: true });
        });

        contenedorDestinos.appendChild(card);
    });
}
