import { UserRepository } from "@/repositories/user-repository";
import { compare } from "bcryptjs";
import { InvalidCredentialsError } from "../errors/invalid-credentials-error";

interface AuthenticateRequest {
  email: string;
  password: string;
}

export class AuthenticateUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({ email, password }: AuthenticateRequest) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const doesPasswordMatches = await compare(password, user.getPassword());

    if (!doesPasswordMatches) {
      throw new InvalidCredentialsError();
    }

    return { user };
  }
}
