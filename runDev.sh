#!/bin/bash
node-inspector --web-port=7000 &
nodemon app.js --debug &