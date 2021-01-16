# WhatsApp Migrator - Telegram Bot

Telegram bot for migrating your existing WhatsApp group chats. Looking for maintainers!

## How

1. **EXPORT ARCHIVE** - Go to your WhatsApp chat, menu (three dots), more, "Export Chat" and save the zip file on your phone.
  a. _Option is not available in Germany, however it might be that one of the chat members can access this option._
2. **START CHAT** - Open Telegram and start a new chat or navigate to your destination chat.
3. **ADD BOT** - Add our bot to the chat - [@whatsapp_migrator_bot](https://t.me/whatsapp_migrator_bot).
4. **UPLOAD ARCHIVE** - Reply to the bot's message with your exported zip file.
5. **SETUP USERS** - Follow the bots instructions to setup user mappings.
  a. _Best to have all users added to the group and turn off their notifications as there will be a storm of messages._
6. **IMPORT** - Start the import process.

_Import is deliberately slow (~1000 messages per hour) so the bots don't get rate limited for posting too many messages._

## Why

If you wish to migrate from WhatsApp to Telegram and to preserve your old chat history.

### Why not use existing solution

There's few of them but I couldn't find one that:
* has username mappings from WA to Telegram users (+w/ `@mentions`)
* send original timestamps with migrated message
* preserve chronological ordering between messages
* upload all audio and video files to the group
* is open source (FLOSS)

Most notable mentions:
* WhatsApp Chats Importer - [@whatsapp_chat_migrator_bot](https://t.me/whatsapp_chat_migrator_bot) (not open source?)
* [TLImporter](https://github.com/TelegramTools/TLImporter)
* [wat-bridge](https://github.com/rmed/wat-bridge)
* [puregram](https://github.com/nitreojs/puregram/) - used under the hood to work with Telegram API
