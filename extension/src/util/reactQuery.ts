import { createQuery } from "react-query-kit";
import { getFeeds, getWebsites } from "./getWebsites";
import { db, getFeedUrlScheme, getHideWebsitesOnClick } from "./storage";

export const useWebsiteQuery = createQuery({
  queryKey: ["websites"],
  async fetcher() {
    const result = {
      feeds: await getWebsites(db, false),
      hiddenFeeds: await getWebsites(db, true),
    };
    return result;
  },
});

type FeedsQuery = { website: string };
export const useFeedQuery = createQuery({
  queryKey: ["feeds"],
  async fetcher(vars: FeedsQuery) {
    return await getFeeds(db, vars.website);
  },
});

export const useFeedUrlSchemeQuery = createQuery({
  queryKey: ["feedurlscheme"],
  fetcher: () => getFeedUrlScheme(),
});

export const useHideWebsitesOnClickQuery = createQuery({
  queryKey: ["hidewebsitesonclick"],
  fetcher: () => getHideWebsitesOnClick(),
});
