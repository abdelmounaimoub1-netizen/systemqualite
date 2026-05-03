import { NextResponse } from "next/server";

import { isEmailConfigured, sendAppEmail } from "@/lib/email";
import { contactFormRateLimiter } from "@/lib/rate-limit";
import { contactSchema, sanitizeHeader, sanitizeInput } from "@/lib/validations/contact";

export const runtime = "nodejs";

function getClientIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "127.0.0.1";
  }

  return req.headers.get("x-real-ip") ?? "127.0.0.1";
}

async function verifyRecaptcha({
  token,
  ip
}: {
  token?: string;
  ip: string;
}) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RECAPTCHA_SECRET_KEY is not configured.");
    }

    console.warn("reCAPTCHA skipped because RECAPTCHA_SECRET_KEY is not configured.");
    return;
  }

  if (!token) {
    throw new Error("Missing reCAPTCHA token.");
  }

  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret,
      response: token,
      remoteip: ip
    })
  });
  const data = (await response.json()) as {
    success?: boolean;
    score?: number;
    action?: string;
  };
  const minScore = Number(process.env.CONTACT_RECAPTCHA_MIN_SCORE ?? 0.5);

  if (!data.success || Number(data.score ?? 0) < minScore || data.action !== "contact_form") {
    console.warn(
      `reCAPTCHA failed IP: ${ip}, Score: ${data.score}, Action: ${data.action}`
    );
    throw new Error("Spam detected. reCAPTCHA verification failed.");
  }
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const { success, limit, remaining, reset } = await contactFormRateLimiter.limit(ip);

    if (!success) {
      console.warn(`Spam Defense: rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { error: "Too many requests, please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString()
          }
        }
      );
    }

    const body = (await req.json()) as unknown;
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid formulation.", details: result.error.issues },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      subject,
      message,
      phone,
      countryCode,
      honeypot,
      recaptchaToken
    } = result.data;

    if (honeypot && honeypot.trim() !== "") {
      console.warn(`Honeypot triggered for IP: ${ip}`);
      return NextResponse.json({ message: "Message sent successfully!" });
    }

    try {
      await verifyRecaptcha({ token: recaptchaToken, ip });
    } catch (error) {
      const message = error instanceof Error ? error.message : "reCAPTCHA verification failed.";
      const status = message.includes("not configured") ? 500 : 400;

      return NextResponse.json({ error: message }, { status });
    }

    const gmailUser = process.env.GMAIL_USER;
    const toEmail = process.env.CONTACT_EMAIL_TO;

    if (!gmailUser || !isEmailConfigured() || !toEmail) {
      console.error("Contact email is not configured. Check Gmail and recipient env vars.");
      return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }

    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeHeader(email);
    const sanitizedSubject = sanitizeHeader(subject || "No Subject").substring(0, 200);
    const sanitizedMessage = sanitizeInput(message);
    const sanitizedPhone = phone ? sanitizeInput(phone).substring(0, 30) : "N/A";
    const sanitizedCountryCode = countryCode ? sanitizeHeader(countryCode) : "";
    const displayName = sanitizedName.replace(/&quot;/g, "'").replace(/"/g, "'");

    await sendAppEmail({
      fromName: displayName,
      replyTo: sanitizedEmail,
      to: toEmail,
      subject: `New Contact Form Submission: ${sanitizedSubject}`,
      text: `
Name: ${sanitizedName}
Email: ${sanitizedEmail}
Phone: ${sanitizedCountryCode ? `${sanitizedCountryCode} ` : ""}${sanitizedPhone}
Subject: ${sanitizedSubject}

Message:
${sanitizedMessage}
      `.trim(),
      html: `
<h3>New Contact Form Submission</h3>
<p><strong>Name:</strong> ${sanitizedName}</p>
<p><strong>Email:</strong> ${sanitizedEmail}</p>
<p><strong>Phone:</strong> ${sanitizedCountryCode ? `${sanitizedCountryCode} ` : ""}${sanitizedPhone}</p>
<p><strong>Subject:</strong> ${sanitizedSubject}</p>
<p><strong>Message:</strong><br/>${sanitizedMessage.replace(/\n/g, "<br/>")}</p>
      `.trim()
    });

    console.info(`Contact message from ${sanitizedEmail} effectively sent.`);

    return NextResponse.json({ message: "Message sent successfully!" }, { status: 200 });
  } catch (error) {
    console.error("Error handling contact request:", error);
    return NextResponse.json(
      { error: "Failed to send message securely. Please try again." },
      { status: 500 }
    );
  }
}
