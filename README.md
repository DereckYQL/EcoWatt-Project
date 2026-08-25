# EcoWatt 3.0

**Tecnología para un consumo energético más inteligente.**

Plataforma web desarrollada por estudiantes del Instituto Superior de Comercio de Valparaíso que permite a hogares y pequeños negocios conocer, monitorear y optimizar su consumo eléctrico.

## Funcionalidades

### Calculadora de consumo
- Registro de electrodomésticos con potencia (W) y horas de uso diarias
- Cálculo automático de consumo mensual (kWh) y costo estimado ($CLP)
- Catálogo integrado con potencias típicas que se autocompletan
- Selector de tarifa eléctrica por zona de Chile ($180–$236 CLP/kWh)
- Tabla editable con eliminación de equipos registrados
- Gráfico de barras + gráfico circular de distribución (Chart.js)
- Comparador visual contra el promedio nacional (265 kWh/mes casa familiar)
- Estimación de huella de carbono (kg CO₂ y equivalencia en km en auto)
- Exportación a PDF vía impresión
- Persistencia local de datos (localStorage)

### Agente IA
- Compara tu consumo con rangos reales de hogares chilenos (CNE / Ministerio de Energía)
- Estima gasto mensual y anual según la zona tarifaria seleccionada
- Detecta el equipo de mayor consumo y entrega consejos específicos por tipo de artefacto

### Sitio informativo
- Sección del equipo de desarrollo
- Consejos de ahorro energético
- Explicador de la Etiqueta de Eficiencia Energética (SEC)
- Glosario técnico y preguntas frecuentes
- Formulario de contacto y fuentes oficiales (CNE, Min. Energía, SEC, Enel, A3E)
- Modo claro/oscuro persistente

## Tecnologías

| Tecnología | Uso |
|------------|-----|
| HTML5 | Estructura de las páginas |
| CSS3 | Estilos, tema oscuro/claro, responsive, estilos de impresión |
| JavaScript (Vanilla) | Lógica de cálculo, localStorage, agente IA |
| Chart.js | Gráficos de barras y circular |

## Estructura

```
EcoWatt/
├── index.html        # Página principal e informativa
├── calculadora.html  # Calculadora de consumo energético
├── style.css         # Hoja de estilos global
├── script.js         # Lógica de la aplicación
├── logo.png          # Logo EcoWatt
├── fondo.png         # Imagen de fondo del hero
└── img/              # Fondos decorativos por sección (Pexels)
```

## Datos utilizados

Las comparaciones y estimaciones se basan en:
- **CNE** — Comisión Nacional de Energía (rangos de consumo residencial)
- **Ministerio de Energía** — Informe de Usos de la Energía en Hogares
- **Enel Distribución** — Cuadros tarifarios residenciales
- Factor de emisión promedio de la matriz eléctrica chilena: ~0,4 kg CO₂/kWh

## Versiones

| Version | Tag | Release |
|---------|-----|---------|
| EcoWatt 1.0 | `v1.0` | https://github.com/DereckYQL/EcoWatt-Project/releases/tag/v1.0 |
| EcoWatt 2.0 | `v2.0` | https://github.com/DereckYQL/EcoWatt-Project/releases/tag/v2.0 |
| EcoWatt 3.0 | `v3.0` | https://github.com/DereckYQL/EcoWatt-Project/releases/tag/v3.0 |

## Equipo

Proyecto desarrollado por estudiantes de Programación del Instituto Superior de Comercio de Valparaíso.

---

EcoWatt © 2026
