/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
import { MASTER_ADMIN_EMAIL } from "./auth-constants";

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Configure Nodemailer with your Gmail account
// Ensure GMAIL_EMAIL and GMAIL_APP_PASSWORD are set in your functions/.env file
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Helper to replace placeholders
const replacePlaceholders = (text: string, data: any) => {
  let result = text || "";
  for (const key in data) {
    const placeholder = `{{${key}}}`;
    // Use a global regex to replace all occurrences
    result = result.replace(new RegExp(placeholder, 'g'), data[key] || '');
  }
  return result;
};

// Helper to send email
const sendEmail = async (to: string, subject: string, html: string) => {
  // Check if credentials are present
  if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
    logger.warn("Gmail credentials not set. SIMULATING email send.");
    logger.info(`[SIMULATION] To: ${to}, Subject: ${subject}`);
    return; // Return successfully to simulate sending
  }

  const mailOptions = {
    from: `"Stratic CMS" <${process.env.GMAIL_EMAIL}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}`);
  } catch (error) {
    logger.error("Error sending email:", error);
    throw error;
  }
};

/**
 * Callable function to send a test email for a specific template.
 */
export const sendTestEmail = onCall(async (request) => {
  const { templateId, recipientEmail } = request.data;

  if (!templateId || !recipientEmail) {
    throw new HttpsError('invalid-argument', 'Missing templateId or recipientEmail');
  }

  // Verify authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in.');
  }

  try {
    const templateDoc = await db.collection('emailTemplates').doc(templateId).get();

    // If template doesn't exist, use a default fallback for testing
    let template = templateDoc.exists ? templateDoc.data() : null;

    if (!template) {
      logger.warn(`Template ${templateId} not found. Using fallback.`);
      template = {
        subject: "Test Subject (Fallback)",
        body: "<p>This is a fallback body because the template was not found.</p>"
      };
    }

    // Mock data for placeholders
    const mockData: any = {
      name: request.auth.token.name || 'Test User',
      message: 'This is a test message content used for previewing the email template.',
      postTitle: 'Example Blog Post Title',
      postUrl: 'https://yourwebsite.com/blog/example-post',
      email: recipientEmail
    };

    const subject = replacePlaceholders(template.subject, mockData);
    const body = replacePlaceholders(template.body, mockData);

    await sendEmail(recipientEmail, `[TEST] ${subject}`, body);

    return { success: true, message: 'Test email sent (or simulated)' };
  } catch (error: any) {
    logger.error("Error sending test email:", error);
    // Return a more user-friendly error if possible, but 'internal' is standard for crashes
    throw new HttpsError('internal', error.message || 'Failed to send email');
  }
});

/**
 * Trigger: Send email when a new contact form submission is created.
 */
export const onContactSubmission = onDocumentCreated("contacts/{contactId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    return;
  }
  const data = snapshot.data();

  try {
    // 1. Notify Admin
    await sendEmail(
      MASTER_ADMIN_EMAIL,
      `New Contact Form Submission: ${data.subject}`,
      `<p><strong>Name:</strong> ${data.name}</p>
             <p><strong>Email:</strong> ${data.email}</p>
             <p><strong>Message:</strong></p>
             <blockquote>${data.message}</blockquote>`
    );

    // 2. Send Auto-reply to User
    const templateDoc = await db.collection('emailTemplates').doc('contact-form').get();
    if (templateDoc.exists) {
      const template = templateDoc.data();
      if (template) {
        const subject = replacePlaceholders(template.subject, data);
        const body = replacePlaceholders(template.body, data);
        await sendEmail(data.email, subject, body);
      }
    }
  } catch (error) {
    logger.error("Error processing contact submission:", error);
  }
});

/**
 * Trigger: Send welcome email when a new subscriber is created.
 */
export const onNewSubscriber = onDocumentCreated("subscribers/{subscriberId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    return;
  }
  const data = snapshot.data();

  try {
    const templateDoc = await db.collection('emailTemplates').doc('new-subscriber').get();
    if (templateDoc.exists) {
      const template = templateDoc.data();
      if (template) {
        const subject = replacePlaceholders(template.subject, data);
        const body = replacePlaceholders(template.body, data);
        await sendEmail(data.email, subject, body);
      }
    }
  } catch (error) {
    logger.error("Error processing new subscriber:", error);
  }
});

/**
 * Trigger: Send notification to all subscribers when a new post is published.
 * Note: This can be expensive if you have many subscribers. Consider using a batching approach or a dedicated email service for bulk sending.
 */
export const onNewPost = onDocumentCreated("posts/{postId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    return;
  }
  const post = snapshot.data();

  // Only send if status is 'public'
  if (post.status !== 'public') {
    return;
  }

  try {
    const templateDoc = await db.collection('emailTemplates').doc('new-post').get();
    if (!templateDoc.exists) {
      return;
    }
    const template = templateDoc.data();
    if (!template) return;

    // Get all subscribers
    const subscribersSnapshot = await db.collection('subscribers').get();

    if (subscribersSnapshot.empty) {
      return;
    }

    const postUrl = `https://yourwebsite.com/blog/${post.urlSlug}`; // Replace with your actual domain

    // Send emails in parallel (limit concurrency in production)
    const emailPromises = subscribersSnapshot.docs.map(async (doc) => {
      const subscriber = doc.data();
      const data = {
        name: subscriber.name || 'Subscriber',
        email: subscriber.email,
        postTitle: post.title,
        postUrl: postUrl
      };

      const subject = replacePlaceholders(template.subject, data);
      const body = replacePlaceholders(template.body, data);

      try {
        await sendEmail(subscriber.email, subject, body);
      } catch (e) {
        logger.error(`Failed to send new post email to ${subscriber.email}`, e);
      }
    });

    await Promise.all(emailPromises);

  } catch (error) {
    logger.error("Error processing new post notification:", error);
  }
});