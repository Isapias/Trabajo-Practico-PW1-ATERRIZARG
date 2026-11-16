const usuario = localStorage.getItem("usuarioLogueado");

if (!usuario) {
    window.location.href = "./login.html";
} else {
    const lista = document.getElementById("lista-reservas");
    const detalle = document.getElementById("detalle-reserva");
    const icono = ATERRIZARG.icono;

    const reservas = JSON.parse(localStorage.getItem("reservas_" + usuario)) || [];

    function escribir(id, texto) {
        const elemento = document.getElementById(id);
        if (elemento) elemento.textContent = texto;
    }

    // Mostramos todos los datos de la reserva que toco el usuario
    function mostrarDetallesDeReserva(reserva) {
        if (!reserva) return;

        // cargamos los datos del vuelo
        document.getElementById("ruta-ida").textContent = `${reserva.origen} → ${reserva.destino}`;
        document.getElementById("fecha-ida").textContent = reserva.fechaSalida;
        document.getElementById("hora-salida").textContent = reserva.horarioSalida;
        document.getElementById("hora-llegada").textContent = reserva.horarioLlegada;
        document.getElementById("duracion").textContent = reserva.duracion;
        document.getElementById("numero-vuelo").textContent = reserva.numeroVuelo;

        // pase de abordar
        const asientos = reserva.asientos && reserva.asientos.length > 0 ? reserva.asientos.join(", ") : "—";

        escribir("pase-origen-cod", ATERRIZARG.codigoCiudad(reserva.origen));
        escribir("pase-origen", reserva.origen);
        escribir("pase-salida", reserva.horarioSalida);
        escribir("pase-destino-cod", ATERRIZARG.codigoCiudad(reserva.destino));
        escribir("pase-destino", reserva.destino);
        escribir("pase-llegada", reserva.horarioLlegada);
        escribir("pase-pasajero", reserva.pasajero?.nombre || "—");
        escribir("pase-fecha", reserva.fechaSalida);
        escribir("pase-vuelo", reserva.numeroVuelo);
        escribir("pase-asientos", asientos);

        // calculamos el total del pago
        const cantPasajeros = reserva.cantidadDePasajeros || 1;
        const precioUnitario = reserva.precio || 0;
        const descuento = reserva.descuento || 0;
        const total = (precioUnitario * cantPasajeros) - descuento;

        document.getElementById("cantidad-de-pasajeros").textContent =
            `${cantPasajeros} x U$D ${precioUnitario}`;

        document.getElementById("descuento").textContent =
            `- U$D ${descuento}`;

        document.getElementById("pago-total").textContent =
            `U$D ${total}`;

        // nos fijamos que metodo de pago uso
        let metodoText = "";
        if (reserva.metodoPago === "creditCard") {
            metodoText = `Tarjeta de Crédito (terminación ${reserva.tarjetaInfo ? reserva.tarjetaInfo.slice(-4) : "****"})`;
        } else if (reserva.metodoPago === "transfer") {
            metodoText = "Transferencia Bancaria";
        } else {
            metodoText = reserva.metodoPago || "No especificado";
        }
        document.getElementById("terminacion-tarjeta").textContent = metodoText;

        if (reserva.fechaDePago) {
            const fechaObj = new Date(reserva.fechaDePago);
            document.getElementById("fecha-de-pago").textContent =
                fechaObj.toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires", timeZoneName: "short" });
        } else {
            document.getElementById("fecha-de-pago").textContent = "No disponible";
        }
    }

    if (reservas.length === 0) {
        // sin reservas: ocultamos el detalle y ofrecemos buscar un vuelo
        if (detalle) detalle.classList.add("oculto");
        lista.parentElement.classList.add("sin-reservas");

        lista.innerHTML = `
            <div class="estado-vacio">
                ${icono("ticket")}
                <h2>No tienes reservas realizadas.</h2>
                <p>Cuando reserves un vuelo lo vas a ver acá, con tu pase de abordar y el detalle del pago.</p>
                <a class="btn btn-primario" href="../index.html">${icono("search")} Buscar vuelos</a>
            </div>
        `;
    } else {
        reservas.forEach(function (reserva, index) {
            const card = document.createElement("div");
            card.classList.add("card");
            card.setAttribute("role", "button");
            card.setAttribute("tabindex", "0");

            const asientos = reserva.asientos && reserva.asientos.length > 0 ? reserva.asientos.join(", ") : "";

            card.innerHTML = `
            <div class="card-ruta">
                <p>${reserva.origen} → ${reserva.destino}</p>
                <span class="badge badge-plano mono">${reserva.numeroVuelo}</span>
            </div>
            <ul class="card-meta">
                <li>${icono("calendar")} ${reserva.fechaSalida}</li>
                <li>${icono("clock")} <span class="mono">${reserva.horarioSalida} - ${reserva.horarioLlegada}</span></li>
                ${asientos ? `<li>${icono("seat")} <span class="mono">${asientos}</span></li>` : ""}
            </ul>
        `;

            function seleccionarReserva() {
                // desmarcamos las otras tarjetas y pintamos la que clickeo
                lista.querySelectorAll(".card").forEach(c => {
                    c.classList.remove("selected");
                    c.setAttribute("aria-pressed", "false");
                });
                card.classList.add("selected");
                card.setAttribute("aria-pressed", "true");

                mostrarDetallesDeReserva(reserva);
            }

            // si hace click, cambiamos los datos sin recargar la pagina
            card.addEventListener("click", seleccionarReserva);

            card.addEventListener("keydown", function (e) {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    seleccionarReserva();
                }
            });

            // las más nuevas quedan arriba
            lista.prepend(card);
        });

        // por defecto mostramos siempre la ultima reserva que agrego
        const ultimaReserva = reservas[reservas.length - 1];
        mostrarDetallesDeReserva(ultimaReserva);

        // y le ponemos la clase selected a esa ultima tarjeta (quedó primera en la lista)
        const ultimaCard = lista.firstElementChild;
        if (ultimaCard) {
            ultimaCard.classList.add("selected");
            ultimaCard.setAttribute("aria-pressed", "true");
        }
    }
}
