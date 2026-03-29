/**
 * EVA by Solvix — Email content builder.
 *
 * Interprets the incoming API payload and produces the structured options
 * expected by renderEmailTemplate(). The controller calls buildEmailContent()
 * and passes the result to the renderer.
 *
 * Backward-compatible:
 *   - payload has `html`              → use as-is (no wrapping, original behaviour)
 *   - payload has `text` only         → wrap in EVA generic layout
 *   - payload has `templateType`      → use specialized builder
 *   - otherwise                       → generic_professional
 */

import { renderEmailTemplate } from './emailRenderer.js';

// ─────────────────────────────────────────────────────────────────────────────
// Main entry point
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds the final { html, text, subject } from the raw API payload.
 * Returns null if no template rendering is needed (raw html provided without context).
 *
 * @param {object} payload  - Request body from mailController
 * @returns {{ html: string, text: string, subject: string } | null}
 */
export function buildEmailContent(payload) {
  const { html, text, templateType, templateContext = {}, subject } = payload;

  // ── Case A: caller passed explicit html AND no templateType → preserve verbatim ──
  if (html && !templateType) {
    return null;  // controller will use payload.html / payload.text as-is
  }

  // ── Case B: specialized template requested ─────────────────────────────────
  if (templateType) {
    switch (templateType) {
      case 'invoice_delivery':
        return buildInvoiceEmailContent({ ...templateContext, subject });

      case 'document_delivery':
        return buildDocumentEmailContent({ ...templateContext, subject });

      default:
        return buildGenericProfessionalEmailContent({ ...templateContext, subject, text, html });
    }
  }

  // ── Case C: text only → wrap in EVA generic layout ─────────────────────────
  if (text && !html) {
    return buildGenericProfessionalEmailContent({ text, subject });
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Specialized builders
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds content for invoice delivery emails.
 *
 * @param {object} ctx
 * @param {string}  [ctx.subject]
 * @param {string}  [ctx.folio]
 * @param {string}  [ctx.uuid]
 * @param {string}  [ctx.receiverName]
 * @param {string}  [ctx.receiverRfc]
 * @param {string}  [ctx.issuerName]
 * @param {string}  [ctx.issuerRfc]
 * @param {string}  [ctx.formats]        - e.g. "PDF y XML"
 * @param {string}  [ctx.issuedAt]       - ISO date string or human-readable
 * @param {string}  [ctx.total]          - e.g. "$1,250.00 MXN"
 * @param {Array}   [ctx.attachments]    - [{filename, contentType, approxBytes}]
 * @param {string}  [ctx.introText]      - Override opening paragraph
 * @returns {{ html: string, text: string, subject: string }}
 */
export function buildInvoiceEmailContent(ctx = {}) {
  const {
    subject,
    folio,
    uuid,
    receiverName,
    receiverRfc,
    issuerName,
    issuerRfc,
    formats    = 'Factura',
    issuedAt,
    total,
    attachments = [],
    introText,
  } = ctx;

  const greeting   = receiverName ? `Hola, ${receiverName}.` : 'Estimado cliente.';
  const folioLabel = folio ? `#${folio}` : '';
  const intro = introText || (
    `${greeting} Adjuntamos los archivos correspondientes a ${folioLabel ? `la factura ${folioLabel}` : 'tu factura'} generada a través de EVA.`
  );

  const metadata = [];
  if (folio)        metadata.push({ label: 'Folio',    value: folio,        highlight: true });
  if (issuerRfc)    metadata.push({ label: 'Emisor',   value: issuerRfc     + (issuerName ? ` — ${issuerName}` : '') });
  if (receiverRfc)  metadata.push({ label: 'Receptor', value: receiverRfc   + (receiverName ? ` — ${receiverName}` : '') });
  if (total)        metadata.push({ label: 'Total',    value: total,        highlight: true });
  if (issuedAt)     metadata.push({ label: 'Fecha',    value: _formatDate(issuedAt) });
  if (uuid)         metadata.push({ label: 'UUID',     value: uuid });
  if (formats)      metadata.push({ label: 'Archivos', value: formats });

  return renderEmailTemplate({
    templateType:       'invoice_delivery',
    title:              folioLabel ? `Factura ${folioLabel}` : 'Tu factura',
    subtitle:           formats,
    introText:          intro,
    metadata,
    attachmentsSummary: buildAttachmentSummary(attachments),
    alertMessage:       'Este documento tiene validez fiscal ante el SAT.',
    alertVariant:       'success',
    subjectContext:     { folio, receiverName, issuerRfc, formats },
    subjectOverride:    subject || '',
  });
}

/**
 * Builds content for generic document delivery emails.
 *
 * @param {object} ctx
 * @param {string}  [ctx.subject]
 * @param {string}  [ctx.documentType]   - "contrato", "reporte", etc.
 * @param {string}  [ctx.receiverName]
 * @param {string}  [ctx.description]    - One-line description of the document
 * @param {Array}   [ctx.attachments]
 * @param {string}  [ctx.introText]
 * @returns {{ html: string, text: string, subject: string }}
 */
export function buildDocumentEmailContent(ctx = {}) {
  const {
    subject,
    documentType = 'documento',
    receiverName,
    description,
    attachments  = [],
    introText,
  } = ctx;

  const greeting = receiverName ? `Hola, ${receiverName}.` : 'Estimado usuario.';
  const intro = introText || `${greeting} Adjuntamos el ${documentType.toLowerCase()} solicitado a través de EVA.`;

  const metadata = [];
  if (documentType) metadata.push({ label: 'Tipo',         value: _capitalize(documentType) });
  if (description)  metadata.push({ label: 'Descripción',  value: description });

  return renderEmailTemplate({
    templateType:       'document_delivery',
    title:              _capitalize(documentType),
    introText:          intro,
    metadata,
    attachmentsSummary: buildAttachmentSummary(attachments),
    subjectContext:     { documentType, receiverName },
    subjectOverride:    subject || '',
  });
}

/**
 * Wraps a free-form text or html message in the EVA professional layout.
 *
 * @param {object} ctx
 * @param {string}  [ctx.subject]
 * @param {string}  [ctx.topic]        - e.g. "Informe mensual"
 * @param {string}  [ctx.receiverName]
 * @param {string}  [ctx.text]         - Plain text body
 * @param {string}  [ctx.html]         - HTML body (injected as messageHtml)
 * @param {string}  [ctx.introText]
 * @param {Array}   [ctx.metadata]
 * @param {Array}   [ctx.attachments]
 * @returns {{ html: string, text: string, subject: string }}
 */
export function buildGenericProfessionalEmailContent(ctx = {}) {
  const {
    subject,
    topic        = '',
    receiverName,
    text,
    html,
    introText,
    metadata     = [],
    attachments  = [],
  } = ctx;

  const effectiveIntro = introText || (receiverName ? `Hola, ${receiverName}.` : '');
  const messageHtml = html ? html : (text ? `<p style="margin:0 0 16px 0;font-size:15px;line-height:24px;color:#475569;">${_escNewlines(text)}</p>` : '');
  const messageText = text || '';

  return renderEmailTemplate({
    templateType:       'generic_professional',
    title:              topic || 'Mensaje de EVA',
    introText:          effectiveIntro,
    messageHtml,
    messageText,
    metadata,
    attachmentsSummary: buildAttachmentSummary(attachments),
    subjectContext:     { subject, topic, receiverName },
    subjectOverride:    subject || '',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalizes attachment list to summary format expected by blockAttachmentList.
 * Accepts either parsed attachments (with _meta.approxBytes) or raw items.
 *
 * @param {Array} attachments
 * @returns {Array<{filename: string, contentType: string, approxBytes?: number}>}
 */
export function buildAttachmentSummary(attachments) {
  if (!Array.isArray(attachments) || attachments.length === 0) return [];
  return attachments.map(a => ({
    filename:    a.filename || 'archivo',
    contentType: a.contentType || a.encoding || 'application/octet-stream',
    approxBytes: a._meta?.approxBytes ?? a.approxBytes ?? undefined,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Private helpers
// ─────────────────────────────────────────────────────────────────────────────

function _capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function _formatDate(isoOrString) {
  if (!isoOrString) return '';
  try {
    const d = new Date(isoOrString);
    if (isNaN(d)) return isoOrString;
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return isoOrString;
  }
}

function _escNewlines(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}
