var sock = new WebSocket(`ws://${document.location.host}/rpc`)

sock.onmessage = function(event) {
  console.log(event.data)
}

function sendRPC(method, params) {
  data = {
    "jsonrpc": "2.0",
    "method": method,
    "params": params
  }
  sock.send(JSON.stringify(data))
}

document.onkeydown = function(e) {
  switch (e.keyCode) {
    case 37:
      console.log('left');
      sendRPC('left')
      break;
    case 38:
      console.log('up');
      sendRPC('forward')
      break;
    case 39:
      console.log('right');
      sendRPC('right')
      break;
    case 40:
      console.log('down');
      sendRPC('backward')
      break;
  }
};

document.onkeyup = function(e) {
  switch (e.keyCode) {
    case 37:
      console.log('stop');
      sendRPC('stop')
      break;
    case 38:
      console.log('stop');
      sendRPC('stop')
      break;
    case 39:
      console.log('stop');
      sendRPC('stop')
      break;
    case 40:
      console.log('stop');
      sendRPC('stop')
      break;
  }
};
