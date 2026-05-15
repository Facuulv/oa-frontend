# Frontend Governance (OA!)

Guía de estabilidad para evitar recaídas de deuda técnica luego de merges y nuevas features.

## 1) Reglas de Arquitectura

- Las rutas `app/**/page` deben ser delgadas: composición y wiring, no lógica de dominio extensa.
- Toda lógica de dominio repetible va a `src/features/*`, `src/hooks/*` o `src/services/*`.
- Evitar mezclar en un mismo módulo: fetch + mapping + reglas de negocio + JSX complejo.
- Los stores Zustand contienen estado global y acciones; la UI no debe duplicar contratos del store.

## 2) Reglas de Estado (Zustand)

- Definir selectores nombrados para estado crítico de sesión.
- Evitar lecturas dispersas del mismo store en un componente cuando puede agruparse.
- Usar `useShallow` al componer selectores objeto para minimizar renders evitables.
- No introducir flags duplicados si pueden derivarse de una sola fuente de verdad.

## 3) Reglas de UI y Estilos

- Preferir tokens/constantes (`src/constants/layout.js`, variables de `globals.css`) sobre hex hardcodeados.
- Reutilizar utilidades de navegación/formulario antes de copiar clases largas.
- Mantener breakpoints consistentes: documentar cuando un módulo use un corte distinto.
- Cualquier nuevo shell/sidebar/header debe usar contratos visuales compartidos.

## 4) Reglas para Next.js App Router

- Evaluar primero si una ruta puede ser Server Component.
- Marcar `"use client"` solo cuando realmente se necesite estado/efectos/eventos del cliente.
- Definir `loading.jsx` por segmento cuando el tiempo de carga sea perceptible.
- Evitar data fetching duplicado entre RSC y stores cliente para el mismo caso de uso.

## 5) Política de Merges

- PRs grandes deben dividirse por feature o capa (UI, store, services, routing).
- No mezclar refactors estructurales con cambios funcionales no relacionados.
- Resolver conflictos validando ambos flujos (público y admin), no solo compilación.
- Si se duplica un bloque por merge, dejar TODO técnico en el PR o resolver antes de merge final.

## 6) Checklist anti-regresión (obligatorio en PR)

- [ ] No se introdujeron nuevos god components (>500 líneas sin razón justificada).
- [ ] No hay duplicación de contrato auth (`user` vs flags conflictivos).
- [ ] Los componentes de lista pesada evaluaron memoización/selector estable.
- [ ] Se usaron constantes/tokens compartidos para layout y color de marca.
- [ ] No hay mezcla de responsabilidades en módulos críticos.
- [ ] Se verificó responsive base en mobile + desktop para la pantalla tocada.
- [ ] Si hubo merge complejo, se revisaron rutas admin y públicas afectadas.

## 6.1) Definition of Done técnico (obligatorio)

- [ ] La implementación respeta separación de responsabilidades (página delgada, lógica en hook/service/feature).
- [ ] El cambio incluye validación manual mínima en mobile y desktop para el flujo impactado.
- [ ] No se agregaron `console.*` de depuración en paths de producción.
- [ ] Si se tocó auth/store, se validaron redirecciones y estado de sesión.
- [ ] Si se tocó UI crítica, se validó accesibilidad básica (focus visible, botones con label, estados disabled).

## 6.2) Etiquetas de backlog recomendadas

- `stabilization`: deuda técnica y consolidación estructural.
- `feature`: entrega funcional de negocio.
- `risky`: cambio con potencial de regresión alta.
- `pre-release`: tareas de hardening y cierre de release.
- `post-merge`: limpieza específica por conflictos recientes.

## 6.3) Política de capacidad semanal

- Reservar **30-40%** de capacidad para `stabilization`.
- No iniciar una feature `risky` sin revisar impacto en módulos en refactor.
- Toda feature en áreas críticas debe incluir checklist de humo antes de merge.

## 7) Convención de tamaño sugerida

- `page.jsx`: ideal < 250 líneas, revisar > 350.
- Componente presentacional: ideal < 180 líneas, revisar > 260.
- Hook de feature: ideal < 220 líneas, revisar > 320.
- Store: justificar crecimiento con secciones y selectores explícitos.
