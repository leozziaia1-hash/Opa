# Plan de Refactorización: Apex GT Racing Engine & Zero-GC Memory Pool (Máxima Fidelidad Visual)

Plan de arquitectura y optimización de alto rendimiento para descomponer la clase monolítica `RacingGameEngine.ts` en subsistemas modulares independientes, erradicar asignaciones de memoria en el bucle de render mediante una piscina centralizada de vectores/matrices (`MathPool`), e implementar un simulador de físicas con *fixed timestep* a 120Hz e interpolación sub-frame.

---

### Compromiso de Integridad y Fidelidad Visual (Anti-Degradación)

> [!IMPORTANT]
> **Garantía Estricta: Cero Pérdida de Calidad Visual ni Elementos**:
> - **Todos los Efectos Cinemáticos Intactos**: Se preservan al 100% el *Heat Haze* (distorsión térmica de motor en GPU), *Speed Post Effect* (visión túnel y aberración cromática a alta velocidad), *Cinematic Optics* y el sistema de cielo dinámico procedural (*DynamicSkySystem*).
> - **Preservación Integral de Sombras y Materiales**: Se mantienen intactas las sombras suaves direccionales con seguimiento dinámico del monoplaza, texturas PBR de asfalto, reflejos en carrocería y shaders de fibra de carbono.
> - **Todos los Elementos del Mundo y Props**: Muros de contención, tribunas con público animado (*GrandstandCrowdSystem*), cabinas de comisarios, edificios VIP modernos, gantry de boxes y fondo montañoso distante (*DistantMountainBackdropBuilder*) se conservan sin omitir ningún objeto ni simplificar mallas.
> - **Partículas y Efectos Físicos**: Skidmarks de 4 ruedas independientes, humo de derrape/burnout, chispas por fondo plano o pinchazos, y vórtices aerodinámicos de alerón se mantienen idénticos.
> - **Origen de la Mejora**: El incremento en fluidez (60/120 FPS estables) proviene exclusivamente de **eliminar el Garbage Collector (GC)** mediante el banco estático `MathPool`, desacoplar la CPU y estabilizar la física con el acumulador a 120Hz, **sin recortar resolución ni gráficos**.

---

### Decisiones Críticas Confirmadas

- **Estructura de Refactorización**: Extracción de subsistemas modulares (`CameraSystem`, `RaceLoopManager`, `CollisionSubsystem`) manteniendo `RacingGameEngine` como orquestador ligero y reactivo.
- **Estrategia de Piscina de Memoria**: Piscina estática centralizada (`MathPool`) para vectores (`Vector3`), matrices (`Matrix4`), cuaterniones (`Quaternion`) y rayos (`Raycaster`), garantizando 0 asignaciones dinámicas por frame.
- **Física y Timestep**: Acumulador temporal a 120Hz fijos (`dt = 8.333ms`) con interpolación alfa entre sub-frames para eliminar saltos temporales, traspaso de muros por lag y jitter visual.

---

## 1. Visión General y Objetivos Técnicos

### El Problema Actual
- `RacingGameEngine.ts` supera los 100 KB y 2.500 líneas de código, acumulando responsabilidades dispares (cámara cinematográfica, físicas, telemetría, pits, colisiones, render y checkpoints).
- Se realizan múltiples llamadas a `new THREE.Vector3()` y objetos temporales en la cadena de animación `requestAnimationFrame`, provocando recolecciones de basura (*Garbage Collection pauses*) y caídas de framerate imprevistas.
- El paso temporal de la física varía directamente con el frametime del navegador (`dt`), lo que causa inestabilidad a altas velocidades (>300 km/h) si el navegador sufre una microcaída de frames.

### La Solución Arquitectónica
1. **Descomposición Modular**:
   - `CameraSystem.ts`: Manejo de vistas (`chase`, `hood`, `bumper`, `orbit`, `broadcast_pit`), suavizado angular de yaw y transiciones dinámicas de FOV.
   - `RaceLoopManager.ts`: Cronometraje de vueltas, sectores, récords personales (*best lap*), banderas y coordinación con `CareerRaceManager`.
   - `CollisionSubsystem.ts`: Verificación de límites de pista, bordillos de pianos (*kerbs*), barreras, muros de boxes y dispatch de daños mecánicos y deformación de chapa.
   - `RacingGameEngine.ts`: Orquestador principal simplificado (~350 líneas) que inicializa Three.js, enlaza subsistemas y gestiona el ciclo de vida del juego.
2. **Piscina Centralizada `MathPool` (Zero-GC)**:
   - Banco estático de estructuras matemáticas prealojadas en memoria VRAM/Heap.
   - Eliminación total de instanciaciones `new` dentro de `update()`, `physicsStep()`, cinemáticas y cálculos de partículas.
3. **Paso Físico Fijo a 120Hz (*Fixed Timestep Accumulator*)**:
   - Tasa de actualización de física constante a 120 ticks/segundo.
   - Transformaciones gráficas suavizadas mediante interpolación de estados previo y actual ($\alpha = \text{acumulador} / \text{dt}_{\text{físico}}$).

---

## 2. Experiencia de Usuario y Rendimiento Visual

- **Estabilidad de Framerate**: 60 FPS sólidos en hardware modesto y 120 FPS nativos en pantallas ProMotion / High-Refresh (120Hz/144Hz/240Hz) sin variabilidad en el comportamiento del monoplaza.
- **Respuesta Cinemática de Cámara**: Movimientos de cámara fluidos sin cortes de posición al entrar a boxes, acelerar o trompear.
- **Cero Reducción Gráfica**: La fidelidad visual se mantiene al 100%, con la misma riqueza visual, shaders y texturas que en la versión original.

---

## 3. Decisiones de Diseño y Trade-offs

| Decisión | Enfoque Elegido | Razón / Ventaja | Alternativa Descartada |
| :--- | :--- | :--- | :--- |
| **Arquitectura de Motor** | Subsistemas Modulares Orientados a Objetos | Mantiene compatibilidad total con la API existente de la UI y los componentes React sin romper tipos. | Arquitectura ECS completa (innecesariamente compleja y requeriría reescribir todo el juego). |
| **Fidelidad Gráfica** | 100% de Calidad Visual Preservada | Se corrigen los cuellos de botella en la raíz (CPU / GC) sin sacrificar shaders, efectos ni mallas. | Reducción de resolución o eliminación de efectos de post-procesado (inaceptable). |
| **Gestión de Memoria** | `MathPool` Estático Centralizado | Acceso inmediato O(1), sin overhead de acquire/release ni fugas de objetos olvidados. | Generic ObjectPool con acquire/release (propenso a olvidar devolver referencias en bucles complejos). |
| **Frecuencia de Físicas** | Acumulador Fijo a 120Hz con Sub-stepping | Gran precisión en el agarre de neumáticos a 350 km/h, sin riesgo de traspasar guardarraíles. | Paso variable simple (provoca inestabilidad en picos de lag). |

---

## 4. Arquitectura Técnica y Diagrama de Sistemas

### Diagrama de Flujo y Módulos

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                              App.tsx / HUD                             │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │ Inputs / Telemetry
 ┌───────────────────────────────────▼────────────────────────────────────┐
 │                     RacingGameEngine (Orchestrator)                    │
 │                                                                        │
 │  ┌──────────────────────────────────────────────────────────────────┐  │
 │  │                 Render Loop Tick (Preserves Shaders & FX)        │  │
 │  └───────┬──────────────────────────┬─────────────────────────┬─────┘  │
 └──────────┼──────────────────────────┼─────────────────────────┼────────┘
            │                          │                         │
            ▼                          ▼                         ▼
 ┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────┐
 │  CollisionSubsystem  │   │     CameraSystem     │   │ RaceLoopManager  │
 │                      │   │                      │   │                  │
 │ • Track Boundaries   │   │ • Chase / Hood / TV  │   │ • Lap & Sectors  │
 │ • Kerb Audio & Rumble│   │ • Dynamic FOV Lerp   │   │ • Best Lap Store │
 │ • Impact Deformation │   │ • Damped Yaw Track   │   │ • Leaderboard    │
 └──────────┬───────────┘   └──────────┬───────────┘   └────────┬─────────┘
            │                          │                        │
            └──────────────────────────┼────────────────────────┘
                                       │
                                       ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      MathPool (Zero-GC Scratch)                        │
 │  • Vector3: V0..V15     • Matrix4: M0..M3    • Raycaster: R0           │
 │  • Quaternion: Q0..Q3   • Euler: E0..E1      • Color: C0..C1           │
 └────────────────────────────────────────────────────────────────────────┘
```

### Detalle de Módulos

1. **`src/game/utils/MathPool.ts`**:
   - Contiene vectores prealojados: `MathPool.V0` hasta `MathPool.V15`.
   - Matrices y cuaterniones prealojados: `MathPool.M0`, `MathPool.Q0`.
   - Métodos auxiliares de cálculo vectorial sin crear instancias nuevas.
2. **`src/game/camera/CameraSystem.ts`**:
   - Encapsula las 4 perspectivas de cámara del jugador (`chase`, `hood`, `bumper`, `orbit`).
   - Orquesta la cámara cinematográfica de boxes (*pit lane 4K broadcast cam*).
   - Controla el FOV dinámico dependiente de la velocidad y el suavizado de cabeceo/alabeo.
3. **`src/game/race/RaceLoopManager.ts`**:
   - Control de tiempo por vuelta, sectores 1, 2 y 3.
   - Detección de vuelta rápida, persistencia en `localStorage` por circuito.
   - Coordinación con eventos de boxes y banderas.
4. **`src/game/collisions/CollisionSubsystem.ts`**:
   - Detección y respuesta ante barreras perimetrales, pianos, muros de boxes y obstáculos dinámicos.
   - Cálculo del impulso de impacto y aplicación de deformación sobre la malla del monoplaza (`CarModel`).
5. **Refactorización de `src/game/RacingGameEngine.ts`**:
   - Reducción del archivo principal a un coordinador limpio.
   - Integración del acumulador de 120Hz en el bucle `animate()`.
   - Conservación absoluta de todos los shaders, post-procesado, sombras y mallas gráficas.

---

## 5. Fases de Ejecución

1. **Fase 1: Infraestructura de Memoria (`MathPool`)**
   - Crear `MathPool.ts` con todos los vectores, matrices y utilidades matemáticas prealojadas.
2. **Fase 2: Extracción de Subsistemas**
   - Crear `CameraSystem.ts` extrayendo la lógica de cámaras y FOV.
   - Crear `RaceLoopManager.ts` extrayendo el cronometraje de sectores y récords.
   - Crear `CollisionSubsystem.ts` extrayendo colisiones de pista y deformación.
3. **Fase 3: Refactorización del Bucle Principal y Física 120Hz**
   - Conectar los subsistemas en `RacingGameEngine.ts`.
   - Implementar el acumulador de tiempo fijo (120Hz) con interpolación de renderizado.
   - Reemplazar todas las asignaciones dinámicas por el uso de `MathPool`.
   - Verificar que todos los shaders y efectos (Heat Haze, Speed Post Effect, luces, sombras y mallas) permanezcan exactamente en su sitio sin alteraciones visuales.
4. **Fase 4: Verificación y Pruebas**
   - Compilación con `compile_applet` y validación estricta con `lint_applet`.
   - Verificación del comportamiento del juego en pista, respuesta de mandos, paradas en boxes y estabilidad de 60/120 FPS.
