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

var WindowGroup = function () {
  this.storage = [];

  var allClients = workspace.clientList();

  for (var i = 0; i < allClients.length; i++) {
    this.add(allClients[i]);
  }
};

WindowGroup.prototype.filterByDesktop = function (desktop) {
  var f = [];

  for (var i = 0; i < this.storage.length; i++) {
    var win = this.storage[i];

    if ((win.client.desktop == desktop) && !win.client.minimized) {
      f.push(win);
    }
  }

  return f;
};

function simpleSwap(v, i, j) {
  var temp = v[i];
  v[i] = v[j];
  v[j] = temp;
}

// FIXME: redundant code from filterByDesktop
WindowGroup.prototype.swap = function (direction) {
  var indexes = [], active;

  for (var i = 0; i < this.storage.length; i++) {
    var client = this.storage[i].client;

    if ((client.desktop == workspace.currentDesktop) && !client.minimized) {
      if (client == workspace.activeClient) active = indexes.length;
      indexes.push(i);
    }
  }

  if (indexes <= 1) return;

  var neighbor = active + direction;

  if (neighbor < 0) neighbor = indexes.length - 1;
  if (neighbor >= indexes.length) neighbor = 0;

  simpleSwap(this.storage, indexes[active], indexes[neighbor]);
  this.layout(workspace.currentDesktop);
};

WindowGroup.prototype.resize = function (client, offset) {
  for (var i = 0; i < this.storage.length; i++) {
    if (this.storage[i].client == client) {
      this.storage[i].proportion += offset;
      break;
    }
  }

  this.layout(client.desktop);
};

// TODO: Add param to reset excesses
WindowGroup.prototype.layout = function (desktop) {
  var clients = this.filterByDesktop(desktop);

  var screen = workspace.clientArea(workspace.WorkArea, workspace.activeScreen, desktop);

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

function tileable(client) {
  return !(client.skipTaskbar || client.skipSwitcher || client.skipPager  ||
           client.transient || client.modal) && client.normalWindow;
}

WindowGroup.prototype.add = function (client) {
  if (tileable(client)) {
    this.storage.push(new Window(client));
    this.layout(client.desktop);
  }
};

WindowGroup.prototype.remove = function (client) {
  for (var i = 0; i < this.storage.length; i++) {
    if (client == this.storage[i].client) {
      this.storage.splice(i, 1);
      this.layout(client.desktop);
      break;
    }
  }
};

var windows = new WindowGroup();

workspace.clientAdded.connect(function (client) {
  windows.add(client);
});

workspace.clientUnminimized.connect(function (client) {
  windows.layout(client.desktop);
});

workspace.clientRemoved.connect(function (client) {
  windows.remove(client);
});

// TODO: Shift client to the last position
workspace.clientMinimized.connect(function (client) {
  windows.layout(client.desktop);
});

workspace.currentDesktopChanged.connect(function (desktop, client) {
  for (var i = 1; i <= workspace.desktops; i++) {
    windows.layout(i);
  }
});

registerShortcut("Reset_layout", "Reset layout for all desktops", "Shift+Z", function () {
  windows.layout(workspace.currentDesktop);
});

// TODO: Pass client as parameter
registerShortcut("Left_swap", "Swap with window to the left", "Alt+Shift+Left", function () {
  windows.swap(-1);
});

// TODO: Pass client as parameter
registerShortcut("Right_swap", "Swap with window to the left", "Alt+Shift+Right", function () {
  windows.swap(1);
});

registerShortcut("Grow_Window", "Grow window", "Alt+Shift+PgUp", function () {
  windows.resize(workspace.activeClient, 0.2);
});

registerShortcut("Shrink_Window", "Shrink window", "Alt+Shift+PgDown", function () {
  windows.resize(workspace.activeClient, -0.2);
});

/*

Group by desktop
Tabbing mode
Floating mode

*/
