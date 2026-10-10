# Plan Maestro: Depuración Acústica Dinámica y Saneamiento Geométrico de Vértices

Plan técnico para erradicar definitivamente el sonido parásito de tipo interferencia de radio (que se activa únicamente cuando el vehículo supera los 0 km/h) y corregir la intrusión de malla de césped/terreno en los ápices de las curvas del Circuito 1 (Square Apex), manteniendo 60/120 FPS estables.

> [!IMPORTANT]
> **Diagnóstico Clave Confirmado:**
> - **Comportamiento Acústico**: El sonido de interferencia/radiofrecuencia NO se escucha a 0 km/h (ralentí limpio), sino que se dispara inmediatamente cuando el vehículo inicia la marcha (> 0 km/h) o se aplica carga de acelerador.
> - **Causas Raíz Identificadas**:
>   1. **`f1WhineOsc` (1500 Hz - 3400 Hz)**: Oscilador senoidal puro modulado por `loadFactor > 0.02` que se activa en cuanto el coche inicia movimiento, sonando como portadora de radio o silbido de alternador parásito.
>   2. **`windGain` / `windSource`**: Búfer de ruido rosa/blanco con filtro pasobajo que se abre en cuanto `speed >= 1.0 m/s`, produciendo un siseo/estática constante de fondo que emula ruido de sintonizador de radio.
>   3. **Fricción de neumático / Scrub en tracción**: La aceleración desde parado dispara micro-deslizamiento (`slipRatio > 0.12`), abriendo el filtro pasa-banda a 1400 Hz del búfer de fricción con sonido de estática.
>   4. **Intermodulación en WaveShaper**: Saturación no lineal agresiva de armónicos que añade zumbido eléctrico bajo aceleración.
> - **Causas Geométricas en Pista (Circuito 1)**:
>   1. **Elevación ondulatoria del terreno base**: `SculptedOrganicTerrain` tiene cuadrícula de 12.5 m (64x64 en 800 m). Al elevarse fuera del radio de 46 m, la interpolación de triángulos estira aristas oblicuas que atraviesan la rasante horizontal del asfalto ($y = 0.005$) y del piano ($y = 0.025$).
>   2. **Solapamiento y holgura en arcén de tierra**: El arcén interior se generaba solapando el radio del piano ($r = 27.8$ a $30.0$ vs piano $r = 28.4$ a $30.0$) dejando cuñas de discontinuidad en los empalmes recto-curva.

---

## 1. Visión General y Diagnóstico Exhaustivo

### A. Diagnóstico Acústico (El porqué a 0 km/h no se escucha y al moverse sí)
Al estar el vehículo detenido ($0\text{ km/h}$, ralentí a $1000\text{ RPM}$, acelerador $0.0$, `slipRatio = 0`):
- `f1Volume = 0.0` (la compuerta `loadFactor > 0.02` permanece cerrada).
- `windTargetGain = 0.0` (la compuerta `speed < 1.0` permanece cerrada).
- `tireRumbleGain = 0.0` y `screechGain = 0.0`.
- Por tanto, al ralentí el motor suena sin ninguna estática.

En el instante exacto en que el usuario pisa el acelerador o el vehículo comienza a moverse ($> 0\text{ km/h}$):
1. **Disparo de `f1WhineOsc`**: El oscilador a 1500–3400 Hz se abre abruptamente hacia `this.engineBusGain`. Un tono senoidal puro continuo a 1.5 kHz suena de manera idéntica a una interferencia electromagnética de radio (RFI) o silbido de sintonizador.
2. **Disparo de `windSource`**: Al superar $1.0\text{ m/s}$ ($3.6\text{ km/h}$), el búfer de ruido se suma al máster filtrado como ruido de banda ancha, añadiendo un siseo continuo tipo "fritura de radio".
3. **Pico de tracción**: En salida de parado, el deslizamiento longitudinal supera el umbral del filtro pasa-banda de neumáticos a 1400 Hz, inyectando ráfagas de ruido aleatorio.

### B. Diagnóstico de Intrusión de Terreno en Curvas
1. **Interpolación Poligonal de Malla**: En `OrganicTerrainBuilder.ts`, la malla de terreno tiene vértices cada 12.5 metros. Si un vértice en $(50, -50)$ se eleva 3 o 4 metros por las funciones senoidales, el triángulo que conecta con $(62.5, -62.5)$ cruza diagonalmente el plano de la pista, emergiendo hierba sobre el asfalto.
2. **Geometría de Arcenes y Pianos**: El piano FIA interior tiene un ancho de 1.6 m (de $r = 30.0$ a $r = 28.4$). El arcén de tierra interior se extendía desde $27.8$ hasta $30.0$ m, solapando con el piano y dejando un hueco angular en la transición con la recta.

---

## 2. Experiencia de Usuario y Acabado FIA

- **Pureza Acústica de Competición**:
  - Al iniciar la marcha, el sonido responde exclusivamente con el rugido visceral del V8 (armónicos de admisión, pulso de escape profundo y resonancia de cámara).
  - Eliminación total del tono senoidal parásito a 1.5 kHz (`f1WhineOsc` eliminado o sustituido por armónico de transmisión orgánico inaudible como interferencia).
  - El ruido de viento aerodinámico solo abre a altas velocidades ($> 80\text{ km/h}$) con curva cúbica suave y sin siseos a baja velocidad.
  - La distorsión por intermodulación (IMD) del WaveShaper queda calibrada con pre-ganancia conservadora para evitar zumbidos eléctricos.
- **Vértice de Curva Limpio y Reglamentario**:
  - Interior de la curva constituido estrictamente por el piano reglamentario FIA en rojo y blanco con biselado tridimensional.
  - Arcén de tierra compactada continuo y hermético sin grietas ni desniveles.
  - Terreno de hierba confinado rigurosamente a cota plana $y = -0.04\text{ m}$ en todo el interior del circuito, eliminando cualquier intrusión vegetal.

---

## 3. Decisiones Técnicas y Compromisos

- **Decisión 1: Silenciado Completo del `f1WhineOsc` o Transformación a Armónico Mecánico**
  - *Enfoque*: Desactivar por completo el oscilador senoidal aislado `f1WhineOsc` (que genera la falsa impresión de interferencia de radio) o fijar su ganancia en 0.0. Toda la tonalidad del motor provendrá de la síntesis armónica aditiva del bloque V8.
  - *Justificación*: Los motores V8 de competición no disponen de sistema híbrido MGU-K silbante. El tono senoidal a 1500 Hz es el causante directo del reporte del usuario.
- **Decisión 2: Perfil Aerodinámico sin Fritura a Baja/Media Velocidad**
  - *Enfoque*: Elevar el umbral de activación del viento a $22\text{ m/s}$ ($80\text{ km/h}$) con progresión $V^3$, asegurando silencio absoluto de ruido blanco durante aceleraciones a baja velocidad.
- **Decisión 3: Zona de Exclusión Total del Terreno Infield en Circuito 1**
  - *Enfoque*: En `OrganicTerrainBuilder.ts`, cualquier punto dentro de los límites interiores del circuito ($|x| \le 110\text{ m}$ y $|z| \le 110\text{ m}$) tendrá elevación forzada a `0.000` absoluto (plano a $-0.04\text{ m}$).
  - *Justificación*: Elimina de raíz cualquier posibilidad geométrica de que aristas de 12.5 m perforen el asfalto.

---

## 4. Arquitectura Técnica y Diagrama del Sistema

```
┌────────────────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA DE CORRECCIÓN                          │
├──────────────────────────────────┬─────────────────────────────────────┤
│         PIPELINE DE AUDIO        │        PIPELINE GEOMÉTRICO          │
│        (src/game/audio)          │        (src/game/world)             │
├──────────────────────────────────┼─────────────────────────────────────┤
│ ┌──────────────────────────────┐ │ ┌─────────────────────────────────┐ │
│ │ EngineSound.ts               │ │ │ OrganicTerrainBuilder.ts        │ │
│ │ • f1WhineGain.gain = 0.0     │ │ │ • Infield Box Mask:             │ │
│ │   (Elimina tono 1.5-3.4 kHz) │ │ │   |x| <= 110 && |z| <= 110      │ │
│ │ • Wind threshold: > 80 km/h  │ │ │   elevation = 0.0 estrictamente │ │
│ │ • Tire scrub gate calibrado  │ │ └────────────────┬────────────────┘ │
│ └──────────────┬───────────────┘ │                  │                  │
│                │                 │ ┌────────────────▼────────────────┐ │
│ ┌──────────────▼──────────────┐ │ │ TrackBuilder.ts                 │ │
│ │ WaveShaper & Bus            │ │ │ • Arcén interior:                │ │
│ │ • PreGain = 0.18 (Anti-IMD) │ │ │   radio 26.2 a 28.4 (sin solape) │ │
│ │ • Master sin fritura parásita│ │ │ • Parche triangular en esquina  │ │
│ └──────────────────────────────┘ │ │ • Exclusión de penachos de hierba│ │
│                                  │ └─────────────────────────────────┘ │
└──────────────────────────────────┴─────────────────────────────────────┘
```

---

## 5. Plan de Verificación

1. **Prueba de Rodadura y Aceleración (Audio)**:
   - Arrancar y acelerar progresivamente de 0 a 100 km/h.
   - Confirmar la ausencia absoluta del silbido/portadora de radio a 1.5 kHz y de siseo blanco en aceleración.
2. **Inspección Óptica de los 4 Vértices (Geometría)**:
   - Recorrer las 4 curvas del Circuito 1 y verificar con cámara en tercera persona y rasante.
   - Confirmar que el piano y el arcén se muestran con superficie limpia, asfalto íntegro y sin penetración poligonal de césped.
3. **Verificación de Compilación**:
   - Ejecutar `compile_applet` para asegurar 0 errores de compilación TypeScript.
