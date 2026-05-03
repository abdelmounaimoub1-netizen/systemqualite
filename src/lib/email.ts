import nodemailer from "nodemailer";

type SendAppEmailOptions = {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
  fromName?: string;
};

function getEmailConfig() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("Gmail email transport is not configured.");
  }

  return { user, pass };
}

export function isEmailConfigured() {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

export async function sendAppEmail({
  to,
  subject,
  text,
  html,
  replyTo,
  fromName = "QMS Pro"
}: SendAppEmailOptions) {
  const { user, pass } = getEmailConfig();
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass
    }
  });

  await transporter.sendMail({
    from: `"${fromName.replace(/"/g, "'")}" <${user}>`,
    replyTo,
    to,
    subject,
    text,
    html
  });
}
