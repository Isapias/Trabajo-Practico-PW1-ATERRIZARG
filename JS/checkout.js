// =========================
// VERIFICAR LOGIN
// =========================
const sesionActiva = localStorage.getItem("usuarioLogueado");

if (!sesionActiva) {
    notificar("Debe iniciar sesión");
    window.location.href = "./login.html";
} else {
    // =========================
    // OBTENER VUELO SELECCIONADO
    // =========================
    const vuelo = JSON.parse(localStorage.getItem("vueloSeleccionado"));

    // Si no hay vuelo seleccionado
    if (!vuelo) {
        notificar("No hay ningún vuelo seleccionado");
        window.location.href = "../index.html";
    } else {

// =========================
// MOSTRAR RESUMEN DEL VUELO Y PASAJEROS
// =========================
const busqueda = JSON.parse(localStorage.getItem("busqueda")) || {};
const cantidadPasajeros = busqueda.pasajeros || 1;
let descuentoAplicado = 0;
const totalBase = vuelo.precio * cantidadPasajeros;

document.getElementById("ruta-vuelo").textContent = `${vuelo.origen} → ${vuelo.destino}`;
document.getElementById("fecha-vuelo").textContent = vuelo.fechaSalida;
document.getElementById("horario-vuelo").textContent = `${vuelo.horarioSalida} - ${vuelo.horarioLlegada}`;
document.getElementById("numero-vuelo").textContent = vuelo.numeroVuelo;
document.getElementById("precio-vuelo").textContent = `U$D ${vuelo.precio}`;

// Asientos elegidos en el paso anterior
const asientosElegidos = JSON.parse(localStorage.getItem("asientosSeleccionados")) || [];
const resumenAsientos = document.getElementById("asientos-vuelo");
if (resumenAsientos && asientosElegidos.length > 0) {
    resumenAsientos.textContent = asientosElegidos.join(", ");
}

// Actualizar cantidad de pasajeros en el HTML
const summaryItems = document.querySelectorAll(".summary-item");
summaryItems.forEach(item => {
    if (item.querySelector(".summary-item-label")?.textContent.trim() === "Pasajeros:") {
        item.querySelector(".summary-item-value").textContent = cantidadPasajeros;
    }
});

function actualizarTotal() {
    const finalTotal = totalBase - descuentoAplicado;
    document.getElementById("total-vuelo").textContent = `U$D ${finalTotal}`;

    // Aviso del descuento debajo del código
    const avisoDescuento = document.getElementById("descuento-aplicado");
    if (avisoDescuento) {
        avisoDescuento.textContent = `Descuento aplicado: - U$D ${descuentoAplicado}`;
        avisoDescuento.classList.toggle("oculto", descuentoAplicado === 0);
    }
}
actualizarTotal();

// Aplicar Código de Descuento
const inputDescuento = document.getElementById("codigo-descuento");
const btnDescuento = document.querySelector(".apply-discount-btn");

if (btnDescuento && inputDescuento) {
    btnDescuento.addEventListener("click", function () {
        const codigo = inputDescuento.value.trim().toUpperCase();
        if (codigo === "DESCUENTO10" || codigo === "ATERRIZARG") {
            descuentoAplicado = Math.round(totalBase * 0.1); // 10% de descuento
            notificar(`¡Código aplicado correctamente! Descuento de $${descuentoAplicado} USD.`);
        } else {
            notificar("Código de descuento inválido");
            descuentoAplicado = 0;
            inputDescuento.value = "";
        }
        actualizarTotal();
    });
}

// =================================
// CAMBIO DINÁMICO DE MÉTODOS DE PAGO
// =================================
// Capturamos los tres contenedores de detalles del HTML
const detallesTarjeta = document.getElementById("creditCardDetails");
const detallesPaypal = document.getElementById("paypalDetails");
const detallesTransferencia = document.getElementById("transferDetails");

// Capturamos todos los radio buttons que manejan el pago
const opcionesPago = document.querySelectorAll('input[name="payment"]');

// Escuchamos cuando el usuario cambia de opción de pago
opcionesPago.forEach(radio => {
    radio.addEventListener("change", function (e) {
        const metodoSeleccionado = e.target.value; // "creditCard", "paypal" o "transfer"

        // Ocultamos todos los contenedores primero
        detallesTarjeta.classList.add("oculto");
        detallesPaypal.classList.add("oculto");
        detallesTransferencia.classList.add("oculto");

        // Quitamos el 'required' de la tarjeta por si elige otro método
        document.getElementById("numero-tarjeta").required = false;
        document.getElementById("mes-vto").required = false;
        document.getElementById("anio-vto").required = false;
        document.getElementById("cvv").required = false;

        // Mostramos solo el que corresponde y activamos validaciones si es tarjeta
        if (metodoSeleccionado === "creditCard") {
            detallesTarjeta.classList.remove("oculto");
            document.getElementById("numero-tarjeta").required = true;
            document.getElementById("mes-vto").required = true;
            document.getElementById("anio-vto").required = true;
            document.getElementById("cvv").required = true;
            inicializarTarjetasGuardadasCheckout();
        } else if (metodoSeleccionado === "paypal") {
            detallesPaypal.classList.remove("oculto");
        } else if (metodoSeleccionado === "transfer") {
            detallesTransferencia.classList.remove("oculto");
        }
    });
});

// =========================
// FORMULARIO
// =========================
const formulario = document.getElementById("checkout-form");

// =========================
// GUARDAR RESERVA
// =========================
formulario.addEventListener("submit", function (e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre-completo").value.trim();
    const documento = document.getElementById("documento").value.trim();
    const correo = document.getElementById("correo-electronico").value.trim();
    const telefono = document.getElementById("telefono").value.trim();

    const numeroTarjeta = document.getElementById("numero-tarjeta").value.trim();
    const mes = document.getElementById("mes-vto").value;
    const anio = document.getElementById("anio-vto").value;
    const cvv = document.getElementById("cvv").value.trim();

    // =========================
    // VALIDACIONES MEJORADAS
    // =========================
    // 1. Validar datos personales comunes
    if (nombre === "" || documento === "" || correo === "") {
        notificar("Complete todos los campos obligatorios del pasajero");
        return;
    }

    if (nombre.length < 2) {
        notificar("Ingrese un nombre válido")
        return;
    }

    if (documento.length < 6 || documento.length > 9) {
        notificar("Ingrese un documento válido")
        return;
    }

    // 2. Validar datos de tarjeta SOLO si está seleccionada la opción "creditCard"
    const metodoPagoActual = document.querySelector('input[name="payment"]:checked').value;
    let tarjetaMascara = "No aplica";
    if (metodoPagoActual === "creditCard") {
        if (numeroTarjeta === "" || mes === "" || anio === "" || cvv === "") {
            notificar("Complete los datos de su tarjeta de crédito");
            return;
        } else {
            tarjetaMascara = "**** **** **** " + numeroTarjeta.slice(-4);
        }
    }

    // =========================
    // USUARIO
    // =========================
    const usuario = localStorage.getItem("usuarioLogueado");

    let reservas = JSON.parse(localStorage.getItem("reservas_" + usuario)) || [];

    // =========================
    // RESERVA COMPLETA
    // =========================
    const asientosSeleccionados =
        JSON.parse(
            localStorage.getItem(
                "asientosSeleccionados"
            )
        ) || [];

    const claveAsientos =
        "asientos_" +
        vuelo.numeroVuelo;

    const asientosOcupados =
        JSON.parse(
            localStorage.getItem(
                claveAsientos
            )
        ) || [];

    const reservaCompleta = {
        origen: vuelo.origen,
        destino: vuelo.destino,
        aerolinea: vuelo.aerolinea,
        asientos: asientosSeleccionados,
        precio: vuelo.precio,
        cantidadDePasajeros: cantidadPasajeros,
        descuento: descuentoAplicado,
        duracion: vuelo.duracion,
        numeroVuelo: vuelo.numeroVuelo,
        fechaSalida: vuelo.fechaSalida,
        horarioSalida: vuelo.horarioSalida,
        horarioLlegada: vuelo.horarioLlegada,
        metodoPago: metodoPagoActual,
        tarjetaInfo: tarjetaMascara,
        fechaDePago: new Date(),
        pasajero: {
            nombre: nombre,
            documento: documento,
            correo: correo,
            telefono: telefono
        }
    };

    // =========================
    // GUARDAR
    // =========================
    reservas.push(reservaCompleta);
    localStorage.setItem("reservas_" + usuario, JSON.stringify(reservas));

    // Dejar la nueva reserva como seleccionada
    localStorage.setItem("reservaSeleccionada", JSON.stringify(reservaCompleta));
    asientosSeleccionados.forEach(
        function (asiento) {

            if (
                !asientosOcupados.includes(
                    asiento
                )
            ) {
                asientosOcupados.push(
                    asiento
                );
            }

        }
    );

    localStorage.setItem(
        claveAsientos,
        JSON.stringify(
            asientosOcupados
        )
    );

    // =========================
    // LIMPIAR TEMPORAL
    // =========================
    localStorage.removeItem("vueloSeleccionado");
    localStorage.removeItem("asientosSeleccionados");
    localStorage.removeItem("asientoSeleccionado");
    // =========================
    // CONFIRMAR
    // =========================
    notificar("Pago realizado correctamente");
    window.location.href = "./reservas.html";
});

// =================================
// TARJETAS GUARDADAS EN CHECKOUT
// =================================
function inicializarTarjetasGuardadasCheckout() {
    const mailLogueado = localStorage.getItem("usuarioLogueado");
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuarioActual = usuarios.find(u => u.correo === mailLogueado);
    const tarjetasGuardadas = usuarioActual?.listaTarjetas || [];

    const contenedor = document.getElementById("contenedor-tarjetas-guardadas-checkout");
    const lista = document.getElementById("lista-tarjetas-checkout");

    if (!contenedor || !lista) return;

    if (tarjetasGuardadas.length === 0) {
        contenedor.classList.add("oculto");
        return;
    }

    contenedor.classList.remove("oculto");
    lista.innerHTML = "";

    tarjetasGuardadas.forEach((tarjeta, index) => {
        const item = document.createElement("div");
        item.className = "tarjeta-item-checkout";

        const ultimosCuatro = tarjeta.nroTarjeta.slice(-4);

        item.innerHTML = `
            <div class="tarjeta-info-checkout">
                <span class="icono-tarjeta-item">${ATERRIZARG.icono("card")}</span>
                <div>
                    <div class="nro">**** **** **** ${ultimosCuatro}</div>
                    <div class="titular">${tarjeta.titular}</div>
                </div>
            </div>
            <button type="button" class="btn btn-suave btn-chico btn-seleccionar-tarjeta">Seleccionar</button>
        `;

        item.querySelector(".btn-seleccionar-tarjeta").addEventListener("click", () => {
            cargarTarjetaFormulario(tarjeta);
            marcarTarjetaElegida(item);
        });

        lista.appendChild(item);
    });

    // Cargar automáticamente la primera tarjeta
    cargarTarjetaFormulario(tarjetasGuardadas[0]);
    marcarTarjetaElegida(lista.firstElementChild);
}

// Resalta en la lista la tarjeta guardada que está cargada en el formulario
function marcarTarjetaElegida(itemElegido) {
    document.querySelectorAll(".tarjeta-item-checkout").forEach(item => {
        const elegida = item === itemElegido;
        item.classList.toggle("elegida", elegida);
        const boton = item.querySelector(".btn-seleccionar-tarjeta");
        if (boton) boton.textContent = elegida ? "Seleccionada" : "Seleccionar";
    });
}

function cargarTarjetaFormulario(tarjeta) {
    const inputNumero = document.getElementById("numero-tarjeta");
    const selectMes = document.getElementById("mes-vto");
    const selectAnio = document.getElementById("anio-vto");
    const inputCvv = document.getElementById("cvv");

    // El perfil permite guardar el número con espacios o guiones: acá se usan solo los dígitos
    if (inputNumero) inputNumero.value = (tarjeta.nroTarjeta || "").replace(/\D/g, "");
    if (selectMes) selectMes.value = tarjeta.mesVto || "";
    if (selectAnio) selectAnio.value = tarjeta.anioVto || "";
    if (inputCvv) inputCvv.value = tarjeta.codigoSeg || "";

    actualizarVistaTarjeta(tarjeta.titular);
}

// =================================
// VISTA PREVIA DE LA TARJETA
// =================================
function actualizarVistaTarjeta(titularGuardado) {
    const vistaNumero = document.getElementById("tp-numero");
    const vistaTitular = document.getElementById("tp-titular");
    const vistaVto = document.getElementById("tp-vto");

    if (!vistaNumero || !vistaTitular || !vistaVto) return;

    const digitos = document.getElementById("numero-tarjeta").value.replace(/\D/g, "").slice(0, 16);
    const grupos = digitos.padEnd(16, "•").match(/.{4}/g);
    vistaNumero.textContent = grupos.join(" ");

    const titular =
        (typeof titularGuardado === "string" && titularGuardado) ||
        document.getElementById("nombre-completo").value.trim();
    vistaTitular.textContent = titular ? titular.toUpperCase() : "NOMBRE Y APELLIDO";

    const mes = document.getElementById("mes-vto").value;
    const anio = document.getElementById("anio-vto").value;
    vistaVto.textContent =
        (mes ? mes.padStart(2, "0") : "MM") + "/" + (anio ? anio.slice(-2) : "AA");
}

["numero-tarjeta", "nombre-completo", "mes-vto", "anio-vto"].forEach(id => {
    const campo = document.getElementById(id);
    if (!campo) return;
    campo.addEventListener("input", () => actualizarVistaTarjeta());
    campo.addEventListener("change", () => actualizarVistaTarjeta());
});

// Inicializar al cargar la página
inicializarTarjetasGuardadasCheckout();
    }
}