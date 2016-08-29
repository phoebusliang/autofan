'use strict';

var lcd;

var dht;

var timer;

var receiver;

var sender;

// var confirm = [16786156, 4540, 16777736, 600, 16777736, 600, 16777736, 600, 16777756, 1700, 16777756, 580, 16777796, 520, 16777776, 580, 16777756, 600, 16777736, 1720, 16777756, 1700, 16777756, 1700, 16777756, 580, 16777756, 1720, 16777736, 1720, 16777736, 1720, 16777736, 1720, 16777756, 580, 16777756, 1700, 16777756, 1700, 16777756, 1720, 16777736, 1720, 16777736, 580, 16777756, 600, 16777736, 600, 16777856, 1600, 16777756, 580, 16777756, 580, 16777756, 600, 16777736, 600, 16777736, 1720, 16777756, 1700, 16777736, 1720, 16777756, 39780, 16786156, 2280, 16777796];
// var fanConfirm= [16778476, 540, 16778336, 560, 16777476, 1300, 16778536, 480, 16778376, 520, 16777516, 1280, 16777596, 1280, 16777616, 1280, 16777636, 1280, 16777596, 1280, 16777616, 1300, 16778476, 7160, 16778455, 480, 16778416, 520, 16777556, 1240, 16778476, 420, 16778476, 520, 16777516, 1300, 16777616, 1280, 16777616, 1280, 16777576, 1320, 16777616, 1320, 16777576, 1280, 16778476, 7140, 16778516, 800, 16778136, 580, 16777396, 1280, 16778456, 540, 16778356, 540, 16777476, 1320, 16777616, 1280, 16777636, 1280, 16777616, 1280, 16777636, 1260, 16777616, 1280, 16778336, 7319, 16778476, 420, 16778476, 460, 16777596, 1280, 16778516, 440,16778436,500,16777536,1240,16777656,1260,16777656,1280,16777676,1240,16777676,1260,16777676,1260,16778476];
var fanPower = [16778496, 400, 16778516, 380, 16777656, 1240, 16778516, 380, 16778556, 340, 16777716, 1180, 16777656, 1260, 16777636, 1260, 16777676, 1200, 16777656, 1240, 16777676, 1220, 16778536, 7100, 16778536, 360, 16778516, 380, 16777656, 1260, 16778496, 380, 16778536, 360, 16777676, 1240, 16777636, 1260, 16777636, 1260, 16777676, 2900, 16777636, 1260, 16778496, 7140, 16778516, 380, 16778596, 340, 16777596, 1260, 16778516, 360, 16778536, 380, 16777636, 1260, 16777636, 1260, 16777776, 1140, 16777656, 1240, 16777656, 1240, 16777656, 1240, 16778536, 7100, 16778536, 360, 16778496, 400, 16777676, 1240, 16778516, 380, 16778516, 380, 16777696, 1200, 16777736, 1180, 16777676, 1240, 16777696, 1240, 16777676, 1240, 16777696, 1220, 16778516];
// var fanShake = [16778516,380,16778536,380,16777676,1300,16778416,420,16778516,380,16777656,1260,16777696,1220,16778516,360,16777716,1220,16777676,1260,16777676,1240,16777696,7980,16778496,380,16778516,380,16777676,1260,16778516,380,16778496,380,16777676,1240,16777756,1320,16778376,380,16777676,1240,16777676,1260,16777676,1240,16777676,8020,16778516,360,16778516,360,16777716,1220,16778516,380,16778516,380,16777676,1260,16777656,1260,16778496,380,16777696,1220,16777696,1240,16777756,1140,16777676,8000,16778536,340,16778516,380,16777676,1220,16778516,400,16778516,360,16777716,1220,16777676,1260,16778496,380,16777676,1260,16777676,1240,16777696,1240,16777656];

var boundary = 28;

var flag = 0;

var mqtt = require('mqtt');


$.ready(function (error) {
    if (error) {
        console.log(error);
        return;
    }
    // var client = mqtt.connect('mqtt://172.20.10.3:1883', {
    //     protocolId: 'MQIsdp',
    //     protocolVersion: 3
    // });
    var client = mqtt.connect('mqtt://172.20.10.3:1883');

    client.on('connect', function () {
        client.subscribe('topic');
    });

    client.on('message', function (topic, message) {
        // message is Buffer
        // console.log(message.toString());
        boundary = message.toString();
        // client.end();
    });


    lcd = $('#lcd');
    dht = $('#dht');
    receiver = $('#receiver');
    sender = $('#sender');


    timer = setInterval(function () {
        lcd.clear();

        var temperature = dht.getTemperature(function (error, temperature) {
            if (error) {
                console.error(error);
                return;
            }
            lcd.print('Temperature:' + temperature);

            console.log('boundary', boundary);
            console.log('Current Temp', temperature);
            console.log('flag', flag);

            if (flag == 1) {
                if (temperature < parseInt(boundary)) {
                    swichPower();
                    flag = 0;
                }

            } else {
                if (temperature >= parseInt(boundary)) {
                    swichPower();
                    flag = 1;
                }

            }

            // receiver.on('data', function (data) {
            //     console.log('received data', data);
            // });
        });


        var humidity = dht.getRelativeHumidity(function (error, humidity) {
            if (error) {
                console.error(error);
                return;
            }
            lcd.setCursor(0, 1);
            lcd.print('Humidity:' + humidity);
        });

    }, 10000);

});

function swichPower() {
    sender.send(fanPower, function (error) {
        if (error) {
            console.error(error);
            return;
        }

        console.log('data sent');
    });
}

$.end(function () {
    lcd.turnOff();
    clearInterval(timer);
});