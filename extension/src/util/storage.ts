import { Dexie, type EntityTable } from "dexie";
import type { DeepReadonly } from "ts-essentials";
import {
  HrefStore,
  MaybePromise,
  NotNullNotUndefined,
  actionActive,
  actionInactive,
} from "./constants";
import { getWebsiteName } from "./getWebsiteName";
import { getFeeds } from "./legacyGetFeeds";
import { sleep } from "./sleep";

function storageFactory<T extends NotNullNotUndefined>(args: {
  parse(storageData: any): DeepReadonly<T>;
  serialize(data: DeepReadonly<T>): any;
  storageKey: string;
  onChange?(args: {
    prev: DeepReadonly<T>;
    curr: DeepReadonly<T>;
  }): MaybePromise<void>;
}): {
  (
    cb?: (data: DeepReadonly<T>) => MaybePromise<DeepReadonly<T> | void>,
  ): Promise<DeepReadonly<T>>;
} {
  let lastDataPromise: Promise<DeepReadonly<T>> = Promise.resolve(
    args.parse(undefined),
  );

  return (cb) => {
    const oldLastDataPromise = lastDataPromise;
    lastDataPromise = new Promise((res) => {
      oldLastDataPromise.then(async (oldValue) => {
        try {
          const storageData = (
            await browser.storage.local.get(args.storageKey)
          )?.[args.storageKey];

          const data = args.parse(storageData);
          const changedData = await cb?.(data);

          if (changedData !== undefined) {
            await Promise.all([
              browser.storage.local.set({
                [args.storageKey]: args.serialize(changedData),
              }),
              args.onChange?.({
                prev: data,
                curr: changedData,
              }),
            ]);
          }

          res(changedData ?? data);
        } catch (err) {
          res(oldValue);
        }
      });
    });

    return lastDataPromise;
  };
}

export const getIconState = storageFactory({
  storageKey: "icon-state-3",
  parse(storageData) {
    const iconState: { state: "on" | "off"; unreadCount?: number | undefined } =
      storageData ?? { state: "off" };
    return iconState;
  },
  serialize(iconState) {
    return iconState;
  },
  onChange({ curr }) {
    /**
     * Firefox is still at manifest v2
     */
    const browserAction =
      __TARGET__ === "firefox" ? browser.browserAction : browser.action;

    /**
     * Safari can't render grayed out icon
     */
    if (__TARGET__ !== "safari") {
      const path = curr.state === "off" ? actionInactive : actionActive;

      browserAction.setIcon({
        path: path,
      });
    }
  },
});

// Legacy!
export const getHrefStore = storageFactory({
  storageKey: "feed-href-data-store-3",
  parse(storageData) {
    let hrefStore: HrefStore;
    try {
      hrefStore = new Map(storageData);
    } catch (err) {
      hrefStore = new Map();
    }
    return hrefStore;
  },
  serialize(hrefStore) {
    return Array.from(hrefStore.entries());
  },
  async onChange({ prev, curr }) {
    const prevFeeds = getFeeds(prev);
    const currFeeds = getFeeds(curr);
    const feedsDiff = currFeeds.length - prevFeeds.length;
    if (feedsDiff <= 0) {
      return;
    }

    {
      const prevHiddenFeeds = getFeeds(prev, { hidden: true });
      const currHiddenFeeds = getFeeds(curr, { hidden: true });
      const hiddenFeedsDiff = prevHiddenFeeds.length - currHiddenFeeds.length;

      /**
       * Early exit if we are just moving feeds from hidden to non hidden.
       * This can def be figured out in a better way by figuring out the exact
       * feeds that were added. This is just easier and prob won't break
       * anything.
       */
      if (hiddenFeedsDiff === feedsDiff) {
        return;
      }
    }

    getIconState((iconState) => ({
      state: "on",
      unreadCount: (iconState.unreadCount ?? 0) + feedsDiff,
    }));
  },
});

export const getFeedUrlScheme = storageFactory({
  storageKey: "feed-url-scheme-1",
  parse(storageData: string) {
    return storageData ?? "";
  },
  serialize(data) {
    return data ?? "";
  },
});

export const getHideWebsitesOnClick = storageFactory({
  storageKey: "hide-websites-on-click-1",
  parse(storageData: boolean) {
    return storageData ?? false;
  },
  serialize(data) {
    return data;
  },
});

export interface Feed {
  feedUrl: string; // primary key
  website: string;
  title: string | undefined;
  tabUrl: string;
  viewedAt: number;
}

export interface Website {
  website: string; // primary key
  viewedAt: number;
  hidden: boolean | undefined;
  favicon: string | undefined;
}

export type BlogQuestDBType = Dexie & {
  feeds: EntityTable<Feed, "feedUrl">;
  websites: EntityTable<Website, "website">;
};

const db = new Dexie("BlogQuestDB") as BlogQuestDBType;
db.version(1).stores({
  feeds: "&feedUrl, website, viewedAt",
  websites: "&website, hidden, viewedAt",
});
db.open().catch((e) => {
  console.error("Open failed: " + e);
});

const legacyImport = async () => {
  // Add legacy data, if any exists
  await getHrefStore(async (hrefStore) => {
    await db
      .transaction("rw", db.feeds, db.websites, async () => {
        console.log("Adding legacy data");
        for (const old of hrefStore.values()) {
          const website = getWebsiteName(old.websiteUrl);
          if (!website) {
            continue;
          }
          const existingWebsite = await db.websites.get(website);
          if (existingWebsite) {
            await db.websites.update(website, {
              viewedAt: Math.max(old.viewedAt, existingWebsite.viewedAt),
            });
          } else {
            await db.websites.add({
              website: website,
              viewedAt: old.viewedAt,
              hidden: undefined,
              favicon: old.feedData.favicon,
            });
          }

          if (!(await db.feeds.get(old.feedHref))) {
            await db.feeds.add({
              feedUrl: old.feedHref,
              website: website,
              title: old.feedData.feedTitle,
              tabUrl: old.websiteUrl,
              viewedAt: old.viewedAt,
            });
          }
        }
        console.log("Legacy data added");
      })
      .catch((e) => {
        console.error("Unable to import: ", e);
      });
  });
};

// Schema changes, migrations, etc
const updateDatabase = async (previousVersion: string | undefined) => {
  if (previousVersion !== undefined) {
    const previousVersionYear = Number(previousVersion.split(".")[0]);
    if (previousVersionYear < 2026) {
      // 2025 versions used local storage, migrate to Dexie
      await legacyImport();
    }
  }
};

export { db, updateDatabase };
