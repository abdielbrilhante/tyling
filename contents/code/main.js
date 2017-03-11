var Window = function (client) {
  this.client   = client;
  this.geometry = client.geometry;
  this.desktop  = client.desktop;
  this.floating = false;
  this.proportion = 1.0;
};

var spacing = {
  gap: 2, lr: 8, tb: 8
};

function simpleSwap(v, i, j) {
  var temp = v[i];
  v[i] = v[j];
  v[j] = temp;
}

function tileable(client) {
  return !(client.skipTaskbar || client.skipSwitcher || client.skipPager  ||
           client.transient || client.modal) && client.normalWindow;
}

var WindowGroup = function (desktop) {
  this.tiling = true;
  this.storage = [];
  this.desktop = desktop;

  var allClients = workspace.clientList();

  for (var i = 0; i < allClients.length; i++) {
    if (allClients[i].desktop == this.desktop) {
      this.add(allClients[i]);
    }
  }
};

WindowGroup.prototype.filter = function () {
  var f = [];

  for (var i = 0; i < this.storage.length; i++) {
    var win = this.storage[i];

    if (!win.client.minimized) {
      f.push(win);
    }
  }

  return f;
};

// FIXME: redundant code from filterByDesktop
WindowGroup.prototype.swap = function (direction) {
  var indexes = [], active;

  for (var i = 0; i < this.storage.length; i++) {
    var client = this.storage[i].client;

    if (!client.minimized) {
      if (client == workspace.activeClient) active = indexes.length;
      indexes.push(i);
    }
  }

  if (indexes <= 1) return;

  var neighbor = active + direction;

  if (neighbor < 0) neighbor = indexes.length - 1;
  if (neighbor >= indexes.length) neighbor = 0;

  simpleSwap(this.storage, indexes[active], indexes[neighbor]);
  this.layout();
};

WindowGroup.prototype.resize = function (client, offset) {
  for (var i = 0; i < this.storage.length; i++) {
    if (this.storage[i].client == client) {
      this.storage[i].proportion += offset;
      break;
    }
  }

  this.layout();
};

// TODO: Add param to reset excesses
WindowGroup.prototype.layout = function () {
  if (!this.tiling) { return }

  var clients = this.filter();

  var screen = workspace.clientArea(workspace.WorkArea, workspace.activeScreen, workspace.currentDesktop);

  var weightSum = 0;
  for (var i = 0; i < clients.length; i++) {
    weightSum += clients[i].proportion;
  }

  var width  = (screen.width - (spacing.gap*(clients.length - 1)) - (2*spacing.lr));
  var height = screen.height - (2*spacing.tb);

  var offset = spacing.lr + screen.x;
  for (var i = 0; i < clients.length; i++) {
    var geometry = clients[i].client.geometry;

    geometry.width = Math.round(width*(clients[i].proportion/weightSum));
    geometry.height = height;

    geometry.x = offset;
    geometry.y = spacing.tb + screen.y;

    clients[i].client.geometry = geometry;
    offset += geometry.width + spacing.gap;
  }
};

WindowGroup.prototype.add = function (client) {
  if (tileable(client)) {
    this.storage.push(new Window(client));
    this.layout();
  }
};

WindowGroup.prototype.remove = function (client) {
  for (var i = 0; i < this.storage.length; i++) {
    if (client == this.storage[i].client) {
      this.storage.splice(i, 1);
      this.layout();
      break;
    }
  }
};

WindowGroup.prototype.toggleTiling = function () {
  this.tiling = !this.tiling;
  this.layout();
};

var windows = {};

for (var i = 1; i <= workspace.desktops; i++) {
  windows[i] = new WindowGroup(i)
}

workspace.clientAdded.connect(function (client) {
  windows[client.desktop].add(client);
});

workspace.clientUnminimized.connect(function (client) {
  windows[client.desktop].layout();
});

workspace.clientRemoved.connect(function (client) {
  windows[client.desktop].remove(client);
});

// TODO: Shift client to the last position
workspace.clientMinimized.connect(function (client) {
  windows[client.desktop].layout();
});

workspace.desktopPresenceChanged.connect(function (client, desktop) {
  if (desktop > 0) {
    windows[desktop].remove(client);
    windows[client.desktop].add(client);
  }
});

workspace.currentDesktopChanged.connect(function (desktop, client) {
  for (var i = 1; i <= workspace.desktops; i++) {
    windows[i].layout();
  }
});

registerShortcut("Reset_layout", "Reset layout for all desktops", "Shift+Z", function () {
  windows[workspace.currentDesktop].layout();
});

// TODO: Pass client as parameter
registerShortcut("Left_swap", "Swap with window to the left", "Alt+Shift+Left", function () {
  windows[workspace.currentDesktop].swap(-1);
});

// TODO: Pass client as parameter
registerShortcut("Right_swap", "Swap with window to the left", "Alt+Shift+Right", function () {
  windows[workspace.currentDesktop].swap(1);
});

registerShortcut("Grow_Window", "Grow window", "Alt+Shift+PgUp", function () {
  windows[workspace.currentDesktop].resize(workspace.activeClient, 0.2);
});

registerShortcut("Shrink_Window", "Shrink window", "Alt+Shift+PgDown", function () {
  windows[workspace.currentDesktop].resize(workspace.activeClient, -0.2);
});

registerShortcut("Toggle_Tiling", "Toggle active desktop tiling", "Meta+T", function () {
  windows[workspace.currentDesktop].toggleTiling();
});

/*

Group by desktop
Tabbing mode
Floating mode

*/
