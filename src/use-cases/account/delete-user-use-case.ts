import { UserRepository } from "@/repositories/user-repository";
import { NotFoundError } from "../errors/not-found-error";

interface DeleteUserRequest {
  userId: string
}

export class DeleteUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({ userId }: DeleteUserRequest) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError();
    }

    await this.userRepository.delete(userId)

    return { message: "User deleted with successful" };
  }
}
