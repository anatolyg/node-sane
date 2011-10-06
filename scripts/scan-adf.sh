#!/bin/bash

sys=`uname`

if [ $sys == 'Darwin' ]
then
    echo 'Bypass Scan'
else
    echo 'Scanning using feeder...'
    # scan using feeder
    scanadf --resolution 300 -o $1/image-%04d

    echo 'Converting to PDF...'
    # convert to PDF
    convert -compress JPEG -quality 80 $1/image-* $1/$2.pdf

    # delete the large files
    rm -rf $1/image-*

    echo 'Finished!'
fi