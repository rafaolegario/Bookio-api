import { User, UserProps } from "./User";

export interface LibraryProps {
  cnpj: string; 
}

export class Library extends User {
  private cnpj: string;

  constructor(props: UserProps & LibraryProps) {
    super(props); 
    this.cnpj = props.cnpj; 
  }

  public getCnpj(): string {
    return this.cnpj;
  }

  public setCnpj(cnpj: string): void {
    this.cnpj = cnpj;
  }

}
