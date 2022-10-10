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

/* exported init */

const GETTEXT_DOMAIN = 'my-indicator-extension';

const {GObject, St, GLib} = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Clipboard = St.Clipboard.get_default();

const _ = ExtensionUtils.gettext;

const Indicator = GObject.registerClass(
  class Indicator extends PanelMenu.Button {
      _init() {
          super._init(0.0, _('dev tools'));

          this.add_child(
              new St.Icon({
                  icon_name: 'preferences-system-symbolic',
                  style_class: 'system-status-icon',
              })
          );

          const generateUUIDItem = new PopupMenu.PopupMenuItem(_('Generate UUID'));
          generateUUIDItem.connect('activate', () => {
              const uuid = GLib.uuid_string_random();
              Clipboard.set_text(St.ClipboardType.CLIPBOARD, uuid);
              Main.notify(_(`${uuid} copied to clipboard...`));
          });
          this.menu.addMenuItem(generateUUIDItem);

          const currentTimeInMillisItem = new PopupMenu.PopupMenuItem(
              _('Current time in millis')
          );
          currentTimeInMillisItem.connect('activate', () => {
              const millis = `${Math.floor(GLib.get_real_time() / 1000)}`;
              Clipboard.set_text(St.ClipboardType.CLIPBOARD, millis);
              Main.notify(_(`${millis} copied to clipboard...`));
          });
          this.menu.addMenuItem(currentTimeInMillisItem);
      }
  }
);

class Extension {
    constructor(uuid) {
        this._uuid = uuid;
        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    }

    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this._uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}


/**
 *
 * @param {object} meta The data in metadata.json
 */
function init(meta) {
    return new Extension(meta.uuid);
}
