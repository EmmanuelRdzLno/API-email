import { sendMail } from "../services/mailService.js";

export const sendEmail = async (req, res) => {
  try {
    const { to, subject, text, html, attachments } = req.body;

    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Validar attachments en base64
    let parsedAttachments = [];

    if (attachments && Array.isArray(attachments)) {
      parsedAttachments = attachments.map((file) => {
        if (!file.filename || !file.content) {
          throw new Error("Attachment inválido");
        }

        return {
          filename: file.filename,
          content: file.content,
          encoding: "base64",
          contentType: file.contentType || "application/octet-stream",
        };
      });
    }

    const info = await sendMail({
      to,
      subject,
      text,
      html,
      attachments: parsedAttachments,
    });

    res.json({
      message: "Correo enviado correctamente",
      messageId: info.messageId,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error enviando el correo",
      detail: error.message,
    });
  }
};
