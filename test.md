# Testing Feed Quest

Feed Quest uses a manual testing strategy.
Repeate these steps on each supported browser.


## Firefox setup

* Open `about:debugging`
* Click "This Firefox"
* Under Temporary Extensions click "Load Temporary Add-on"
* Select the `dist-firefox` directory


## Chrome setup

* Open `chrome://extensions`
* Enable developer mode
* Click load unpacked extension
* Select the `dist-chrome` directory


## Feed reader quirks

You'll need an account with Inoreader, otherwise you'll see the login page.
The others show a helpful page when logged out.

FeedLand shows an error if it hasn't loaded the feed yet.


# Test steps

1. Open the pop-up
  - Confirm feed is empty
2. Open testing/test.html
  - Confirm two feeds are discovered
  - Validate their titles and URLs
  - Confirm "NOT A FEED" is not discovered
3. Select each preset subscription URL; for each preset:
  - Click a feed, confirm it loads with the selected provider
4. Hide a feed
  - Ensure it's not longer visible
5. Click reset / confirm
  - Confirm no feeds are shown

