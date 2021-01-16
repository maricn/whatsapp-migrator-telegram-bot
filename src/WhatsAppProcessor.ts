const fs = require('fs');
import { Telegram } from 'puregram';
import { TelegramUser } from 'puregram/lib/interfaces';
import { markdownv2 as format } from 'telegram-format';
import { TelegramMessage } from './TelegramMessage';
import { WhatsAppLine } from './WhatsAppLine';

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
  private chatId: string;

  constructor(chatDirectory: string, chatFilename: string, chat_id: string) {
    this.chatDirectory = chatDirectory;
    this.chatFile = chatDirectory + chatFilename;
    this.chatId = chat_id;
    this.chatLines = fs.readFileSync(this.chatFile, {
      encoding: 'utf8',
    });
  }

  async process(userMap: { [user: string]: Partial<TelegramUser> }) {
    const lines = this.chatLines.split('\u000d\u000a');
    console.log('chat lines: ' + lines.length);
    await this.processLines(lines, userMap);
  }

  private async processLines(
    lines: string[],
    userMap: { [user: string]: Partial<TelegramUser> },
    resumeFrom?: number,
  ) {
    // set up bot token in environment variables
    const t: Telegram = new Telegram({
      token: process.env.TOKEN,
    });

    // t.updates.on('message', menu.onMessage);
    // t.updates.startPolling().catch(console.error);
    //
    let lineStart = 0;
    let lineEnd = lineStart;
    for (lineStart = resumeFrom; lineStart < lines.length; lineStart = lineEnd + 1) {
      const lineRaw = lines[lineStart];
      lineEnd = lineStart;

      const matchingRegex = this.regexes.find(r => r.re.test(lineRaw));
      if (!matchingRegex || matchingRegex.id === 'unknown') {
        console.error(`No matching regex for line: [${lineRaw}].`);
        continue;
      }

      if (matchingRegex.id === 'chatEnd') {
        if (lineStart < lines.length - 1) {
          console.error(`Empty line in the middle of the chat?`);
          continue;
        } else break;
      }

      console.log(`MATCH: ${matchingRegex.id}`);
      console.log(`LINE: ${lineRaw}`);

      const matchFields = lineRaw.match(matchingRegex.re);
      const line: WhatsAppLine = Object.assign(new WhatsAppLine(), matchFields.groups);

      // clean up case when ` <Anhang:` gets captured into user's name
      const username = line.user?.split(':')[0];
      const markdownMention = userMap[username]?.id
        ? format.userMention(username, userMap[username].id)
        : username;

      const tgMessage: TelegramMessage = {
        timestamp: format.monospace(line.getTimestampISO8601()),
        mention: markdownMention,
        text: (line.text && format.escape(line.text)) || null,
      };

      switch (matchingRegex.id) {
        case 'text':
          // @TODO: maricn - uncomment
          break;
          await t.api.sendMessage({
            chat_id: this.chatId,
            text: `${tgMessage.mention}: ${tgMessage.text}\n${tgMessage.timestamp}`,
            parse_mode: 'MarkdownV2',
            disable_notification: true,
          });
          break;

        case 'uploadAudio':
          const audioBuffer = fs.readFileSync(
            `${this.chatDirectory + line.filename}.${line.filetype}`,
          );
          // @TODO: maricn - uncomment
          break;
          await t.api.sendAudio({
            chat_id: this.chatId,
            audio: audioBuffer,
            parse_mode: 'MarkdownV2',
            caption: `${tgMessage.mention} [${tgMessage.timestamp}]`,
          });
          break;

        case 'uploadPhoto':
          const photoBuffer = fs.readFileSync(
            `${this.chatDirectory + line.filename}.${line.filetype}`,
          );
          // @TODO: maricn - uncomment
          break;
          await t.api.sendPhoto({
            chat_id: this.chatId,
            photo: photoBuffer,
            parse_mode: 'MarkdownV2',
            caption: `${tgMessage.mention} [${tgMessage.timestamp}]`,
          });
          break;

        case 'uploadDocument':
          break;

        case 'exporterAnnouncement':
        case 'announcement':
          console.log(`ANNOUNCEMENT`);
          break;

        case 'unknown':
        default:
          console.log(`Unrecognized line: [${lineRaw}]`);
          break;
      }

      continue;

      // make sure we don't get throttled
      await sleep(3000);
    }
  }
}
