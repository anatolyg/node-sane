#!/bin/bash

sys=`uname`

if [ $sys == 'Darwin' ]
then
    echo '{"statusText":"Bypass Scan", "status":1}'
    cp ./scripts/data/random.pdf $1/$2.pdf
else
    # scan using feeder
    scanadf --resolution 300 -o $1/image-%04d

    echo 'Converting to PDF...'
    # convert to PDF
    convert -compress JPEG -quality 80 $1/image-* $1/$2.pdf

    # delete the large files
    rm -rf $1/image-*
fi
echo '{"statusText":"finished", "status":0}'