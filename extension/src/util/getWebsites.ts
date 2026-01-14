import { BlogQuestDBType, Feed, Website } from "./storage";

export type WebsiteExtra = Website & {
  summaryFeeds: Array<Feed>;
  additionalFeeds: number;
};

export const getWebsites = async (db: BlogQuestDBType, hidden: boolean) => {
  const websites = await db.websites
    .filter((o) => !!o.hidden == hidden)
    .reverse()
    .sortBy("viewedAt");

  return Promise.all(
    websites.map(async (website) => {
      const feeds = await db.feeds
        .where("website")
        .equals(website.website)
        .reverse()
        .sortBy("viewedAt");

      const SUMMARY_FEED_COUNT = 3;
      const additionalFeeds = Math.max(feeds.length - SUMMARY_FEED_COUNT, 0);

      const out: WebsiteExtra = {
        ...website,
        summaryFeeds: feeds.slice(0, SUMMARY_FEED_COUNT),
        additionalFeeds: additionalFeeds,
      };
      return out;
    }),
  );
};

export const getFeeds = async (db: BlogQuestDBType, website: string) => {
  return await db.feeds
    .where("website")
    .equals(website)
    .reverse()
    .sortBy("viewedAt");
};

export const getAllFeeds = async (db: BlogQuestDBType) => {
  return await db.feeds.reverse().sortBy("viewedAt");
};
