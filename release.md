# Releasing Blog Quest

## Versioning

Update VERSION in constants.ts for the new release.

The version scheme is YEAR.MONTH.DAY, with January starting at 1.
Do not zero pad the values.

On GitHub tag the commit that updates VERSION with the corresponding tag.


## Firefox

In extension directory:

    $ yarn build:firefox

Test it.

Package it:

    $ zip -r -FS ../blog-quest-firefox.zip * --exclude '*.git*'

Upload to [Firefox developer page](https://addons.mozilla.org/en-US/developers/addons).

