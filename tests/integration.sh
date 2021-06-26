#!/bin/sh
mkdir -p dist/examples
touch dist/output.js dist/node-output.js
for entry in "examples"/*
do
  echo "doing a bundle for ${entry}/a.js..."
  npm start -- --main=${entry}/a.js --output=./dist/${entry}.js &> /dev/null
  node dist/${entry}.js >> dist/output.js  2> /dev/null
  node ${entry}/a.js >> dist/node-output.js  2> /dev/null
done

tool_tests=$(md5 -q dist/output.js 2> /dev/null|| md5sum dist/output.js | awk '{ print $1 }' 2> /dev/null)
node_tests=$(md5 -q dist/node-output.js 2> /dev/null|| md5sum dist/node-output.js | awk '{ print $1 }' 2> /dev/null)

if [ "$tool_tests" = "$node_tests" ]; then
  echo -e "\033[0;32m✔ integration tests passed."
  rm -rf dist
else
  echo -e "\033[0;31m❌ integration tests failed. Compare mini JS bundler output and node output for details.\n\n\n"
  echo -e "\033[0;31mMini JS Bundler: \n------------\n------------\n$(cat dist/output.js)\n\n\n"
  echo -e "\033[0;31mnode: \n------------\n------------\n$(cat dist/node-output.js)\n\n\n"
  rm -rf dist
  exit 1
fi
