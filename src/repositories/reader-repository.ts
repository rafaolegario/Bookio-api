import { Reader } from "@/entities/Reader";

export abstract class ReaderRepository {
    abstract findByEmail(email: string):Promise<Reader | null>
    abstract findByCpf(cpf: string):Promise<Reader | null>
    abstract create(reader: Reader):Promise<void>
}