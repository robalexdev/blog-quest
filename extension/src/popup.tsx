import "webextension-polyfill";
import * as React from "react";
import * as ReactDom from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Popover from "@radix-ui/react-popover";
import * as Tabs from "@radix-ui/react-tabs";
import { InView } from "react-intersection-observer";
import {
  HrefDataType,
  Message,
  MessageReturn,
  PopupTab,
  hideFeedsFormId,
} from "./util/constants";
import { getDisplayHref } from "./util/getDisplayHref";
import { exportFeeds } from "./util/exportFeeds";
import {
  getIconState,
  getHrefStore,
  getFeedUrlScheme,
  getHideFeedsOnClick,
} from "./util/storage";
import { cx } from "class-variance-authority";
import { getFeedUrl } from "./util/getFeedUrl";
import { downloadLink } from "../../constants";
import { getHrefProps } from "./util/getHrefProps";
import {
  useHrefStoreQuery,
  useFeedUrlSchemeQuery,
  useHideFeedsOnClickQuery,
} from "./util/reactQuery";

getIconState(() => {
  return { state: "off" };
});

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: Infinity } },
});

const button = cx(
  "flex h-[1.68em] min-w-[1.4em] shrink-0 cursor-default items-center justify-center rounded-6 bg-faded px-[0.38em] text-11 font-medium focus-visible:outline-none",
);

const buttonCheckbox = cx("scale-[0.82]");

function Popup() {
  const [hideFeeds, setHideFeeds] = React.useState(false);
  const hrefStoreQuery = useHrefStoreQuery();
  const feedUrlSchemeQuery = useFeedUrlSchemeQuery();
  const hideFeedsOnClickQuery = useHideFeedsOnClickQuery();
  const popoverCloseRef = React.useRef<HTMLButtonElement>(null);
  const feedUrlSchemeInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="relative flex h-[600px] w-[350px] flex-col overflow-auto bg-primaryBg">
      <div className="flex flex-col items-center pt-[12px]">
        <img src="/icon-128.png" width="36" height="36" />

        <h1 className="text-14 font-medium leading-[1.21] text-primaryText">
          Feed Collector
        </h1>
      </div>

      <div className="flex grow flex-col gap-[18px] px-12 py-[18px]">
        <Feeds
          hideFeeds={hideFeeds}
          feeds={hrefStoreQuery.data?.feeds}
        />

        {!!hrefStoreQuery.data?.hiddenFeeds.length && (
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
              <Feeds
                hideFeeds={hideFeeds}
                feeds={hrefStoreQuery.data?.hiddenFeeds}
              />
            </div>
          </details>
        )}

        {hrefStoreQuery.data?.feeds.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center peer-open:hidden">
            <p className="pointer-events-auto text-13 text-secondaryText">
              No feeds
              {hrefStoreQuery.data.hiddenFeeds.length === 0 && (
                <>
                  . Try{" "}
                  <a
                    {...getHrefProps("https://streetpass.social")}
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

      <div
        className="absolute right-12 top-12 flex gap-8"
        hidden={!hideFeeds}
      >
        <form
          id={hideFeedsFormId}
          className="contents"
          onSubmit={async (ev) => {
            ev.preventDefault();
            const formData = new FormData(ev.currentTarget);

            await getHrefStore((prev) => {
              const hrefStore = new Map(prev);

              for (const [key, hrefData] of hrefStore) {
                const hidden = formData.get(key) === "on";
                hrefStore.set(key, {
                  ...hrefData,
                  hidden: hidden,
                });
              }

              return hrefStore;
            });

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

      <div
        className="absolute right-12 top-12 flex gap-8"
        hidden={hideFeeds}
      >
        {!!hrefStoreQuery.data?.feeds.length && (
          <span className={cx(button, "text-accent")}>
            {hrefStoreQuery.data?.feeds.length}
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
                    Hide Feeds…
                  </Popover.Close>

                  <label className={cx(button, "text-accent")}>
                    Hide Feeds On Click&nbsp;
                    <input
                      type="checkbox"
                      defaultChecked={hideFeedsOnClickQuery.data}
                      className={buttonCheckbox}
                      onChange={async (ev) => {
                        await getHideFeedsOnClick(() => ev.target.checked);
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
                    Rate Feed Collector
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
                      await getFeedUrlScheme(
                        () => feedUrlSchemeInputRef.current?.value.trim(),
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
                          "feedly",
                          "feedland.com",
                          "feedland.org",
                          "inoreader",
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
                                  feedly: "https://feedly.com/i/discover?query=suggesto%2F{feedUrl}",
                                  "feedland.com": "https://feedland.com/?feedurl={feedUrl}",
                                  "feedland.org": "https://feedland.org/?feedurl={feedUrl}",
                                  inoreader: "https://www.inoreader.com/search/feeds/{feedUrl}",
                                  debug: "http://localhost:8080/#{feedUrl}",
                                  download: "",
                                }[item];

                                feedUrlSchemeInputRef.current.focus();
                              }}
                            >
                              {
                                {
                                  feedly: "Feedly",
                                  "feedland.com": "Feedland.com",
                                  "feedland.org": "Feedland.org",
                                  inoreader: "Inoreader",
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
    </div>
  );
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

function Feeds(props: {
  feeds: Array<HrefDataType<"feed">> | undefined;
  hideFeeds: boolean;
}) {
  return props.feeds?.map((hrefData, index, arr) => {
    const prevHrefData = arr[index - 1];
    const prevHrefDate = prevHrefData
      ? new Date(prevHrefData.viewedAt).getDate()
      : new Date().getDate();
    const previousItemWasDayBefore =
      prevHrefDate !== new Date(hrefData.viewedAt).getDate();
    const feedHrefProps = getHrefProps(
      hrefData.feedData.feedUrl,
      async () => {
        const [feedUrlScheme, hideFeedsOnClick] = await Promise.all([
          queryClient.fetchQuery(useFeedUrlSchemeQuery.getFetchOptions()),
          queryClient.fetchQuery(useHideFeedsOnClickQuery.getFetchOptions()),
        ]);

        if (hideFeedsOnClick) {
          await getHrefStore((prev) =>
            new Map(prev).set(hrefData.feedHref, {
              ...hrefData,
              hidden: true,
            }),
          );

          queryClient.refetchQueries();
        }

        return getFeedUrl(hrefData.feedData, feedUrlScheme);
      },
    );
    const feedDisplayName = hrefData.feedData.feedTitle
      ? `${hrefData.feedData.feedTitle}`
      : getDisplayHref(hrefData.feedData.feedUrl);

    return (
      <React.Fragment key={`${index}.${hrefData.feedHref}`}>
        {previousItemWasDayBefore && (
          <p className="shrink-0 text-13 text-secondaryText">
            {new Intl.DateTimeFormat(undefined, {
              day: "numeric",
              month: "short",
            }).format(hrefData.viewedAt)}
          </p>
        )}

        <InView
          as="div"
          className="flex items-start"
        >
          <a
            {...feedHrefProps}
            className="flex shrink-0 pr-[7px] pt-[4px]"
            title={feedDisplayName}
          >
            <div className="relative flex size-[19px] shrink-0 overflow-hidden rounded-full">
              {hrefData.feedData.favicon ? (
                <>
                  <img
                    src={hrefData.feedData.favicon}
                    width={19}
                    height={19}
                    className="object-cover"
                    loading="lazy"
                    decoding="async"
                  />

                  <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-primaryText opacity-[0.14]" />
                </>
              ) : (
                <div className="flex w-full items-center justify-center bg-faded text-accent">
                  <svg
                    width="40" height="40" 
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
          </a>
          <div className="flex min-w-0 grow flex-col">
            <div className="flex items-baseline justify-between gap-x-6 leading-[1.45]">
              <a
                {...feedHrefProps}
                className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-medium text-accent"
                title={feedDisplayName}
              >
                {feedDisplayName}
              </a>

              {!props.hideFeeds && (
                <span className="shrink-0 text-[12px] text-secondaryText">
                  {new Intl.DateTimeFormat(undefined, {
                    timeStyle: "short",
                  })
                    .format(hrefData.viewedAt)
                    .toLowerCase()
                    .replace(/\s+/g, "")}
                </span>
              )}
            </div>

            <a
              {...getHrefProps(hrefData.websiteUrl)}
              className="self-start break-all text-[12.5px] leading-[1.5] text-secondaryText"
            >
              {getDisplayHref(hrefData.websiteUrl)}
            </a>
          </div>

          {props.hideFeeds && (
            <label className={cx(button, "ml-8 text-accent")}>
              Hide&nbsp;
              <input
                name={hrefData.feedHref}
                form={hideFeedsFormId}
                type="checkbox"
                defaultChecked={hrefData.hidden}
                className={buttonCheckbox}
              />
            </label>
          )}
        </InView>
      </React.Fragment>
    );
  });
}

const nullIconJsx = (
  <>
	<path d="M 2 25.955 L 2 50.909 5.250 51.373 C 7.038 51.629, 14.125 52.332, 21 52.936 C 84.261 58.497, 142.337 95.734, 176.523 152.652 C 190.729 176.305, 201.348 208.766, 203.460 235 C 203.793 239.125, 204.311 245.313, 204.612 248.750 L 205.159 255 230.235 255 L 255.310 255 254.659 241.750 C 252.131 190.296, 232.676 138.977, 199.960 97.465 C 167.325 56.054, 115.406 22.193, 65.195 9.570 C 46.492 4.868, 20.606 1.081, 6.750 1.021 L 2 1 2 25.955 M 2 113.349 L 2 139 8.750 139.022 C 16.594 139.047, 29.317 141.692, 40 145.518 C 73.506 157.520, 100.765 185.199, 111.903 218.527 C 115.055 227.959, 117.989 243.478, 117.996 250.750 L 118 255 143.604 255 L 169.208 255 168.545 246.750 C 165.377 207.321, 150.714 172.240, 125.598 144 C 107.218 123.334, 82.287 106.698, 55.967 97.537 C 43.256 93.112, 24.146 89.153, 11.488 88.322 L 2 87.698 2 113.349 M 24.763 188.456 C 18.828 190.728, 12.186 195.775, 8.475 200.833 C 3.385 207.768, 1.673 213.790, 2.200 222.899 C 3.967 253.414, 40.693 265.900, 61.368 243.014 C 67.479 236.250, 69.429 230.926, 69.429 221 C 69.429 210.663, 67.377 205.456, 60.341 197.933 C 53.263 190.366, 47.426 187.716, 37 187.335 C 31.348 187.129, 27.248 187.504, 24.763 188.456" stroke="none" fill="#ff8000" fill-rule="evenodd"/>
  </>
);

const rootNode = document.getElementById("root");
if (!rootNode) {
  throw new Error();
}

const root = ReactDom.createRoot(rootNode);

root.render(
  <QueryClientProvider client={queryClient}>
    <Popup />
  </QueryClientProvider>,
);
