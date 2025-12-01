#!/bin/bash

# Change white to transparent
convert assets/action-active-500.png -transparent white assets/action-active-500.png
convert assets/action-inactive-500.png -transparent white assets/action-inactive-500.png

# Resize
magick assets/action-active-500.png -resize 16x16 extension/public/action-active-16.png
magick assets/action-active-500.png -resize 19x19 extension/public/action-active-19.png
magick assets/action-active-500.png -resize 32x32 extension/public/action-active-32.png
magick assets/action-active-500.png -resize 38x38 extension/public/action-active-38.png
magick assets/action-inactive-500.png -resize 16x16 extension/public/action-inactive-16.png
magick assets/action-inactive-500.png -resize 19x19 extension/public/action-inactive-19.png
magick assets/action-inactive-500.png -resize 32x32 extension/public/action-inactive-32.png
magick assets/action-inactive-500.png -resize 38x38 extension/public/action-inactive-38.png
magick assets/action-active-500.png -resize 128x128 extension/public/icon-128-nopadding.png
magick assets/action-active-500.png -resize 128x128 extension/public/icon-128.png
magick assets/action-active-500.png -resize 256x256 extension/public/icon-256-nopadding.png
magick assets/action-active-500.png -resize 256x256 extension/public/icon-256.png

# Chrome needs a 96x96 icon padded to 128x128
magick assets/action-active-500.png -resize 96x96 assets/action-active-96.png
convert -border 16x16 -bordercolor "#00000000" assets/action-active-96.png assets/action-active-padded-128.png

