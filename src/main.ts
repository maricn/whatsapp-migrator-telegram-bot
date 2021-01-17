import { EventQueue } from 'ts-events';
import { ChatMessageTransformer } from './telegram/chat-message-transformer';
import { TelegramSender } from './telegram/telegram-sender';
import { WhatsAppProcessor } from './whatsapp/whatsapp-processor';

// if you want to mention OPs
const userMap = {
  user1: { id: 12345678 },
  user2: { id: 87654321 },
  user3: { id: 666999666 },
  nikola: { id: 123 },
};

const chatId = '77777777';

const resumeFrom = 0;
const chatDirectory = 'imports/chat777/';
const chatFilename = '_chat.txt';

new Promise(async resolve => {
  const chatMessageQueue = new EventQueue();

  const telegramSender = new TelegramSender(chatId);
  const transformer = new ChatMessageTransformer(telegramSender, userMap);

  await new WhatsAppProcessor(chatDirectory, chatFilename, chatMessageQueue, transformer).process();
}).catch(err => console.error(err));
