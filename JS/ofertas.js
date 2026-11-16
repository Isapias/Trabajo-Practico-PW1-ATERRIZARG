let ofertasPorDestino = [];
let imagenes = JSON.parse(localStorage.getItem("imagenesDestinos"))

buscarPreciosMasBajos();
cambiarImagenes();

function buscarPreciosMasBajos() {
    vuelos.forEach(v => {
        const existeMismoDestino = ofertasPorDestino.some(x => x.destino === v.destino);

        if (existeMismoDestino) {
            const indexMismoDestino = ofertasPorDestino.findIndex(x => x.destino === v.destino);
            if (v.precio < ofertasPorDestino[indexMismoDestino].precio) {
                ofertasPorDestino[indexMismoDestino] = { ...v };
            }
        } else {
            ofertasPorDestino.push({ ...v });
        }
    });

    ofertasPorDestino = ofertasPorDestino.sort((a, b) => a.precio - b.precio);
}

function cambiarImagenes() {
    const masBaratosAMostrar = ofertasPorDestino.slice(0, 4);
    const contenedorOfertas = document.getElementById("contenedor-ofertas");
    const icono = ATERRIZARG.icono;

    masBaratosAMostrar.forEach((v, index) => {
        contenedorOfertas.innerHTML += `
        <a href="./calendario.html" class="links-cards" onclick="seleccionarOferta(${v.id})">
            <article class="card-oferta">
                <div class="imagen-oferta">
                    <img src="${imagenes[v.destino]}" alt="" loading="lazy">
                    ${index === 0 ? `<span class="badge badge-sol badge-plano">${icono("tag")} El más barato</span>` : ""}
                </div>
                <div class="title-oferta">
                    <h3>${v.destino}</h3>
                    <p>${icono("plane")} Saliendo desde Buenos Aires</p>
                </div>
                <div class="descripcion-oferta">
                    <span>Tarifas desde</span>
                    <strong class="precio-oferta mono"><span class="unidad-moneda-oferta">U$D</span> ${v.precio}</strong>
                </div>
                <span class="btn btn-suave btn-bloque">Ver fechas ${icono("arrow-right", "ico-mueve")}</span>
            </article>
        </a>
        `
    });
}

function seleccionarOferta(vueloId) {
    const vueloSeleccionado = vuelos.find(v => v.id === vueloId);
    localStorage.setItem("ofertaSeleccionada", JSON.stringify(vueloSeleccionado));
}
