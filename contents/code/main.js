var Window = function (client) {
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

WindowGroup.prototype.add = function (client) {
  if (client.normalWindow) {
    this.storage[client.windowId] = new Window(client);
  }
};

WindowGroup.prototype.remove = function (client) {
  delete this.storage[client.windowId];
};

var spacing = {
  gap: 4, lr: 12, tb: 12
};

var windows = new WindowGroup();

var layout = function (desktop) {
  var clients = windows.filterByDesktop(desktop);

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

registerShortcut("Tyling", "Tile current desktop", "Shift+Z", function () {
  layout(workspace.currentDesktop);
});
