import { SchedulingRepository } from '../../../repositories/scheduling-repository'
import { BookRepository } from '../../../repositories/book-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { Scheduling, SchedulingStatus } from '../../../entities/Scheduling'
import { UniqueEntityId } from '../../../entities/UniqueEntityId'

interface CreateSchedulingUseCaseRequest {
  readerId: string
  bookId: string
}

export class CreateSchedulingUseCase {
  constructor(
    private schedulingRepository: SchedulingRepository,
    private bookRepository: BookRepository,
  ) { }

  async execute({ readerId, bookId }: CreateSchedulingUseCaseRequest) {
    const book = await this.bookRepository.findById(bookId)
    if (!book) {
      throw new NotAllowedError('Livro não encontrado')
    }

    if (book.getAvailable() <= 0) {
      throw new NotAllowedError('Livro não está disponível para agendamento')
    }

    // Verificar se já existe um agendamento pendente para este leitor e livro
    const existingScheduling = await this.schedulingRepository.findPendingByReaderAndBook(
      readerId,
      bookId,
    )

    if (existingScheduling) {
      throw new Error('Already has a pending scheduling for this book')
    }

    const scheduling = new Scheduling({
      readerId: new UniqueEntityId(readerId),
      bookId: new UniqueEntityId(bookId),
      status: SchedulingStatus.PENDING,
    })

    await this.schedulingRepository.create(scheduling)

    return {
      scheduling,
    }
  }
}