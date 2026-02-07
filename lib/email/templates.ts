export function approvalEmail(opts: {
  preferredName: string;
  username: string;
  portalUrl: string;
  supportEmail: string;
}) {
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.5;">
    <h2>You’ve been approved — Welcome to broTher collecTive</h2>
    <p>Hi ${escapeHtml(opts.preferredName)},</p>
    <p>You’ve been approved for entry into broTher collecTive.</p>
    <p>This is a peer-led, intentional brotherhood space built on trust, respect, and accountability. We’re glad you’re here.</p>

    <p><strong>Your portal access details:</strong></p>
    <ul>
      <li>Username: <strong>${escapeHtml(opts.username)}</strong></li>
      <li>Portal Link: <a href="${opts.portalUrl}">${opts.portalUrl}</a></li>
    </ul>

    <p><strong>Next step:</strong> Check your email for an invite from Supabase to set your password, then log in.</p>

    <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;" />
    <p style="font-size: 12px; color: #666;">
      This inbox is not monitored. For support, contact <a href="mailto:${opts.supportEmail}">${opts.supportEmail}</a>.
    </p>
    <p>With respect,<br/>broTher collecTive</p>
  </div>
  `;
}

export function denialEmail(opts: { supportEmail: string }) {
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.5;">
    <h2>broTher collecTive — Update on your request</h2>
    <p>Hi,</p>
    <p>Thank you for your interest in broTher collecTive.</p>
    <p>
      At this time, we’re unable to approve your request for entry. This decision is based on current capacity and fit
      and is not a judgment of you as a person.
    </p>
    <p>
      If you believe this message was sent in error, please reach out to
      <a href="mailto:${opts.supportEmail}">${opts.supportEmail}</a> so we can further review.
    </p>

    <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;" />
    <p style="font-size: 12px; color: #666;">
      This inbox is not monitored. For support, contact <a href="mailto:${opts.supportEmail}">${opts.supportEmail}</a>.
    </p>
    <p>With respect,<br/>broTher collecTive</p>
  </div>
  `;
}

function escapeHtml(s: string) {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
