var Window = function (client, column) {
  this.client   = client;
  this.geometry = client.geometry;
  this.desktop  = client.desktop;
};

var spacing = {
  gap: 4, lr: 12, tb: 12
};

var WindowGroup = function () {
  this.storage = {};

  var allClients = workspace.clientList();

  for (var i = 0; i < allClients.length; i++) {
    this.add(allClients[i]);
  }
};

WindowGroup.prototype.window = function (id) {
  return this.storage[id];
};

WindowGroup.prototype.filterByDesktop = function (desktop) {
  var keys = Object.keys(this.storage);
  var f = [];

  for (var i = 0; i < keys.length; i++) {
    var client = this.storage[keys[i]].client;

    if (client.desktop == desktop) {
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

WindowGroup.prototype.add = function (client) {
  if (client.normalWindow && !(client.windowId in this.storage)) {
    this.storage[client.windowId] = new Window(client);
    this.layout(client.desktop);
  }
};

WindowGroup.prototype.remove = function (client) {
  if (client.windowId in this.storage) {
    delete this.storage[client.windowId];
    this.layout(client.desktop);
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
  windows.add(client);
});

workspace.clientRemoved.connect(function (client) {
  windows.remove(client);
});

workspace.clientMinimized.connect(function (client) {
  windows.remove(client);
});

registerShortcut("Toggle Floating", "Tile current desktop", "Shift+Z", function () {
  windows.layout(workspace.currentDesktop);
});
