const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  debug: true
});

/**
 * Sends a welcome email to a newly registered user
 * @param {string} name - User's name
 * @param {string} email - User's email address
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendWelcomeEmail = async (name, email) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('Email credentials not found in environment variables');
      return false;
    }
    
    const mailOptions = {
      from: `"RainCheck Weather" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to RainCheck!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #1e40af;">Welcome to RainCheck!</h1>
          </div>
          <p>Hello ${name},</p>
          <p> Thanks for checking out RainCheck! Hope it helps you stay dry (or get wet, if that's your thing).</p>
          <p>If you have any questions or feedback, please don't hesitate to contact us.</p>
          <div style="margin-top: 30px; padding: 15px; background-color: #f0f9ff; border-radius: 5px;">
            <p style="margin: 0;">Wishing you sunny days ahead,</p>
            <p style="margin: 5px 0 0; font-weight: bold;">The RainCheck Team</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email} - Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

const verifyConnection = async () => {
  try {
    await transporter.verify();
    console.log('SMTP connection established successfully');
  } catch (error) {
    console.error('SMTP connection error:', error);
  }
};

verifyConnection().catch(console.error);

module.exports = {
  sendWelcomeEmail,
  verifyConnection
};