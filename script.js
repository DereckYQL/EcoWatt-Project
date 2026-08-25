let totalConsumo = 0;

let nombres = [];
let consumos = [];

const ctx = document.getElementById("graficoConsumo").getContext("2d");

const grafico = new Chart(ctx, {
    type: "bar",
    data: {
        labels: nombres,
        datasets: [{
            label: "Consumo mensual (kWh)",
            data: consumos
        }]
    },
    options: {
        responsive: true
    }
});

function agregarElectrodomestico() {

    const nombre = document.getElementById("nombre").value.trim();
    const potencia = parseFloat(document.getElementById("potencia").value);
    const horas = parseFloat(document.getElementById("horas").value);

    if (!nombre || isNaN(potencia) || isNaN(horas)) {
        alert("Complete todos los campos correctamente");
        return;
    }

    const consumo = (potencia * horas * 30) / 1000;

    const tabla = document.getElementById("tablaDatos");

    tabla.innerHTML += `
        <tr>
            <td>${nombre}</td>
            <td>${consumo.toFixed(2)} kWh</td>
        </tr>
    `;

    totalConsumo += consumo;

    document.getElementById("total").textContent =
        `Consumo Total: ${totalConsumo.toFixed(2)} kWh`;

    nombres.push(nombre);
    consumos.push(consumo);

    grafico.update();

    const recomendacion = document.getElementById("recomendacion");

    if (totalConsumo < 150) {
        recomendacion.innerHTML =
            "✅ Consumo eficiente.";
    } else if (totalConsumo < 300) {
        recomendacion.innerHTML =
            "⚠️ Consumo moderado. Intenta apagar equipos que no uses.";
    } else {
        recomendacion.innerHTML =
            "🚨 Consumo alto. Se recomienda reducir el uso de algunos equipos.";
    }

    document.getElementById("nombre").value = "";
    document.getElementById("potencia").value = "";
    document.getElementById("horas").value = "";

    generarRecomendacionIA();
}

/* ==========================================================
   AGENTE IA - Recomendaciones basadas en datos reales de Chile
   Fuentes: Comisión Nacional de Energía (CNE), Ministerio de
   Energía (Informe de Usos de la Energía en Hogares) y
   cuadros tarifarios Enel Distribución 2026.
   - Consumo promedio departamento: 120-220 kWh/mes
   - Consumo promedio casa: 180-350 kWh/mes
   - Tarifa promedio residencial 2026: ~$195 CLP/kWh (varía 140-236 según zona)
   - Refrigerador + iluminación + TV = ~52,6% del consumo eléctrico de un hogar
   - Termo eléctrico, calefacción y secadora son los mayores "picos" de consumo
   ========================================================== */

const TARIFA_CLP_KWH = 195;

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
      tip: "El aire acondicionado en horario punta (18:00-23:00) es más caro en tarifas con recargo horario. Prográmalo a 24°C para optimizar consumo." },
    { patron: /tv|televisor/i,
      tip: "Los televisores modernos son eficientes, pero dejarlos en modo espera (standby) suma consumo fantasma. Apágalos por completo si no los usarás por horas." },
    { patron: /lavadora/i,
      tip: "Usar la lavadora con carga completa y en agua fría reduce notoriamente el consumo eléctrico por ciclo." },
    { patron: /microondas|horno/i,
      tip: "Los hornos eléctricos consumen mucha potencia en poco tiempo; el microondas es más eficiente para calentar porciones pequeñas." }
];

function generarRecomendacionIA() {

    const iaTexto = document.getElementById("iaTexto");

    // Comparación con rangos reales de hogares en Chile (CNE / Min. Energía)
    let comparacion;
    if (totalConsumo <= 220) {
        comparacion = `Tu consumo (${totalConsumo.toFixed(1)} kWh) está dentro del rango típico de un departamento en Chile (120-220 kWh/mes según la CNE).`;
    } else if (totalConsumo <= 350) {
        comparacion = `Tu consumo (${totalConsumo.toFixed(1)} kWh) se ubica en el rango de una casa familiar promedio en Chile (180-350 kWh/mes, Min. Energía).`;
    } else {
        comparacion = `Tu consumo (${totalConsumo.toFixed(1)} kWh) supera el promedio nacional de una casa familiar (180-350 kWh/mes). Podrías estar entrando en tramo tarifario BT-2, más costoso.`;
    }

    // Estimación de costo mensual con tarifa promedio residencial 2026
    const costoEstimado = totalConsumo * TARIFA_CLP_KWH;
    const costoTexto = `Con la tarifa residencial promedio 2026 (~$${TARIFA_CLP_KWH}/kWh), tu gasto mensual estimado es de <strong>$${costoEstimado.toLocaleString("es-CL", {maximumFractionDigits:0})} CLP</strong>.`;

    // Identificar el electrodoméstico de mayor consumo
    let indiceMax = 0;
    for (let i = 1; i < consumos.length; i++) {
        if (consumos[i] > consumos[indiceMax]) indiceMax = i;
    }
    const nombreMax = nombres[indiceMax];
    const consumoMax = consumos[indiceMax];

    const focoTexto = `El equipo que más aporta a tu consumo es <strong>${nombreMax}</strong>, con ${consumoMax.toFixed(1)} kWh/mes (${((consumoMax/totalConsumo)*100).toFixed(0)}% del total).`;

    // Buscar consejo específico según el tipo de electrodoméstico detectado
    let consejoEspecifico = "";
    for (const item of CONSEJOS_POR_TIPO) {
        if (item.patron.test(nombreMax)) {
            consejoEspecifico = item.tip;
            break;
        }
    }
    if (!consejoEspecifico) {
        consejoEspecifico = "Revisa la etiqueta de eficiencia energética de este equipo; reemplazar modelos antiguos por unos clasificación A/A+ puede reducir su consumo hasta en un 30%.";
    }

    iaTexto.innerHTML = `
        <p>${comparacion}</p>
        <p>${costoTexto}</p>
        <p>${focoTexto}</p>
        <p>💡 <strong>Recomendación del agente:</strong> ${consejoEspecifico}</p>
    `;
}