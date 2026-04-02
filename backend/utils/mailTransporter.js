const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const brevoApiKey = process.env.BREVO_API_KEY;
const smtpHost = process.env.SMTP_HOST || "smtp-relay.brevo.com";
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = process.env.SMTP_SECURE === "true";
const smtpUser = process.env.BREVO_SMTP_LOGIN || process.env.EMAIL_USER;
const smtpPass = process.env.BREVO_API_KEY || process.env.EMAIL_PASS;

const parseSingleAddress = (value) => {
  if (!value) return null;

  if (typeof value === "object") {
    return {
      email: value.address || value.email,
      name: value.name,
    };
  }

  const raw = String(value).trim();
  const match = raw.match(/^(.*)<(.+)>$/);
  if (match) {
    const name = match[1].trim().replace(/^"|"$/g, "");
    const email = match[2].trim();
    return { email, name: name || undefined };
  }

  return { email: raw };
};

const normalizeAddresses = (value) => {
  if (!value) return [];

  const source = Array.isArray(value)
    ? value
    : String(value)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  return source
    .map(parseSingleAddress)
    .filter((addr) => addr && addr.email)
    .map((addr) => ({ email: addr.email, name: addr.name }));
};

const normalizeAttachment = (attachment) => {
  if (!attachment) return null;

  let base64Content;

  if (attachment.content) {
    const buffer = Buffer.isBuffer(attachment.content)
      ? attachment.content
      : Buffer.from(String(attachment.content));
    base64Content = buffer.toString("base64");
  } else if (attachment.path) {
    const fileBuffer = fs.readFileSync(attachment.path);
    base64Content = fileBuffer.toString("base64");
  } else {
    return null;
  }

  return {
    name: attachment.filename || path.basename(attachment.path || "attachment"),
    content: base64Content,
    contentId: attachment.cid,
  };
};

const sendViaBrevoApi = async (mailOptions) => {
  const sender = parseSingleAddress(mailOptions.from || process.env.EMAIL_USER);
  const to = normalizeAddresses(mailOptions.to);

  if (!sender || !sender.email) {
    throw new Error("Sender email is required for Brevo API sending.");
  }

  if (to.length === 0) {
    throw new Error("Recipient email is required for Brevo API sending.");
  }

  const payload = {
    sender: { email: sender.email, name: sender.name },
    to,
    subject: mailOptions.subject || "(no subject)",
  };

  if (mailOptions.text) payload.textContent = mailOptions.text;
  if (mailOptions.html) payload.htmlContent = mailOptions.html;

  const cc = normalizeAddresses(mailOptions.cc);
  const bcc = normalizeAddresses(mailOptions.bcc);
  if (cc.length > 0) payload.cc = cc;
  if (bcc.length > 0) payload.bcc = bcc;

  if (mailOptions.replyTo) {
    const replyTo = parseSingleAddress(mailOptions.replyTo);
    if (replyTo && replyTo.email) payload.replyTo = replyTo;
  }

  const attachments = Array.isArray(mailOptions.attachments)
    ? mailOptions.attachments.map(normalizeAttachment).filter(Boolean)
    : [];
  if (attachments.length > 0) payload.attachment = attachments;

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": brevoApiKey,
    },
    body: JSON.stringify(payload),
  });

  const bodyText = await response.text();
  if (!response.ok) {
    throw new Error(`Brevo API send failed (${response.status}): ${bodyText}`);
  }

  let body = {};
  try {
    body = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    body = {};
  }

  return {
    accepted: to.map((item) => item.email),
    rejected: [],
    messageId: body.messageId,
    response: bodyText || response.statusText,
  };
};

if (!brevoApiKey && (!smtpUser || !smtpPass)) {
  console.warn("⚠️ Mail credentials are missing. Set BREVO_API_KEY (recommended) or SMTP credentials in .env.");
}

const smtpTransporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

const transporter = {
  sendMail: async (mailOptions) => {
    if (brevoApiKey) {
      return sendViaBrevoApi(mailOptions);
    }
    return smtpTransporter.sendMail(mailOptions);
  },
};

module.exports = transporter;