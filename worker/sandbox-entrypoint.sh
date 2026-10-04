#!/bin/sh
set -eu

test -f /input/input.pdf
test -d /output
umask 077
exec pdftoppm -png -r "${PDF_DPI:-216}" -f 1 -l "${PDF_MAX_PAGES:-501}" /input/input.pdf /output/page
