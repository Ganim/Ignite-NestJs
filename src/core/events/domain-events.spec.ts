import { AggregateRoot } from '../entities/aggregate-root'
import { UniqueEntityID } from '../entities/unique-entity-id'
import { DomainEvent } from './domain-event'
import { DomainEvents } from './domain-events'

class CustomAggregateCreated implements DomainEvent {
  public ocurredAt: Date
  private aggregate: CustomAggregate //eslint-disable-line

  constructor(aggregate: CustomAggregate) {
    this.ocurredAt = new Date()
    this.aggregate = aggregate
  }

  public getAggregateId(): UniqueEntityID {
    return this.aggregate.id
  }
}

class CustomAggregate extends AggregateRoot<null> {
  static create() {
    const aggregate = new CustomAggregate(null)

    aggregate.addDomainEvent(new CustomAggregateCreated(aggregate))

    return aggregate
  }
}

describe('domain events', () => {
  it('should be able to dispach and listen to events', () => {
    const callbackSpy = vi.fn()

    // Subscriber cadastrado (ouvindo evento de "resposta criado")
    DomainEvents.register(callbackSpy, CustomAggregateCreated.name)

    // Estou criando uma "resposta" sem salvar no banco
    const aggregate = CustomAggregate.create()

    // Estou assegurando que o evento foi criado porém não foi disparado
    expect(aggregate.domainEvents).toHaveLength(1)

    // Estou salvando a "resposta" no banco de dados e disparando o evento
    DomainEvents.dispatchEventsForAggregate(aggregate.id)

    // O Subscriber ouve o evento e faz o que precisa ser feito com o dado
    expect(callbackSpy).toHaveBeenCalled()

    expect(aggregate.domainEvents).toHaveLength(0)
  })
})
