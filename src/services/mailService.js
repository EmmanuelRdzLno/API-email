import transporter from "../config/mailer.js";

export const sendMail = async ({
  to,
  subject,
  text,
  html,
  attachments = [],
}) => {
  const info = await transporter.sendMail({
    from: `"EVA AI Assistant" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
    attachments,
  });

  return info;
};
