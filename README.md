# LED Designer

Calculadora para Pantallas LED - Euforia Tecnica y Logistica para Eventos

## URL de Produccion

https://app.euforiateclog.cloud/tools/leddesigner/

## Funcionalidades

### Calculadora
- Seleccion de modulos LED y procesadores
- Entrada de dimensiones por modulos o centimetros
- Calculo automatico de:
  - Resolucion total y megapixeles
  - Aspect ratio con analisis de letterbox/pillarbox
  - Peso total y consumo electrico
  - Puntos de rigging y SWL
  - Distancia de visualizacion recomendada

### Procesadores Multiples
- Deteccion automatica cuando se requiere mas de un procesador
- Distribucion equilibrada de lineas entre procesadores
- Corte recto (horizontal o vertical) entre procesadores para mapeo simple
- Recomendacion de procesador alternativo

### Limite de Modulos por Output
- Campo configurable `maxModulesPerOutput` por procesador
- Permite limitar modulos por seguridad (ej: 10 en lugar de 14 calculados)
- Listbox con opciones desde el maximo calculado hacia abajo

### Pixel Map
- Visualizacion de la pantalla con patrones de cableado
- Colores diferentes por procesador para identificacion
- Linea divisoria sutil entre procesadores
- Conexiones siempre en extremos de la pantalla
- Numeracion de outputs con color del procesador
- Leyenda de procesadores cuando hay multiples
- Exportacion a PNG para uso en Resolume u otros

### Sistema de Proyectos
- Multiples proyectos guardados en localStorage
- Crear, duplicar, eliminar proyectos
- Auto-guardado de cambios
- Importar/exportar configuracion completa (JSON)

### Exportacion
- Especificaciones comerciales (TXT)
- Especificaciones tecnicas (TXT)
- Pixel map (PNG)
- Configuracion completa (JSON)

## Stack Tecnologico

- React 18
- Vite 6
- Tailwind CSS
- Lucide React (iconos)
- Canvas API (pixel map)

## Desarrollo Local

```bash
npm install
npm run dev
```

## Deploy

El proyecto esta deployado en Raspberry Pi 4 como parte del stack de EuforiaEvents.

```bash
# Desde Mac, sincronizar codigo
rsync -avz --exclude 'node_modules' --exclude 'dist' \
  /Users/malcomito/Projects/LedDesigner/ \
  malcomito@192.168.80.160:~/projects/LedDesigner/

# En la Pi, rebuild y redeploy
cd ~/projects/EuforiaEvents
docker compose -f docker-compose.prod.yml build led-designer
docker compose -f docker-compose.prod.yml up -d led-designer
```

## Estructura de Datos

### localStorage: 'led-designer-data'

```json
{
  "activeProjectId": "proj-001",
  "projects": {
    "proj-001": {
      "id": "proj-001",
      "name": "Nombre del Proyecto",
      "config": {
        "selectedModule": "arakur-p29",
        "selectedProcessor": "vx600",
        "widthModules": 6,
        "heightModules": 4,
        "wiringPattern": "horizontal-right",
        "groupIndexStart": 1
      }
    }
  },
  "modules": { ... },
  "processors": { ... }
}
```

### Procesadores Default

- NovaStar VX300 (3 outputs, 3.9MP)
- NovaStar VX600 (6 outputs, 3.9MP)
- NovaStar VX1000 (10 outputs, 6.5MP)
- NovaStar MSD300 (2 outputs, 1.3MP)
- NovaStar MSD600 (4 outputs, 2.3MP)

### Modulos Default

- Arakur P2.9 (208x208px, 64x64cm)
- Generic P3.9 (128x256px, 50x100cm)

## Logica de Cableado

1. **Conexiones en extremos**: Cada output comienza en un borde de la pantalla
2. **1 linea = 1+ outputs**: Si una linea cabe en el limite, usa 1 output; si no, divide
3. **Corte recto entre procesadores**: Horizontal para patron horizontal, vertical para vertical
4. **Cada procesador = rectangulo**: Para mapeo simple en software de video

## Colores de Procesadores en Pixel Map

| Procesador | Color |
|------------|-------|
| 1 | Cyan |
| 2 | Magenta |
| 3 | Naranja |
| 4 | Verde |
| 5 | Purpura |
| 6 | Amarillo |

---

Desarrollado para Euforia Tecnica y Logistica para Eventos
