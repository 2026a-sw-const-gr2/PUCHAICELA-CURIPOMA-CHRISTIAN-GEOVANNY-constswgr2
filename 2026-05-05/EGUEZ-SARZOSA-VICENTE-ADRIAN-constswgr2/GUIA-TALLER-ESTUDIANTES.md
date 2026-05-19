# Guia del Taller: EPN Event Manager

## Objetivo
Este taller usa un backend central de eventos para que cada estudiante conecte su propio CRUD y registre actividad del sistema. La meta no es solo consumir una API, sino practicar mantenimiento de software sobre un proyecto que funciona, pero que fue disenado con deuda tecnica intencional.

## Idea Central del Backend
Cada estudiante tendra un CRUD diferente. Por eso, en lugar de modelar tablas por dominio como `players`, `planets` o `books`, el Event Manager guardara eventos genericos enviados por cualquier sistema.

La decision intencionalmente incorrecta sera usar una tabla por tipo de operacion:

- `create_events`
- `update_events`
- `delete_events`
- `query_events`

Este diseno es util para el taller porque soporta CRUDs distintos, pero al mismo tiempo introduce problemas reales de mantenimiento.

## Por Que Este Diseno Esta Mal a Proposito
Separar por operacion y no por un modelo normalizado genera varios problemas:

- Duplica estructura y logica de persistencia.
- Obliga a usar `if` o `switch` para decidir en que tabla guardar.
- Hace mas costoso listar el historial completo porque hay que unir varias tablas manualmente.
- Facilita inconsistencias entre columnas, validaciones y formatos de fecha.
- Vuelve mas dificil agregar reportes o metricas globales.

En un sistema bien disenado, probablemente existiria una sola tabla `events` con una columna `action`. En este taller no se hara asi porque necesitamos un sistema que sea mantenible, no perfecto.

## Propuesta de Payload
Cada CRUD de estudiante enviara eventos como este:

```json
{
  "source": "crud-planetas",
  "entity": "planet",
  "action": "DELETE",
  "title": "Planeta eliminado",
  "description": "Se elimino Marte del catalogo",
  "payload": {
    "id": 4,
    "name": "Marte"
  }
}
```

## Endpoints Base
- `POST /events`: registra un evento.
- `GET /events`: devuelve el historial completo mezclando varias tablas.
- `GET /health`: confirma que la API esta activa.
- `GET /stats`: devuelve metricas generales del hub.
- `GET /events/source/:source`: filtra eventos por sistema origen.
- `GET /events/entity/:entity`: filtra eventos por entidad.

Payload esperado en `POST /events`:

- `source`
- `entity`
- `action`
- `title`
- `description`
- `payload`

## Estructura Tecnica Sugerida
- Framework: NestJS
- ORM: TypeORM
- Base de datos: SQLite
- Entidades iniciales:
  - `CreateEventEntity`
  - `UpdateEventEntity`
  - `DeleteEventEntity`
  - `QueryEventEntity`

## Errores y Debilidades Intencionales
El backend debe arrancar y funcionar, pero con varios problemas sembrados a proposito. Para el taller, no se documentaran los defectos concretos en este archivo ni en el codigo base.

Lo que si deben saber los estudiantes es lo siguiente:

- Existen 6 incidencias intencionales distribuidas en los 6 endpoints publicados.
- Cada endpoint expuesto debe ser revisado funcionalmente y a nivel de codigo.
- Las incidencias fueron pensadas para provocar actividades de mantenimiento correctivo, adaptativo, perfectivo y preventivo.
- No todos los problemas se manifiestan de la misma forma: algunos afectan comportamiento, otros compatibilidad, otros calidad interna y otros robustez.

## Cumplimiento de los 4 Tipos de Mantenimiento

### 1. Mantenimiento Correctivo
El sistema contiene al menos una incidencia funcional que provoca un comportamiento incorrecto en tiempo de ejecucion.

Resultado esperado del estudiante:

- Reproducir el fallo.
- Encontrar su causa tecnica.
- Corregirlo sin introducir regresiones.

### 2. Mantenimiento Adaptativo
El sistema tambien debe ser ajustado a requisitos externos o reglas nuevas del entorno.

Resultado esperado del estudiante:

- Identificar la parte del sistema que no cumple la nueva regla.
- Aplicar el cambio de forma compatible con el resto del hub.
- Verificar que los clientes puedan seguir integrandose.

### 3. Mantenimiento Perfectivo
El taller incluye trabajo de mejora sobre rendimiento, organizacion interna o capacidad de analisis.

Resultado esperado del estudiante:

- Detectar puntos de mejora.
- Refactorizar sin cambiar el contrato funcional esperado.
- Justificar la mejora con evidencia tecnica.

### 4. Mantenimiento Preventivo
Tambien existen puntos del sistema que deben reforzarse para reducir riesgo futuro.

Resultado esperado del estudiante:

- Identificar fragilidades tecnicas antes de que fallen en produccion.
- Endurecer validaciones, manejo de errores o controles de entrada.
- Explicar por que el cambio reduce riesgo operativo.

Conclusion: con esta arquitectura si se cubren los 4 tipos de mantenimiento, siempre que el repositorio base incluya defectos y restricciones reales para que los estudiantes los enfrenten de forma incremental.

## Tareas del Taller para Estudiantes

### Tarea 1. Integracion
- Levantar el Event Manager localmente.
- Conectar su CRUD al endpoint `POST /events`.
- Enviar eventos de `CREATE`, `UPDATE`, `DELETE` y `QUERY`.
- Verificar el comportamiento de los 6 endpoints publicados.

### Tarea 2. Mantenimiento Correctivo
- Seleccionar una incidencia funcional real.
- Identificar la causa en controller, service, repository o capa de consulta.
- Corregir el problema sin romper otros endpoints.
- Explicar por que el cambio corresponde a mantenimiento correctivo.

### Tarea 3. Mantenimiento Adaptativo
- Ajustar el sistema a una regla nueva definida por el docente.
- Aplicar el cambio en todos los endpoints afectados.
- Verificar que los CRUDs clientes puedan seguir integrandose con el hub.
- Explicar por que el cambio corresponde a mantenimiento adaptativo.

### Tarea 4. Mantenimiento Perfectivo
- Mejorar una parte del sistema relacionada con consulta, agregacion o reporte.
- Refactorizar el codigo sin ocultar el anti patron principal del taller.
- Presentar una mejora medible o observable.
- Explicar por que el cambio corresponde a mantenimiento perfectivo.

### Tarea 5. Mantenimiento Preventivo
- Agregar validaciones a DTOs.
- Restringir longitud de campos como `title`, `description` y `source`.
- Manejar errores de payload invalido o demasiado grande.
- Explicar por que el cambio corresponde a mantenimiento preventivo.

## Reglas para la Sustentacion
Cada grupo debe presentar:

- El problema recibido.
- La parte del codigo afectada.
- La solucion implementada.
- La clasificacion del mantenimiento.
- Evidencia de prueba antes y despues del cambio.

## Recomendacion Docente
La tabla `query_events` forma parte del diseno completo del taller. La idea es que el hub reciba operaciones de escritura y tambien consultas realizadas desde los CRUDs de los estudiantes.

Eso permite:

- Tener 4 tipos de operacion visibles desde el inicio.
- Hacer mas evidente el problema del agregado entre tablas.
- Dar mas material para metricas y reportes.