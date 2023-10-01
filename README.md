# Dev-Tools

This is my little [Gnome Shell](https://wiki.gnome.org/Projects/GnomeShell) extension. It contains some small helpers that I use on my every day job as a software developer.

These are currently:

- Generating a new random UUID
- Getting the current time in milli seconds

![](./screenshot.png)

## Contribution

You can clone the extension from github and send me pull requests.

### How to run it locally

After cloning, you can build and install it using following shell script: `./scripts/build.sh` and `./scripts/install.sh`.

Then you run a gnome session with `dbus-run-session -- gnome-shell --nested --wayland`. For more information see [https://gjs.guide/extensions/topics/extension.html](https://gjs.guide/extensions/topics/extension.html).
