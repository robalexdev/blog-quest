import * as Popover from "@radix-ui/react-popover";
import * as Tabs from "@radix-ui/react-tabs";
import { cx } from "class-variance-authority";
import * as React from "react";
import { InView } from "react-intersection-observer";
import "webextension-polyfill";
import { downloadLink } from "../../constants";
import { queryClient, nullIconJsx } from "./popup";
import { PopupTab, Website, hideFeedsFormId } from "./util/constants";
import { exportFeeds } from "./util/exportFeeds";
import { getFeedUrl } from "./util/getFeedUrl";
import { getHrefProps } from "./util/getHrefProps";
import { WebsiteExtra } from "./util/getWebsites";
import {
  useFeedUrlSchemeQuery,
  useHideWebsitesOnClickQuery,
  useWebsiteQuery,
} from "./util/reactQuery";
import {
  Feed,
  db,
  getFeedUrlScheme,
  getHideWebsitesOnClick,
  getHrefStore,
} from "./util/storage";

const buttonCheckbox = cx("scale-[0.82]");
const button = cx(
  "flex h-[1.68em] min-w-[1.4em] shrink-0 cursor-default items-center justify-center rounded-6 bg-faded px-[0.38em] text-11 font-medium focus-visible:outline-none",
);

export function WebsiteListView(props: {
  setSelectedWebsite: (website: Website) => any;
}) {
  const websiteQuery = useWebsiteQuery();
  const [hideFeeds, setHideFeeds] = React.useState(false);
  const feedUrlSchemeQuery = useFeedUrlSchemeQuery();
  const hideFeedsOnClickQuery = useHideWebsitesOnClickQuery();
  const popoverCloseRef = React.useRef<HTMLButtonElement>(null);
  const feedUrlSchemeInputRef = React.useRef<HTMLInputElement>(null);
  return (
    <>
      <div className="flex flex-col items-center pt-[12px]">
        <img src="/icon-128.png" width="36" height="36" />

        <h1 className="text-14 font-medium leading-[1.21] text-primaryText">
          Blog Quest
        </h1>
      </div>
      <div className="flex grow flex-col gap-[18px] px-12 py-[18px]">
        <Websites
          hideWebsites={hideFeeds}
          setSelectedWebsite={props.setSelectedWebsite}
          websites={websiteQuery.data?.feeds}
        />

        {!!websiteQuery.data?.hiddenFeeds.length && (
          <details
            className="peer mt-auto"
            tabIndex={
              /* Safari autofocuses this element when the popup opens */
              -1
            }
          >
            <summary
              tabIndex={
                /* Safari autofocuses this element when the popup opens */
                -1
              }
              className="text-13 text-secondaryText"
            >
              Hidden
            </summary>

            <div className="flex flex-col gap-[18px] pt-[18px]">
              <Websites
                hideWebsites={hideFeeds}
                setSelectedWebsite={props.setSelectedWebsite}
                websites={websiteQuery.data?.hiddenFeeds}
              />
            </div>
          </details>
        )}

        {websiteQuery.data?.feeds.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center peer-open:hidden">
            <p className="pointer-events-auto text-13 text-secondaryText">
              No feeds
              {websiteQuery.data.hiddenFeeds.length === 0 && (
                <>
                  . Try{" "}
                  <a
                    {...getHrefProps("https://alexsci.com/blog/")}
                    className="font-medium text-accent"
                  >
                    this
                  </a>
                  !
                </>
              )}
            </p>
          </div>
        )}
      </div>

      <div className="absolute right-12 top-12 flex gap-8" hidden={!hideFeeds}>
        <form
          id={hideFeedsFormId}
          className="contents"
          onSubmit={async (ev) => {
            ev.preventDefault();
            const formData = new FormData(ev.currentTarget);

            const websiteKeys = (await db.websites.toArray()).map(
              (i) => i.website,
            );
            const updates = websiteKeys.map((key) => ({
              key: key,
              changes: {
                hidden: formData.get(key) === "on" ? true : undefined,
              },
            }));
            db.websites.bulkUpdate(updates);

            setHideFeeds((prev) => !prev);
            queryClient.refetchQueries();
          }}
        >
          <button
            type="button"
            className={cx(button, "text-secondaryText")}
            onClick={(ev) => {
              const formElements = ev.currentTarget.form?.elements;
              if (!formElements) {
                return;
              }

              for (const formElement of formElements) {
                if (formElement instanceof HTMLInputElement) {
                  formElement.checked = true;
                }
              }
            }}
          >
            Hide All
          </button>

          <button className={cx(button, "text-accent")}>Save</button>
        </form>
      </div>

      <div className="absolute right-12 top-12 flex gap-8" hidden={hideFeeds}>
        {!!websiteQuery.data?.feeds.length && (
          <span className={cx(button, "text-accent")}>
            {websiteQuery.data?.feeds.length}
          </span>
        )}

        <Popover.Root modal>
          <Popover.Close hidden ref={popoverCloseRef} />

          <Popover.Trigger className={cx(button, "text-accent")}>
            <svg
              fill="currentColor"
              className="size-[1em]"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="15" cy="50" r="9" />
              <circle cx="50" cy="50" r="9" />
              <circle cx="85" cy="50" r="9" />
            </svg>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="end"
              side="bottom"
              sideOffset={6}
              avoidCollisions={false}
              className="flex rounded-6 border border-primaryBorder bg-primaryBg"
              onOpenAutoFocus={(ev) => {
                ev.preventDefault();
              }}
              onCloseAutoFocus={(ev) => {
                ev.preventDefault();
              }}
            >
              <Tabs.Root defaultValue={PopupTab.root} className="contents">
                <Tabs.Content
                  value={PopupTab.root}
                  className="flex flex-col items-start gap-y-8 p-8"
                >
                  <Tabs.List className="contents">
                    <Tabs.Trigger
                      value={PopupTab.openFeedsWith}
                      className={cx(button, "text-accent")}
                    >
                      Subscribe Using…
                    </Tabs.Trigger>
                  </Tabs.List>

                  <Popover.Close
                    className={cx(button, "text-accent")}
                    onClick={() => {
                      setHideFeeds((prev) => !prev);
                    }}
                  >
                    Hide Websites…
                  </Popover.Close>

                  <label className={cx(button, "text-accent")}>
                    Hide Websites On Click&nbsp;
                    <input
                      type="checkbox"
                      defaultChecked={hideFeedsOnClickQuery.data}
                      className={buttonCheckbox}
                      onChange={async (ev) => {
                        await getHideWebsitesOnClick(() => ev.target.checked);
                        queryClient.refetchQueries();
                      }}
                    />
                  </label>

                  <Popover.Close
                    onClick={exportFeeds}
                    className={cx(button, "text-accent")}
                  >
                    Export (.opml)
                  </Popover.Close>

                  <ConfirmButton
                    className={cx(
                      button,
                      "text-accent data-[confirm]:text-[--red-10]",
                    )}
                    onClick={async () => {
                      popoverCloseRef.current?.click();
                      // Purge the database
                      await db.delete({ disableAutoOpen: false });
                      // Legacy
                      await getHrefStore(() => {
                        return new Map();
                      });
                      queryClient.refetchQueries();
                    }}
                    confirmJsx=" (Confirm)"
                  >
                    Reset
                  </ConfirmButton>

                  <a
                    className={cx(button, "text-accent")}
                    {...getHrefProps(downloadLink[__TARGET__])}
                  >
                    Rate Blog Quest
                  </a>
                </Tabs.Content>

                <Tabs.Content
                  value={PopupTab.openFeedsWith}
                  className="flex w-[275px] flex-col gap-y-8 pt-8"
                >
                  <form
                    className="contents"
                    onSubmit={async (ev) => {
                      ev.preventDefault();
                      await getFeedUrlScheme(() =>
                        feedUrlSchemeInputRef.current?.value.trim(),
                      );
                      queryClient.refetchQueries();
                      popoverCloseRef.current?.click();
                    }}
                  >
                    <label className="contents">
                      <span className="px-8 text-12 text-secondaryText">
                        URL to open feeds with. Set as empty for default
                        behavior.
                      </span>

                      <input
                        spellCheck={false}
                        type="text"
                        placeholder="https://example.com/?subscribe={feedUrl}"
                        className="mx-8 rounded-6 border border-primaryBorder bg-secondaryBg px-6 py-2 text-12 text-primaryText placeholder:text-[--gray-a10]"
                        ref={feedUrlSchemeInputRef}
                        defaultValue={feedUrlSchemeQuery.data}
                        key={feedUrlSchemeQuery.data}
                      />
                    </label>

                    <span className="px-8 text-12 text-secondaryText">
                      …or select a preset:
                    </span>

                    <div className="flex flex-wrap gap-8 px-8">
                      {(
                        [
                          "feedbin",
                          "feedhandler",
                          "feedland.com",
                          "feedland.org",
                          "feedly",
                          "feedmail",
                          "inoreader",
                          "netnewswire",

                          "debug",
                          "download",
                        ] as const
                      ).map((item) => {
                        return (
                          <React.Fragment key={item}>
                            <button
                              type="button"
                              className={cx(button, "text-accent")}
                              onClick={() => {
                                if (!feedUrlSchemeInputRef.current) {
                                  return;
                                }

                                feedUrlSchemeInputRef.current.value = {
                                  feedbin:
                                    "https://feedbin.com/?subscribe={feedUrl}",
                                  feedhandler: "feed://{feedUrl}",
                                  "feedland.com":
                                    "https://feedland.com/?feedurl={feedUrl}",
                                  "feedland.org":
                                    "https://feedland.org/?feedurl={feedUrl}",
                                  feedly:
                                    "https://feedly.com/i/discover?query=suggesto%2F{feedUrl}",
                                  feedmail:
                                    "https://feedmail.org/subscriptions/new?url={feedUrl}",
                                  inoreader:
                                    "https://www.inoreader.com/search/feeds/{feedUrl}",
                                  netnewswire: "feed://{feedUrl}",

                                  debug: "http://localhost:8080/#{feedUrl}",
                                  download: "",
                                }[item];

                                feedUrlSchemeInputRef.current.focus();
                              }}
                            >
                              {
                                {
                                  feedbin: "Feedbin",
                                  feedhandler: "feed://",
                                  "feedland.com": "Feedland.com",
                                  "feedland.org": "Feedland.org",
                                  feedly: "Feedly",
                                  feedmail: "FeedMail",
                                  inoreader: "Inoreader",
                                  netnewswire: "NetNewsWire",

                                  debug: "Debug",
                                  download: "Download",
                                }[item]
                              }
                            </button>
                          </React.Fragment>
                        );
                      })}
                    </div>

                    <div className="flex justify-end gap-x-8 border-t border-primaryBorder px-8 py-8">
                      <button
                        type="button"
                        onClick={() => {
                          if (!feedUrlSchemeInputRef.current) {
                            return;
                          }

                          feedUrlSchemeInputRef.current.value = "";
                          feedUrlSchemeInputRef.current.focus();
                        }}
                        className={cx(button, "text-secondaryText")}
                      >
                        Clear
                      </button>

                      <button className={cx(button, "text-accent")}>
                        Save
                      </button>
                    </div>
                  </form>
                </Tabs.Content>
              </Tabs.Root>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </>
  );
}

function Websites(props: {
  websites: Array<WebsiteExtra> | undefined;
  setSelectedWebsite: (website: Website) => any;
  hideWebsites: boolean;
}) {
  return props.websites?.map((websiteData, index, arr) => {
    const prevwebsiteData = arr[index - 1];
    const prevHrefDate = prevwebsiteData
      ? new Date(prevwebsiteData.viewedAt).getDate()
      : new Date().getDate();
    const previousItemWasDayBefore =
      prevHrefDate !== new Date(websiteData.viewedAt).getDate();

    const feedDisplayName = websiteData.website;
    const websiteClickHandler = async (hideWebsites: boolean) => {
      const hideWebsitesOnClick = await queryClient.fetchQuery(
        useHideWebsitesOnClickQuery.getFetchOptions(),
      );
      if (hideWebsites) {
        // Do nothing, the user is interacting with the checkbox
      } else if (!!hideWebsitesOnClick) {
        db.websites.update(websiteData.website, { hidden: true });
        queryClient.refetchQueries();
      } else {
        props.setSelectedWebsite(websiteData);
      }
    };

    return (
      <React.Fragment key={`${index}.${websiteData.website}`}>
        {previousItemWasDayBefore && (
          <p className="shrink-0 text-13 text-secondaryText">
            {new Intl.DateTimeFormat(undefined, {
              day: "numeric",
              month: "short",
            }).format(websiteData.viewedAt)}
          </p>
        )}
        <InView as="div" className="flex items-start">
          <div
            className="pr-[10px]"
            onClick={() => websiteClickHandler(props.hideWebsites)}
          >
            <div className="relative flex size-[19px] shrink-0 overflow-hidden">
              {websiteData.favicon ? (
                <>
                  <img
                    src={websiteData.favicon}
                    width={19}
                    height={19}
                    className="object-cover"
                    loading="lazy"
                    decoding="async"
                  />

                  <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-primaryText opacity-[0.14]" />
                </>
              ) : (
                <div className="flex w-full items-center justify-center bg-faded">
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
                </div>
              )}
            </div>
          </div>
          <div
            className="flex min-w-0 grow flex-col"
            onClick={() => websiteClickHandler(props.hideWebsites)}
          >
            <div className="flex items-baseline justify-between gap-x-6 leading-[1.45]">
              <div className="text overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-medium">
                {feedDisplayName}
              </div>
            </div>

            <FeedsSummary feeds={websiteData.summaryFeeds} />

            {websiteData.additionalFeeds > 0 ? (
              <div className="self-start break-all text-[12.5px] leading-[1.5] text-secondaryText">
                and {websiteData.additionalFeeds} additional feed
                {websiteData.additionalFeeds > 1 && <>s</>}
              </div>
            ) : (
              <div className="self-start break-all text-[12.5px] leading-[1.5] text-secondaryText">
                view details
              </div>
            )}
          </div>
          {props.hideWebsites && (
            <label className={cx(button, "ml-8 text-accent")}>
              Hide&nbsp;
              <input
                name={websiteData.website}
                form={hideFeedsFormId}
                type="checkbox"
                defaultChecked={websiteData.hidden}
                className={buttonCheckbox}
              />
            </label>
          )}
        </InView>
      </React.Fragment>
    );
  });
}

function ConfirmButton(
  props: {
    confirmJsx: React.ReactNode;
  } & Pick<
    JSX.IntrinsicElements["button"],
    "onClick" | "className" | "children"
  >,
) {
  const [confirm, setConfirm] = React.useState(false);

  return (
    <button
      data-confirm={confirm ? "" : undefined}
      className={props.className}
      onClick={
        confirm
          ? props.onClick
          : () => {
              setConfirm(true);
            }
      }
    >
      {props.children}
      {confirm && props.confirmJsx}
    </button>
  );
}

function FeedsSummary(props: { feeds: Array<Feed> | undefined }) {
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
            <div className="flex items-baseline justify-between gap-x-6 leading-[1.45]">
              <a
                {...feedHrefProps}
                className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-medium text-accent"
              >
                {feedData.title}
              </a>
            </div>
          </div>
          <span className="shrink-0 text-[12px] text-secondaryText">
            {new Intl.DateTimeFormat(undefined, {
              timeStyle: "short",
            })
              .format(feedData.viewedAt)
              .toLowerCase()
              .replace(/\s+/g, "")}
          </span>
        </InView>
      </React.Fragment>
    );
  });
}
