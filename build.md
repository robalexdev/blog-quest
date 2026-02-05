# Building Feed Quest

In the extension directory:

```
yarn
yarn build:firefox
yarn build:chrome
yarn build # builds all
```

Extensions are in the `dist-firefox` and `dist-chrome` directories.


## Firefox for Android

Per: https://extensionworkshop.com/documentation/develop/developing-extensions-for-firefox-for-android/#install-and-run-your-extension-in-firefox-for-android

    $ cd dist-firefox
    $ adb devices  # List devices
    $ export DEVICEID="changeme"
    $ web-ext run -t firefox-android --adb-device $DEVICEID --firefox-apk org.mozilla.firefox_beta
