import Telegraf from "telegraf";
import { onTweet } from "./commands";

const telegramClient = new Telegraf(process.env.TELEGRAM_TOKEN!);

telegramClient.command("tweet", onTweet);

telegramClient.launch();

console.log("Bot started");
