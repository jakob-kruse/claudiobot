import { TelegrafContext } from "telegraf/typings/context";
import { ResponseData } from "twitter";
import { sendMediaTweet, sendTextTweet } from "./twitter";

function tweetUrlFromResponseData(responsData: ResponseData) {
  return `https://twitter.com/${responsData.user.screen_name}/status/${responsData.id_str}`;
}

export async function onTweet(ctx: TelegrafContext) {
  if (!ctx.message) {
    return;
  }

  const messageId = ctx.message.message_id;

  ctx.deleteMessage(messageId).catch((e) => {
    ctx.reply(e.message);
    return;
  });

  const replyTo = ctx.message.reply_to_message;

  if (replyTo) {
    // Get first photo
    const photo = replyTo.photo?.shift();

    if (photo) {
      const caption = replyTo.caption;
      const photoUrl = await ctx.telegram.getFileLink(photo.file_id);
      const { error, response } = await sendMediaTweet(photoUrl, caption);

      if (error || !response) {
        ctx.reply(error!);
        return;
      }
      ctx.reply(tweetUrlFromResponseData(response));
      return;
    }

    const { response, error } = await sendTextTweet(replyTo.text!);
    if (!response || error) {
      ctx.reply(error!);
      return;
    }
    ctx.reply(tweetUrlFromResponseData(response));
    return;
  }

  const messageText = ctx.message.text?.split(" ").slice(1).join(" ").trim();

  if (!messageText) {
    ctx.reply(
      "guna: Please provide a tweet text or reply to a message to use it"
    );
    return;
  }

  const { response, error } = await sendTextTweet(messageText);
  if (!response || error) {
    ctx.reply(error!);
    return;
  }

  ctx.reply(tweetUrlFromResponseData(response));
}
