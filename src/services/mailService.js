import transporter from "../config/mailer.js";

export const sendMail = async ({ to, subject, text, html }) => {
  const info = await transporter.sendMail({
    from: `"Mi API" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });
  return info;
};
