import dotenv from 'dotenv';
dotenv.config();
import sendEmail from './utils/sendEmail.js';

// Allow overrides via CLI args: --to, --subject, --message
const args = Object.fromEntries(
  (process.argv.slice(2) || []).map((a) => {
    const [k, ...rest] = a.replace(/^--/, '').split('=');
    return [k, rest.join('=') || true];
  })
);

const to = args.to || process.env.TEST_EMAIL_TO || process.env.SMTP_USERNAME;
const subject = args.subject || 'Test: Almoktabar SMTP';
const message = args.message || 'This is a test email from Almoktabar backend.';

(async () => {
  try {
    console.log('Sending test email to:', to);
    await sendEmail(to, subject, message);
    console.log('✅ Test email sent successfully');
    process.exit(0);
  } catch (e) {
    console.error('❌ Failed to send test email:', e);
    process.exit(1);
  }
})();


