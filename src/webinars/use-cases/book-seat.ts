<<<<<<< HEAD
import { IIdGenerator } from 'src/core/ports/id-generator.interface';
=======
>>>>>>> 1df41f7645bf1eaeb654fe69295b98645c1d700f
import { IMailer } from 'src/core/ports/mailer.interface';
import { Executable } from 'src/shared/executable';
import { User } from 'src/users/entities/user.entity';
import { IUserRepository } from 'src/users/ports/user-repository.interface';
<<<<<<< HEAD
import { WebinarAlreadyParticipatingException } from 'src/webinars/exceptions/webinar-already-participating';
import { WebinarNoSeatsAvailableException } from 'src/webinars/exceptions/webinar-no-seats-available';
import { Participation } from 'src/webinars/entities/participation.entity';
=======
>>>>>>> 1df41f7645bf1eaeb654fe69295b98645c1d700f
import { IParticipationRepository } from 'src/webinars/ports/participation-repository.interface';
import { IWebinarRepository } from 'src/webinars/ports/webinar-repository.interface';

type Request = {
  webinarId: string;
  user: User;
};
type Response = void;

export class BookSeat implements Executable<Request, Response> {
  constructor(
    private readonly participationRepository: IParticipationRepository,
    private readonly userRepository: IUserRepository,
    private readonly webinarRepository: IWebinarRepository,
    private readonly mailer: IMailer,
<<<<<<< HEAD
    private readonly idGenerator: IIdGenerator,
  ) {}
  async execute({ webinarId, user }: Request): Promise<Response> {
    const webinar = await this.webinarRepository.findById(webinarId);
    if (!webinar) {
      throw new Error('Webinar not found');
    }

    const existingParticipations =
      await this.participationRepository.findByWebinarId(webinarId);
    const remainingSeats = webinar.props.seats - existingParticipations.length;

    if (remainingSeats <= 0) {
      throw new WebinarNoSeatsAvailableException();
    }

    const isAlreadyParticipating = existingParticipations.some(
      (participation) => participation.props.userId === user.props.id,
    );

    if (isAlreadyParticipating) {
      throw new WebinarAlreadyParticipatingException();
    }

    const participation = new Participation({
      id: this.idGenerator.generate(),
      userId: user.props.id,
      webinarId: webinarId,
    });

    await this.participationRepository.save(participation);

    const organizer = await this.userRepository.findById(
      webinar.props.organizerId,
    );
    if (organizer) {
      await this.mailer.send({
        to: organizer.props.email,
        subject: 'New participant registered',
        body: `A new participant has registered for your webinar "${webinar.props.title}"`,
      });
    }
=======
  ) {}
  async execute({ webinarId, user }: Request): Promise<Response> {
    return;
>>>>>>> 1df41f7645bf1eaeb654fe69295b98645c1d700f
  }
}
