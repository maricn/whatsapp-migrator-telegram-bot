import { MessageContext, User } from 'puregram';

export class Menu {
  private userMap: { [sourceUsername: string]: Partial<User> };
  private destinationChatId: string;

  constructor() {
    this.userMap = {};
  }

  onMessage(context: MessageContext) {
    if (context.groupChatCreated) {
      console.log(`group chat created: ${context.chat.title}`);
    }

    if (context.forwardMessage?.from) {
      console.log(`forwarded from: ${context.forwardMessage.from.toJSON()}`);
    }

    const text = context.text;
    console.log(text);
    const [_, command, argsAll] = text.match(/^\/([a-zA-Z]+) ?(.*)/);
    const [...args] = argsAll.split(' ');

    console.log(`command: [${command}], args: [${args}]`);
    switch (command) {
      case 'setuser':
        this.setUser(args[0], args[1]);
        break;
      case 'setdest':
        this.setDestinationChatId(args[0]);
        break;
      default:
        console.log(`DEFAULT: command: [${command}], args: [${args}]`);
        break;
    }
  }

  private setUser(chatUsername, telegramId) {
    this.userMap.chatUsername = telegramId;
  }

  private setDestinationChatId(chatId) {
    this.destinationChatId = chatId;
  }
}
