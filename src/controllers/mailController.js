import { sendMail }         from "../services/mailService.js";
import { info, warn, error as logError } from "../utils/logger.js";
import { buildEmailContent } from "../emailContentBuilder.js";

const TAG = 'send_email';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Tamaño aproximado en bytes de un string base64. */
function base64ApproxBytes(b64) {
  return Math.floor((b64.replace(/=+$/, '').length * 3) / 4);
}

/** Verifica que un string sea base64 válido (sin data URI prefix). */
function isValidBase64(str) {
  if (typeof str !== 'string' || str.length === 0) return false;
  return /^[A-Za-z0-9+/]*={0,2}$/.test(str.replace(/[\r\n\s]/g, ''));
}

/** Respuesta de error 4xx/5xx unificada con logs. */
function sendError(res, { requestId, startTime, status, stage, message }) {
  const durationMs = Date.now() - startTime;
  info(TAG, 'response_sent', { request_id: requestId, status, duration_ms: durationMs });
  return res.status(status).json({ ok: false, stage, message, request_id: requestId });
}

// ─────────────────────────────────────────────────────────────────────────────
// Controlador principal
// ─────────────────────────────────────────────────────────────────────────────

export const sendEmail = async (req, res) => {
  const { requestId, correlationId, startTime } = req;
  const body = req.body || {};

  // ── 1. Request received ───────────────────────────────────────────────────
  info(TAG, 'request_received', {
    request_id:        requestId,
    correlation_id:    correlationId !== requestId ? correlationId : undefined,
    method:            req.method,
    route:             req.originalUrl,
    to:                body.to,
    subject:           body.subject,
    has_text:          !!body.text,
    has_html:          !!body.html,
    attachments_count: Array.isArray(body.attachments) ? body.attachments.length : 0,
  });

  // ── 2. Validación de campos obligatorios ──────────────────────────────────
  const { to, subject, text, html, attachments, templateType, templateContext } = body;

  if (!to || typeof to !== 'string' || !to.trim()) {
    warn(TAG, 'payload_invalid', { request_id: requestId, reason: 'missing_to' });
    return sendError(res, {
      requestId, startTime, status: 400,
      stage: 'payload_validation', message: "Campo 'to' es obligatorio.",
    });
  }

  if (!subject || typeof subject !== 'string' || !subject.trim()) {
    warn(TAG, 'payload_invalid', { request_id: requestId, reason: 'missing_subject' });
    return sendError(res, {
      requestId, startTime, status: 400,
      stage: 'payload_validation', message: "Campo 'subject' es obligatorio.",
    });
  }

  // templateType alone is enough to build the body; text/html are optional when a template is used
  if (!text && !html && !templateType) {
    warn(TAG, 'payload_invalid', { request_id: requestId, reason: 'missing_text_and_html' });
    return sendError(res, {
      requestId, startTime, status: 400,
      stage: 'payload_validation', message: "Se requiere 'text', 'html' o 'templateType' en el cuerpo del correo.",
    });
  }

  // ── 3. Validación y procesamiento de adjuntos ─────────────────────────────
  let parsedAttachments = [];

  if (Array.isArray(attachments) && attachments.length > 0) {
    for (let idx = 0; idx < attachments.length; idx++) {
      const file = attachments[idx];

      if (!file.filename || typeof file.filename !== 'string') {
        warn(TAG, 'attachment_invalid', {
          request_id: requestId, idx, reason: 'missing_filename',
        });
        return sendError(res, {
          requestId, startTime, status: 400,
          stage: 'attachment_processing',
          message: `Attachment[${idx}]: falta 'filename'.`,
        });
      }

      if (!file.content || typeof file.content !== 'string') {
        warn(TAG, 'attachment_invalid', {
          request_id: requestId, idx, reason: 'missing_content',
          filename: file.filename,
        });
        return sendError(res, {
          requestId, startTime, status: 400,
          stage: 'attachment_processing',
          message: `Attachment[${idx}] (${file.filename}): falta 'content'.`,
        });
      }

      if (!isValidBase64(file.content)) {
        warn(TAG, 'attachment_invalid', {
          request_id: requestId, idx, reason: 'invalid_base64',
          filename: file.filename, content_length: file.content.length,
        });
        return sendError(res, {
          requestId, startTime, status: 400,
          stage: 'attachment_processing',
          message: `Attachment[${idx}] (${file.filename}): 'content' no es base64 válido.`,
        });
      }

      const contentType  = file.contentType || 'application/octet-stream';
      const approxBytes  = base64ApproxBytes(file.content);

      parsedAttachments.push({
        filename:    file.filename,
        content:     file.content,
        encoding:    'base64',
        contentType,
        _meta: { approxBytes },   // solo para logging, eliminado antes de enviar
      });

      info(TAG, 'attachment_ready', {
        request_id:   requestId,
        idx,
        filename:     file.filename,
        contentType,
        approx_bytes: approxBytes,
      });
    }
  }

  // ── 4. Construir contenido HTML con el sistema de templates ──────────────
  let finalSubject = subject;
  let finalHtml    = html  || null;
  let finalText    = text  || null;

  try {
    const built = buildEmailContent({
      html,
      text,
      subject,
      templateType:    templateType    || null,
      templateContext: templateContext || {},
      attachments:     parsedAttachments,  // incluye _meta.approxBytes para el summary
    });

    if (built) {
      // Template rendered successfully
      finalHtml    = built.html;
      finalText    = built.text    || finalText;
      finalSubject = built.subject || finalSubject;

      info(TAG, 'template_rendered', {
        request_id:    requestId,
        template_type: templateType || 'generic_professional',
        subject:       finalSubject,
      });
    }
  } catch (tplErr) {
    // Template error is non-fatal: fall back to original text/html
    warn(TAG, 'template_render_failed', {
      request_id: requestId,
      error_msg:  tplErr?.message || String(tplErr),
    });
    finalHtml = html || null;
    finalText = text || null;
  }

  // ── 5. Log de payload validado ────────────────────────────────────────────
  info(TAG, 'payload_validated', {
    request_id:    requestId,
    to,
    subject:       finalSubject,
    template_type: templateType || null,
    has_text:      !!finalText,
    has_html:      !!finalHtml,
    attachments:   parsedAttachments.map(a => ({
      filename:     a.filename,
      contentType:  a.contentType,
      approx_bytes: a._meta.approxBytes,
    })),
  });

  // Quitar _meta antes de pasar a nodemailer
  const mailAttachments = parsedAttachments.map(({ _meta, ...rest }) => rest);

  // ── 6. Enviar correo ──────────────────────────────────────────────────────
  try {
    const mailInfo = await sendMail({
      to,
      subject: finalSubject,
      text:    finalText,
      html:    finalHtml,
      attachments: mailAttachments,
      requestId,
    });

    const durationMs = Date.now() - startTime;
    info(TAG, 'response_sent', {
      request_id:  requestId,
      status:      200,
      duration_ms: durationMs,
      messageId:   mailInfo.messageId,
    });

    return res.json({
      ok:         true,
      message:    'Correo enviado correctamente',
      messageId:  mailInfo.messageId,
      accepted:   mailInfo.accepted,
      rejected:   mailInfo.rejected,
      request_id: requestId,
    });

  } catch (sendErr) {
    // Clasificar etapa del error para diagnóstico accionable
    const errMsg  = sendErr?.message || String(sendErr);
    const errCode = sendErr?.code    || '';
    let stage = 'smtp_send';

    if (['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET'].includes(errCode)) {
      stage = 'transport_init';
    }

    logError(TAG, 'send_failed', {
      request_id:  requestId,
      stage,
      error_code:  errCode,
      error_msg:   errMsg,
      stack:       sendErr?.stack?.split('\n').slice(0, 6).join(' | '),
    });

    return sendError(res, {
      requestId, startTime, status: 500,
      stage, message: errMsg,
    });
  }
};
