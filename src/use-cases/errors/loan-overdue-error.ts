export class LoanOverdueError extends Error {
  constructor() {
    super('Loan is overdue and will generate a penalty')
    this.name = 'LoanOverdueError'
  }
}