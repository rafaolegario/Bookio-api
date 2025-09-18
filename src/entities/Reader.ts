import { UniqueEntityId } from "./UniqueEntityId";
import { User, UserProps } from "./User";
export interface ReaderProps {
  pictureUrl?: string;
  cpf: string;
  active?: boolean;
  suspense?: number;
  libraryId: UniqueEntityId;
}
export class Reader extends User {
  private pictureUrl?: string;
  private cpf: string;
  private active: boolean;
  private suspense: number;
  private libraryId: UniqueEntityId;

  constructor(props: UserProps & ReaderProps) {
    super(props);
    this.pictureUrl = props.pictureUrl ?? '';
    this.cpf = props.cpf;
    this.active = props.active ?? true;
    this.suspense = props.suspense ?? 0;
    this.libraryId = props.libraryId;
  }

  public getPictureUrl(): string | undefined {
    return this.pictureUrl;
  }

  public getCpf(): string {
    return this.cpf;
  }

  public isActive(): boolean {
    return this.active;
  }

  public getSuspense(): number {
    return this.suspense;
  }

  public getLibraryId(): UniqueEntityId {
    return this.libraryId;
  }

  public setPictureUrl(pictureUrl: string): void {
    this.pictureUrl = pictureUrl;
    this.touch()
  }

  public setCpf(cpf: string): void {
    this.cpf = cpf;
    this.touch()
  }

  public setActive(active: boolean): void {
    this.active = active;
    this.touch()
  }

  public setSuspense(suspense: number): void {
    this.suspense = suspense;
    this.touch()
  }

  public setLibraryId(libraryId: UniqueEntityId): void {
    this.libraryId = libraryId;
    this.touch()
  }

}
