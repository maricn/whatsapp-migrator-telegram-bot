const fs = require('fs');
import { EventQueue, QueuedEvent } from 'ts-events';
import { ChatMessage } from '../chat-message';
import { ChatMessageTransformer } from '../telegram/chat-message-transformer';
import { WhatsAppLine } from './whatsapp-chat-line';

function sleep(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export class WhatsAppProcessor {
  private readonly regexes = [
    {
      id: 'text',
      re: /^\[(?<day>\d\d)\.(?<month>\d\d)\.(?<year>\d\d), (?<hour>\d\d):(?<minute>\d\d):(?<second>\d\d)\] (?<user>.+): (?<text>(?!\u200e)(?:.|\u000a)*)/,
    },
    {
      id: 'uploadAudio',
      re: /^\u200e\[(?<day>\d\d)\.(?<month>\d\d)\.(?<year>\d\d), (?<hour>\d\d):(?<minute>\d\d):(?<second>\d\d)\] (?<user>.+): (?<filename>.*)\.(?<filetype>opus)>$/,
    },
    {
      id: 'uploadPhoto',
      re: /^\u200e\[(?<day>\d\d)\.(?<month>\d\d)\.(?<year>\d\d), (?<hour>\d\d):(?<minute>\d\d):(?<second>\d\d)\] (?<user>.+): (?<filename>.*)\.(?<filetype>jpg)>$/,
    },
    {
      id: 'uploadDocument',
      re: /^\u200e\[(?<day>\d\d)\.(?<month>\d\d)\.(?<year>\d\d), (?<hour>\d\d):(?<minute>\d\d):(?<second>\d\d)\] (?<user>.+): (?<filename>.*)\.(?<filetype>.{3,4}) • (?<description>.*)\u200e(?<action>.*)$/,
    },
    {
      id: 'exporterAnnouncement',
      re: /\[(?<day>\d\d)\.(?<month>\d\d)\.(?<year>\d\d), (?<hour>\d\d):(?<minute>\d\d):(?<second>\d\d)\] \u200e(?<action>.*)$/,
    },
    {
      id: 'announcement',
      re: /\[(?<day>\d\d)\.(?<month>\d\d)\.(?<year>\d\d), (?<hour>\d\d):(?<minute>\d\d):(?<second>\d\d)\] (?<user>.+): \u200e(?<action>.*)$/,
    },
    { id: 'chatEnd', re: /^$/ },
    { id: 'unknown', re: /.*/ },
  ];
  private chatDirectory: string;
  private chatFile: string;
  private chatLines: string;
  private queuedEvent: QueuedEvent<Partial<ChatMessage>>;

  constructor(
    chatDirectory: string,
    chatFilename: string,
    chatMessageQueue: EventQueue,
    chatListener: ChatMessageTransformer,
    // queuedEvent: QueuedEvent<Partial<ChatMessage>>,
  ) {
    this.chatDirectory = chatDirectory;
    this.chatFile = chatDirectory + chatFilename;
    this.chatLines = fs.readFileSync(this.chatFile, {
      encoding: 'utf8',
    });
    this.queuedEvent = new QueuedEvent<ChatMessage>({ queue: chatMessageQueue });
    this.queuedEvent.attach(chatListener.transform.bind(chatListener));
  }

  async process() {
    const lines = this.chatLines.split('\u000d\u000a');
    console.log('chat lines: ' + lines.length);
    await this.processLines(lines);
  }

  private async processLines(lines: string[], resumeFrom?: number) {
    // t.updates.on('message', menu.onMessage);
    // t.updates.startPolling().catch(console.error);

    let lineStart = 0;
    let lineEnd = lineStart;
    for (lineStart = resumeFrom || 0; lineStart < lines.length; lineStart = lineEnd + 1) {
      const lineRaw = lines[lineStart];
      lineEnd = lineStart;

      // find a pattern that matches the raw line
      const matchingRegex = this.regexes.find(r => r.re.test(lineRaw));
      if (!matchingRegex || matchingRegex.id === 'unknown') {
        console.error(`No matching regex for line: [${lineRaw}].`);
        continue;
      }

      // handle end of chat line
      if (matchingRegex.id === 'chatEnd') {
        if (lineStart < lines.length - 1) {
          console.error(`Empty line in the middle of the chat?`);
          continue;
        } else break;
      }

      // extract information from the raw chat line
      const matchFields = lineRaw.match(matchingRegex.re);
      const line: WhatsAppLine = Object.assign(new WhatsAppLine(), matchFields.groups);

      // clean up case when ` <Anhang:` gets captured into user's name
      const username = line.user?.split(':')[0];

      const chatMessage: ChatMessage = {
        type: matchingRegex.id,
        timestamp: new Date(line.getTimestampISO8601()),
        username,
        text: line.text,
        attachment: /^upload(Audio|Photo)$/.test(matchingRegex.id)
          ? fs.readFileSync(`${this.chatDirectory + line.filename}.${line.filetype}`)
          : null,
      };

      this.queuedEvent.post(chatMessage);
      this.queuedEvent.options.queue?.flush();
      continue;

      // make sure we don't get throttled
      await sleep(3000);
    }
  }
}
