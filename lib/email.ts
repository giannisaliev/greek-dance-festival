import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export interface RegistrationEmailData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  packageType: string;
}

export async function sendRegistrationEmail(data: RegistrationEmailData) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: `New Registration - ${data.firstName} ${data.lastName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a365d; border-bottom: 3px solid #3182ce; padding-bottom: 10px;">
          New Festival Registration
        </h2>
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
          <p style="margin: 10px 0;"><strong>Email:</strong> ${data.email}</p>
          <p style="margin: 10px 0;"><strong>Phone:</strong> ${data.phone}</p>
          <p style="margin: 10px 0;"><strong>Package:</strong> ${data.packageType}</p>
        </div>
        <p style="color: #718096; font-size: 14px;">
          Registration received on ${new Date().toLocaleString()}
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
}
