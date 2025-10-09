import { Resend } from 'resend'
import { MailProvider, SendMailParams } from './mail-provider'

export class ResendMailProvider implements MailProvider {
  private resend: Resend

  constructor() {
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not defined in environment variables')
    }

    this.resend = new Resend(apiKey)
  }

  async sendMail({ to, subject, body, from }: SendMailParams): Promise<void> {
    const defaultFrom = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

    try {
      await this.resend.emails.send({
        from: from || defaultFrom,
        to,
        subject,
        html: body,
      })

      console.log('✅ Email sent successfully:', { to, subject })
    } catch (error) {
      console.error('❌ Failed to send email:', error)
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}
