// const nodemailer = require('nodemailer');
// const crypto = require('crypto');

// // Create reusable transporter - supports both Gmail and Outlook
// const createTransporter = () => {
//     const emailService = process.env.EMAIL_SERVICE || 'gmail';
    
//     if (emailService === 'gmail') {
//         // Gmail configuration (easier to set up)
//         return nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASSWORD, // Use App Password
//             },
//         });
//     } else {
//         // Outlook/Office 365 configuration
//         return nodemailer.createTransport({
//             host: process.env.EMAIL_HOST || 'smtp-mail.outlook.com',
//             port: parseInt(process.env.EMAIL_PORT) || 587,
//             secure: false, // Use STARTTLS
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASSWORD,
//             },
//             tls: {
//                 ciphers: 'SSLv3',
//                 rejectUnauthorized: false
//             }
//         });
//     }
// };

// // Convert tsecedu.org email to tsecol.onmicrosoft.com format
// const convertToOutlookEmail = (email) => {
//     if (email.includes('@tsecedu.org')) {
//         const username = email.split('@')[0];
//         return `${username}@tsecol.onmicrosoft.com`;
//     }
//     return email;
// };

// // Generate verification token
// const generateVerificationToken = () => {
//     return crypto.randomBytes(32).toString('hex');
// };

// // Check if email domain is allowed
// const isAllowedEmailDomain = (email) => {
//     const allowedDomains = process.env.ALLOWED_EMAIL_DOMAINS 
//         ? process.env.ALLOWED_EMAIL_DOMAINS.split(',').map(d => d.trim()) 
//         : ['tsecedu.org'];
    
//     const emailDomain = email.split('@')[1];
    
//     // Check if email ends with any allowed domain
//     return allowedDomains.some(domain => emailDomain === domain || emailDomain.endsWith('.' + domain));
// };

// // Extract domain from email
// const getEmailDomain = (email) => {
//     return email.split('@')[1];
// };

// // Send verification email
// const sendVerificationEmail = async (user, token) => {
//     const transporter = createTransporter();
    
//     // Convert to Outlook email format
//     const outlookEmail = convertToOutlookEmail(user.email);
    
//     const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${token}`;
    
//     const mailOptions = {
//         from: process.env.EMAIL_FROM || `"Alumni Mentorship Platform" <${process.env.EMAIL_USER}>`,
//         to: outlookEmail,
//         subject: 'Verify Your Email - Alumni Mentorship Platform',
//         html: `
//             <!DOCTYPE html>
//             <html>
//             <head>
//                 <style>
//                     body {
//                         font-family: Arial, sans-serif;
//                         line-height: 1.6;
//                         color: #333;
//                         max-width: 600px;
//                         margin: 0 auto;
//                         padding: 20px;
//                     }
//                     .header {
//                         background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//                         color: white;
//                         padding: 30px;
//                         text-align: center;
//                         border-radius: 10px 10px 0 0;
//                     }
//                     .content {
//                         background: #f9fafb;
//                         padding: 30px;
//                         border: 1px solid #e5e7eb;
//                     }
//                     .button {
//                         display: inline-block;
//                         padding: 12px 30px;
//                         background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//                         color: white !important;
//                         text-decoration: none;
//                         border-radius: 5px;
//                         font-weight: bold;
//                         margin: 20px 0;
//                     }
//                     .footer {
//                         text-align: center;
//                         padding: 20px;
//                         color: #6b7280;
//                         font-size: 14px;
//                     }
//                     .verification-box {
//                         background: white;
//                         padding: 20px;
//                         border-radius: 5px;
//                         margin: 20px 0;
//                         border-left: 4px solid #667eea;
//                     }
//                 </style>
//             </head>
//             <body>
//                 <div class="header">
//                     <h1>Welcome to Alumni Mentorship Platform!</h1>
//                 </div>
//                 <div class="content">
//                     <h2>Hi ${user.name},</h2>
//                     <p>Thank you for registering as a <strong>${user.role}</strong> on our platform.</p>
                    
//                     <p>To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
                    
//                     <div style="text-align: center;">
//                         <a href="${verificationUrl}" class="button">Verify Email Address</a>
//                     </div>
                    
//                     <div class="verification-box">
//                         <p><strong>Or copy and paste this link in your browser:</strong></p>
//                         <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
//                     </div>
                    
//                     <p><strong>⏰ This link will expire in 24 hours.</strong></p>
                    
//                     <p>If you didn't create an account with us, please ignore this email.</p>
                    
//                     <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                    
//                     <p style="color: #6b7280; font-size: 14px;">
//                         <strong>Note:</strong> Once verified, your account will be automatically approved and you can start connecting with ${user.role === 'student' ? 'alumni mentors' : 'students'} immediately!
//                     </p>
//                 </div>
//                 <div class="footer">
//                     <p>Alumni-Student Mentorship Platform</p>
//                     <p>Connecting students with alumni for career guidance and mentorship</p>
//                 </div>
//             </body>
//             </html>
//         `,
//         text: `
//             Hi ${user.name},
            
//             Welcome to Alumni Mentorship Platform!
            
//             Thank you for registering as a ${user.role}.
            
//             To complete your registration, please verify your email by clicking this link:
//             ${verificationUrl}
            
//             This link will expire in 24 hours.
            
//             If you didn't create an account, please ignore this email.
            
//             Best regards,
//             Alumni Mentorship Platform Team
//         `,
//     };
    
//     try {
//         console.log('📤 Sending verification email...');
//         console.log('   From:', mailOptions.from);
//         console.log('   To:', mailOptions.to);
//         console.log('   Subject:', mailOptions.subject);
        
//         const info = await transporter.sendMail(mailOptions);
        
//         console.log('✅ Verification email sent successfully!');
//         console.log('   Sent to:', outlookEmail);
//         console.log('   Message ID:', info.messageId);
//         console.log('   Response:', info.response);
        
//         return { success: true, messageId: info.messageId, sentTo: outlookEmail };
//     } catch (error) {
//         console.error('❌ Error sending verification email:');
//         console.error('   Error Type:', error.name);
//         console.error('   Error Message:', error.message);
//         console.error('   Error Code:', error.code);
//         if (error.command) console.error('   SMTP Command:', error.command);
//         if (error.responseCode) console.error('   Response Code:', error.responseCode);
//         console.error('   Full Error:', error);
//         throw error; // Throw the original error with all details
//     }
// };

// // Send welcome email after verification
// const sendWelcomeEmail = async (user) => {
//     const transporter = createTransporter();
    
//     // Convert to Outlook email format
//     const outlookEmail = convertToOutlookEmail(user.email);
    
//     const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`;
    
//     const mailOptions = {
//         from: process.env.EMAIL_FROM || `"Alumni Mentorship Platform" <${process.env.EMAIL_USER}>`,
//         to: outlookEmail,
//         subject: 'Welcome! Your Account is Verified',
//         html: `
//             <!DOCTYPE html>
//             <html>
//             <head>
//                 <style>
//                     body {
//                         font-family: Arial, sans-serif;
//                         line-height: 1.6;
//                         color: #333;
//                         max-width: 600px;
//                         margin: 0 auto;
//                         padding: 20px;
//                     }
//                     .header {
//                         background: linear-gradient(135deg, #10b981 0%, #059669 100%);
//                         color: white;
//                         padding: 30px;
//                         text-align: center;
//                         border-radius: 10px 10px 0 0;
//                     }
//                     .content {
//                         background: #f9fafb;
//                         padding: 30px;
//                         border: 1px solid #e5e7eb;
//                     }
//                     .button {
//                         display: inline-block;
//                         padding: 12px 30px;
//                         background: linear-gradient(135deg, #10b981 0%, #059669 100%);
//                         color: white !important;
//                         text-decoration: none;
//                         border-radius: 5px;
//                         font-weight: bold;
//                         margin: 20px 0;
//                     }
//                     .feature-box {
//                         background: white;
//                         padding: 15px;
//                         border-radius: 5px;
//                         margin: 10px 0;
//                         border-left: 4px solid #10b981;
//                     }
//                 </style>
//             </head>
//             <body>
//                 <div class="header">
//                     <h1>🎉 Account Verified Successfully!</h1>
//                 </div>
//                 <div class="content">
//                     <h2>Welcome aboard, ${user.name}!</h2>
//                     <p>Your email has been verified and your account is now active.</p>
                    
//                     <p>You can now access all features of the platform:</p>
                    
//                     <div class="feature-box">
//                         ✅ <strong>Resource Repository</strong> - Access shared resumes, interview experiences, and study materials
//                     </div>
//                     <div class="feature-box">
//                         ✅ <strong>Blogs & Articles</strong> - Read and share career advice and industry insights
//                     </div>
//                     <div class="feature-box">
//                         ✅ <strong>Q&A Community</strong> - Ask questions and get answers from experienced alumni
//                     </div>
//                     ${user.role === 'student' ? 
//                         '<div class="feature-box">✅ <strong>Find Mentors</strong> - Connect with alumni in your field of interest</div>' :
//                         '<div class="feature-box">✅ <strong>Mentor Students</strong> - Share your experience and guide the next generation</div>'
//                     }
                    
//                     <div style="text-align: center;">
//                         <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
//                     </div>
                    
//                     <p>Start exploring and make the most of your mentorship journey!</p>
//                 </div>
//             </body>
//             </html>
//         `,
//     };
    
//     try {
//         await transporter.sendMail(mailOptions);
//         console.log('✅ Welcome email sent to:', outlookEmail);
//     } catch (error) {
//         console.error('❌ Error sending welcome email:', error);
//         // Don't throw error - welcome email is not critical
//     }
// };

// module.exports = {
//     generateVerificationToken,
//     isAllowedEmailDomain,
//     getEmailDomain,
//     sendVerificationEmail,
//     sendWelcomeEmail,
//     convertToOutlookEmail,
// };
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create reusable transporter - supports both Gmail and Outlook
const createTransporter = () => {
    const emailService = process.env.EMAIL_SERVICE || 'gmail';
    
    if (emailService === 'gmail') {
        // Gmail configuration (easier to set up)
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD, // Use App Password
            },
        });
    } else {
        // Outlook/Office 365 configuration
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp-mail.outlook.com',
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: false, // Use STARTTLS
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
            tls: {
                ciphers: 'SSLv3',
                rejectUnauthorized: false
            }
        });
    }
};

// Convert tsecedu.org email to tsecol.onmicrosoft.com format
const convertToOutlookEmail = (email) => {
    if (email.includes('@tsecedu.org')) {
        const username = email.split('@')[0];
        return `${username}@tsecol.onmicrosoft.com`;
    }
    return email;
};

// Generate verification token
const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Check if email domain is allowed
const isAllowedEmailDomain = (email) => {
    const allowedDomains = process.env.ALLOWED_EMAIL_DOMAINS 
        ? process.env.ALLOWED_EMAIL_DOMAINS.split(',').map(d => d.trim()) 
        : ['tsecedu.org'];
    
    const emailDomain = email.split('@')[1];
    
    // Check if email ends with any allowed domain
    return allowedDomains.some(domain => emailDomain === domain || emailDomain.endsWith('.' + domain));
};

// Extract domain from email
const getEmailDomain = (email) => {
    return email.split('@')[1];
};

// Send verification email
const sendVerificationEmail = async (user, token) => {
    const transporter = createTransporter();
    
    // Convert to Outlook email format
    const outlookEmail = convertToOutlookEmail(user.email);
    
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${token}`;
    
    const mailOptions = {
        from: process.env.EMAIL_FROM || `"Alumni Mentorship Platform" <${process.env.EMAIL_USER}>`,
        to: outlookEmail,
        subject: 'Verify Your Email - Alumni Mentorship Platform',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                        border-radius: 10px 10px 0 0;
                    }
                    .content {
                        background: #f9fafb;
                        padding: 30px;
                        border: 1px solid #e5e7eb;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 30px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white !important;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                        margin: 20px 0;
                    }
                    .footer {
                        text-align: center;
                        padding: 20px;
                        color: #6b7280;
                        font-size: 14px;
                    }
                    .verification-box {
                        background: white;
                        padding: 20px;
                        border-radius: 5px;
                        margin: 20px 0;
                        border-left: 4px solid #667eea;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Welcome to Alumni Mentorship Platform!</h1>
                </div>
                <div class="content">
                    <h2>Hi ${user.name},</h2>
                    <p>Thank you for registering as a <strong>${user.role}</strong> on our platform.</p>
                    
                    <p>To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
                    
                    <div style="text-align: center;">
                        <a href="${verificationUrl}" class="button">Verify Email Address</a>
                    </div>
                    
                    <div class="verification-box">
                        <p><strong>Or copy and paste this link in your browser:</strong></p>
                        <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
                    </div>
                    
                    <p><strong>⏰ This link will expire in 24 hours.</strong></p>
                    
                    <p>If you didn't create an account with us, please ignore this email.</p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                    
                    <p style="color: #6b7280; font-size: 14px;">
                        <strong>Note:</strong> Once verified, your account will be automatically approved and you can start connecting with ${user.role === 'student' ? 'alumni mentors' : 'students'} immediately!
                    </p>
                </div>
                <div class="footer">
                    <p>Alumni-Student Mentorship Platform</p>
                    <p>Connecting students with alumni for career guidance and mentorship</p>
                </div>
            </body>
            </html>
        `,
        text: `
            Hi ${user.name},
            
            Welcome to Alumni Mentorship Platform!
            
            Thank you for registering as a ${user.role}.
            
            To complete your registration, please verify your email by clicking this link:
            ${verificationUrl}
            
            This link will expire in 24 hours.
            
            If you didn't create an account, please ignore this email.
            
            Best regards,
            Alumni Mentorship Platform Team
        `,
    };
    
    try {
        console.log('📤 Sending verification email...');
        console.log('   From:', mailOptions.from);
        console.log('   To:', mailOptions.to);
        console.log('   Subject:', mailOptions.subject);
        
        const info = await transporter.sendMail(mailOptions);
        
        console.log('✅ Verification email sent successfully!');
        console.log('   Sent to:', outlookEmail);
        console.log('   Message ID:', info.messageId);
        console.log('   Response:', info.response);
        
        return { success: true, messageId: info.messageId, sentTo: outlookEmail };
    } catch (error) {
        console.error('❌ Error sending verification email:');
        console.error('   Error Type:', error.name);
        console.error('   Error Message:', error.message);
        console.error('   Error Code:', error.code);
        if (error.command) console.error('   SMTP Command:', error.command);
        if (error.responseCode) console.error('   Response Code:', error.responseCode);
        console.error('   Full Error:', error);
        throw error; // Throw the original error with all details
    }
};

// Send welcome email after verification
const sendWelcomeEmail = async (user) => {
    const transporter = createTransporter();
    
    // Convert to Outlook email format
    const outlookEmail = convertToOutlookEmail(user.email);
    
    const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`;
    
    const mailOptions = {
        from: process.env.EMAIL_FROM || `"Alumni Mentorship Platform" <${process.env.EMAIL_USER}>`,
        to: outlookEmail,
        subject: 'Welcome! Your Account is Verified',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                        border-radius: 10px 10px 0 0;
                    }
                    .content {
                        background: #f9fafb;
                        padding: 30px;
                        border: 1px solid #e5e7eb;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 30px;
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                        color: white !important;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                        margin: 20px 0;
                    }
                    .feature-box {
                        background: white;
                        padding: 15px;
                        border-radius: 5px;
                        margin: 10px 0;
                        border-left: 4px solid #10b981;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🎉 Account Verified Successfully!</h1>
                </div>
                <div class="content">
                    <h2>Welcome aboard, ${user.name}!</h2>
                    <p>Your email has been verified and your account is now active.</p>
                    
                    <p>You can now access all features of the platform:</p>
                    
                    <div class="feature-box">
                        ✅ <strong>Resource Repository</strong> - Access shared resumes, interview experiences, and study materials
                    </div>
                    <div class="feature-box">
                        ✅ <strong>Blogs & Articles</strong> - Read and share career advice and industry insights
                    </div>
                    <div class="feature-box">
                        ✅ <strong>Q&A Community</strong> - Ask questions and get answers from experienced alumni
                    </div>
                    ${user.role === 'student' ? 
                        '<div class="feature-box">✅ <strong>Find Mentors</strong> - Connect with alumni in your field of interest</div>' :
                        '<div class="feature-box">✅ <strong>Mentor Students</strong> - Share your experience and guide the next generation</div>'
                    }
                    
                    <div style="text-align: center;">
                        <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
                    </div>
                    
                    <p>Start exploring and make the most of your mentorship journey!</p>
                </div>
            </body>
            </html>
        `,
    };
    
    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ Welcome email sent to:', outlookEmail);
    } catch (error) {
        console.error('❌ Error sending welcome email:', error);
        // Don't throw error - welcome email is not critical
    }
};

// Send webinar notification email
const sendWebinarNotificationEmail = async ({ 
    toEmail,
    studentName,
    webinarName,
    speakerName,
    date,
    time,
    roomId
}) => {
    const transporter = createTransporter();

    const outlookEmail = convertToOutlookEmail(toEmail);

    const mailOptions = {
        from: process.env.EMAIL_FROM || `"Alumni Mentorship Platform" <${process.env.EMAIL_USER}>`,
        to: outlookEmail,
        subject: `📢 New Webinar Scheduled: ${webinarName}`,
        html: `
            <h2>Hello ${studentName},</h2>
            <p>A new webinar has been scheduled on the Alumni Mentorship Platform.</p>

            <ul>
                <li><strong>Webinar:</strong> ${webinarName}</li>
                <li><strong>Speaker:</strong> ${speakerName}</li>
                <li><strong>Date:</strong> ${date}</li>
                <li><strong>Time:</strong> ${time}</li>
                <li><strong>Room ID:</strong> ${roomId}</li>
            </ul>

            <p>Please log in to the dashboard to register.</p>
            <p>🎓 Happy Learning!</p>
        `,
    };

    await transporter.sendMail(mailOptions);
};

// Send mentor availability notification email
const sendMentorAvailabilityEmail = async ({
    toEmail,
    studentName,
    mentorName,
    startTime,
    endTime,
    bookingLink
}) => {
    const transporter = createTransporter();
    const outlookEmail = convertToOutlookEmail(toEmail);

    const mailOptions = {
        from: process.env.EMAIL_FROM || `"Alumni Mentorship Platform" <${process.env.EMAIL_USER}>`,
        to: outlookEmail,
        subject: `🟢 ${mentorName} is available for 1:1 Mentorship`,
        html: `
            <h2>Hello ${studentName},</h2>

            <p><strong>${mentorName}</strong> has opened new availability for a one-on-one mentorship session.</p>

            <ul>
                <li><strong>Start:</strong> ${new Date(startTime).toLocaleString()}</li>
                <li><strong>End:</strong> ${new Date(endTime).toLocaleString()}</li>
            </ul>

            <p>
                Click the button below to book this slot before it fills up:
            </p>

            <div style="margin: 20px 0;">
                <a href="${bookingLink}"
                   style="
                     padding: 12px 24px;
                     background: #2563eb;
                     color: white;
                     text-decoration: none;
                     border-radius: 6px;
                     font-weight: bold;
                   ">
                    Book Slot
                </a>
            </div>

            <p>If you miss this slot, keep an eye out for future availability.</p>

            <p>🎓 Alumni Mentorship Platform</p>
        `,
    };

    await transporter.sendMail(mailOptions);
};



module.exports = {
    generateVerificationToken,
    isAllowedEmailDomain,
    getEmailDomain,
    sendVerificationEmail,
    sendWelcomeEmail,
    convertToOutlookEmail,
    sendWebinarNotificationEmail,
    sendMentorAvailabilityEmail
};