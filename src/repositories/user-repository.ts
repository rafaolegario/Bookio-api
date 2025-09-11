import { User } from "@/entities/User";

export abstract class UserRepository {
    abstract findByEmail(email:string): Promise<User>
    abstract findById(userId:string): Promise<User>
    abstract delete(userId: string): Promise<void>
    abstract save(user: User): Promise<void>
}