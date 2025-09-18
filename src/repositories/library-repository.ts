import { Library } from "@/entities/Library";
export abstract class LibraryRepository {
    abstract findByEmail(email: string):Promise<Library | null>
    abstract findByCnpj(cpnj: string):Promise<Library | null>
    abstract findById(id: string):Promise<Library | null>
    abstract create(library: Library):Promise<void>
    abstract save(library: Library): Promise<void>
}