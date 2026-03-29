import transporter from "../config/mailer.js";
import { info, error as logError } from "../utils/logger.js";

/**
 * Envía un correo a través del transporter SMTP configurado.
 *
 * @param {object} opts
 * @param {string}   opts.to
 * @param {string}   opts.subject
 * @param {string}   [opts.text]
 * @param {string}   [opts.html]
 * @param {Array}    [opts.attachments]
 * @param {string}   [opts.requestId]   - para correlacionar logs
 * @returns {Promise<object>} info de nodemailer (messageId, accepted, rejected, …)
 */
export const sendMail = async ({
  to,
  subject,
  text,
  html,
  attachments = [],
  requestId   = '-',
}) => {
  const host   = process.env.SMTP_HOST   || '(no configurado)';
  const port   = process.env.SMTP_PORT   || '(no configurado)';
  const secure = parseInt(port, 10) === 465;

  info('transport_ready', 'SMTP transport configurado', {
    request_id: requestId,
    host,
    port,
    secure,
    user: process.env.SMTP_USER ? `${process.env.SMTP_USER.slice(0, 4)}***` : '(no configurado)',
  });

  info('send_started', 'Invocando transporter.sendMail', {
    request_id:        requestId,
    to,
    subject,
    attachments_count: attachments.length,
  });

  let mailInfo;
  try {
    mailInfo = await transporter.sendMail({
      from:        `"EVA AI Assistant" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
      attachments,
    });
  } catch (smtpErr) {
    logError('smtp_send', 'transporter.sendMail lanzó excepción', {
      request_id: requestId,
      error_code: smtpErr?.code   || '',
      error_msg:  smtpErr?.message || String(smtpErr),
      stack:      smtpErr?.stack?.split('\n').slice(0, 6).join(' | '),
    });
    throw smtpErr;
  }

  info('send_succeeded', 'Email enviado correctamente', {
    request_id: requestId,
    messageId:  mailInfo.messageId,
    accepted:   mailInfo.accepted,
    rejected:   mailInfo.rejected,
    response:   mailInfo.response?.slice(0, 120),   // recortar respuesta larga
  });

  return mailInfo;
};
