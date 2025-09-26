import { SchedulingRepository } from '../../../repositories/scheduling-repository'
import { SchedulingStatus } from '../../../entities/Scheduling'

export class SchedulingVerificationService {
  private intervalId: NodeJS.Timeout | null = null
  private readonly CHECK_INTERVAL = 3 * 60 * 1000

  constructor(private schedulingRepository: SchedulingRepository) { }

  start() {
    if (this.intervalId) {
      return
    }

    this.checkExpiredSchedulings()

    this.intervalId = setInterval(() => {
      this.checkExpiredSchedulings()
    }, this.CHECK_INTERVAL)
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  private async checkExpiredSchedulings() {
    try {
      const expiredSchedulings = await this.schedulingRepository.findExpiredSchedulings()

      for (const scheduling of expiredSchedulings) {
        if (scheduling.getStatus === SchedulingStatus.PENDING && scheduling.isExpired) {
          scheduling.setStatus = SchedulingStatus.EXPIRED
          await this.schedulingRepository.update(scheduling.getId, scheduling)
        }
      }
    } catch (error) {
      console.error('Error checking expired schedulings:', error)
    }
  }
}