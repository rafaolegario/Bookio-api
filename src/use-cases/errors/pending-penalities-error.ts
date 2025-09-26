export class PendingPenalitiesError extends Error {
  constructor() {
    super('Reader has pending penalties and cannot make new loans')
    this.name = 'PendingPenalitiesError'
  }
}