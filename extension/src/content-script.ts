/* eslint-env browser */

import type { Message } from "./util/constants.js";

function getCurrentUrlSanitized() {
  const url = new URL(window.location.toString());

  // Delete hash
  url.hash = "";

  // Delete UTM parameters https://en.wikipedia.org/wiki/UTM_parameters#UTM_parameters
  url.searchParams.delete("utm_source");
  url.searchParams.delete("utm_medium");
  url.searchParams.delete("utm_campaign");
  url.searchParams.delete("utm_term");
  url.searchParams.delete("utm_content");

  // Delete yahoo trackers https://github.com/brave/adblock-lists/pull/978/files
  url.searchParams.delete("guccounter");
  url.searchParams.delete("guce_referrer");
  url.searchParams.delete("guce_referrer_sig");

  return url.toString();
}

let currentUrlSanitized = getCurrentUrlSanitized();
const hrefs: Set<string> = new Set();

// Normalize and make absolute
function normalizeHref(url) {
  if (url) {
    try {
      return (new URL(url, document.baseURI)).href;
    } catch (err) {
    }
  }
  return '';
}

function processFeed(feed, iconHref) {
  let feedHref = normalizeHref(feed.getAttribute("href"));

  if (feedHref && !hrefs.has(feedHref)) {
    hrefs.add(feedHref);
    let feedTitle = feed.getAttribute('title');
    if (! feedTitle) {
      // Fallback: use the page title
      feedTitle = document.title;
    }

    const message: Message = {
      name: "HREF_PAYLOAD",
      args: {
        faviconHref: iconHref,
        feedHref: feedHref,
        feedTitle: feedTitle,
        tabUrl: currentUrlSanitized,
      },
    };
    browser.runtime.sendMessage(message);
    console.log('RSS content script');
    console.log(message);
  }
}

function sendHrefs() {
  // Find the best icon for the site
  const icons = document.querySelectorAll(":is(link)[href][rel~='icon']");
  let iconHref = '';
  if (icons.length > 0) {
      iconHref = normalizeHref(icons[0].getAttribute("href"));
  }

  // Process RSS feeds
  let feeds = document.querySelectorAll(":is(link)[href][type~='application/rss+xml'][rel~='alternate']");
  for (const feed of feeds) {
    processFeed(feed, iconHref);
  }

  // Process Atom feeds
  feeds = document.querySelectorAll(":is(link)[href][type~='application/atom+xml'][rel~='alternate']");
  for (const feed of feeds) {
    processFeed(feed, iconHref);
  }
}

new MutationObserver(() => {
  const testCurrentUrlSanitized = getCurrentUrlSanitized();
  if (currentUrlSanitized !== testCurrentUrlSanitized) {
    currentUrlSanitized = testCurrentUrlSanitized;
    hrefs.clear();
  }

  sendHrefs();
}).observe(document.documentElement, {
  subtree: true,
  childList: true,
  attributeFilter: ["rel"],
});

sendHrefs();
