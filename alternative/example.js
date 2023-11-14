// Übernahme von MobileAlerts-Sensordaten nach ioBroker 
// über die MobileAlerts-API

// Das Script erzeugt die benötigten ioBroker-Datenpunkte und füllt sie mit den Werten,
// die der MobileAlerts-Server über die API zur Verfügung stellt.

// Die Sensordaten werden direkt über die SensorId ausgewertet, eine PhoneId wird nicht benötigt.

// Hinweise:
// -  Das Abrufen der Daten erfolgt standardmäßig mit "/usr/bin/curl" (siehe https://curl.se ).
//    Falls ein anderes Programm benutzt wird, muss die Variable urlClientCmd angepasst werden.
// -  In "Hosts --> Host-Basiseinstellungen --> System" muss "Shell-Befehle zulassen" aktiviert sein!

const mobileAlertsPath = "0_userdata.0.mobileAlertsTest.";  //Datenpunkte werden in diesem Pfad erzeugt.
const apiURL = "https://www.data199.com/api/pv1/device/lastmeasurement";

//Die folgenden Konstanten enthalten, welche Datenpunkte für einen bestimmten Sensortyp angelegt werden.
//Anzugeben sind für den Datenpunkt name, type und unit.

//measurementXX: Die Nummern XX beziehen sich auf die API-Doku.

//TODO: Es gibt in der API-Doku weitere Measurements, die hier noch nicht definiert sind

const measurement02 =  new Map([  //Thermometer
    ["t1", {name: "Temperatur", type: "number", unit: "°C"}]]);

const measurement03 = new Map([   //Thermo- und Hygrometer
	["t1", {name: "Temperatur", type: "number", unit: "°C"}],
	["h",  {name: "Luftfeuchte", type: "number", unit: "%"}]]);

const measurement04 = new Map([    //Thermometer mit Wassersensor
    ["t1", {name: "Temperatur", type: "number", unit: "°C"}], 
    ["t2", {name: "Wassersensor", type: "number", unit: ""}], 
    ["h",  {name: "Luftfeuchte", type: "number", unit: "%"}], 
    ["ts", {name: "Timestamp", type: "number", unit: "sec"}]]);

const measurement08 = new Map([ //Regensensor
    ["t1", {name: "Temperatur", type: "number", unit: "°C"}],
    ["r",  {name: "Regenmenge", type: "number", unit: "mm"}]]);

const measurement07 = new Map([     //Wetterstation
    ["t1", {name: "Temperatur, innen", type: "number", unit: "°C"}], 
    ["t2", {name: "Temperatur, außen", type: "number", unit: "°C"}], 
    ["h",  {name: "Luftfeuchte, innen", type: "number", unit: "%"}], 
    ["h2", {name: "Luftfeuchte, außen", type: "number", unit: "%"}]]);

const measurement10 =  new Map([    //Kontaktsensor
    ["w", {name: "Kontakt", type: "boolean", unit: ""}]]);

const measurement0B = new Map([  //Windsensor
    ["ws", {name: "Windgeschwindigkeit", type: "string", unit: "m/s"}],
    ["wg", {name: "Böe", type: "string", unit: "m/s"}],
    ["wd", {name: "Windrichtung", type: "number", unit: ""}]]);


// Hier werden für jede Geräte-Id der Name und das zu benutzende Measurement festgelegt.
// Die IDs hier sind Test-SensorIDs von MobileAlerts
let propertyArray = [
    { id: "1200099803A1",	name: "Sample Sensor Humidity Guard", data: measurement02},

    { id: "090005AC99E2",	name: "Sample Sensor Hannover" , data: measurement02},

    { id: "0301548CBC4A",	name: "Sample Sensor Berlin" , data: measurement02},

    { id: "034A9045C882",	name: "Sample Sensor Hannover" , data: measurement03},

    { id: "04419803C1B0",	name: "Sample Water Detection Sensor", data: measurement04},

    { id: "0706D3E17D33",	name: "Sample Wetterstation", data: measurement07},

    { id: "0816B9D3591E",	name: "Sample Rain Sensor", data: measurement08},

    { id: "0B0075E315BB",	name: "Sample Wind Sensor" , data: measurement0B}, 

    { id: "10246A3EB617",	name: "Sample Contact Sensor" , data: measurement10}
];


//================================ Ab hier nur ändern, wenn man weiß was man tut! ================================

let deviceidString = "";
var propertiesById = new Map();
propertyArray.forEach (function(item, key, arr) {
    propertiesById.set(item.id, item);
    deviceidString += ((deviceidString !== "") ? "," : "") + item.id;
})

let urlClientCmd = '/usr/bin/curl -d "deviceids=' + deviceidString + '" --http1.1 ' + apiURL;
// Falls "wget" eingesetzt werden soll:
// let urlClientCmd = '/usr/bin/wget -O "-" --post-data "deviceids=' + deviceidString + '" ' + apiURL;

log("urlClientCommand: " + urlClientCmd, "debug");

propertyArray.forEach (function(item, key) {
    let itemIdPath = mobileAlertsPath + "Devices" + "." + item.id;
    
    if (!existsObject(itemIdPath)) {
        createState(itemIdPath, undefined, { "name": item.name, "type": "object", "read": true, "write": true});

        //generelle Werte
        createState(itemIdPath + ".lb", undefined, { "name": "Low Battery", "type": "boolean", "unit": "", "read": true, "write": true, "role": "data" });
        createState(itemIdPath + ".ts", undefined, { "name": "Timestamp", "type": "number", "unit": "sec", "read": true, "write": true, "role": "data" });

        //sensorspezifische Werte
        item.data.forEach (function(subitem, key) {
            createState(itemIdPath + "." + key, undefined, { "name": subitem.name, "type": subitem.type, "unit": subitem.unit, "read": true, "write": true, "role": "data" });
        });
    }
});

let receivingData = false;
let execCounter = 0;
let execDuration = 0;
let maxExecDuration = 0;

function getData() {

if (receivingData) return;
receivingData = true;

execDuration = new Date().getTime();

exec(urlClientCmd, function (error, stdout, stderr) {
    execCounter = ++execCounter % 1000;
    execDuration = Math.round((new Date().getTime() - execDuration) / 100) / 10;  //Startwert setzen
    maxExecDuration = Math.max(maxExecDuration, execDuration);

    if (error !== null) {
        log('Mobile Alerts: (1) Receiving Data ended with errorcode ' +  error.code + '(#' + execCounter + ", " + execDuration + " sec).", "error");
        receivingData = false;
        return;
    }

    let obj = JSON.parse(stdout);

    if ( obj.success == true) {

        if (execCounter <= 10 || execCounter % 10 == 0) {
            log('Mobile Alerts: Data successfully received (#' + execCounter + ", max. " + maxExecDuration + " sec).", "info");
            maxExecDuration = 0;
        }

        obj.devices.forEach (function(item) {
            log(JSON.stringify(item), "debug");
            let deviceIdPath = mobileAlertsPath + "Devices" + "." + item.deviceid;
            
            setState(deviceIdPath, {val: item, ack: true});

            //generelle Werte
            setState(deviceIdPath + ".lb", {val: item.lowbattery, ack: true});
            setState(deviceIdPath + ".ts", {val: item["measurement"].ts, ack: true});

            //sensorspezifische Werte
            let props = propertiesById.get(item.deviceid);
            for (var [key, subitem] of props.data) {
                let val = item["measurement"][key];
                if (val == 65295 || val == 43530) {
                    /* If a sensor was not connected the value 43530 is returned.
                       If the measurement of a sensor was out of range the value 65295 is returned.*/
                    setState(deviceIdPath + "." + key, null);
                } else {
                    setState(deviceIdPath + "." + key, {val: val, ack: true});
                }
            };
        });

    } else {  
        log('Mobile Alerts: (2) Messsage in received object: "' +  obj.Message + '" (#' + execCounter + ", " + execDuration + ' sec).', 'warn');
    }

    receivingData = false;
});
}

getData();

schedule('42 */7 * * * *', getData);




