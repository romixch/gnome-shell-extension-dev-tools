/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

import GLib from 'gi://GLib';
import St from 'gi://St';
import GObject from 'gi://GObject';

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';

const Indicator = GObject.registerClass(
  class Indicator extends PanelMenu.Button {
      _init() {
          super._init(0.0, _('dev tools'));
          this.Clipboard = St.Clipboard.get_default();

          this.add_child(
              new St.Icon({
                  icon_name: 'preferences-system-symbolic',
                  style_class: 'system-status-icon',
              })
          );

          this.addUUIDUtils();
          this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
          this.addTimeUtils();
          this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
          this.addBase64Utils();
      }

      addUUIDUtils() {
          const baseMenuItem = new PopupMenu.PopupBaseMenuItem({reactive: false});
          const container = createContainer('UUID');
          const generateUUIDButton = new St.Button({label: _('Copy random UUID'), can_focus: true, track_hover: true, style_class: 'button'});
          generateUUIDButton.connect('clicked', copyUUID(this.Clipboard, this.menu));
          container.add_child(generateUUIDButton);
          baseMenuItem.add_child(container);
          this.menu.addMenuItem(baseMenuItem);
      }

      addTimeUtils() {
          const baseMenuItem = new PopupMenu.PopupBaseMenuItem({reactive: false});
          const container = createContainer('Time Utilities');

          const copyTimeInSecondsButton = new St.Button({
              label: _('Copy current time in seconds'),
              can_focus: true, track_hover: true, style_class: 'button',
          });
          copyTimeInSecondsButton.connect('clicked', copyTimeInSeconds(this.Clipboard, this.menu));
          container.add_child(copyTimeInSecondsButton);

          container.add_child(new St.Bin({style_class: 'spacer'}));

          const entry = new St.Entry({hint_text: 'enter unix timestamp in utc'});
          container.add_child(entry);
          const copySpacer1 = new St.Bin({style_class: 'spacer'});
          const copyRowUTC = createCopyRow(this.Clipboard, this.menu);
          const copySpacer2 = new St.Bin({style_class: 'spacer'});
          const copyRowLocal = createCopyRow(this.Clipboard, this.menu);

          entry.connect('key_release_event', calculateDateTimeFromTimestamp(entry, container, copyRowUTC, copySpacer1, copySpacer2, copyRowLocal));

          baseMenuItem.add_child(container);
          this.menu.addMenuItem(baseMenuItem);
      }

      addBase64Utils() {
          const baseMenuItem = new PopupMenu.PopupBaseMenuItem({reactive: false});
          const container = createContainer('Base64 Utilities');
          const base64Entry = new St.Entry({hint_text: 'enter base64 string to convert'});
          container.add_child(base64Entry);
          container.add_child(new St.Bin({style_class: 'gap'}));

          const buttonContainer = new St.BoxLayout({x_expand: true});
          const downIcon = new St.Icon({icon_name: 'go-down-symbolic', icon_size: 14});
          const base64ToClearButton = new St.Button({can_focus: true, track_hover: true, style_class: 'button', child: downIcon});
          base64ToClearButton.connect('clicked', () => {
              const decoded = base64decode(base64Entry.text);
              cleartextEntry.set_text(decoded);
          });
          buttonContainer.add_child(new St.Bin({x_expand: true}));
          buttonContainer.add_child(base64ToClearButton);
          const upIcon = new St.Icon({icon_name: 'go-up-symbolic', icon_size: 14});
          const clearToBase64Button = new St.Button({can_focus: true, track_hover: true, style_class: 'button', child: upIcon});
          clearToBase64Button.connect('clicked', () => {
              const encoded = base64encode(cleartextEntry.text);
              base64Entry.set_text(encoded);
          });
          buttonContainer.add_child(new St.Bin({style_class: 'gap'}));
          buttonContainer.add_child(clearToBase64Button);
          buttonContainer.add_child(new St.Bin({x_expand: true}));
          container.add_child(buttonContainer);

          container.add_child(new St.Bin({style_class: 'gap'}));
          const cleartextEntry = new St.Entry({hint_text: 'enter clear text string to convert'});
          container.add_child(cleartextEntry);
          baseMenuItem.add_child(container);
          this.menu.addMenuItem(baseMenuItem);
      }
  }
);

const createContainer = title => {
    const container = new St.BoxLayout({vertical: true, x_expand: true});
    container.add_child(new St.Label({text: title, style_class: 'title'}));
    return container;
};

const createCopyRow = (clipboard, menu) => {
    const row = new St.BoxLayout({style_class: 'row'});
    const label = new St.Label({text: '', x_expand: true});
    row.add_child(label);
    const copyIcon = new St.Icon({icon_name: 'edit-copy-symbolic', icon_size: 14});
    const copyButton = new St.Button({can_focus: true, track_hover: true, style_class: 'button', child: copyIcon});
    copyButton.connect('clicked', () => {
        clipboard.set_text(St.ClipboardType.CLIPBOARD, label.get_text());
        Main.notify(_(`${label.get_text()} copied to clipboard...`));
        menu.toggle();
    });
    row.add_child(copyButton);
    return {row, label};
};

const copyUUID = (clipboard, menu) => () => {
    const uuid = GLib.uuid_string_random();
    clipboard.set_text(St.ClipboardType.CLIPBOARD, uuid);
    Main.notify(uuid + _(' copied to clipboard...'));
    menu.toggle();
};

const copyTimeInSeconds = (clipboard, menu) => () => {
    const seconds = `${Math.floor(GLib.get_real_time() / 1000 / 1000)}`;
    clipboard.set_text(St.ClipboardType.CLIPBOARD, seconds);
    Main.notify(_(`${seconds} copied to clipboard...`));
    menu.toggle();
};

const calculateDateTimeFromTimestamp = (entry, container, utcRow, copySpacer1, copySpacer2, localRow) => () => {
    const unixTimestamp = parseInt(entry.text);
    if (isNaN(unixTimestamp)) {
        container.remove_child(copySpacer1);
        container.remove_child(utcRow.row);
        container.remove_child(copySpacer2);
        container.remove_child(localRow.row);
    } else {
        container.add_child(copySpacer1);
        container.add_child(utcRow.row);
        container.add_child(copySpacer2);
        container.add_child(localRow.row);
        const dateTime = GLib.DateTime.new_from_unix_utc(unixTimestamp);
        utcRow.label.set_text(dateTime.format_iso8601());
        const localTimeZone = GLib.TimeZone.new_local();
        const offsetInSeconds = localTimeZone.get_offset(unixTimestamp);
        const localDateTime = dateTime.add_seconds(offsetInSeconds).to_timezone(localTimeZone);
        localRow.label.set_text(localDateTime.format_iso8601());
    }
    return true;
};

const BASE64_STRING = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const  base64encode = string => {
    let output = '';
    const stringSafe = `${string}\0\0\0`; // ugly
    for (let index = 0; index < string.length; index += 3) {
        let value = 0;
        for (let i = 0; i < 3; i += 1)
            value = value * 256 + stringSafe.charCodeAt(index + i);

        const n = Math.min(string.length - index, 3);
        for (let i = 0; i < 4; i += 1)
            output += i <= n ? BASE64_STRING[Math.floor(value / Math.pow(64, 3 - i)) % 64] : '=';
    }
    return output;
};

const base64decode = string => {
    let output = '';
    for (let index = 0; index < string.length; index += 4) {
        let value = 0;
        let n = 3; // ugly
        for (let i = 0; i < 4; i += 1) {
            n -= string[index + i] === '=' ? 1 : 0;
            value = (value * 64) + (string[index + i] === '=' ? 0 : BASE64_STRING.indexOf(string[index + i]));
        }
        for (let i = 0; i < n; i += 1)
            output += String.fromCharCode(Math.floor(value / Math.pow(256, 2 - i)) % 256);
    }
    return output;
};


export default class DevExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        this._metadata = metadata;
    }

    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this._metadata, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}


