#!/bin/bash

# scan using feeder
scanadf --resolution 300 --page-format Legal -o $1/

# convert to PDF
convert -compress JPEG -quality 80 $1/image-* $1/$2.pdf