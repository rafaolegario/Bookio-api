import { UniqueEntityId } from "./UniqueEntityId";

export enum BookGenders {
  Fiction = "Fiction",
  NonFiction = "NonFiction",
  Fantasy = "Fantasy",
  ScienceFiction = "ScienceFiction",
  Mystery = "Mystery",
  Romance = "Romance",
  Thriller = "Thriller",
  Horror = "Horror",
  Biography = "Biography",
  History = "History",
  Poetry = "Poetry",
  SelfHelp = "SelfHelp"
}

export interface BookProps {
  id?: UniqueEntityId;
  libraryId: UniqueEntityId;
  author: string;
  title: string;
  imageUrl?: string;
  gender: BookGenders;
  year: Date;
  available: number;
  total_loans: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Book {
  private id: UniqueEntityId;
  private author: string;
  private libraryId: UniqueEntityId;
  private title: string;
  private imageUrl?: string;
  private gender: BookGenders;
  private year: Date;
  private available: number;
  private total_loans: number;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(props: BookProps) {
    this.id = props.id ?? new UniqueEntityId();
    this.author = props.author;
    this.libraryId = props.libraryId;
    this.title = props.title;
    this.imageUrl = props.imageUrl;
    this.gender = props.gender;
    this.year = props.year;
    this.available = props.available;
    this.total_loans = props.total_loans;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public getId(): UniqueEntityId {
    return this.id;
  }

  public getAuthor(): string {
    return this.author;
  }

  public getLibraryId(): UniqueEntityId {
    return this.libraryId;
  }

  public getTitle(): string {
    return this.title;
  }

  public getImageUrl(): string | undefined {
    return this.imageUrl;
  }

  public getGender(): BookGenders {
    return this.gender;
  }

  public getYear(): Date {
    return this.year;
  }

  public getAvailable(): number {
    return this.available;
  }

  public getTotalLoans(): number {
    return this.total_loans;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  protected touch(): void {
    this.updatedAt = new Date();
  }

  public setTitle(title: string): void {
    this.title = title;
    this.touch();
  }

  public setImageUrl(imageUrl: string): void {
    this.imageUrl = imageUrl;
    this.touch();
  }

  public setGender(gender: BookGenders): void {
    this.gender = gender;
    this.touch();
  }

  public setYear(year: Date): void {
    this.year = year;
    this.touch();
  }

  public setAuthor(author: string): void {
    this.author = author;
    this.touch();
  }

  public setAvailable(available: number): void {
    this.available = available;
    this.touch();
  }

  public setTotalLoans(total_loans: number): void {
    this.total_loans = total_loans;
    this.touch();
  }

  public loan(): boolean {
    if (this.available > 0) {
      this.available -= 1;
      this.total_loans += 1;
      this.touch();
      return true;
    }
    return false;
  }

  public returnBook(): void {
    this.available += 1;
    this.touch();
  }
}
