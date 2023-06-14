const mobileAlertsPath = "javascript.0.mobileAlerts.";
const apiURL = "https://www.data199.com/api/pv1/device/lastmeasurement";

const measurement02 =  new Map([["lb", {name: "lowbattery", type: "boolean", unit: ""}], 
    ["t1", {name: "Temperatur", type: "number", unit: "°C"}], 
    ["ts", {name: "Timestamp", type: "number", unit: "sec"}],
    ["lb", {name: "Low Battery", type: "boolean", unit: ""}]]);

const measurement04 = new Map([["lb", {name: "lowbattery", type: "boolean", unit: ""}], 
    ["t1", {name: "Temperatur", type: "number", unit: "°C"}], 
    ["t2", {name: "Wassersensor", type: "number", unit: ""}], 
    ["h",  {name: "Feuchtigkeit", type: "number", unit: "%"}], 
    ["ts", {name: "Timestamp", type: "number", unit: "sec"}],
    ["lb", {name: "Low Battery", type: "boolean", unit: ""}]]);

const measurement07 = new Map([["lb", {name: "lowbattery", type: "boolean", unit: ""}], 
    ["t1", {name: "Temperatur, innen", type: "number", unit: "°C"}], 
    ["t2", {name: "Temperatur, außen", type: "number", unit: "°C"}], 
    ["h",  {name: "Luftfeuchte, innen", type: "number", unit: "%"}], 
    ["h2", {name: "Luftfeuchte, außen", type: "number", unit: "%"}], 
    ["ts", {name: "Timestamp", type: "number", unit: "sec"}],
    ["lb", {name: "Low Battery", type: "boolean", unit: ""}]]);

let propertyArray = [
{ id: "xxxxxxxxxxxx",	name: "Wetterstation", data: measurement07, 
    targets: new Map([
        ["t1", 'hm-rega.0.xxxxx'/*MA Wetterstation, Innentemperatur*/],
        ["t2", 'hm-rega.0.xxxxx'/*MA Wetterstation, Außentemperatur*/],
        ["h", 'hm-rega.0.xxxxx'/*MA Wetterstation, Innenfeuchte*/],
        ["h2", 'hm-rega.0.xxxxx'/*MA Wetterstation, Außenfeuchte*/]]) },

{ id: "xxxxxxxxxxxx",	name: "Keller", data: measurement04,
    targets: new Map([
        ["t1", 'hm-rega.0.xxxxx'/*MA Keller, Temperatur*/ ],
        ["h", 'hm-rega.0.xxxxx'/*MA Keller, Feuchte*/ ],
        ["t2", 'hm-rega.0.xxxxx'/*MA Keller-Wassersensor*/]]) },

{ id: "xxxxxxxxxxxx",	name: "Zusatzthermometer 1" , data: measurement02,
    targets: new Map([ ["t1", 'hm-rega.0.15921'/*MA Zusatzthermometer 1*/]]) },

{ id: "xxxxxxxxxxxx",	name: "Zusatzthermometer 2" , data: measurement02,
    targets: new Map([ ["t1", 'hm-rega.0.50091'/*MA Zusatzthermometer 2*/]]) } ];

let deviceidString = "";
var propertiesById = new Map();
propertyArray.forEach (function(item, key, arr) {
    propertiesById.set(item.id, item);
    deviceidString += item.id + ",";
})

deviceidString = deviceidString.substring(0, deviceidString.length - 1);  // Komma entfernen

let curlCmd = 'curl -d "deviceids=' + deviceidString + '" --http1.1 ' + apiURL;


function createDataPoint(id, value, name, dptype, unit, role) {
    if (!existsObject(id)) {
        createState(id, value, { "name": name, "type": dptype, "unit": unit, "read": true, "write": true, "role": role });
    }
}

propertyArray.forEach (function(item, key) {

    createDataPoint( mobileAlertsPath + "Devices" + "." + item.id, "", item.name, "object", "", "device");

    item.data.forEach (function(subitem, key) {

        createDataPoint(mobileAlertsPath + "Devices" + "." + item.id + "." + key, undefined, subitem.name, subitem.type, subitem.unit, "data");

    });
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
            let targets = props.targets;

            for (var [key, subitem] of props.data) {

                setState(mobileAlertsPath + "Devices" + "." + item.deviceid + "." + key, item["measurement"][key]);

                if (targets.get(key) !== undefined) {
                    
                    let val;
                    val = parseFloat(item["measurement"][key]);
                    let target = targets.get(key) ;
                    if (target == 'hm-rega.0.xxxx') {
                        val = (val == 0);
                    }
                    
                    setState(targets.get(key), val);
                } 
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
