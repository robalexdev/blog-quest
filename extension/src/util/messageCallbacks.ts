import { z } from "zod";
import {
  Message,
  MessageReturn,
  Feed,
} from "./constants";
import { getUncachedFeedData } from "./getUncachedFeedData";
import { getIsUrlHttpOrHttps } from "./getIsUrlHttpOrHttps";
import { getHrefStore } from "./storage";

type ArgMap = {
  [Key in Message["name"]]: Extract<Message, { name: Key }>["args"];
};

export const messageCallbacks: {
  [K in keyof ArgMap]: (value: ArgMap[K]) => z.infer<(typeof MessageReturn)[K]>;
} = {
  async HREF_PAYLOAD(args) {
    if (!getIsUrlHttpOrHttps(args.feedHref)) {
      return;
    }

    const hasExistingHrefData = (
      await getHrefStore((prev) => {
        const hrefStore = new Map(prev);
        // streetpass would expire known non-profiles here
        // but we don't fetch the feed, so there's nothing to expire
        return hrefStore;
      })
    ).has(args.feedHref);

    if (hasExistingHrefData) {
      return;
    }

    //
    // Unlike Mastodon and Webfinger we can't reliably fetch RSS feed content in an extension
    // CORS can reject it
    // Instead rely on the information in the rel=alternate link
    //

    const feedData = {
      type: "feed",
      feedTitle: args.feedTitle,
      feedUrl: args.feedHref,
      // tabUrl too?
      favicon: args.faviconHref,
    };

    await getHrefStore((hrefStore) => {
      const newHrefStore = new Map(hrefStore);
      newHrefStore.set(args.feedHref, {
        feedData: feedData,
        viewedAt: Date.now(),
        websiteUrl: args.tabUrl,
        feedHref: args.feedHref,
      });

      return newHrefStore;
    });
  },
};

/**
 * Thanks to https://stackoverflow.com/questions/70598583/argument-of-type-string-number-is-not-assignable-to-parameter-of-type-never
 * And https://github.com/Microsoft/TypeScript/issues/30581#issuecomment-1008338350
 * todo look at https://github.com/Microsoft/TypeScript/issues/30581#issuecomment-1080979994
 */
export function runMessageCallback<K extends keyof ArgMap>(
  message: { [P in K]: { name: P; args: ArgMap[P] } }[K],
): z.infer<(typeof MessageReturn)[K]> {
  return messageCallbacks[message.name](message.args);
}
