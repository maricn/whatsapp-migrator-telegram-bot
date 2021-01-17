export class WhatsAppLine {
  day: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
  second: number;

  user?: string;
  text?: string;
  filename?: string;
  description?: string;
  filetype?: string;
  action?: string;

  getTimestampISO8601() {
    return `20${this.year}-${this.month}-${this.day} ${this.hour}:${this.minute}:${this.second}`;
  }
}
