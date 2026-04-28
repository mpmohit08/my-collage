import { transporter } from '@/lib/nodemailer'

export interface MailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendMail(options: MailOptions) {
  try {
    const mailOptions = {
      from: options.from || process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Email sent:', info.messageId)
    return info
  } catch (error) {
    console.error('❌ Error sending email:', error)
    throw error
  }
}
