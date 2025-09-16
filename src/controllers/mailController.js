import { sendMail } from "../services/mailService.js";

export const sendEmail = async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;

    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const info = await sendMail({ to, subject, text, html });
    res.json({ message: "Correo enviado", id: info.messageId });
  } catch (error) {
    res.status(500).json({ error: "Error enviando el correo", detail: error.message });
  }
};
