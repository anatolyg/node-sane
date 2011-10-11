#!/bin/bash
ps ax|grep node |awk '{print $1}'|xargs kill
node-inspector --web-port=7000 &
nodemon app.js --debug &
