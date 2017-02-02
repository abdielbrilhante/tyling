var Window = function (client) {
  this.client   = client;
  this.geometry = client.geometry;
  this.desktop  = client.desktop;
  this.floating = false;
};

var spacing = {
  gap: 4, lr: 16, tb: 12
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
    var client = this.storage[i].client;

    if ((client.desktop == desktop) && !client.minimized) {
      f.push(client);
    }
  }

  return f;
};

WindowGroup.prototype.layout = function (desktop) {
  var clients = this.filterByDesktop(desktop);

  var screen = workspace.clientArea(workspace.WorkArea, workspace.activeScreen, desktop);

  var width  = Math.round((screen.width - (spacing.gap*(clients.length - 1)) - (2*spacing.lr))/clients.length);
  var height = screen.height - (2*spacing.tb);

  for (var i = 0; i < clients.length; i++) {
    var geometry = clients[i].geometry;

    geometry.width = width;
    geometry.height = height;

    geometry.x = spacing.lr + (i*(width + spacing.gap)) + screen.x;
    geometry.y = spacing.tb + screen.y;

    clients[i].geometry = geometry;
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

var spacing = {
  gap: 4, lr: 12, tb: 12
};

var windows = new WindowGroup();

var layout = function (desktop) {

};

workspace.clientAdded.connect(function (client) {
  windows.add(client);
});

workspace.clientRestored.connect(function (client) {
  windows.layout(client.desktop);
});

workspace.clientRemoved.connect(function (client) {
  windows.remove(client);
});

workspace.clientMinimized.connect(function (client) {
  windows.layout(client.desktop);
});

registerShortcut("Toggle Floating", "Tile current desktop", "Shift+Z", function () {
  windows.layout(workspace.currentDesktop);
});
