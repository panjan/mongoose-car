load('api_config.js');
load('api_events.js');
load('api_gpio.js');
load('api_mqtt.js');
load('api_net.js');
load('api_sys.js');
load('api_timer.js');
load('api_rpc.js');
load('api_pwm.js');

let led = Cfg.get('pins.led');
let button = Cfg.get('pins.button');
let topic = '/devices/' + Cfg.get('device.id') + '/events';

print('LED GPIO:', led, 'button GPIO:', button);

let getInfo = function() {
  return JSON.stringify({
    total_ram: Sys.total_ram(),
    free_ram: Sys.free_ram()
  });
};

let right_wheel_forward = 15; // 0 -> spin
let right_wheel_backward = 13;
let left_wheel_backward = 14;
let left_wheel_forward = 12;
let left_wheel_speed = 4;
let right_wheel_speed = 5;
let pwm_frequency = 1000; // Hz

GPIO.set_mode(right_wheel_forward, GPIO.MODE_OUTPUT);
GPIO.set_mode(left_wheel_backward, GPIO.MODE_OUTPUT);
GPIO.set_mode(right_wheel_backward, GPIO.MODE_OUTPUT);
GPIO.set_mode(left_wheel_forward, GPIO.MODE_OUTPUT);
GPIO.set_mode(left_wheel_speed, GPIO.MODE_OUTPUT);
GPIO.write(left_wheel_speed, 1);
GPIO.set_mode(right_wheel_speed, GPIO.MODE_OUTPUT);
GPIO.write(right_wheel_speed, 1);

RPC.addHandler('speed', function(args) {
  PWM.set(right_wheel_speed, pwm_frequency, args.duty);
  PWM.set(left_wheel_speed, pwm_frequency, args.duty);
});

RPC.addHandler('forward', function(args) {
  GPIO.write(right_wheel_forward, 0);
  GPIO.write(left_wheel_forward, 0);
  GPIO.write(right_wheel_backward, 1);
  GPIO.write(left_wheel_backward, 1);
});

RPC.addHandler('stop', function(args) {
  GPIO.write(right_wheel_forward, 1);
  GPIO.write(left_wheel_forward, 1);
  GPIO.write(right_wheel_backward, 1);
  GPIO.write(left_wheel_backward, 1);
});

RPC.addHandler('backward', function(args) {
  GPIO.write(right_wheel_forward, 1);
  GPIO.write(left_wheel_forward, 1);
  GPIO.write(right_wheel_backward, 0);
  GPIO.write(left_wheel_backward, 0);
});

RPC.addHandler('left', function(args) {
  GPIO.write(right_wheel_forward, 0);
  GPIO.write(left_wheel_forward, 1);
  GPIO.write(right_wheel_backward, 1);
  GPIO.write(left_wheel_backward, 0);
});

RPC.addHandler('right', function(args) {
  GPIO.write(right_wheel_forward, 1);
  GPIO.write(left_wheel_forward, 0);
  GPIO.write(right_wheel_backward, 0);
  GPIO.write(left_wheel_backward, 1);
});

GPIO.set_mode(led, GPIO.MODE_OUTPUT);
Timer.set(1000 /* 1 sec */, Timer.REPEAT, function() {
  let value = GPIO.toggle(led);
  print(value ? 'Tick' : 'Tock', 'uptime:', Sys.uptime(), getInfo());
}, null);

// Monitor network connectivity.
Event.addGroupHandler(Net.EVENT_GRP, function(ev, evdata, arg) {
  let evs = '???';
  if (ev === Net.STATUS_DISCONNECTED) {
    evs = 'DISCONNECTED';
  } else if (ev === Net.STATUS_CONNECTING) {
    evs = 'CONNECTING';
  } else if (ev === Net.STATUS_CONNECTED) {
    evs = 'CONNECTED';
  } else if (ev === Net.STATUS_GOT_IP) {
    evs = 'GOT_IP';
  }
  print('== Net event:', ev, evs);
}, null);
