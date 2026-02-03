import { FixedIdGenerator } from 'src/core/adapters/fixed-id-generator';
import { InMemoryMailer } from 'src/core/adapters/in-memory-mailer';
import { IIdGenerator } from 'src/core/ports/id-generator.interface';
import { InMemoryUserRepository } from 'src/users/adapters/user-repository.in-memory';
import { User } from 'src/users/entities/user.entity';
import { InMemoryParticipationRepository } from 'src/webinars/adapters/participation-repository.in-memory';
import { InMemoryWebinarRepository } from 'src/webinars/adapters/webinar-repository.in-memory';
import { Participation } from 'src/webinars/entities/participation.entity';
import { Webinar } from 'src/webinars/entities/webinar.entity';
import { WebinarAlreadyParticipatingException } from 'src/webinars/exceptions/webinar-already-participating';
import { WebinarNoSeatsAvailableException } from 'src/webinars/exceptions/webinar-no-seats-available';
import { BookSeat } from 'src/webinars/use-cases/book-seat';

describe('Feature: Book seat', () => {
  let participationRepository: InMemoryParticipationRepository;
  let userRepository: InMemoryUserRepository;
  let webinarRepository: InMemoryWebinarRepository;
  let mailer: InMemoryMailer;
  let idGenerator: IIdGenerator;
  let useCase: BookSeat;

  const organizer = new User({
    id: 'user-organizer-id',
    email: 'organizer@example.com',
    password: 'password',
  });

  const participant = new User({
    id: 'user-participant-id',
    email: 'participant@example.com',
    password: 'password',
  });

  const webinar = new Webinar({
    id: 'webinar-id',
    organizerId: 'user-organizer-id',
    title: 'Webinar title',
    seats: 100,
    startDate: new Date('2024-01-10T10:00:00.000Z'),
    endDate: new Date('2024-01-10T11:00:00.000Z'),
  });

  beforeEach(() => {
    participationRepository = new InMemoryParticipationRepository();
    userRepository = new InMemoryUserRepository([organizer]);
    webinarRepository = new InMemoryWebinarRepository([webinar]);
    mailer = new InMemoryMailer();
    idGenerator = new FixedIdGenerator();
    useCase = new BookSeat(
      participationRepository,
      userRepository,
      webinarRepository,
      mailer,
      idGenerator,
    );
  });

  describe('Scenario: happy path', () => {
    it('should create a participation', async () => {
      await useCase.execute({
        webinarId: 'webinar-id',
        user: participant,
      });

      const createdParticipation = participationRepository.database[0];
      expect(createdParticipation).toEqual({
        props: {
          id: 'id-1',
          userId: 'user-participant-id',
          webinarId: 'webinar-id',
        },
        initialState: {
          id: 'id-1',
          userId: 'user-participant-id',
          webinarId: 'webinar-id',
        },
      });
    });

    it('should send an email to the organizer', async () => {
      await useCase.execute({
        webinarId: 'webinar-id',
        user: participant,
      });

      expect(mailer.sentEmails).toEqual([
        {
          to: 'organizer@example.com',
          subject: 'New participant registered',
          body: 'A new participant has registered for your webinar "Webinar title"',
        },
      ]);
    });
  });

  describe('Scenario: no seats available', () => {
    beforeEach(() => {
      for (let i = 0; i < 100; i++) {
        participationRepository.database.push(
          new Participation({
            id: `participation-${i}`,
            userId: `user-${i}`,
            webinarId: 'webinar-id',
          }),
        );
      }
    });

    it('should throw an error', async () => {
      await expect(
        useCase.execute({
          webinarId: 'webinar-id',
          user: participant,
        }),
      ).rejects.toThrow('No seats available for this webinar');
    });

    it('should not create a participation', async () => {
      const initialCount = participationRepository.database.length;
      try {
        await useCase.execute({
          webinarId: 'webinar-id',
          user: participant,
        });
      } catch (error) {}

      expect(participationRepository.database.length).toBe(initialCount);
    });

    it('should not send an email', async () => {
      try {
        await useCase.execute({
          webinarId: 'webinar-id',
          user: participant,
        });
      } catch (error) {}

      expect(mailer.sentEmails).toEqual([]);
    });
  });

  describe('Scenario: user already participating', () => {
    beforeEach(() => {
      participationRepository.database.push(
        new Participation({
          id: 'existing-participation-id',
          userId: 'user-participant-id',
          webinarId: 'webinar-id',
        }),
      );
    });

    it('should throw an error', async () => {
      await expect(
        useCase.execute({
          webinarId: 'webinar-id',
          user: participant,
        }),
      ).rejects.toThrow('User is already participating in this webinar');
    });

    it('should not create another participation', async () => {
      const initialCount = participationRepository.database.length;
      try {
        await useCase.execute({
          webinarId: 'webinar-id',
          user: participant,
        });
      } catch (error) {}

      expect(participationRepository.database.length).toBe(initialCount);
    });

    it('should not send an email', async () => {
      try {
        await useCase.execute({
          webinarId: 'webinar-id',
          user: participant,
        });
      } catch (error) {}

      expect(mailer.sentEmails).toEqual([]);
    });
  });
});
