import { Telegram } from 'puregram';
import { ParseMode, TelegramInputFile } from 'puregram/lib/types';
import { markdownv2 as format } from 'telegram-format';
import { ChatMessage } from '../chat-message';

export class TelegramSender {
  private readonly chatId: string;
  private readonly telegram: Telegram;

  constructor(chatId: string) {
    this.chatId = chatId;

    // read bot token from environment variable
    this.telegram = new Telegram({
      token: process.env.TOKEN,
    });
  }

  async sendMessage(message: ChatMessage & { telegramUserId: number }) {
    // @TODO: maricn - use telegram username rather than name of the user
    // as the chat exporter has it saved
    const mention = format.userMention(message.username, message.telegramUserId);
    const timestamp = format.monospace(message.timestamp.toISOString());
    const text = !!message.text ? format.escape(message.text) : null;

    const params: {
      chat_id: string;
      disable_notification: boolean;
      parse_mode: ParseMode;
      text: string;
      caption: string;
      audio: TelegramInputFile;
      photo: TelegramInputFile;
    } = {
      chat_id: this.chatId,
      disable_notification: true,
      parse_mode: 'MarkdownV2',
      text: `${mention}: ${text}\n${timestamp}`,
      caption: `${mention} [${timestamp}]`,
      audio: message.attachment,
      photo: message.attachment,
    };

    if (message.username === 'nikola') {
      console.log(`${JSON.stringify(params.text)}`);
    }

    switch (message.type) {
      case 'text':
        break;
        await this.telegram.api.sendMessage(params);
        break;

      case 'uploadAudio':
        break;
        await this.telegram.api.sendAudio(params);
        break;

      case 'uploadPhoto':
        break;
        await this.telegram.api.sendPhoto(params);
        break;

      case 'uploadDocument':
        break;

      case 'exporterAnnouncement':
      case 'announcement':
        break;

      case 'unknown':
      default:
        console.error(`Unknown type: [${JSON.stringify(message)}]`);
        break;
    }
  }
}
