import { UniqueEntityId } from "./UniqueEntityId";

export type Address = {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  number: string;
};

export interface UserProps {
  id?: UniqueEntityId;
  name: string;
  email: string;
  password: string;
  role: "library" | "reader";
  address: Address;
  createdAt?: Date;
  updatedAt?: Date
}

export class User {
  private id: UniqueEntityId;
  private name: string;
  private email: string;
  private password: string;
  private role: "library" | "reader";
  private address: Address;
  private createdAt?: Date;
  private updatedAt?: Date

  constructor(props: UserProps) {
    this.id = props.id ?? new UniqueEntityId();
    this.name = props.name;
    this.email = props.email;
    this.password = props.password;
    this.role = props.role;
    this.address = props.address;
    this.createdAt = props.createdAt ?? new Date()
    this.updatedAt = props.updatedAt ?? new Date()
  }

  public getId(): UniqueEntityId {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getEmail(): string {
    return this.email;
  }

  public getPassword(): string {
    return this.password;
  }

  public getRole(): "library" | "reader" {
    return this.role;
  }

  public getAddress(): Address {
    return this.address;
  }

    public getCreatedAt() {
    return this.createdAt
  }

  public getUpdatedAt() {
    return this.updatedAt
  }

  protected touch(){
    this.updatedAt = new Date()
  }

  public setName(name: string): void {
    this.name = name;
  }

  public setEmail(email: string): void {
    this.email = email;
  }

  public setPassword(password: string): void {
    this.password = password;
  }

  public setRole(role: "library" | "reader"): void {
    this.role = role;
  }

  public setAddress(address: Address): void {
    this.address = address;
  }

  public updateAddress(newAddress: Address): void {
    this.address = newAddress;
  }

}
