import { v4 as uuidv4 } from 'uuid'; 

export class UniqueEntityId {
  private _id: string;

  constructor(id?: string) {
    this._id = id ?? uuidv4();
  }

  public get id(): string {
    return this._id;
  }

  public equals(otherId: UniqueEntityId): boolean {
    return this._id === otherId.id;
  }

  public toString(): string {
    return this._id;
  }
}
