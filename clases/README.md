# Compendio y Guía de Clases Oficiales - Hackathon 30X (Octubre 2026)

Este directorio contiene las **6 clases y workshops oficiales** impartidos por el equipo de **30X AI Devs** para el Hackathon de Octubre 2026.

Cada sesión incluye:
* El archivo de video en alta definición (`.mp4`, 720p).
* El archivo de subtítulos sincronizados (`.srt`).
* La transcripción limpia con marcas de tiempo (`- Transcripcion.txt`).

---

## Índice de Clases

| # | Clase / Workshop | Fecha | Duración | Archivo de Video | Transcripción | Enlace Oficial YouTube |
|---|---|---|---|---|---|---|
| **01** | **Strategic Problem Solving** | 13/10/2026 | 58 min | `01 - Strategic Problem Solving.mp4` | [`01 - Strategic Problem Solving - Transcripcion.txt`](file:///C:/30x/Hackaton%20octubre%202026/clases/01%20-%20Strategic%20Problem%20Solving%20-%20Transcripcion.txt) | [Ver en YouTube](https://www.youtube.com/watch?v=Djt7qCpg-pk) |
| **02** | **Loop Engineering** | 14/10/2026 | 1h 03m | `02 - Loop Engineering.mp4` | [`02 - Loop Engineering - Transcripcion.txt`](file:///C:/30x/Hackaton%20octubre%202026/clases/02%20-%20Loop%20Engineering%20-%20Transcripcion.txt) | [Ver en YouTube](https://www.youtube.com/watch?v=3yEb_V8-Tss) |
| **03** | **Demo con Jev: Usa menos tokens al desarrollar** | 15/10/2026 | 1h 01m | `03 - Demo con Jev - Menos tokens al desarrollar.mp4` | [`03 - Demo con Jev - Usa menos tokens al desarrollar - Transcripcion.txt`](file:///C:/30x/Hackaton%20octubre%202026/clases/03%20-%20Demo%20con%20Jev%20-%20Usa%20menos%20tokens%20al%20desarrollar%20-%20Transcripcion.txt) | [Ver en YouTube](https://www.youtube.com/watch?v=EbztG-aww9I) |
| **04** | **Del demo a la implementación: Herramientas para tu proyecto** | 15/10/2026 | 1h 09m | `04 - Del demo a la implementacion.mp4` | [`04 - Del demo a la implementacion - Herramientas para tu proyecto - Transcripcion.txt`](file:///C:/30x/Hackaton%20octubre%202026/clases/04%20-%20Del%20demo%20a%20la%20implementacion%20-%20Herramientas%20para%20tu%20proyecto%20-%20Transcripcion.txt) | [Ver en YouTube](https://www.youtube.com/watch?v=z8a3AHd7VRQ) |
| **05** | **UX con propósito: Diseñar cuando la IA genera las primeras versiones** | 16/10/2026 | 50 min | `05 - UX con proposito - IA y primeras versiones.mp4` | [`05 - UX con proposito - Disenar cuando la IA genera versiones - Transcripcion.txt`](file:///C:/30x/Hackaton%20octubre%202026/clases/05%20-%20UX%20con%20proposito%20-%20Disenar%20cuando%20la%20IA%20genera%20versiones%20-%20Transcripcion.txt) | [Ver en YouTube](https://www.youtube.com/watch?v=ByOGwoOrJNM) |
| **06** | **Kickoff Oficial: Reglas, Retos y Criterios de Evaluación** | 16/10/2026 | 59 min | `06 - Kickoff Oficial - Hackathon 30X.mp4` | [`06 - Kickoff Oficial - Hackathon 30X - Transcripcion.txt`](file:///C:/30x/Hackaton%20octubre%202026/clases/06%20-%20Kickoff%20Oficial%20-%20Hackathon%2030X%20-%20Transcripcion.txt) | [Ver en YouTube](https://www.youtube.com/watch?v=WdXQBNzHHIg) |

---

## Síntesis Ejecutiva de Cada Clase

### Clase 1: Strategic Problem Solving
* **Enfoque:** Cómo atacar un problema complejo sin dispersarse construyendo funcionalidades innecesarias.
* **Puntos Clave:**
  1. Identificar el **North Star Metric** del cliente antes de tirar una sola línea de código.
  2. En retos empresariales B2B (como Blinka), el valor real no es "chatear con un bot", sino **ahorrar dinero, evitar fraudes y eliminar horas humanas en procesos manuales**.
  3. Estructurar la solución en torno a hipótesis verificables y pruebas tangibles.

### Clase 2: Loop Engineering
* **Enfoque:** Arquitectura de agentes de IA autónomos que ejecutan tareas complejas durante horas sin atascarse.
* **Puntos Clave:**
  1. Diferencia entre un prompt de un solo paso y un bucle agente (Agent Loop: *Perceive $\to$ Plan $\to$ Tool Call $\to$ Validate $\to$ Reflect*).
  2. Manejo de estados y auto-corrección cuando una llamada a una herramienta falla.
  3. Guardrails para evitar bucles infinitos de consumo de tokens y asegurar la finalización determinista del objetivo.

### Clase 3: Demo con Jev (Usa menos tokens al desarrollar)
* **Enfoque:** Eficiencia en el consumo de contexto y orquestación rápida de modelos.
* **Puntos Clave:**
  1. Cómo estructurar el contexto del agente para que tome decisiones en milisegundos sin sobrecargar la ventana de contexto.
  2. Modularización de herramientas mediante esquemas bien delimitados (exactamente lo que hicimos con el servidor MCP de Blinka).
  3. Buenas prácticas para caching de prompts y reducción drástica de latencia.

### Clase 4: Del demo a la implementación (Herramientas para tu proyecto)
* **Enfoque:** Llevar un prototipo local a producción real con infraestructura en la nube.
* **Puntos Clave:**
  1. Despliegue continuo en plataformas modernas (Railway, Vercel, Fly.io).
  2. Integración de agentes en interfaces web reactivas y asistentes de escritorio vía MCP.
  3. Conexión de webhooks y APIs externas para crear un producto vivo y operable.

### Clase 5: UX con propósito (Diseñar cuando la IA genera las primeras versiones)
* **Enfoque:** "Des-IA-izar" el diseño de producto. Superar la estética genérica que los modelos suelen generar por defecto.
* **Puntos Clave:**
  1. Jerarquía visual: El usuario de negocios no quiere ver un chat infinito; quiere paneles de control claros, métricas de riesgo y estados inmediatos.
  2. "Human-in-the-loop": Cómo presentar las alertas críticas (como una factura sospechosa de phishing) con microinteracciones que generen confianza y permitan aprobar o bloquear en 1 clic.
  3. Consistencia de diseño con la identidad de marca (Blinka: tipografía sans moderna, acentos azules/verdes, contrastes limpios).

### Clase 6: Kickoff Oficial del Hackathon
* **Enfoque:** Reglas del juego, criterios de evaluación y especificaciones del reto Blinka.
* **Puntos Clave:**
  1. **Criterios de Evaluación:**
     * **30% Impacto:** ¿Resuelve un problema real y cuantificable en operaciones financieras?
     * **20% Innovación:** Uso de tecnologías de frontera (Model Context Protocol, autonomía con guardrails).
     * **20% Viabilidad Técnica:** Código robusto, modular, tipado y funcional.
     * **15% Viabilidad de Implementación:** Fácil de adoptar por empresas reales.
     * **15% Pitch (3 minutos):** Demostración concisa, problema, solución y demo en vivo.
  2. **El Reto Blinka:** Crear agentes autónomos que paguen facturas corporativas con toma de decisiones reglada (umbral de montos, verificación de cuentas bancarias y conciliación de transacciones).
