import { Library } from "@/entities/Library";
import { Roles } from "@/entities/User";
import { LibraryRepository } from "@/repositories/library-repository";
import { MailProvider } from "@/providers/mail-provider";
import { NotAllowedError } from "@/use-cases/errors/not-allowed-error";
import { hash } from "bcryptjs";

interface createLibraryRequest {
  name: string;
  email: string;
  password: string;
  cnpj: string;
  Address: {
    cep: string;
    street: string;
    neighborhood: string;
    city: string;
    number: string;
  };
}

export class CreateLibraryUseCase {
  constructor(
    private LibraryRepository: LibraryRepository,
    private MailProvider: MailProvider
  ) { }
  async execute({
    name,
    email,
    password,
    cnpj,
    Address,
  }: createLibraryRequest) {
    let library = await this.LibraryRepository.findByEmail(email);

    if (library) {
      throw new NotAllowedError('Este e-mail já está cadastrado');
    }

    library = await this.LibraryRepository.findByCnpj(cnpj);

    if (library) {
      throw new NotAllowedError('Este CNPJ já está cadastrado');
    }

    const hashedPassword = await hash(password, 6);

    library = new Library({
      name,
      email,
      cnpj,
      role: Roles.LIBRARY,
      password: hashedPassword,
      address: Address,
    });

    await this.LibraryRepository.create(library);

    // Envia email de boas-vindas
    await this.MailProvider.sendMail({
      to: email,
      subject: 'Bem-vindo ao Bookio!',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Olá, ${name}! 📚</h1>

          <p style="font-size: 16px; color: #555;">
            Sua biblioteca foi cadastrada com sucesso no <strong>Bookio</strong>!
          </p>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">Suas credenciais de acesso:</h2>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 10px 0;"><strong>CNPJ:</strong> ${cnpj}</p>
          </div>

          <div style="background-color: #e8f5e9; padding: 15px; border-left: 4px solid #4caf50; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0; color: #2e7d32;">
              <strong>✓ Próximos passos:</strong><br>
              Agora você já pode fazer login e começar a cadastrar seus leitores e gerenciar empréstimos!
            </p>
          </div>

          <p style="font-size: 14px; color: #555; margin-top: 30px;">
            Atenciosamente,<br>
            <strong>Equipe Bookio</strong>
          </p>
        </div>
      `
    });
  }
}
