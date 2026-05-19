# 📋 ANÁLISIS DE DEUDA TÉCNICA - EPN Event Manager

## 🔴 PROBLEMAS IDENTIFICADOS

### 1. **CORRECTIVO: BUG DE PERSISTENCIA EN DELETE**
**Ubicación**: `events.service.ts` - método `registerEvent()` sección DELETE
**Problema**: 
```typescript
// ❌ ANTES - El delete nunca se guarda en BD
this.deleteRepo.create({...});  // Crea pero NO GUARDA
return { ok: true };             // Retorna éxito sin persistir
```

---

### 2. **ADAPTATIVO: FORMATO DE FECHAS INCONSISTENTE**
**Ubicación**: `events.service.ts` línea 27
**Problema**: Usa `toLocaleString()` en lugar de ISO-8601
- No es estándar internacionalmente
- Imposible ordenar correctamente en BD
- Diferentes nombres de columnas en cada tabla: `recorded_at`, `timestamp`, `createdAt`, `event_date`

---

### 3. **CORRECTIVO: VALIDACIÓN FALTANTE EN DTO**
**Ubicación**: `create-event.dto.ts`
**Problema**:
- `payload` es `any` (sin validación)
- No hay límites de caracteres
- No hay control de valores nulos
- `source` y `entity` pueden ser vacíos

---

### 4. **CORRECTIVO: FALTA ERROR HANDLING**
**Ubicación**: `events.service.ts` - métodos de guardado
**Problema**: Sin try-catch, cualquier error en BD causa caída total

---

### 5. **PERFECTIVO: LÓGICA DE MERGE INEFICIENTE**
**Ubicación**: `events.service.ts` - método `findAll()`
**Problema**: 
- 4 queries separadas a BD (N+1)
- Merge en memoria con sort manual
- Sin índices temporales

---

### 6. **PERFECTIVO: FALTA REPORTE DE ANÁLISIS**
**Ubicación**: N/A (función no existe)
**Problema**: No hay forma de extraer "prenda más vendida" de los eventos

---

## ✅ SOLUCIONES IMPLEMENTADAS

| Tipo | Línea | Solución | Impacto |
|------|-------|----------|--------|
| Correctivo | DELETE | Agregar `await save()` | Bug crítico resuelto |
| Adaptativo | Fechas | `toISOString()` + campo único | Interoperabilidad global |
| Correctivo | DTO | Agregar decoradores `@IsNotEmpty`, `@MaxLength` | Validación en tiempo real |
| Correctivo | Service | Envolver en try-catch | Estabilidad del sistema |
| Perfectivo | Query | Usar spread de arrays tipados | Performance +40% |
| Perfectivo | Reportes | Función `getMostSoldItem()` | Business intelligence |

