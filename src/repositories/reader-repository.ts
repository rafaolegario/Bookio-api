import { Reader } from "@/entities/Reader";

export abstract class ReaderRepository {
    abstract findByEmail(email: string):Promise<Reader | null>
    abstract findByCpf(cpf: string):Promise<Reader | null>
    abstract findById(id: string):Promise<Reader | null>
    abstract findByLibraryId(libraryId: string): Promise<Reader[]>
    abstract create(reader: Reader):Promise<void>
    abstract save(reader: Reader): Promise<void>
}