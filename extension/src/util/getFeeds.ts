import type { DeepReadonly } from "ts-essentials";
import { HrefDataType, HrefStore } from "./constants";

export function getFeeds(
  hrefStore: DeepReadonly<HrefStore>,
  options?: { hidden?: boolean },
): Array<HrefDataType<"feed">> {
  const feeds: Array<HrefDataType<"feed">> = [];

  for (const hrefData of hrefStore.values()) {
    if (hrefData.feedData.type !== "feed") {
      continue;
    }

    if (!!hrefData.hidden !== !!options?.hidden) {
      continue;
    }

    feeds.push({
      ...hrefData,
      feedData: hrefData.feedData,
    });
  }

  return feeds.sort((a, b) => b.viewedAt - a.viewedAt);
}
