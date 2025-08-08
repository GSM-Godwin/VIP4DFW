import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from = process.env.EMAIL_FROM }: SendEmailOptions) {
  if (!from) {
    console.error("EMAIL_ERROR: EMAIL_FROM environment variable is not set.");
    return { success: false, message: "Email sender not configured." };
  }

  try {
    await transporter.sendMail({
      from: from,
      to: to,
      subject: subject,
      html: html,
    });
    console.log(`EMAIL_SUCCESS: Email sent to ${to} with subject: ${subject}`);
    return { success: true, message: "Email sent successfully." };
  } catch (error: any) {
    console.error(`EMAIL_ERROR: Failed to send email to ${to}. Error: ${error.message}`);
    return { success: false, message: `Failed to send email: ${error.message}` };
  }
}
