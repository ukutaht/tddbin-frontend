'use strict';

import {keyboardEventUtil} from './keyboard-event-util';
import {browserEventUtil} from './browser-event-util';

function ShortcutProcessor() {
  this._pressedKeys = [];
  this._registeredShortcuts = [];
  keyboardEventUtil.addKeyDownListener(this._keyDown.bind(this));
  keyboardEventUtil.addKeyUpListener(this._keyUp.bind(this));
  browserEventUtil.onWindowBlur(this._fireOnShortcutEndCallback.bind(this));
}

ShortcutProcessor.prototype = {

  _pressedKeys: null,
  _registeredShortcuts: null,
  _firstKeyOfCurrentShortcut: null,
  _onKeyDownCallback: null,
  _onShortcutEndCallback: null,

  registerShortcut: function(shortcut) {
    this._registeredShortcuts.push(shortcut);
  },

  registerShortcuts: function(shortcuts) {
    var self = this;
    shortcuts.forEach(function(shortcut) {
      self.registerShortcut(shortcut);
    });
  },

  onKeyDown: function(callback) {
    this._onKeyDownCallback = callback;
  },

  onShortcutEnd: function(callback) {
    this._onShortcutEndCallback = callback;
  },

  _fireOnKeyDownCallback: function() {
    if (this._onKeyDownCallback) {
      this._onKeyDownCallback(this._pressedKeys);
    }
  },

  _fireOnShortcutEndCallback: function() {
    if (this._onShortcutEndCallback) {
      this._onShortcutEndCallback();
    }
  },

  _keyDown: function(keyName) {
    var isStartOfShortcut = this._pressedKeys.length === 0;
    if (isStartOfShortcut) {
      return this._handlePossibleShortcutStart(keyName);
    }
    return this._handleConsecutiveKey(keyName);
  },

  _handlePossibleShortcutStart: function(keyName) {
    var isFirstKeyOfRegisteredShortcut = this._registeredShortcuts.some(function(shortcut) {
      return shortcut.isStartOfKeyCombo([keyName]);
    });
    if (isFirstKeyOfRegisteredShortcut) {
      this._pressedKeys = [keyName];
      this._firstKeyOfCurrentShortcut = keyName;
      this._fireOnKeyDownCallback();
    }
  },

  _handleConsecutiveKey: function(keyName) {
    var isFirstKeyRepition = this._pressedKeys.length === 1 && this._pressedKeys[0] === keyName;
    if (isFirstKeyRepition) {
      return;
    }

    this._pressedKeys.push(keyName);
    this._fireOnKeyDownCallback();

    if (this._isRegisteredShortcut(this._pressedKeys)) {
      return keyboardEventUtil.PREVENT_DEFAULT_ACTION;
    }
  },

  _keyUp: function(keyName) {
    if (this._isEndOfCurrentShortcut(keyName)) {
      this._processFirstMatchingShortcut(this._pressedKeys);
      this._fireOnShortcutEndCallback();
      this._pressedKeys = [];
    }
  },

  _isEndOfCurrentShortcut: function(keyName) {
    return keyName === this._firstKeyOfCurrentShortcut;
  },

  _processFirstMatchingShortcut: function(pressedKeys) {
    this._registeredShortcuts.some(function(shortcut) {
      if (shortcut.isKeyCombo(pressedKeys)) {
        shortcut.fireAssignedCallback();
        return true;
      }
      return false;
    });
  },

  _isRegisteredShortcut: function(pressedKeys) {
    return this._registeredShortcuts.some(function(shortcut) {
      return shortcut.isKeyCombo(pressedKeys);
    });
  }
};

module.exports = ShortcutProcessor;
