import { cx } from "class-variance-authority";
import * as React from "react";
import { InView } from "react-intersection-observer";
import "webextension-polyfill";
import { queryClient, nullIconJsx } from "./popup";
import { Website } from "./util/constants";
import { getFeedUrl } from "./util/getFeedUrl";
import { getHrefProps } from "./util/getHrefProps";
import { useFeedQuery, useFeedUrlSchemeQuery } from "./util/reactQuery";
import { Feed } from "./util/storage";

const button = cx(
  "flex h-[1.68em] min-w-[1.4em] shrink-0 cursor-pointer items-center justify-center rounded-6 bg-faded p-[1em] my-[0.2em] text-16 font-medium focus-visible:outline-2",
);

export function WebsiteDetailView(props: {
  website: Website;
  clearSelectedWebsite: () => any;
}) {
  const variables = { website: props.website.website };
  const feedsQuery = useFeedQuery({ variables });
  return (
    <>
      <div className="flex flex-col items-center pt-[12px]">
        {props.website.favicon ? (
          <img
            src={props.website.favicon}
            width={36}
            height={36}
            className="object-cover align-middle"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <svg
            width="40"
            height="40"
            viewBox="0 0 256 256"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[12px]"
          >
            {nullIconJsx}
          </svg>
        )}

        <a {...getHrefProps("https://" + props.website.website)}>
          <h1 className="text-14 font-medium leading-[2] text-primaryText">
            {props.website.website}
          </h1>
        </a>
      </div>

      <div className="flex grow flex-col gap-[18px] px-12 py-[18px]">
        <h2 className="text-left text-12 font-medium leading-[1.21] text-secondaryText">
          Discovered feeds:
        </h2>
        <Feeds feeds={feedsQuery.data} />
      </div>

      <button
        className={cx(
          button, "absolute left-12 top-12"
        )}
        onClick={props.clearSelectedWebsite}
      >
        &larr; back
      </button>
    </>
  );
}

function Feeds(props: { feeds: Array<Feed> | undefined }) {
  return props.feeds?.map((feedData, index, arr) => {
    const feedHrefProps = getHrefProps(feedData.feedUrl, async () => {
      const feedUrlScheme = await queryClient.fetchQuery(
        useFeedUrlSchemeQuery.getFetchOptions(),
      );
      return getFeedUrl(feedData, feedUrlScheme);
    });
    return (
      <React.Fragment key={`${index}.${feedData.feedUrl}`}>
        <InView as="div" className="flex items-start">
          <div className="flex min-w-0 grow flex-col">
            <span className="shrink-0 text-[12px] text-secondaryText">
              {new Intl.DateTimeFormat(undefined, {
                timeStyle: "short",
              })
                .format(feedData.viewedAt)
                .toLowerCase()
                .replace(/\s+/g, "")}
            </span>
            <div className="flex items-baseline justify-between gap-x-6 leading-[1.45]">
              <span className="overflow-hidden text-[14px] font-medium text-primaryText">
                {feedData.title}
              </span>
            </div>
            <a
              {...getHrefProps(feedData.feedUrl)}
              className="overflow-hidden text-ellipsis text-[13px] font-medium text-secondaryText"
              title={feedData.feedUrl}
            >
              {feedData.feedUrl}
            </a>
            <a
              {...getHrefProps(feedData.tabUrl)}
              className={cx(button)}
              title={feedData.tabUrl}
            >
              View webpage
            </a>
            <a
              {...feedHrefProps}
              className={cx(button)}
              title={feedData.feedUrl}
            >
              Subscribe
            </a>
          </div>
        </InView>
      </React.Fragment>
    );
  });
}
