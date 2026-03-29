/**
 * EVA by Solvix — Email renderer.
 * Composes blocks into the base layout and produces { html, text }.
 *
 * Usage:
 *   const { html, text } = renderEmailTemplate({ templateType, ... })
 */

import { wrapInLayout }   from './templates/layout.js';
import {
  blockHero,
  blockTitle,
  blockParagraph,
  blockAttachmentList,
  blockMetadata,
  blockAlert,
  blockDivider,
  blockSpacer,
} from './templates/blocks.js';
import {
  invoiceDeliverySubject,
  documentDeliverySubject,
  genericProfessionalSubject,
} from './templates/subjects.js';

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders an EVA email template.
 *
 * @param {object} opts
 * @param {'invoice_delivery'|'document_delivery'|'generic_professional'} [opts.templateType]
 *   Defaults to 'generic_professional' when not provided.
 *
 * @param {string}  [opts.title]           - Card heading
 * @param {string}  [opts.subtitle]        - Card subheading
 * @param {string}  [opts.introText]       - Opening paragraph (plain text, auto-escaped)
 * @param {string}  [opts.messageHtml]     - Custom HTML body injected after introText
 * @param {string}  [opts.messageText]     - Plain-text version of messageHtml
 * @param {Array}   [opts.attachmentsSummary] - [{filename, contentType?, approxBytes?}]
 * @param {Array}   [opts.metadata]        - [{label, value, highlight?}]
 * @param {string}  [opts.alertMessage]    - Optional alert banner text
 * @param {'info'|'success'|'warning'} [opts.alertVariant]
 * @param {object}  [opts.subjectContext]  - Passed to subject generator
 * @param {string}  [opts.subjectOverride] - Bypass subject generator entirely
 *
 * @returns {{ html: string, text: string, subject: string, preheader: string }}
 */
export function renderEmailTemplate({
  templateType        = 'generic_professional',
  title               = '',
  subtitle            = '',
  introText           = '',
  messageHtml         = '',
  messageText         = '',
  attachmentsSummary  = [],
  metadata            = [],
  alertMessage        = '',
  alertVariant        = 'info',
  subjectContext      = {},
  subjectOverride     = '',
} = {}) {

  // ── Subject & preheader ────────────────────────────────────────────────────
  let subject, preheader;
  if (subjectOverride) {
    subject   = subjectOverride;
    preheader = subjectContext.preheader || subjectOverride;
  } else {
    const fn = _subjectFnFor(templateType);
    ({ subject, preheader } = fn(subjectContext));
  }

  // ── Body blocks ────────────────────────────────────────────────────────────
  const parts = [];

  // Hero: usa fondo BG_SOFT para el título principal (más aire visual)
  if (title) {
    parts.push(blockHero(title, subtitle || introText));
  }

  // introText solo se pone debajo si ya se usó como subtítulo en el hero
  if (introText && !subtitle) {
    // ya está en el hero — no duplicar
  } else if (introText && subtitle) {
    parts.push(blockParagraph(_esc(introText)));
  }

  if (messageHtml) {
    // caller is responsible for sanitizing messageHtml before passing
    parts.push(`<div style="margin-bottom:16px;">${messageHtml}</div>`);
  }

  if (alertMessage) {
    parts.push(blockAlert(alertMessage, alertVariant));
  }

  if (metadata.length > 0) {
    parts.push(blockMetadata(metadata, _metadataTitle(templateType)));
  }

  if (attachmentsSummary.length > 0) {
    parts.push(blockDivider());
    parts.push(blockAttachmentList(attachmentsSummary));
  }

  parts.push(blockSpacer(8));
  parts.push(blockParagraph(
    `Si tienes dudas, responde este correo o contáctanos a través de EVA.`,
    { isLast: true }
  ));

  const bodyHtml = parts.join('\n');

  // ── Assemble HTML ──────────────────────────────────────────────────────────
  const html = wrapInLayout({ preheader, title: subject, bodyHtml });

  // ── Plain text fallback ────────────────────────────────────────────────────
  const text = _buildPlainText({ title, subtitle, introText, messageText, metadata, attachmentsSummary });

  return { html, text, subject, preheader };
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

function _subjectFnFor(templateType) {
  switch (templateType) {
    case 'invoice_delivery':  return invoiceDeliverySubject;
    case 'document_delivery': return documentDeliverySubject;
    default:                  return genericProfessionalSubject;
  }
}

function _metadataTitle(templateType) {
  switch (templateType) {
    case 'invoice_delivery':  return 'Detalles de la factura';
    case 'document_delivery': return 'Detalles del documento';
    default:                  return 'Información';
  }
}

function _buildPlainText({ title, subtitle, introText, messageText, metadata, attachmentsSummary }) {
  const lines = [];

  lines.push('EVA by Solvix — Asistente Inteligente Empresarial');
  lines.push('='.repeat(52));
  lines.push('');

  if (title)    lines.push(title);
  if (subtitle) lines.push(subtitle);
  if (title || subtitle) lines.push('');

  if (introText)   lines.push(introText, '');
  if (messageText) lines.push(messageText, '');

  if (metadata.length > 0) {
    lines.push('-'.repeat(40));
    for (const row of metadata) {
      lines.push(`${row.label}: ${row.value ?? '—'}`);
    }
    lines.push('');
  }

  if (attachmentsSummary.length > 0) {
    lines.push(`Archivos adjuntos (${attachmentsSummary.length}):`);
    for (const f of attachmentsSummary) {
      const size = f.approxBytes ? ` (${_humanBytes(f.approxBytes)})` : '';
      lines.push(`  · ${f.filename}${size}`);
    }
    lines.push('');
  }

  lines.push('-'.repeat(52));
  lines.push('Este correo fue generado automáticamente por EVA.');
  lines.push(`Solvix © ${new Date().getFullYear()}`);

  return lines.join('\n');
}

function _esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function _humanBytes(bytes) {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
