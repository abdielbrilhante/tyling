var Window = function (client) {
  this.client   = client;
  this.geometry = client.geometry;
  this.desktop  = client.desktop;
};

var spacing = {
  gap: 4, lr: 12, tb: 12
};
