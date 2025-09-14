import { Resend } from 'resend'

const resend = new Resend(process.env.EMAIL_SERVER_PASSWORD)

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

export async function sendEmail({ to, subject, html, from }: EmailOptions) {
  try {
    const fromEmail = from || process.env.EMAIL_FROM || 'noreply@tumasajes.com'
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    })

    if (error) {
      console.error('Error sending email:', error)
      throw new Error(`Error al enviar email: ${error.message}`)
    }

    console.log('Email sent successfully:', data?.id)
    return data
  } catch (error) {
    console.error('Email service error:', error)
    throw error
  }
}

export async function sendBulkEmails(emails: EmailOptions[]) {
  const results = []
  
  for (const email of emails) {
    try {
      const result = await sendEmail(email)
      results.push({ success: true, result })
    } catch (error) {
      results.push({ success: false, error })
    }
  }
  
  return results
}