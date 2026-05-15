# Frontend Stabilization Baseline (OA!)

Fecha: 2026-05-15

Este documento deja trazable el cierre del baseline de auditoría para ejecutar el plan de estabilización frontend.

## Prioridades Acordadas

1. Reducir deuda de consistencia (auth contract, layout constants, duplicación de UI).
2. Consolidar patrones admin repetidos (listas paginadas y flujos CRUD).
3. Cortar módulos monolíticos en features de dominio (`combo`, checkout y admin).
4. Mejorar performance percibida y costo de hidratación.
5. Dejar gobernanza técnica para evitar recaídas post-merge.

## Riesgos Activos Aceptados

- Pantallas grandes con mezcla de UI + lógica + fetch.
- Desalineación parcial entre estado de sesión y selectores.
- Inconsistencias de breakpoints y estilos hardcodeados.
- Duplicación de patrones admin y utilidades visuales.

## Criterios de Aceptación por Etapa

- **Etapa 1 (quick wins):** contrato de auth unificado, reducción de duplicación de navegación y tokens visuales centralizados.
- **Etapa 2 (consolidación):** hook/base compartido para listas admin, menor código repetido entre módulos.
- **Etapa 3 (arquitectura):** extracción de lógica de dominio de archivos monolíticos hacia módulos feature.
- **Etapa 4 (performance):** menor trabajo innecesario en cliente y mejor experiencia de carga.
- **Etapa 5 (gobernanza):** estándares y checklist de PR/merge publicados y adoptables.

## Regla de Implementación

- Todos los cambios deben ser incrementales y sin big-bang refactor.
- No romper contratos API existentes sin migración explícita.
- Mantener compatibilidad funcional para panel admin y carta pública en cada PR.

## Operativa Semanal (con features en paralelo)

- Presupuesto fijo sugerido: **30-40%** del sprint para estabilización técnica.
- Revisión de backlog semanal con segmentación: `stabilization`, `feature`, `risky`, `pre-release`.
- Si una feature toca un módulo en consolidación activa, priorizar branch corto y merge secuenciado.
