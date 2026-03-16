import nodemailer from 'nodemailer';

export type MailPayload = {
  to: string;
  subject: string;
  body: string;
};
// using nodemailer instead of cds.MailService for better local usage
// The transport is injectable for easy mocking in tests.
const defaultTransport = async (payload: MailPayload): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // sandbox.smtp.mailtrap.io
    port: Number(process.env.SMTP_PORT), // 2525
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: '"Galactic HQ" <noreply@galactic.adventure>',
    to: payload.to,
    subject: payload.subject,
    text: payload.body,
  });
};

export async function sendCosmicWelcomeEmail(
  spacefarer: any,
  transport: (payload: MailPayload) => Promise<void> = defaultTransport,
): Promise<void> {
  const name = spacefarer.name || 'Spacefarer';
  const planet = spacefarer.origin_planet || 'the cosmos';

  await transport({
    to: `${name} <spacefarer@galactic.adventure>`,
    subject: 'Congratulations on your Cosmic Adventure!',
    body: `Dear ${name},\n\nWelcome aboard! You have been launched from ${planet} into the SAP galaxy.\n\nMay your wormhole navigation be true.\n\nThe Galactic Spacefarers Team`,
  });
}
