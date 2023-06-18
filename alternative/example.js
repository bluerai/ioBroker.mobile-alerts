// Übernahme von MobileAlerts-Sensordaten nach ioBroker 
// über die MobileAlerts-API

// Das Script erzeugt die benötigten ioBroker-Datenpunkte und füllt sie mit den Werten,
// die der MobileAlerts-Server über die API zur Verfügung stellt.

// Die Sensordaten werden direkt ausgewertet, eine PhoneId wird nicht benötigt.

// Hinweis: 
// In "Hosts --> Host-Basiseinstellungen --> System" muss "Shell-Befehle zulassen" aktiviert sein!

const mobileAlertsPath = "javascript.0.mobileAlertsTest.";  //Datenpunkte werden in diesem Pfad erzeugt.
const apiURL = "https://www.data199.com/api/pv1/device/lastmeasurement";

//Die folgenden Konstanten enthalten, welche Datenpunkte für einen bestimmten Sensortyp angelegt werden.
//Anzugeben sind für den Datenpunkt name, type und unit.

//measurementXX: Die Nummern XX beziehen sich auf die API-Doku.

//TODO: Es gibt in der API-Doku weitere Measurements, die hier noch nicht definiert sind

const measurement02 =  new Map([
    ["t1", {name: "Temperatur", type: "number", unit: "°C"}], 
    ["ts", {name: "Timestamp", type: "number", unit: "sec"}],
    ["lb", {name: "Low Battery", type: "boolean", unit: ""}]]);

const measurement04 = new Map([ 
    ["t1", {name: "Temperatur", type: "number", unit: "°C"}], 
    ["t2", {name: "Wassersensor", type: "number", unit: ""}], 
    ["h",  {name: "Feuchtigkeit", type: "number", unit: "%"}], 
    ["ts", {name: "Timestamp", type: "number", unit: "sec"}],
    ["lb", {name: "Low Battery", type: "boolean", unit: ""}]]);

const measurement07 = new Map([ 
    ["t1", {name: "Temperatur, innen", type: "number", unit: "°C"}], 
    ["t2", {name: "Temperatur, außen", type: "number", unit: "°C"}], 
    ["h",  {name: "Luftfeuchte, innen", type: "number", unit: "%"}], 
    ["h2", {name: "Luftfeuchte, außen", type: "number", unit: "%"}], 
    ["ts", {name: "Timestamp", type: "number", unit: "sec"}],
    ["lb", {name: "Low Battery", type: "boolean", unit: ""}]]);

// Hier werden für jede Geräte-Id der Name und das zu benutzende Measurement festgelegt.
// Die IDs hier sind Test-IDs von MobileAlerts
let propertyArray = [

{ id: "0706D3E17D33",	name: "Wetterstation Wohnzimmer", data: measurement07},

{ id: "04419803C1B0",	name: "Badezimmer", data: measurement04},

{ id: "1200099803A1",	name: "Sample Sensor Humidity Guard", data: measurement02},

{ id: "0301548CBC4A",	name: "Sample Sensor Berlin" , data: measurement02},

{ id: "090005AC99E2",	name: "Sample Sensor Hannover" , data: measurement02} ];


//================================ Ab hier nur ändern, wenn man weiß was man tut! ================================

let deviceidString = "";
var propertiesById = new Map();
propertyArray.forEach (function(item, key, arr) {
    propertiesById.set(item.id, item);
    deviceidString += item.id + ",";
})

deviceidString = deviceidString.substring(0, deviceidString.length - 1);  // Komma entfernen

let curlCmd = 'curl -d "deviceids=' + deviceidString + '" --http1.1 ' + apiURL;


propertyArray.forEach (function(item, key) {
    if (!existsObject(mobileAlertsPath + "Devices" + "." + item.id)) {
        item.data.forEach (function(subitem, key) {
            createState(mobileAlertsPath + "Devices" + "." + item.id + "." + key, undefined, { "name": name, "type": subitem.type, "unit": subitem.unit, "read": true, "write": true, "role": "data" });
        });
        extendObject(mobileAlertsPath + "Devices" + "." + item.id, {common: {name: item.name}});
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

exec(curlCmd, function (error, stdout, stderr) {
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

            let props = propertiesById.get(item.deviceid);

            for (var [key, subitem] of props.data) {

                setState(mobileAlertsPath + "Devices" + "." + item.deviceid + "." + key, item["measurement"][key]);

            };
        });

    } else {
        log('Mobile Alerts: (2) Received object contains error "' +  obj.errorcode + '": ' + obj.errormessage + '(#' + execCounter + ", " + execDuration + ' sec).', 'error');
    }

    receivingData = false;
});
}

getData();

schedule('*/7 * * * *', function() {setTimeout(getData, 4.5 * 60000)});




