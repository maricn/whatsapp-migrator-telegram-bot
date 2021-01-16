import { Menu } from './Menu';
import { WhatsAppProcessor } from './WhatsAppProcessor';

// if you want to mention OPs
const userMap = {
  user1: { id: 12345678 },
  user2: { id: 87654321 },
  user3: { id: 666999666 },
};

const chat_id = '77777777';

const resumeFrom = 0;
const chatDirectory = 'imports/chat777/';
const chatFilename = '_chat.txt';

new Promise(async resolve =>
  new WhatsAppProcessor(chatDirectory, chatFilename, chat_id).process(userMap),
).catch(err => console.error(err));

const menu: Menu = new Menu();
