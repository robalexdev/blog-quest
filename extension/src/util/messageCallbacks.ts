import { z } from "zod";
import { Message, MessageReturn } from "./constants";
import { getIsUrlHttpOrHttps } from "./getIsUrlHttpOrHttps";
import { getWebsiteName } from "./getWebsiteName";
import { getIconState, db } from "./storage";

type ArgMap = {
  [Key in Message["name"]]: Extract<Message, { name: Key }>["args"];
};

export const messageCallbacks: {
  [K in keyof ArgMap]: (value: ArgMap[K]) => z.infer<(typeof MessageReturn)[K]>;
} = {
  async OPEN_TAB(args) {
    if (!getIsUrlHttpOrHttps(args.url)) {
      return;
    }
    return browser.tabs.create({
      url: args.url,
      active: !args.metaKey,
    });
  },
  async HREF_PAYLOAD(args) {
    if (!getIsUrlHttpOrHttps(args.feedHref)) {
      return;
    }

    //
    // Unlike Mastodon and Webfinger we can't reliably fetch RSS feed content in an extension
    // CORS can reject it
    // Instead rely on the information in the rel=alternate link
    //

    const website = getWebsiteName(args.tabUrl);
    if (!website) {
      console.log("Unable to get website name for: ", args.tabUrl);
      return;
    }

    await db.transaction("rw", db.feeds, db.websites, async () => {
      if (!!(await db.feeds.get(args.feedHref))) {
        // Already seen
        return;
      }

      const now = Date.now();

      console.log("Adding website: " + website);
      await db.websites.upsert(website, {
        viewedAt: now,
        favicon: args.faviconHref,
        // hidden: undefined or unchanged
      });

      console.log("Adding feed: " + args.feedHref);
      await db.feeds.put({
        feedUrl: args.feedHref,
        website: website,
        title: args.feedTitle,
        tabUrl: args.tabUrl,
        viewedAt: now,
      });
      console.log("Added");
    });

    getIconState((iconState) => ({
      state: "on",
      unreadCount: (iconState.unreadCount ?? 0) + 1,
    }));
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
