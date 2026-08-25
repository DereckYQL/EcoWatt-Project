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
}