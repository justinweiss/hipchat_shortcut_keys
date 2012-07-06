// ==UserScript==
// @name        hipchat_shortcut_keys
// @namespace   http://uberweiss.org
// @description Fixes cmd-w behavior, remaps ctrl-f to cmd-f, and adds a cmd-t 'go to user or room' function to the HipChat web interface.
// @include     *
// @author      Justin Weiss
// ==/UserScript==

$('<div id="goToUI"><form name="goToUIForm"><input type="text" class="text"><ol></ol></form></div>').insertAfter('#main_chat');
$('<style>' +
  '#goToUI { background-color: #fefefe; border: 1px solid #ccc; position: absolute; top: 140px; left: 50%; top: 50%; width: 350px; max-height: 200px; margin-left: -175px; margin-top: -100px; overflow: auto; display: none; }' +
  '#goToUI input { border: none; border-bottom: 1px solid #ccc; border-radius: 0; box-sizing: border-box; width: 100%; }' +
  '#goToUI input:focus { outline: 0; }' +
  '#goToUI ol { list-style-type: none; margin-left: 0px; }' +
  '#goToUI li { padding: 5px; cursor: pointer; color: #333; -webkit-user-select: none; white-space: nowrap; }' +
  '#goToUI li.selected { background-color:#669acc; color:#fff; }' +
  '#goToUI li:hover { background-color: #f6f6f6; color: #333; }' +
  '#goToUI li.room { font-weight: bold; }' +
  '</style>').appendTo('head');

(function () {

  function GoToUI(popupWindow) {
    this.popupWindow = popupWindow;
    this.inputField = popupWindow.find('input');
    this.bindKeys();
  }

  GoToUI.prototype.filterItemList = function (filterFunction) {
    this.itemList.filter(function (i) {
      return filterFunction(this);
    }).show();
    this.itemList.filter(function (i) {
      return !filterFunction(this);
    }).hide();
  }

  GoToUI.prototype.selectedItem = function () {
    var selectedItem = this.itemList.filter('.selected');
    if (selectedItem.length === 0) {
      return this.itemList.filter(':visible').first();
    } else {
      return selectedItem;
    }
  }

  GoToUI.prototype.changeSelection = function (newItemFunction) {
    var selectedItem = this.selectedItem();
    var newItem = newItemFunction(selectedItem);
    if (newItem.length !== 0) {
      selectedItem.removeClass("selected");
      newItem.addClass("selected");
    }
  }

  GoToUI.prototype.buildItems = function () {
    var items = app.room_list.concat(app.roster);
    items = items.concat({
      name: 'Lobby',
      num_participants: app.room_list.length,
      jid: app.lobby_jid
    });
    items = items.sort(function (a, b) {
      return a.name > b.name ? 1 : -1;
    });
    return items;
  }

  GoToUI.prototype.buildHTMLFromItems = function (items) {
    var itemHTML = "";

    for (var i = 0; i < items.length; i++) {
      var classes = "";
      var item = items[i];
      if (item.num_participants) {
        classes += "room "
      }
      itemHTML += "<li class='" + classes + "' jid='" + item.jid +  "'>" + item.name + "</li>";
    }
    return itemHTML;
  }

  GoToUI.prototype.buildItemList = function () {
    this.itemList = this.popupWindow.find('li');
  }

  GoToUI.prototype.show = function () {
    var goToUI = this;
    this.popupWindow.find('ol').html(this.buildHTMLFromItems(this.buildItems()));
    this.buildItemList();
    this.itemList.click(function () {
      goToUI.goToItem($(this));
    });
    this.popupWindow.show();
    this.inputField.focus();
  }

  GoToUI.prototype.hide = function () {
    this.popupWindow.hide();
    this.inputField.val('').trigger('keyup');
    $('#message_input').focus();
  }

  GoToUI.prototype.goToItem = function (item) {
    if (item.length > 0) {
      var jid = item.attr('jid');
      chat.focus_chat(jid, app.get_display_name(jid), true);
      this.hide();
    }
  }

  GoToUI.prototype.bindKeys = function () {
    var goToUI = this;
    this.inputField.bind('keyup', function (event) {
      var specialKey = jQuery.hotkeys.specialKeys [event.which];
      if (specialKey === 'up' || specialKey === 'down') {
        return;
      }
      var inputString = goToUI.inputField.val();
      var itemList = goToUI.itemList;
      goToUI.filterItemList(function (element) {
        return $(element).html().toLowerCase().indexOf(inputString.toLowerCase()) !== -1;
      });
      goToUI.changeSelection(function () {
        return itemList.filter(':visible').first();
      });
    }).bind('keydown', 'return', function () {
      goToUI.goToItem(goToUI.selectedItem());
      return false;
    }).bind('keydown', 'esc', function () {
      goToUI.hide();
      return false;
    }).bind('keydown', 'up', function () {
      goToUI.changeSelection(function (selectedItem) {
        return selectedItem.prev(':visible');
      })
      return false;
    }).bind('keydown', 'down', function () {
      goToUI.changeSelection(function (selectedItem) {
        return selectedItem.next(':visible');
      })
      return false;
    });
  }

  // Unbind the event handler for keyboard shortcut +shortcutString+
  $.fn.unbindShortcut = function (eventType, shortcutString) {
    $(this).each(function() {
      var element = $(this);
      var events = element.data("events")[eventType];

      $.each(events, function () {
        if (this.data === shortcutString) {
          element.unbind(eventType, this.handler);
        }
      })
    });
    return $(this);
  }

  function setupHotkeys() {
    var goToUI = new GoToUI($("#goToUI"));
    var inputs = $(document).add('#message_input');
    inputs.unbindShortcut('keydown', 'Meta+w').unbindShortcut('keydown', 'Ctrl+f');

    inputs.bind('keydown', 'Meta+w', function (e) {
      if (app.current_jid !== app.lobby_jid) {
        var next_tab = $('#tabs li.selected').next();
        // do the same thing clicking the 'x' does
        chat.close_chat(app.current_jid, null, true);
        if (next_tab.length !== 0) {
          chat.focus_chat(next_tab.attr('jid'));
        }
      }
      return false;
    }).bind('keydown', 'Meta+f', function (e) {
      chat.show_search_ui();
      return false;
    }).bind('keydown', 'Meta+t', function (e) {
      goToUI.show();
      return false;
    });
  }

  setupHotkeys();
})();
