/**
 * EVA by Solvix — Dynamic subject and preheader generators.
 * Returns { subject, preheader } for each template type.
 */

/**
 * @param {object} context
 * @param {string}  [context.to]             - Recipient email
 * @param {number}  [context.attachmentCount] - Number of attached files
 * @param {string}  [context.folio]           - Invoice folio
 * @param {string}  [context.receiverName]    - Receptor name
 * @param {string}  [context.issuerRfc]       - Emisor RFC
 * @param {string}  [context.formats]         - "PDF", "XML", "PDF y XML", etc.
 * @returns {{ subject: string, preheader: string }}
 */
export function invoiceDeliverySubject(context = {}) {
  const { folio, receiverName, issuerRfc, formats = 'factura' } = context;

  let subject = 'Tu factura está lista';
  if (folio) subject = `Factura #${folio} — ${formats}`;
  else if (issuerRfc) subject = `Factura de ${issuerRfc} — ${formats}`;

  const who = receiverName ? `, ${receiverName}` : '';
  const preheader = folio
    ? `Hola${who}, adjuntamos los archivos de la factura #${folio} solicitada a través de EVA.`
    : `Hola${who}, adjuntamos los archivos de tu factura solicitada a través de EVA.`;

  return { subject, preheader };
}

/**
 * @param {object} context
 * @param {string}  [context.documentType]   - "contrato", "reporte", etc.
 * @param {string}  [context.receiverName]
 * @returns {{ subject: string, preheader: string }}
 */
export function documentDeliverySubject(context = {}) {
  const { documentType = 'documento', receiverName } = context;
  const docLabel = _capitalize(documentType);
  const who = receiverName ? `, ${receiverName}` : '';

  return {
    subject:   `${docLabel} adjunto — EVA`,
    preheader: `Hola${who}, te enviamos el ${documentType.toLowerCase()} solicitado a través de EVA.`,
  };
}

/**
 * Generic professional email.
 * @param {object} context
 * @param {string}  [context.subject]         - Explicit subject override
 * @param {string}  [context.topic]           - e.g. "Informe mensual"
 * @param {string}  [context.receiverName]
 * @returns {{ subject: string, preheader: string }}
 */
export function genericProfessionalSubject(context = {}) {
  const { subject, topic = 'Notificación', receiverName } = context;
  const who = receiverName ? `, ${receiverName}` : '';

  return {
    subject:   subject || `${topic} — EVA`,
    preheader: `Hola${who}, tienes un nuevo mensaje de EVA, tu asistente empresarial inteligente.`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

function _capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
