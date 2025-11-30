import { z } from "zod";

export type MaybePromise<T> = Promise<T> | T;

export const Feed = z.object({
  type: z.literal("feed"),
  feedUrl: z.string(),
  feedTitle: z.optional(z.union([z.string(), z.undefined()])),
  favicon: z.optional(z.union([z.string(), z.undefined()])),
});

export type Feed = z.infer<typeof Feed>;

export const Message = z.discriminatedUnion("name", [
  z.object({
    name: z.literal("HREF_PAYLOAD"),
    args: z.object({
      faviconHref: z.string(),
      feedHref: z.string(),
      feedTitle: z.string(),
      tabUrl: z.string(),
    }),
  }),
]);

export const MessageReturn = {
  HREF_PAYLOAD: z.void(),
} satisfies Record<Message["name"], unknown>;

export type Message = z.infer<typeof Message>;

export type Target = "chrome" | "firefox" | "safari";

export type FeedData = Feed;

export type NotNullNotUndefined = {};

export type HrefData = {
  feedData: FeedData;
  websiteUrl: string;
  viewedAt: number;
  feedHref: string;
  updatedAt?: number;
  hidden?: boolean;
};
export type HrefDataType<T extends HrefData["feedData"]["type"]> =
  HrefData & { feedData: Extract<FeedData, { type: T }> };

export type HrefStore = Map<string, HrefData>;

export const actionInactive = {
  "16": "/action-inactive-16.png",
  "19": "/action-inactive-19.png",
  "32": "/action-inactive-32.png",
  "38": "/action-inactive-38.png",
} as const satisfies Record<string, string>;

export const actionActive = {
  "16": "/action-active-16.png",
  "19": "/action-active-19.png",
  "32": "/action-active-32.png",
  "38": "/action-active-38.png",
} as const satisfies Record<string, string>;

export const hideFeedsFormId = "hideFeedsFormId";

export enum PopupTab {
  root = "root",
  openFeedsWith = "openFeedsWith",
}
