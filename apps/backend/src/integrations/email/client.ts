/**
 * @file Email Integration Client
 * @description Email sending service (placeholder for future implementation)
 */

import { logger } from "../../config/logger";
import type { EmailPayload } from "../../types";
import { ServiceUnavailableError } from "../../types/errors";

/**
 * Send email using configured provider
 * @param payload - Email data
 */
export async function sendEmail(payload: EmailPayload): Promise<void> {
  // TODO: Implement email sending with provider like SendGrid, Resend, or Nodemailer

  logger.info(
    { to: payload.to, template: payload.template, subject: payload.subject },
    "Sending email",
  );

  throw new ServiceUnavailableError(
    "Email service not yet implemented",
    "EMAIL_NOT_IMPLEMENTED",
  );

  // Example with Nodemailer:
  // const nodemailer = require('nodemailer');
  //
  // const transporter = nodemailer.createTransport({
  //   host: env.SMTP_HOST,
  //   port: env.SMTP_PORT,
  //   secure: true,
  //   auth: {
  //     user: env.SMTP_USER,
  //     pass: env.SMTP_PASSWORD,
  //   },
  // });
  //
  // const html = await renderEmailTemplate(payload.template, payload.data);
  //
  // await transporter.sendMail({
  //   from: env.EMAIL_FROM,
  //   to: payload.to,
  //   subject: payload.subject,
  //   html,
  // });
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
  email: string,
  firstName: string,
): Promise<void> {
  await sendEmail({
    to: email,
    subject: "Welcome to Paz Animal!",
    template: "welcome",
    data: { firstName },
  });
}

/**
 * Send adoption confirmation email
 */
export async function sendAdoptionConfirmationEmail(
  email: string,
  petName: string,
): Promise<void> {
  await sendEmail({
    to: email,
    subject: `Your adoption application for ${petName}`,
    template: "adoption-confirmation",
    data: { petName },
  });
}
