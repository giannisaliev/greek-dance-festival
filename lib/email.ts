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

export interface BulkRegistrationStudent {
  firstName: string;
  lastName: string;
  packageType: string;
  guinnessRecordAttempt: boolean;
  greekNight: boolean;
  totalPrice: number;
}

export interface BulkRegistrationEmailData {
  teacherEmail: string;
  teacherFirstName: string;
  teacherLastName: string;
  studioName?: string;
  students: BulkRegistrationStudent[];
  totalPrice: number;
  registeredCount: number;
}

export async function sendBulkRegistrationConfirmation(data: BulkRegistrationEmailData) {
  const studentRows = data.students.map(student => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 12px 8px; color: #1a365d;">
        ${student.firstName} ${student.lastName}
      </td>
      <td style="padding: 12px 8px; color: #4a5568;">
        ${student.packageType}
      </td>
      <td style="padding: 12px 8px; color: #4a5568; text-align: center;">
        ${student.guinnessRecordAttempt ? '🏆' : ''}
        ${student.greekNight ? '🍷' : ''}
        ${!student.guinnessRecordAttempt && !student.greekNight ? '—' : ''}
      </td>
      <td style="padding: 12px 8px; color: #1a365d; font-weight: 600; text-align: right;">
        €${student.totalPrice}
      </td>
    </tr>
  `).join('');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: data.teacherEmail,
    subject: `Greek Dance Festival - Registration Confirmation${data.studioName ? ` - ${data.studioName}` : ''}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f7fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7fafc; padding: 40px 20px;">
            <tr>
              <td align="center">
                <!-- Main Container -->
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
                      <div style="margin-bottom: 15px;">
                        <img src="${process.env.NEXTAUTH_URL || 'https://www.greekdancefestival.gr'}/GUINESS.png" alt="Greek Dance Festival" style="max-width: 80px; height: auto;" />
                      </div>
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        Greek Dance Festival
                      </h1>
                      <p style="margin: 10px 0 0 0; color: #e0f2fe; font-size: 16px;">
                        Registration Confirmation
                      </p>
                    </td>
                  </tr>

                  <!-- Success Message -->
                  <tr>
                    <td style="padding: 30px 30px 20px 30px;">
                      <div style="background-color: #d1fae5; border-left: 4px solid #10b981; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                        <p style="margin: 0; color: #065f46; font-size: 18px; font-weight: 600;">
                          ✅ Registration Successful!
                        </p>
                      </div>

                      <h2 style="margin: 0 0 10px 0; color: #1a365d; font-size: 24px;">
                        Dear ${data.teacherFirstName} ${data.teacherLastName},
                      </h2>
                      
                      <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        Thank you for registering ${data.studioName ? 'your dance studio students' : 'your students'} for the Greek Dance Festival! We're excited to have ${data.registeredCount} participant${data.registeredCount > 1 ? 's' : ''} join us.
                      </p>

                      ${data.studioName ? `
                      <div style="background-color: #f0f9ff; border-radius: 8px; padding: 15px; margin-bottom: 25px; border: 1px solid #bae6fd;">
                        <p style="margin: 0; color: #0c4a6e; font-size: 14px;">
                          <strong style="font-size: 16px;">🏢 Studio:</strong> ${data.studioName}
                        </p>
                      </div>
                      ` : ''}
                    </td>
                  </tr>

                  <!-- Registered Students Table -->
                  <tr>
                    <td style="padding: 0 30px 30px 30px;">
                      <h3 style="margin: 0 0 20px 0; color: #1a365d; font-size: 20px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
                        Registered Participants
                      </h3>
                      
                      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                        <thead>
                          <tr style="background-color: #f1f5f9;">
                            <th style="padding: 12px 8px; text-align: left; color: #1e293b; font-weight: 600; font-size: 14px;">
                              Name
                            </th>
                            <th style="padding: 12px 8px; text-align: left; color: #1e293b; font-weight: 600; font-size: 14px;">
                              Package
                            </th>
                            <th style="padding: 12px 8px; text-align: center; color: #1e293b; font-weight: 600; font-size: 14px;">
                              Add-ons
                            </th>
                            <th style="padding: 12px 8px; text-align: right; color: #1e293b; font-weight: 600; font-size: 14px;">
                              Price
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          ${studentRows}
                        </tbody>
                        <tfoot>
                          <tr style="background-color: #1e40af;">
                            <td colspan="3" style="padding: 16px 8px; color: #ffffff; font-weight: 700; font-size: 16px;">
                              TOTAL
                            </td>
                            <td style="padding: 16px 8px; color: #ffffff; font-weight: 700; font-size: 18px; text-align: right;">
                              €${data.totalPrice}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </td>
                  </tr>

                  <!-- Next Steps -->
                  <tr>
                    <td style="padding: 0 30px 30px 30px;">
                      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 20px;">
                        <h3 style="margin: 0 0 15px 0; color: #92400e; font-size: 18px;">
                          📋 Next Steps
                        </h3>
                        <ul style="margin: 0; padding-left: 20px; color: #78350f; line-height: 1.8;">
                          <li>Check your <strong>Dashboard</strong> to view all registered participants</li>
                          <li>You can manage your registrations and check-in status online</li>
                          <li>Payment details will be sent separately</li>
                        </ul>
                      </div>
                    </td>
                  </tr>

                  <!-- Festival Details -->
                  <tr>
                    <td style="padding: 0 30px 30px 30px;">
                      <h3 style="margin: 0 0 15px 0; color: #1a365d; font-size: 18px;">
                        🎉 Festival Information
                      </h3>
                      <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; border: 1px solid #e2e8f0;">
                        <p style="margin: 0 0 10px 0; color: #475569; line-height: 1.8;">
                          <strong style="color: #1e293b;">📅 Date:</strong> June 12-14, 2026<br>
                          <strong style="color: #1e293b;">📍 Location Guinness Record:</strong> <a href="https://maps.app.goo.gl/oHQ7z9DjKt9YTNXV9" style="color: #3b82f6; text-decoration: none;">Aristotle Square</a><br>
                          <strong style="color: #1e293b;">📍 Location Workshops:</strong> Venue to be announced soon on the website<br>
                          <strong style="color: #1e293b;">🕐 Time:</strong> Details will be announced on the website soon
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- CTA Buttons -->
                  <tr>
                    <td style="padding: 0 30px 40px 30px; text-align: center;">
                      <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                        <tr>
                          <td style="padding: 0 5px 10px 5px;">
                            <a href="https://drive.google.com/drive/folders/1M4zh_JgF0wpacRK3eOXJh2weX-QuwTG-?usp=sharing" 
                               style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3);">
                              📥 Download Guinness Choreography
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 0 5px;">
                            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" 
                               style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                              📋 View My Dashboard
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px;">
                        Questions? Contact us at <a href="mailto:${process.env.EMAIL_USER}" style="color: #3b82f6; text-decoration: none;">${process.env.EMAIL_USER}</a>
                      </p>
                      <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                        Greek Dance Festival ${new Date().getFullYear()} | All Rights Reserved
                      </p>
                      <p style="margin: 10px 0 0 0; color: #cbd5e1; font-size: 12px;">
                        Registration confirmed on ${new Date().toLocaleString()}
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Bulk registration confirmation email sent to:', data.teacherEmail);
    return { success: true };
  } catch (error) {
    console.error('Bulk registration email sending failed:', error);
    return { success: false, error };
  }
}
