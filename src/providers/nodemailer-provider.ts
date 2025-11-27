import nodemailer from 'nodemailer'
import { MailProvider, SendMailParams } from './mail-provider'

export class NodemailerProvider implements MailProvider {
  private transporter: nodemailer.Transporter

  constructor() {
    const emailUser = process.env.SMTP_USER
    const emailPass = process.env.SMTP_PASS
    const emailHost = process.env.SMTP_HOST || 'smtp.elasticemail.com'
    const emailPort = parseInt(process.env.SMTP_PORT || '2525')

    if (!emailUser || !emailPass) {
      console.warn('⚠️  SMTP credentials not configured. Emails will NOT be sent.')
      console.warn('Configure SMTP_USER and SMTP_PASS in .env file')
      console.warn('Recommended: Use Elastic Email (free 100 emails/day)')
      console.warn('Sign up at: https://elasticemail.com')

      // Criar transporter vazio que não enviará emails
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      })
    } else {
      this.transporter = nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: false, // Elastic Email usa STARTTLS na porta 2525
        auth: {
          user: emailUser,
          pass: emailPass,
        },
        tls: {
          ciphers: 'SSLv3',
        },
      })
    }
  }

  async sendMail({ to, subject, body }: SendMailParams): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || `"Bookio" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html: body,
      })

      console.log('Email sent successfully:', info.messageId)

    
     
    } catch (error) {
      console.error('Error sending email:', error)
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}
