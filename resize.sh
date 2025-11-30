#!/bin/bash

# Change white to transparent
convert extension/public/action-active-500.png -transparent white extension/public/action-active-500.png
convert extension/public/action-inactive-500.png -transparent white extension/public/action-inactive-500.png

# Resize
magick extension/public/action-active-500.png -resize 16x16 extension/public/action-active-16.png
magick extension/public/action-active-500.png -resize 19x19 extension/public/action-active-19.png
magick extension/public/action-active-500.png -resize 32x32 extension/public/action-active-32.png
magick extension/public/action-active-500.png -resize 38x38 extension/public/action-active-38.png
magick extension/public/action-inactive-500.png -resize 16x16 extension/public/action-inactive-16.png
magick extension/public/action-inactive-500.png -resize 19x19 extension/public/action-inactive-19.png
magick extension/public/action-inactive-500.png -resize 32x32 extension/public/action-inactive-32.png
magick extension/public/action-inactive-500.png -resize 38x38 extension/public/action-inactive-38.png
magick extension/public/action-active-500.png -resize 128x128 extension/public/icon-128-nopadding.png
magick extension/public/action-active-500.png -resize 128x128 extension/public/icon-128.png
magick extension/public/action-active-500.png -resize 256x256 extension/public/icon-256-nopadding.png
magick extension/public/action-active-500.png -resize 256x256 extension/public/icon-256.png
