#!/bin/bash

# scan using feeder
scanadf --resolution 300 -o $1/image-%04d

# convert to PDF
convert -compress JPEG -quality 80 $1/image-* $1/$2.pdf

# delete the large files
rm -rf $1/image-*