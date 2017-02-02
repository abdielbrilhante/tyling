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
