import { createQuery } from "react-query-kit";
import {
  getHideFeedsOnClick,
  getHrefStore,
  getFeedUrlScheme,
} from "./storage";
import { getFeeds } from "./getFeeds";

export const useHrefStoreQuery = createQuery({
  queryKey: ["feeds"],
  async fetcher() {
    const hrefStore = await getHrefStore();
    return {
      feeds: getFeeds(hrefStore),
      hiddenFeeds: getFeeds(hrefStore, { hidden: true }),
    };
  },
});

export const useFeedUrlSchemeQuery = createQuery({
  queryKey: ["feedurlscheme"],
  fetcher: () => getFeedUrlScheme(),
});

export const useHideFeedsOnClickQuery = createQuery({
  queryKey: ["hidefeedsonclick"],
  fetcher: () => getHideFeedsOnClick(),
});
