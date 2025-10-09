import { Reader } from "@/entities/Reader";
import { UniqueEntityId } from "@/entities/UniqueEntityId";
import { Roles } from "@/entities/User";
import { MailProvider } from "@/providers/mail-provider";
import { ReaderRepository } from "@/repositories/reader-repository";
import { NotAllowedError } from "@/use-cases/errors/not-allowed-error";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";

interface createReaderRequest {
  name: string;
  email: string;
  libraryId: string;
  cpf: string;
  pictureUrl: string;
  Address: {
    cep: string;
    street: string;
    neighborhood: string;
    city: string;
    number: string;
  };
}

function generateRandomPassword(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
  const bytes = randomBytes(length);
  let password = '';

  for (let i = 0; i < length; i++) {
    password += chars[bytes[i] % chars.length];
  }

  return password;
}

export class CreateReaderUseCase {
  constructor(
    private ReaderRepository: ReaderRepository,
    private MailProvider: MailProvider
  ) { }

  async execute({
    name,
    email,
    libraryId,
    cpf,
    Address,
    pictureUrl
  }: createReaderRequest) {
    let reader = await this.ReaderRepository.findByEmail(email);

    if (reader) {
      throw new NotAllowedError('Este e-mail já está cadastrado');
    }

    reader = await this.ReaderRepository.findByCpf(cpf);

    if (reader) {
      throw new NotAllowedError('Este CPF já está cadastrado');
    }

    // Gera senha aleatória
    const randomPassword = generateRandomPassword(12);
    const hashedPassword = await hash(randomPassword, 6);

    reader = new Reader({
      name,
      email,
      libraryId: new UniqueEntityId(libraryId),
      pictureUrl,
      cpf: cpf,
      role: Roles.READER,
      password: hashedPassword,
      address: Address,
    });

    await this.ReaderRepository.create(reader);

    // Envia email com a senha gerada
    await this.MailProvider.sendMail({
      to: email,
      subject: 'Bem-vindo ao Bookio!',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Olá, ${name}! 👋</h1>

          <p style="font-size: 16px; color: #555;">
            Sua conta foi criada com sucesso no <strong>Bookio</strong>!
          </p>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">Suas credenciais de acesso:</h2>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 10px 0;"><strong>Senha:</strong> <code style="background-color: #fff; padding: 5px 10px; border-radius: 4px; font-size: 16px;">${randomPassword}</code></p>
          </div>

          <p style="font-size: 14px; color: #777;">
            ⚠️ Por segurança, recomendamos que você altere sua senha após o primeiro acesso.
          </p>

          <p style="font-size: 14px; color: #555; margin-top: 30px;">
            Atenciosamente,<br>
            <strong>Equipe Bookio</strong>
          </p>
        </div>
      `
    });
  }
}
