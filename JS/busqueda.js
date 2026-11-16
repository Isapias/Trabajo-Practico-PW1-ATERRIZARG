// =========================
// DATOS DE LA BÚSQUEDA
// =========================

const busqueda = JSON.parse(localStorage.getItem("busqueda"));

if (!busqueda) {
    notificar("Debe realizar una búsqueda primero.");
    window.location.href = "../index.html";
} else {
    const idDeVueloOferta = busqueda.id || "";

    const destino = busqueda.destino || "";

    const icono = ATERRIZARG.icono;

    const logosAerolineas = {
        "AerolineasArgentinas": "../images/aerolineasargentinas-logo-l.png",
        "Flybondi": "../images/Flybondi_logo_simple.svg.png"
    };

    const equipajes = {
        "de-mano": { icono: "bag", nombre: "De mano" },
        "cabina": { icono: "carry", nombre: "Cabina" },
        "despachar": { icono: "luggage", nombre: "Para despachar" }
    };

    // =========================
    // RESUMEN DE LA BÚSQUEDA
    // =========================

    function mostrarResumenBusqueda() {
        const contenedor = document.getElementById("informacion-busqueda");
        const titulo = document.getElementById("titulo-busqueda");

        if (titulo && destino) {
            titulo.textContent = (busqueda.origen || "Buenos Aires") + " → " + destino;
        }

        if (!contenedor) return;

        const pasajeros = busqueda.pasajeros || 1;

        contenedor.innerHTML = `
            <span>${icono("users")} ${pasajeros} ${pasajeros === 1 ? "pasajero" : "pasajeros"}</span>
            <span>${icono("seat")} ${busqueda.clase || "Turista"}</span>
            ${idDeVueloOferta ? `<span class="badge badge-sol badge-plano">${icono("tag")} Oferta</span>` : ""}
        `;
    }

    // =========================
    // MOSTRAR VUELOS
    // =========================

    function mostrarVuelos() {
        const contenedor = document.getElementById("contenedor-vuelos");

        contenedor.innerHTML = "";

        if (idDeVueloOferta) {
            const vuelo = vuelos.find(function (v) {
                return v.id === idDeVueloOferta;
            });
            if (vuelo) {
                agregarCardAlContenedor(vuelo, contenedor);
            }
        } else {
            vuelos.forEach(function (vuelo) {
                if (vuelo.destino !== destino) {
                    return;
                }
                agregarCardAlContenedor(vuelo, contenedor);
            });
        }
    }

    function agregarCardAlContenedor(vuelo, contenedor) {
        const card = document.createElement("div");

        card.className = "card";

        card.dataset.destino = vuelo.destino;
        card.dataset.tipo = vuelo.tipo;
        card.dataset.aerolinea = vuelo.aerolinea;
        card.dataset.equipaje = vuelo.equipaje.join(",");
        card.dataset.precio = vuelo.precio;

        const logoAerolinea = logosAerolineas[vuelo.aerolinea] || "";
        const esDirecto = vuelo.tipo === "directo";

        const listaEquipaje = vuelo.equipaje
            .map(function (tipo) {
                const equipaje = equipajes[tipo] || { icono: "bag", nombre: tipo };
                return `<li>${icono(equipaje.icono)} ${equipaje.nombre}</li>`;
            })
            .join("");

        card.innerHTML = `
            <article class="vuelo-card">
                <div class="vuelo-logo">
                    <img
                        src="${logoAerolinea}"
                        alt="${ATERRIZARG.nombreAerolinea(vuelo.aerolinea)}"
                        class="logo-aerolinea logo-${vuelo.aerolinea}"
                    >
                    <span class="vuelo-numero mono">${vuelo.numeroVuelo}</span>
                </div>

                <div class="vuelo-info">
                    <div class="ruta">
                        <div class="ruta-punto">
                            <strong class="mono">${vuelo.horarioSalida}</strong>
                            <span>${vuelo.origen}</span>
                        </div>

                        <div class="ruta-linea">
                            <span class="ruta-duracion">${vuelo.duracion}</span>
                            <span class="ruta-trazo">${icono("plane")}</span>
                            <span class="badge ${esDirecto ? "badge-ok" : "badge-aviso"}">
                                ${esDirecto ? "Directo" : "Con escala"}
                            </span>
                        </div>

                        <div class="ruta-punto ruta-llegada">
                            <strong class="mono">${vuelo.horarioLlegada}</strong>
                            <span>${vuelo.destino}</span>
                        </div>
                    </div>

                    <ul class="datos-vuelo">
                        <li>${icono("calendar")} ${vuelo.fechaSalida}</li>
                        ${listaEquipaje}
                    </ul>
                </div>

                <div class="vuelo-precio">
                    <span class="precio-label">Precio por pasajero</span>
                    <h2 class="mono">U$D ${vuelo.precio}</h2>
                    <button class="btn btn-primario" onclick="reservar(${vuelo.id})">
                        Reservar ${icono("arrow-right", "ico-mueve")}
                    </button>
                </div>
            </article>
        `;

        contenedor.appendChild(card);
    }

    // =========================
    // RESERVAR VUELO
    // =========================

    function reservar(id) {
        const usuarioLogueado = localStorage.getItem("usuarioLogueado");

        if (!usuarioLogueado) {
            notificar("Debe iniciar sesión");

            window.location.href = "./login.html";

            return;
        }

        const vueloSeleccionado = vuelos.find(function (vuelo) {
            return vuelo.id === id;
        });

        localStorage.setItem("vueloSeleccionado", JSON.stringify(vueloSeleccionado));

        localStorage.removeItem("asientosSeleccionados");

        window.location.href = "./detalle-de-vuelo.html";
    }

    // Los botones de las tarjetas llaman a reservar() desde el atributo onclick
    window.reservar = reservar;

    // =========================
    // FILTROS
    // =========================

    const checkDirecto = document.getElementById("directo");
    const checkEscalas = document.getElementById("escalas");
    const Flybondi = document.getElementById("Flybondi");
    const AerolineasArgentinas = document.getElementById("AerolineasArgentinas");
    const mano = document.getElementById("de-mano");
    const cabina = document.getElementById("cabina");
    const despachar = document.getElementById("despachar");
    const precio = document.getElementById("precio");
    const precioActual = document.getElementById("precio-actual");

    // =========================
    // MOSTRAR VALOR DEL SLIDER
    // =========================

    function mostrarPrecioActual() {
        precioActual.textContent = "$" + precio.value + " USD";
    }

    // El tope del slider se ajusta al vuelo más caro de la búsqueda,
    // así ningún resultado queda oculto por el valor inicial.
    function ajustarPrecioMaximo() {
        if (!precio) return;

        let precioMasAlto = 0;

        document.querySelectorAll("#contenedor-vuelos .card").forEach(function (card) {
            precioMasAlto = Math.max(precioMasAlto, Number(card.dataset.precio));
        });

        if (precioMasAlto > 0) {
            const tope = Math.ceil(precioMasAlto / 10) * 10;
            precio.max = tope;
            precio.value = tope;
        }

        mostrarPrecioActual();
    }

    if (precio) {
        precio.addEventListener("input", function () {
            mostrarPrecioActual();
            mostrarTarjetasPorFiltro();
        });
    }

    // =========================
    // OBTENER EQUIPAJE
    // =========================

    function obtenerOpcionesEquipaje(card) {
        return card.dataset.equipaje || "";
    }

    // =========================
    // FILTRAR TARJETAS
    // =========================

    function mostrarTarjetasPorFiltro() {
        const tiposSeleccionados = [];
        const aerolineasSeleccionadas = [];
        const equipajeSeleccionado = [];

        const tarjetas = document.querySelectorAll(".card");

        if (checkDirecto?.checked) {
            tiposSeleccionados.push("directo");
        }

        if (checkEscalas?.checked) {
            tiposSeleccionados.push("escala");
        }

        if (Flybondi?.checked) {
            aerolineasSeleccionadas.push("Flybondi");
        }

        if (AerolineasArgentinas?.checked) {
            aerolineasSeleccionadas.push("AerolineasArgentinas");
        }

        if (mano?.checked) {
            equipajeSeleccionado.push("de-mano");
        }

        if (cabina?.checked) {
            equipajeSeleccionado.push("cabina");
        }

        if (despachar?.checked) {
            equipajeSeleccionado.push("despachar");
        }

        let cantidadVisible = 0;

        tarjetas.forEach(function (card) {

            // Respeta siempre el destino buscado
            if (card.dataset.destino !== destino) {
                card.style.display = "none";

                return;
            }

            const tipo = (card.dataset.tipo || "").toLowerCase();

            const aerolinea = card.dataset.aerolinea || "";

            const equipajeOpciones = obtenerOpcionesEquipaje(card);

            const precioVuelo = Number(card.dataset.precio);

            let visible = true;

            if (
                tiposSeleccionados.length > 0 &&
                !tiposSeleccionados.includes(tipo)
            ) {
                visible = false;
            }

            if (
                aerolineasSeleccionadas.length > 0 &&
                !aerolineasSeleccionadas.includes(aerolinea)
            ) {
                visible = false;
            }

            if (
                equipajeSeleccionado.length > 0 &&
                !equipajeSeleccionado.every(function (opcion) {
                    return equipajeOpciones.includes(opcion);
                })
            ) {
                visible = false;
            }

            if (precio && precioVuelo > Number(precio.value)) {
                visible = false;
            }

            card.style.display = visible ? "flex" : "none";

            if (visible) cantidadVisible++;
        });

        mostrarCantidadDeResultados(cantidadVisible);
    }

    function mostrarCantidadDeResultados(cantidad) {
        const contador = document.getElementById("contador-vuelos");
        const sinResultados = document.getElementById("sin-resultados");

        if (contador) {
            contador.textContent =
                cantidad === 1
                    ? "1 vuelo encontrado"
                    : cantidad + " vuelos encontrados";
        }

        if (sinResultados) {
            sinResultados.classList.toggle("oculto", cantidad > 0);
        }
    }

    // =========================
    // EVENTOS DE FILTRO
    // =========================

    [
        checkDirecto,
        checkEscalas,
        Flybondi,
        AerolineasArgentinas,
        mano,
        cabina,
        despachar,
        precio
    ].forEach(function (input) {
        if (input) {
            input.addEventListener("change", mostrarTarjetasPorFiltro);
        }
    });

    // En pantallas chicas los filtros arrancan cerrados para que los vuelos se vean primero
    if (window.matchMedia("(max-width: 980px)").matches) {
        document.querySelectorAll(".filtros details").forEach(function (grupo) {
            grupo.removeAttribute("open");
        });
    }

    mostrarResumenBusqueda();
    mostrarVuelos();
    ajustarPrecioMaximo();
    mostrarTarjetasPorFiltro();
}
