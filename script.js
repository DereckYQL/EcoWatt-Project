/* ==========================================================
   EcoWatt - Lógica principal
   Funciona en ambas páginas (calculadora e inicio)
   ========================================================== */

/* ==================== TEMA CLARO / OSCURO ==================== */

const ICONO_SOL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
const ICONO_LUNA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

function aplicarTema(tema) {
    document.documentElement.dataset.theme = tema;

    const botones = document.querySelectorAll(".btn-tema");
    botones.forEach(btn => {
        btn.innerHTML = tema === "dark" ? ICONO_SOL : ICONO_LUNA;
    });

    localStorage.setItem("ecowatt_theme", tema);
}

/* ==================== NAVEGACIÓN (móvil + sombra al desplazar) ==================== */

const navToggle = document.getElementById("navToggle");

if (navToggle) {
    navToggle.addEventListener("click", () => {
        const abierto = document.body.classList.toggle("menu-abierto");
        navToggle.setAttribute("aria-expanded", abierto ? "true" : "false");
        navToggle.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
    });

    document.querySelectorAll("#navMenu a").forEach(enlace => {
        enlace.addEventListener("click", () => {
            document.body.classList.remove("menu-abierto");
            navToggle.setAttribute("aria-expanded", "false");
        });
    });
}

const navbar = document.getElementById("navbar");

function actualizarNavbar() {
    if (navbar) {
        navbar.classList.toggle("con-scroll", window.scrollY > 8);
    }
}

window.addEventListener("scroll", actualizarNavbar, { passive: true });
actualizarNavbar();

/* ==================== ANIMACIÓN DE APARICIÓN AL HACER SCROLL ==================== */

const elementosReveal = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && elementosReveal.length > 0) {
    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add("visible");
                observador.unobserve(entrada.target);
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

    elementosReveal.forEach(el => observador.observe(el));
} else {
    elementosReveal.forEach(el => el.classList.add("visible"));
}

document.querySelectorAll(".btn-tema").forEach(btn => {
    btn.addEventListener("click", () => {
        const actual = document.documentElement.dataset.theme;
        aplicarTema(actual === "dark" ? "light" : "dark");
    });
});

aplicarTema(document.documentElement.dataset.theme || "light");

/* ==========================================================
   FORMULARIO DE CONTACTO (index.html)
   ========================================================== */

const formContacto = document.getElementById("formContacto");

if (formContacto) {
    formContacto.addEventListener("submit", (e) => {
        e.preventDefault();

        const nombre = document.getElementById("contactoNombre").value.trim();
        const email = document.getElementById("contactoEmail").value.trim();
        const mensaje = document.getElementById("contactoMensaje").value.trim();

        if (!nombre || !email || !mensaje) {
            alert("Por favor completa todos los campos.");
            return;
        }

        document.getElementById("mensajeFormulario").hidden = false;
        formContacto.reset();

        setTimeout(() => {
            document.getElementById("mensajeFormulario").hidden = true;
        }, 6000);
    });
}

/* ==========================================================
   CALCULADORA
   ========================================================== */

if (document.getElementById("graficoConsumo")) {

    /* ---------- Estado ---------- */
    let equipos = []; // { nombre, potencia, horas }

    /* Escala del comparador y promedio nacional de una casa familiar */
    const ESCALA_MAX_KWH = 400;
    const PROMEDIO_CASA_CHILE = 265;

    /* Factor de emisión promedio matriz eléctrica chilena (kg CO2 por kWh) */
    const FACTOR_CO2 = 0.4;

    /* Catálogo con potencias típicas (Watts) para autocompletar */
    const CATALOGO = {
        "refrigerador": 150,
        "freezer": 200,
        "lavadora": 500,
        "secadora": 2500,
        "lavavajillas": 1200,
        "horno electrico": 2000,
        "horno eléctrico": 2000,
        "microondas": 1200,
        "hervidor electrico": 2000,
        "hervidor eléctrico": 2000,
        "cafetera": 900,
        "plancha": 1100,
        "aspiradora": 1000,
        "televisor led": 100,
        "computador de escritorio": 200,
        "notebook": 65,
        "router wifi": 10,
        "aire acondicionado": 1500,
        "calefactor electrico": 1500,
        "calefactor eléctrico": 1500,
        "panel radiante": 1000,
        "estufa electrica": 1500,
        "estufa eléctrica": 1500,
        "termo electrico": 1500,
        "termo eléctrico": 1500,
        "ventilador": 75,
        "bombilla led": 9,
        "iluminacion led (casa)": 60,
        "iluminación led (casa)": 60,
        "cargador de celular": 5
    };

    const PALETA = [
        "#0b3b78", "#135fc1", "#43a047", "#66bb6a", "#f57c00",
        "#8e24aa", "#00897b", "#fbc02d", "#e53935", "#5c6bc0",
        "#d81b60", "#00acc1", "#7cb342", "#fb8c00", "#3949ab"
    ];

    /* ---------- Referencias DOM ---------- */
    const inputNombre = document.getElementById("nombre");
    const inputPotencia = document.getElementById("potencia");
    const inputHoras = document.getElementById("horas");
    const hintPotencia = document.getElementById("hintPotencia");
    const selectorTarifa = document.getElementById("selectorTarifa");
    const tablaDatos = document.getElementById("tablaDatos");
    const elTotal = document.getElementById("total");
    const elCostoTotal = document.getElementById("costoTotal");
    const elRecomendacion = document.getElementById("recomendacion");
    const iaTexto = document.getElementById("iaTexto");
    const comparadorFill = document.getElementById("comparadorFill");
    const tuConsumoLabel = document.getElementById("tuConsumoLabel");
    const co2Info = document.getElementById("co2Info");

    /* ---------- Gráficos Chart.js ---------- */
    let graficoBarras = null;
    let graficoTorta = null;

    if (typeof Chart !== "undefined") {
        const ctxBarra = document.getElementById("graficoConsumo").getContext("2d");

        graficoBarras = new Chart(ctxBarra, {
            type: "bar",
            data: {
                labels: [],
                datasets: [{
                    label: "Consumo mensual (kWh)",
                    data: [],
                    backgroundColor: []
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: "kWh/mes" }
                    }
                }
            }
        });

        const ctxTorta = document.getElementById("graficoTorta").getContext("2d");

        graficoTorta = new Chart(ctxTorta, {
            type: "doughnut",
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "bottom"
                    }
                }
            }
        });
    }

    /* ---------- Utilidades ---------- */

    function normalizar(texto) {
        return texto.toLowerCase().trim();
    }

    function tarifaActual() {
        return parseFloat(selectorTarifa.value);
    }

    function formatoCLP(valor) {
        return "$" + Math.round(valor).toLocaleString("es-CL");
    }

    function guardarLocalStorage() {
        localStorage.setItem("ecowatt_equipos", JSON.stringify(equipos));
        localStorage.setItem("ecowatt_tarifa", selectorTarifa.value);
    }

    /* ---------- Autocompletado de potencia típica ---------- */

    inputNombre.addEventListener("input", () => {
        const clave = normalizar(inputNombre.value);

        const coincidencia = Object.keys(CATALOGO).find(k => k.includes(clave) && clave.length >= 3);

        if (coincidencia) {
            inputPotencia.value = CATALOGO[coincidencia];
            hintPotencia.textContent =
                `Potencia típica de "${coincidencia}": ~${CATALOGO[coincidencia]} W. Edítala si tu equipo es distinto.`;
        } else {
            hintPotencia.textContent =
                "Escribe el nombre del equipo y completaremos su potencia típica automáticamente.";
        }
    });

    selectorTarifa.addEventListener("change", recalcularTodo);

    /* ---------- Agregar electrodoméstico ---------- */

    window.agregarElectrodomestico = function () {

        const nombre = inputNombre.value.trim();
        const potencia = parseFloat(inputPotencia.value);
        const horas = parseFloat(inputHoras.value);

        if (!nombre || isNaN(potencia) || isNaN(horas)) {
            alert("Complete todos los campos correctamente.");
            return;
        }

        if (potencia <= 0 || potencia > 10000) {
            alert("La potencia debe estar entre 1 y 10.000 Watts.");
            return;
        }

        if (horas <= 0 || horas > 24) {
            alert("Las horas de uso deben estar entre 0,5 y 24 horas diarias.");
            return;
        }

        equipos.push({ nombre, potencia, horas });

        inputNombre.value = "";
        inputPotencia.value = "";
        inputHoras.value = "";
        inputNombre.focus();

        recalcularTodo();
    };

    /* ---------- Eliminar electrodoméstico ---------- */

    window.eliminarEquipo = function (indice) {
        equipos.splice(indice, 1);
        recalcularTodo();
    };

    tablaDatos.addEventListener("click", (e) => {
        const boton = e.target.closest(".btn-eliminar");
        if (boton) {
            eliminarEquipo(parseInt(boton.dataset.indice, 10));
        }
    });

    /* ---------- Recálculo general ---------- */

    function recalcularTodo() {

        const tarifa = tarifaActual();

        const consumos = equipos.map(eq => (eq.potencia * eq.horas * 30) / 1000);
        const costos = consumos.map(c => c * tarifa);

        const totalKwh = consumos.reduce((a, b) => a + b, 0);
        const totalClp = costos.reduce((a, b) => a + b, 0);

        /* --- Tabla --- */
        if (equipos.length === 0) {
            tablaDatos.innerHTML = `
                <tr class="fila-vacia">
                    <td colspan="6">Aún no has agregado electrodomésticos.</td>
                </tr>
            `;
        } else {
            tablaDatos.innerHTML = equipos.map((eq, i) => `
                <tr>
                    <td>${eq.nombre}</td>
                    <td>${eq.potencia} W</td>
                    <td>${eq.horas} h</td>
                    <td>${consumos[i].toFixed(2)} kWh</td>
                    <td>${formatoCLP(costos[i])}</td>
                    <td>
                        <button class="btn-eliminar" data-indice="${i}" title="Eliminar" aria-label="Eliminar ${eq.nombre}">×</button>
                    </td>
                </tr>
            `).join("");
        }

        /* --- Totales --- */
        elTotal.innerHTML = `Consumo total: <span>${totalKwh.toFixed(2)} kWh</span>`;
        elCostoTotal.innerHTML = `Costo estimado: <span>${formatoCLP(totalClp)} CLP</span>`;

        /* --- Gráficos --- */
        actualizarGraficos(consumos);

        /* --- Comparador nacional --- */
        actualizarComparador(totalKwh);

        /* --- CO2 --- */
        actualizarCO2(totalKwh);

        /* --- Recomendaciones por nivel --- */
        actualizarNivel(totalKwh);

        /* --- Agente IA --- */
        generarRecomendacionIA(consumos, tarifa);

        guardarLocalStorage();
    }

    /* ---------- Gráficos ---------- */

    function actualizarGraficos(consumos) {
        if (!graficoBarras) return;

        const colores = consumos.map((_, i) => PALETA[i % PALETA.length]);

        graficoBarras.data.labels = equipos.map(eq => eq.nombre);
        graficoBarras.data.datasets[0].data = consumos.map(c => parseFloat(c.toFixed(2)));
        graficoBarras.data.datasets[0].backgroundColor = colores;
        graficoBarras.update();

        graficoTorta.data.labels = equipos.map(eq => eq.nombre);
        graficoTorta.data.datasets[0].data = consumos.map(c => parseFloat(c.toFixed(2)));
        graficoTorta.data.datasets[0].backgroundColor = colores;
        graficoTorta.update();
    }

    /* ---------- Comparador vs promedio chileno ---------- */

    function actualizarComparador(totalKwh) {

        const porcentaje = Math.min((totalKwh / ESCALA_MAX_KWH) * 100, 100);
        comparadorFill.style.width = porcentaje + "%";

        tuConsumoLabel.textContent = `Tu hogar: ${totalKwh.toFixed(1)} kWh`;

        comparadorFill.classList.remove("moderado", "alto");

        if (totalKwh > PROMEDIO_CASA_CHILE) {
            comparadorFill.classList.add("alto");
        } else if (totalKwh > PROMEDIO_CASA_CHILE * 0.75) {
            comparadorFill.classList.add("moderado");
        }
    }

    /* ---------- Huella de carbono ---------- */

    function actualizarCO2(totalKwh) {

        if (totalKwh === 0) {
            co2Info.innerHTML =
                "Agrega electrodomésticos para calcular tus emisiones mensuales de CO₂.";
            return;
        }

        const kgCO2 = totalKwh * FACTOR_CO2;
        const kmAuto = (kgCO2 * 1000) / 120; // un auto emite ~120 g CO2 por km

        co2Info.innerHTML =
            `Tu consumo mensual equivale a <strong>${kgCO2.toFixed(1)} kg de CO₂</strong> emitidos
             (factor chileno ~${FACTOR_CO2} kg/kWh), aproximadamente lo mismo que
             <strong>${Math.round(kmAuto)} km recorridos en auto</strong>.`;
    }

    /* ---------- Nivel de consumo (recomendación simple) ---------- */

    function actualizarNivel(totalKwh) {
        if (totalKwh === 0) {
            elRecomendacion.textContent =
                "Agrega electrodomésticos para obtener sugerencias.";
            return;
        }

        if (totalKwh < 150) {
            elRecomendacion.innerHTML =
                "Consumo eficiente: tu hogar se encuentra dentro de rangos óptimos. Sigue así.";
        } else if (totalKwh < 300) {
            elRecomendacion.innerHTML =
                "Consumo moderado: intenta apagar los equipos que no uses y revisa los modos de espera.";
        } else {
            elRecomendacion.innerHTML =
                "Consumo alto: se recomienda reducir el uso de algunos equipos y revisar la sección de consejos de ahorro.";
        }
    }

    /* ==========================================================
       AGENTE IA - Recomendaciones basadas en datos reales de Chile
       Fuentes: Comisión Nacional de Energía (CNE), Ministerio de
       Energía (Informe de Usos de la Energía en Hogares) y
       cuadros tarifarios Enel Distribución.
       ========================================================== */

    const CONSEJOS_POR_TIPO = [
        { patron: /refri|nevera/i,
          tip: "Los refrigeradores representan cerca del 25-30% del consumo eléctrico de un hogar chileno (Min. Energía). Verifica que las gomas de la puerta sellen bien y evita ubicarlo cerca de fuentes de calor." },
        { patron: /termo|calefont|agua caliente/i,
          tip: "El agua caliente sanitaria es uno de los mayores gastos energéticos en Chile. Reducir la ducha a 5-8 minutos e instalar aireadores puede bajar este consumo hasta un 20%." },
        { patron: /calefac|estufa|panel radiante/i,
          tip: "La calefacción eléctrica dispara la boleta en invierno. Considera sellar puertas/ventanas y usar temporizador para no calefaccionar ambientes vacíos." },
        { patron: /secadora/i,
          tip: "Las secadoras de ropa consumen mucha energía por ciclo. Secar al aire libre cuando el clima lo permita puede ahorrar un consumo significativo mensual." },
        { patron: /aire acondicionado|a\/a/i,
          tip: "El aire acondicionado en horario punta (18:00-23:00) es más caro en tarifas BT. Prográmalo a 24°C para optimizar consumo." },
        { patron: /tv|televisor/i,
          tip: "Los televisores modernos son eficientes, pero dejarlos en modo espera (standby) suma consumo fantasma. Apágalos por completo si no los usarás por horas." },
        { patron: /lavadora/i,
          tip: "Usar la lavadora con carga completa y en agua fría reduce notoriamente el consumo eléctrico por ciclo." },
        { patron: /microondas|horno/i,
          tip: "Los hornos eléctricos consumen mucha potencia en poco tiempo; el microondas es más eficiente para calentar porciones pequeñas." },
        { patron: /hervidor/i,
          tip: "Hervir solo la cantidad de agua necesaria puede reducir el consumo del hervidor hasta en un 50% al mes." },
        { patron: /computador|notebook/i,
          tip: "Configura el modo de ahorro de energía y apaga el equipo por la noche; los computadores en reposo siguen consumiendo." },
        { patron: /iluminacion|iluminación|bombilla/i,
          tip: "Si aún tienes bombillas incandescentes o halógenas, cambiarlas por LED reduce ese consumo hasta en un 85%." },
        { patron: /ventilador/i,
          tip: "Los ventiladores enfrían personas, no ambientes: apágalos al salir de la habitación." }
    ];

    function generarRecomendacionIA(consumos, tarifa) {

        const totalKwh = consumos.reduce((a, b) => a + b, 0);

        if (totalKwh === 0) {
            iaTexto.innerHTML =
                "El agente analizará tu consumo apenas agregues un electrodoméstico, " +
                "comparándolo con datos reales de hogares chilenos.";
            return;
        }

        // Comparación con rangos reales de hogares en Chile (CNE / Min. Energía)
        let comparacion;
        if (totalKwh <= 220) {
            comparacion = `Tu consumo (${totalKwh.toFixed(1)} kWh) está dentro del rango típico de un departamento en Chile (120-220 kWh/mes según la CNE).`;
        } else if (totalKwh <= 350) {
            comparacion = `Tu consumo (${totalKwh.toFixed(1)} kWh) se ubica en el rango de una casa familiar promedio en Chile (180-350 kWh/mes, Min. Energía).`;
        } else {
            comparacion = `Tu consumo (${totalKwh.toFixed(1)} kWh) supera el promedio nacional de una casa familiar (180-350 kWh/mes). Podrías estar entrando en tramo tarifario BT-2, más costoso.`;
        }

        // Estimación de costo mensual según la zona seleccionada
        const costoEstimado = totalKwh * tarifa;
        const costoTexto = `Con la tarifa seleccionada ($${tarifa}/kWh), tu gasto mensual estimado es de <strong>${formatoCLP(costoEstimado)} CLP</strong> (${formatoCLP(costoEstimado * 12)} al año).`;

        // Identificar el electrodoméstico de mayor consumo
        let indiceMax = 0;
        for (let i = 1; i < consumos.length; i++) {
            if (consumos[i] > consumos[indiceMax]) indiceMax = i;
        }
        const nombreMax = equipos[indiceMax].nombre;
        const consumoMax = consumos[indiceMax];

        const focoTexto = `El equipo que más aporta a tu consumo es <strong>${nombreMax}</strong>, con ${consumoMax.toFixed(1)} kWh/mes (${((consumoMax / totalKwh) * 100).toFixed(0)}% del total).`;

        // Buscar consejo específico según el tipo de electrodoméstico detectado
        let consejoEspecifico = "";
        for (const item of CONSEJOS_POR_TIPO) {
            if (item.patron.test(nombreMax)) {
                consejoEspecifico = item.tip;
                break;
            }
        }
        if (!consejoEspecifico) {
            consejoEspecifico = "Revisa la etiqueta de eficiencia energética de este equipo; reemplazar modelos antiguos por uno clase A/A+ puede reducir su consumo hasta en un 30%.";
        }

        iaTexto.innerHTML = `
            <p>${comparacion}</p>
            <p>${costoTexto}</p>
            <p>${focoTexto}</p>
            <p><strong>Recomendación del agente:</strong> ${consejoEspecifico}</p>
        `;
    }

    /* ---------- Carga inicial desde localStorage ---------- */

    function cargarDatosGuardados() {

        const tarifaGuardada = localStorage.getItem("ecowatt_tarifa");
        if (tarifaGuardada && selectorTarifa.querySelector(`option[value="${tarifaGuardada}"]`)) {
            selectorTarifa.value = tarifaGuardada;
        }

        try {
            const guardados = JSON.parse(localStorage.getItem("ecowatt_equipos"));

            if (Array.isArray(guardados)) {
                equipos = guardados.filter(eq =>
                    eq &&
                    typeof eq.nombre === "string" &&
                    !isNaN(parseFloat(eq.potencia)) &&
                    !isNaN(parseFloat(eq.horas))
                ).map(eq => ({
                    nombre: String(eq.nombre),
                    potencia: parseFloat(eq.potencia),
                    horas: parseFloat(eq.horas)
                }));
            }
        } catch {
            equipos = [];
        }

        recalcularTodo();
    }

    cargarDatosGuardados();
}
