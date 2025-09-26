import { PenalityRepository } from '../../../repositories/penality-repository'
import { ReaderRepository } from '../../../repositories/reader-repository'

export class PenalityVerificationService {
  private intervalId: NodeJS.Timeout | null = null
  private readonly CHECK_INTERVAL = 24 * 60 * 60 * 1000 // 24 horas

  constructor(
    private penalityRepository: PenalityRepository,
    private readerRepository: ReaderRepository,
  ) { }

  start() {
    if (this.intervalId) {
      return
    }

    this.checkUnpaidPenalities()

    this.intervalId = setInterval(() => {
      this.checkUnpaidPenalities()
    }, this.CHECK_INTERVAL)
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  private async checkUnpaidPenalities() {
    try {
      const unpaidPenalities = await this.penalityRepository.findUnpaidPenalities()

      for (const penality of unpaidPenalities) {
        if (!penality.paid && penality.isOverdue()) {
          const reader = await this.readerRepository.findById(penality.readerId)
          if (reader) {
            reader.incrementSuspension(1)
            await this.readerRepository.save(reader)
          }
        }
      }
    } catch (error) {
      console.error('Error checking unpaid penalities:', error)
    }
  }
}