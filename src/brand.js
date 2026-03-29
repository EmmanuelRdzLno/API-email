/**
 * EVA by Solvix — Design tokens oficiales.
 * Fuente única de verdad para el sistema de email HTML.
 *
 * REGLAS DE USO:
 *  1. BASE y texto oscuro: SOLO en títulos, footer
 *  2. ACCENT (teal): barras laterales, highlights funcionales
 *  3. Fondos: SURFACE (blanco) o BG_SOFT (#F9FAFB) — NUNCA oscuros como fondo principal
 *  4. Único bloque oscuro permitido: footer del email
 *
 * Tipografía: Inter-first vía @import Google Fonts.
 * Outlook desktop ignora @import → fallback system-ui / Segoe UI (aceptable).
 */

export const BRAND = {
  // ── Identidad ──────────────────────────────────────────────────────────────
  BASE:   '#1F2A37',   // Azul Grafito Profundo
  ACCENT: '#0EA5A4',   // Teal de Precisión

  // ── Superficies ────────────────────────────────────────────────────────────
  SURFACE:  '#FFFFFF',   // Fondo de card / tarjeta principal
  BG_SOFT:  '#F9FAFB',   // Fondo externo suave / secciones neutras
  BG_OUTER: '#F1F5F9',   // Fondo exterior del email (wrapper)
  WHITE:    '#FFFFFF',

  // ── Texto ──────────────────────────────────────────────────────────────────
  TEXT_PRIMARY:   '#374151',
  TEXT_SECONDARY: '#6B7280',
  TEXT_MUTED:     '#9CA3AF',

  // ── Bordes ─────────────────────────────────────────────────────────────────
  BORDER: '#E5E7EB',

  // ── Semánticos ─────────────────────────────────────────────────────────────
  SUCCESS_BG:   '#F0FDFA',
  SUCCESS_TEXT: '#0F766E',

  WARNING_BG:     '#FFFBEB',
  WARNING_BORDER: '#FDE68A',
  WARNING_TEXT:   '#92400E',

  INFO_BG:     '#EFF6FF',
  INFO_BORDER: '#BFDBFE',
  INFO_TEXT:   '#1D4ED8',
};

export const FONT = {
  PRIMARY:    "'Inter', system-ui, -apple-system, 'Segoe UI', Arial, sans-serif",
  IMPORT_URL: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
};
