export interface SendMailParams {
  to: string
  subject: string
  body: string
  from?: string
}

export interface MailProvider {
  sendMail(params: SendMailParams): Promise<void>
}
