import nodemailer from "nodemailer";

const sendEmail = async function (email, subject, message, html = null) {
  // Gmail SMTP (recommended with App Password)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true, // 465 is secure
    auth: {
      user: process.env.SMTP_USERNAME, // your Gmail address
      pass: process.env.SMTP_PASSWORD, // Gmail App Password
    },
  });

  const mailOptions = {
    from: `${process.env.SMTP_FROM_NAME || 'Almoktabar'} <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USERNAME}>`,
    to: email,
    subject,
    text: message,
  };

  // Add HTML if provided
  if (html) {
    mailOptions.html = html;
  }

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
