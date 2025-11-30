import { Feed } from "./constants";
import { getIsUrlHttpOrHttps } from "./getIsUrlHttpOrHttps";
import { removeSubstring } from "./removeSubstring";

export function getFeedUrl(
  feed: Feed,
  feedUrlScheme: string | undefined,
): string {
  if (!feedUrlScheme) {
    // Download the feed
    return feed.feedUrl;
  }

  let returnUrl = feedUrlScheme;
  if (returnUrl.includes("{feedUrl}")) {
    returnUrl = feed.feedUrl
      ? returnUrl.replaceAll("{feedUrl}", `${feed.feedUrl}`)
      : feed.feedUrl;
  }

  return returnUrl;
}
