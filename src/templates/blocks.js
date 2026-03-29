/**
 * EVA by Solvix — Bloques HTML reutilizables para email.
 *
 * JERARQUÍA DE COLOR (obligatoria):
 *  - Título: BASE (#1F2A37) + barra teal izquierda
 *  - Cards:  SURFACE (#FFFFFF) + borde BORDER
 *  - Meta:   BG_SOFT (#F9FAFB)
 *  - Alerts: fondos semánticos suaves (success/warning/info)
 *
 * PROHIBIDO:
 *  - hardcodear colores fuera de brand.js
 *  - fondos oscuros en bloques de contenido
 *  - gradientes, sombras decorativas
 */

import { BRAND, FONT } from '../brand.js';

// ─────────────────────────────────────────────────────────────────────────────
// Hero (sección de apertura con fondo suave)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sección hero — fondo BG_SOFT, título claro, descripción humana.
 * @param {string} title
 * @param {string} [description]
 */
export function blockHero(title, description = '') {
  const desc = description
    ? `<p style="margin:8px 0 0 0;font-family:${FONT.PRIMARY};font-size:14px;
                 font-weight:400;color:${BRAND.TEXT_SECONDARY};line-height:22px;">
         ${_esc(description)}
       </p>`
    : '';
  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
       style="margin:-32px -32px 28px;width:calc(100% + 64px);max-width:none;">
  <tr>
    <td style="background-color:${BRAND.BG_SOFT};padding:28px 32px 24px;
               border-bottom:1px solid ${BRAND.BORDER};">
      <h1 class="email-title"
          style="margin:0;font-family:${FONT.PRIMARY};font-size:22px;font-weight:700;
                 color:${BRAND.BASE};line-height:30px;letter-spacing:-0.3px;">
        ${_esc(title)}
      </h1>
      ${desc}
    </td>
  </tr>
</table>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Título de sección (dentro del body)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Título con barra teal izquierda. Fondo blanco.
 * @param {string} text
 * @param {string} [subtitle]
 */
export function blockTitle(text, subtitle = '') {
  const sub = subtitle
    ? `<p style="margin:4px 0 0 0;font-family:${FONT.PRIMARY};font-size:13px;
                 font-weight:400;color:${BRAND.TEXT_SECONDARY};line-height:20px;">
         ${_esc(subtitle)}
       </p>`
    : '';
  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
       style="margin-bottom:20px;">
  <tr>
    <td style="border-left:3px solid ${BRAND.ACCENT};padding-left:12px;">
      <h2 class="email-title"
          style="margin:0;font-family:${FONT.PRIMARY};font-size:17px;font-weight:600;
                 color:${BRAND.BASE};line-height:25px;letter-spacing:-0.1px;">
        ${_esc(text)}
      </h2>
      ${sub}
    </td>
  </tr>
</table>`;
}

/**
 * Párrafo de cuerpo.
 * @param {string} html   - Contenido ya sanitizado por el caller
 * @param {object} [opts]
 * @param {boolean} [opts.isLast]
 */
export function blockParagraph(html, { isLast = false } = {}) {
  const mb = isLast ? '0' : '14px';
  return `
<p style="margin:0 0 ${mb} 0;font-family:${FONT.PRIMARY};font-size:14px;font-weight:400;
           line-height:22px;color:${BRAND.TEXT_SECONDARY};">
  ${html}
</p>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Lista de adjuntos
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {Array<{filename: string, contentType?: string, approxBytes?: number}>} files
 */
export function blockAttachmentList(files) {
  if (!Array.isArray(files) || files.length === 0) return '';

  const rows = files.map((f, i) => {
    const name   = _esc(f.filename || 'archivo');
    const size   = f.approxBytes
      ? `&nbsp;<span style="font-family:${FONT.PRIMARY};font-size:11px;
                            color:${BRAND.TEXT_MUTED};">${_humanBytes(f.approxBytes)}</span>`
      : '';
    const border = i < files.length - 1 ? `border-bottom:1px solid ${BRAND.BORDER};` : '';
    const icon   = _fileIconHtml(f.contentType || f.filename);
    return `
    <tr>
      <td style="padding:10px 16px;${border}">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="width:28px;vertical-align:middle;">
              <div style="width:26px;height:26px;background-color:${BRAND.BG_SOFT};
                          border:1px solid ${BRAND.BORDER};border-radius:4px;
                          text-align:center;line-height:26px;font-size:13px;">
                ${icon}
              </div>
            </td>
            <td style="padding-left:10px;vertical-align:middle;">
              <span style="font-family:${FONT.PRIMARY};font-size:13px;font-weight:500;
                           color:${BRAND.TEXT_PRIMARY};">${name}</span>${size}
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
  }).join('');

  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
       style="margin:16px 0;border:1px solid ${BRAND.BORDER};border-radius:4px;
              overflow:hidden;">
  <tr>
    <td style="padding:8px 16px;background-color:${BRAND.BG_SOFT};
               border-bottom:1px solid ${BRAND.BORDER};">
      <span style="font-family:${FONT.PRIMARY};font-size:11px;font-weight:600;
                   color:${BRAND.TEXT_SECONDARY};text-transform:uppercase;letter-spacing:0.6px;">
        Archivos adjuntos&nbsp;(${files.length})
      </span>
    </td>
  </tr>
  ${rows}
</table>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tarjeta de metadata (clave–valor)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {Array<{label: string, value: string, highlight?: boolean}>} rows
 * @param {string} [title]
 */
export function blockMetadata(rows, title = '') {
  if (!Array.isArray(rows) || rows.length === 0) return '';

  const header = title
    ? `<tr>
        <td colspan="2"
            style="padding:8px 16px;background-color:${BRAND.BG_SOFT};
                   border-bottom:1px solid ${BRAND.BORDER};">
          <span style="font-family:${FONT.PRIMARY};font-size:11px;font-weight:600;
                       color:${BRAND.TEXT_SECONDARY};text-transform:uppercase;
                       letter-spacing:0.6px;">${_esc(title)}</span>
        </td>
       </tr>`
    : '';

  const dataRows = rows.map((r, i) => {
    const border    = i < rows.length - 1 ? `border-bottom:1px solid ${BRAND.BORDER};` : '';
    const valColor  = r.highlight ? BRAND.BASE   : BRAND.TEXT_SECONDARY;
    const valWeight = r.highlight ? '600'        : '400';
    return `
    <tr>
      <td style="padding:8px 16px;width:38%;${border}vertical-align:top;">
        <span style="font-family:${FONT.PRIMARY};font-size:12px;font-weight:500;
                     color:${BRAND.TEXT_MUTED};">${_esc(r.label)}</span>
      </td>
      <td style="padding:8px 16px;${border}vertical-align:top;">
        <span style="font-family:${FONT.PRIMARY};font-size:13px;font-weight:${valWeight};
                     color:${valColor};">${_esc(String(r.value ?? '—'))}</span>
      </td>
    </tr>`;
  }).join('');

  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
       class="meta-card"
       style="margin:16px 0;border:1px solid ${BRAND.BORDER};border-radius:4px;
              overflow:hidden;background-color:${BRAND.SURFACE};">
  ${header}
  ${dataRows}
</table>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Alertas
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Banner de alerta — fondo suave + borde lateral.
 * Usar SOLO cuando el mensaje es funcional y necesario.
 * @param {string} message
 * @param {'info'|'success'|'warning'} [variant]
 */
export function blockAlert(message, variant = 'info') {
  const styles = {
    success: { bg: BRAND.SUCCESS_BG,  border: BRAND.ACCENT,          text: BRAND.SUCCESS_TEXT },
    warning: { bg: BRAND.WARNING_BG,  border: BRAND.WARNING_BORDER,  text: BRAND.WARNING_TEXT },
    info:    { bg: BRAND.INFO_BG,     border: BRAND.INFO_BORDER,     text: BRAND.INFO_TEXT    },
  };
  const s = styles[variant] || styles.info;
  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
       style="margin:16px 0;background-color:${s.bg};
              border-left:3px solid ${s.border};border-radius:0 4px 4px 0;">
  <tr>
    <td style="padding:11px 14px;">
      <p style="margin:0;font-family:${FONT.PRIMARY};font-size:13px;font-weight:400;
                color:${s.text};line-height:20px;">
        ${message}
      </p>
    </td>
  </tr>
</table>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Divisor y espaciador
// ─────────────────────────────────────────────────────────────────────────────

export function blockDivider() {
  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
       style="margin:20px 0;">
  <tr>
    <td style="height:1px;background-color:${BRAND.BORDER};font-size:0;line-height:0;">&nbsp;</td>
  </tr>
</table>`;
}

export function blockSpacer(px = 16) {
  return `<div style="height:${px}px;font-size:0;line-height:0;">&nbsp;</div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers privados
// ─────────────────────────────────────────────────────────────────────────────

function _esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function _fileIconHtml(typeOrName) {
  const s = (typeOrName || '').toLowerCase();
  if (s.includes('pdf'))   return '&#128196;';
  if (s.includes('xml'))   return '&#128451;';
  if (s.includes('zip'))   return '&#128230;';
  if (s.includes('xlsx') || s.includes('spreadsheet')) return '&#128202;';
  return '&#128206;';
}

function _humanBytes(bytes) {
  if (bytes < 1024)         return `${bytes} B`;
  if (bytes < 1024 * 1024)  return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
