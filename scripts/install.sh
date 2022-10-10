#!/bin/env bash

set -e

echo "Copy files to local extension folder..."
rm -rf ~/.local/share/gnome-shell/extensions/devtools@romix.ch/
mkdir ~/.local/share/gnome-shell/extensions/devtools@romix.ch/
cp ./dist/* ~/.local/share/gnome-shell/extensions/devtools@romix.ch/
echo "Done."