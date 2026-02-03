import { Webinar } from 'src/webinars/entities/webinar.entity';

export interface IWebinarRepository {
  create(webinar: Webinar): Promise<void>;
<<<<<<< HEAD
  findById(id: string): Promise<Webinar | null>;
=======
>>>>>>> 1df41f7645bf1eaeb654fe69295b98645c1d700f
}
