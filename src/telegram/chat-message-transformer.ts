import { ChatMessage } from '../chat-message';
import { TelegramSender } from './telegram-sender';

export class ChatMessageTransformer {
  private readonly userMap: any;
  private readonly t: TelegramSender;

  constructor(telegramSender: TelegramSender, userMap: { [user: string]: { id: number } }) {
    this.t = telegramSender;
    this.userMap = userMap;
  }

  public async transform(message: ChatMessage) {
    // @TODO: maricn - figure out buffering logic to group messages per sender
    const telegramUserId = this.userMap[message.username]?.id;
    await this.t.sendMessage(Object.assign(message, { telegramUserId }));
  }
}
