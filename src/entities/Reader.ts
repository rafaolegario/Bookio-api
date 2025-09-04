import { User, UserProps } from "./User";

export interface ReaderProps {
  pictureUrl: string;
  cpf: string;
  active: boolean;
  suspense: number;
  libraryId: string;
  booksId: string[];
 
}

export class Reader extends User {
  private pictureUrl: string;
  private cpf: string;
  private active: boolean;
  private suspense: number;
  private libraryId: string;
  private booksId: string[];
 

  constructor(props: UserProps & ReaderProps) {
    super(props);
    this.pictureUrl = props.pictureUrl;
    this.cpf = props.cpf;
    this.active = props.active;
    this.suspense = props.suspense;
    this.libraryId = props.libraryId;
    this.booksId = props.booksId;
    
  }

  public getPictureUrl(): string {
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

  public getLibraryId(): string {
    return this.libraryId;
  }

  public getBooksId(): string[] {
    return this.booksId;
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

  public setLibraryId(libraryId: string): void {
    this.libraryId = libraryId;
    this.touch()
  }

  public setBooksId(booksId: string[]): void {
    this.booksId = booksId;
    this.touch()
  }

  public addBook(bookId: string): void {
    this.booksId.push(bookId);
    this.touch()
  }

  public removeBook(bookId: string): void {
    this.booksId = this.booksId.filter(id => id !== bookId);
    this.touch()
  }
}
