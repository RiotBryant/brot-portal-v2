import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  const from = process.env.RESEND_FROM!;
  const replyTo = process.env.SUPPORT_EMAIL!;

  return await resend.emails.send({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
    replyTo,
  });
}
