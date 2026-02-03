import { Entity } from 'src/shared/entity';

type Props = {
  id: string;
  userId: string;
  webinarId: string;
};

export class Participation extends Entity<Props> {}
