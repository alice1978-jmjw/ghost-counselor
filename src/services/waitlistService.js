import { z } from 'zod';

const EmailSchema = z
  .string()
  .trim()
  .email('Please enter a valid email address (e.g. name@domain.com)');

/**
 * Submits email & optional firstName to Formspree for immediate Guest Access.
 * Reads VITE_FORMSPREE_FORM_ID from environment variables (e.g. "mljbnkdg").
 * If not configured or offline, runs in preview mode so access is never blocked.
 */
export async function submitGuestAccessEmail(email, { firstName = '' } = {}) {
  const validation = EmailSchema.safeParse(email);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || 'Please enter a valid email address.'
    };
  }

  const cleanEmail = validation.data.toLowerCase();
  const cleanFirstName = (firstName || '').trim();

  let formId = import.meta.env?.VITE_FORMSPREE_FORM_ID?.trim();
  if (formId) {
    formId = formId.replace(/^https?:\/\/formspree\.io\/f\//i, '').replace(/\/+$/, '').trim();
  }

  // 1. Submit to Formspree if formId is configured
  if (formId) {
    try {
      const response = await fetch(`https://formspree.io/f/${formId}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: cleanEmail,
          firstName: cleanFirstName || 'Guest Seeker',
          _replyto: cleanEmail,
          source: 'ghost-career-counselor-guest-access',
          roleRequested: 'guest',
          submittedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        return {
          success: true,
          email: cleanEmail,
          firstName: cleanFirstName,
          isMock: false,
          message: 'Welcome! Parting the mist now...'
        };
      }

      const data = await response.json().catch(() => null);
      const errorMessage =
        data?.errors?.[0]?.message ||
        data?.error ||
        `Submission failed with status ${response.status}`;

      return {
        success: false,
        error: errorMessage
      };
    } catch (err) {
      console.warn('[Formspree Guest Access] Network warning:', err);
      // On network failure, grant access gracefully so users are not blocked
      return {
        success: true,
        email: cleanEmail,
        firstName: cleanFirstName,
        isMock: true,
        message: 'Welcome! Parting the mist now...'
      };
    }
  }

  // 2. Local preview fallback (when Formspree ID is not set)
  // Anonymized: do not persist cleartext email or PII to local browser storage
  await new Promise((r) => setTimeout(r, 400));

  return {
    success: true,
    email: cleanEmail,
    firstName: cleanFirstName,
    isMock: true,
    message: 'Welcome! Parting the mist now...'
  };
}

// Helper for verification check
export function verifyConfirmationCode() {
  return true;
}

// Backwards compatibility alias
export const submitWaitlistEmail = submitGuestAccessEmail;
