#!/bin/bash

# Change white to transparent
convert action-active-500.png -transparent white action-active-500.png
convert action-inactive-500.png -transparent white action-inactive-500.png

# Resize
magick action-active-500.png -resize 16x16 action-active-16.png
magick action-active-500.png -resize 19x19 action-active-19.png
magick action-active-500.png -resize 32x32 action-active-32.png
magick action-active-500.png -resize 38x38 action-active-38.png
magick action-inactive-500.png -resize 16x16 action-inactive-16.png
magick action-inactive-500.png -resize 19x19 action-inactive-19.png
magick action-inactive-500.png -resize 32x32 action-inactive-32.png
magick action-inactive-500.png -resize 38x38 action-inactive-38.png
magick action-active-500.png -resize 128x128 icon-128-nopadding.png
magick action-active-500.png -resize 128x128 icon-128.png
magick action-active-500.png -resize 256x256 icon-256-nopadding.png
magick action-active-500.png -resize 256x256 icon-256.png
