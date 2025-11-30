[Download for Chrome](https://chrome.google.com/webstore/detail/streetpass-for-mastodon/fphjfedjhinpnjblomfebcjjpdpakhhn)

[Download for Firefox](https://addons.mozilla.org/en-US/firefox/addon/streetpass-for-mastodon/)

# Feed Quest

Feed Quest is a browser extension that helps you collect RSS and Atom feeds as you browse. Here's how it works:

1. Blogs link to their RSS feeds using [`rel="alternate"` links](https://www.rssboard.org/rss-autodiscovery#element-link)
2. Feed Quest quietly collects these feed URLs as you browse
3. Browse the web as usual. Feed Quest will build a collection of blogs as you go.


## Features

Once installed Feed Quest will collect RSS and Atom feeds from each page you visit.
Click on the extension to open the pop-up, which shows the list of collected feeds.

At the top right you can open the `...` menu to customize Feed Quest.

### OPML export

Many feed readers support import using the OPML format.
If you'd like to import every feed you've discovered, you can use this export feature.


### Subscribe

The "Subscribe Using" feature allows you to choose how feeds are opened.
The default (empty string) will open or download the feed.
Presets allow you to quickly integrate using Feedly, FeedLand, and Inoreader.

If you use a different feed reader you can try integrating yourself.
The subscription URL is a template that replaces `{feedUrl}` with the RSS or Atom feed's URL.
For example: `https://example.com/subscribe?url={feedUrl}`.
Consider sharing your URL template, I'll add it as a new preset.


## Calm tech features

Feed Quest doesn't compete for your attention.
The extension quietly collects feeds, allowing you to explore them when you are ready.


## Additional docs

See build.md, test.md, and release.md to develop this extension.


## Launch post

[This blog post](TODO) announces the launch of this extension.


## Fork of StreetPass for Mastodon

This project builds on the wonderful [StreetPass for Mastodon](https://github.com/tvler/streetpass) browser extension, changing the focus to RSS feeds.


## License

Consistent with the StreetPass license, this project is open-source under the MIT license.

