import needle from "needle";
import TwiterClient, { ResponseData } from "twitter";
import { ResponseOrError } from "./ResponseOrError";

const twitterClient = new TwiterClient({
  consumer_key: process.env.TWITTER_API_KEY!,
  consumer_secret: process.env.TWITTER_API_KEY_SECRET!,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN!,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
});

async function getBase64Image(
  photoUrl: string
): Promise<ResponseOrError<boolean>> {
  return new Promise((resolve) => {
    needle.get(photoUrl, (error, response) => {
      if (!error && response.statusCode == 200) {
        resolve({
          response: response.body.toString("base64"),
        });
      } else {
        resolve({
          error: `guna: Could not get base64 image`,
        });
      }
    });
  });
}

export async function sendTextTweet(
  text: string
): Promise<ResponseOrError<ResponseData>> {
  let postResponse;
  try {
    postResponse = await twitterClient.post("statuses/update", {
      status: text,
    });
  } catch (error) {
    return {
      error: `guna: Could not send text tweet [${error.code}]`,
    };
  }
  console.log(postResponse);

  return {
    response: postResponse,
  };
}

export async function sendMediaTweet(
  photoUrl: string,
  caption?: string
): Promise<ResponseOrError<ResponseData>> {
  let {
    response: base64Image,
    error: base64conversionError,
  } = await getBase64Image(photoUrl);

  if (base64conversionError) {
    return {
      error: "Could not convert image to base64",
    };
  }

  let uploadResponse;
  try {
    uploadResponse = await twitterClient.post("media/upload", {
      media_data: base64Image,
    });
  } catch (error) {
    if (error[0]) {
      return {
        error: `guna: Could not upload file [${error[0].message}]`,
      };
    }

    return {
      error: "guna but no error",
    };
  }

  let postResponse;
  try {
    postResponse = await twitterClient.post("statuses/update", {
      status: caption ?? undefined,
      media_ids: uploadResponse.media_id_string,
    });
  } catch (error) {
    if (error[0]) {
      return {
        error: `guna: Could not send media tweet [${error[0].message}]`,
      };
    }

    return {
      error: "guna but no error",
    };
  }

  return {
    response: postResponse,
  };
}
