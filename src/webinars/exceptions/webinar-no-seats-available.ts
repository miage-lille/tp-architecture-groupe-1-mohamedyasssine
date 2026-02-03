export class WebinarNoSeatsAvailableException extends Error {
  constructor() {
    super('No seats available for this webinar');
    this.name = 'WebinarNoSeatsAvailableException';
  }
}
