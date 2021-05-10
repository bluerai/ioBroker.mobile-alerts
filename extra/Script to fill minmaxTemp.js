/****************** MinMaxTemperatur ********************/

/*** Configuration

source = Datapoint for temperature to be tracked
idChannel = object to be filled

<n> = instance number (0, 1, ...) 
<xxxxxxxxxxxx> = Mobile Alerts device Id
<name> = device name
***/

const source = "mobile-alerts.<n>.<xxxxxxxxxxxx>.<name>"/*Temperatur*/;
const idChannel = "mobile-alerts.<n>.minmaxTemperatur.";

/****************** MinMaxTemperatur ********************/

on({ id : source, change: "ne" }, function(data) {
    var newTemp = data.state.val;
    if (!newTemp || isNaN(newTemp)) { return;}

    var maxHeute = getState(idChannel + "maxTemp_heute").val;
    var minHeute = getState(idChannel + "minTemp_heute").val;
            
    if (maxHeute < newTemp) {
        maxHeute = newTemp; setState(idChannel + "maxTemp_heute", newTemp);
        log("Neues Tagesmaximum: " + newTemp + " °C", "info");
    } else if (minHeute > newTemp) {
        minHeute = newTemp; setState(idChannel + "minTemp_heute", newTemp);
        log("Neues Tagesminimum; " + newTemp + " °C", "info");
    }

    // Woche
    var maxWoche = getState(idChannel + "maxTemp_Woche").val;
    var minWoche = getState(idChannel + "minTemp_Woche").val;

    if (maxWoche < newTemp) {
        maxWoche = newTemp; setState(idChannel + "maxTemp_Woche", newTemp);
        log("Neues Wochenmaximum: " + newTemp + " °C", "info");
    } else if (minWoche > newTemp) {
        minWoche = newTemp; setState(idChannel + "minTemp_Woche", newTemp);
        log("Neues Wochenminimum: " + newTemp + " °C", "info");
    }

    //Monat
    var maxMonat = getState(idChannel + "maxTemp_Monat").val;
    var minMonat = getState(idChannel + "minTemp_Monat").val;

    if (maxMonat < newTemp) {
        maxMonat = newTemp; setState(idChannel + "maxTemp_Monat", newTemp);
        log("Neues Monatsmaximum: " + newTemp + " °C", "info");
    } else if (minMonat > newTemp) {
        minMonat = newTemp; setState(idChannel + "minTemp_Monat", newTemp);
        log("Neues Monatsminimum: " + newTemp + " °C", "info");
    }
});


// 00:00:00 Uhr an jedem Tag
schedule("0 0 0 * * *", function() {
    log("max/minTemp_heute zuruecksetzen", "info");
    var tempJetzt = getState(source).val; 
    if (!tempJetzt || isNaN(tempJetzt)) { return;}

    log("Temperatur: " + tempJetzt + " °C", "info");

    setState(idChannel + "maxTemp_vorgestern", getState(idChannel + "maxTemp_gestern").val);
    setState(idChannel + "minTemp_vorgestern", getState(idChannel + "minTemp_gestern").val);

    setState(idChannel + "maxTemp_gestern", getState(idChannel + "maxTemp_heute").val);
    setState(idChannel + "minTemp_gestern", getState(idChannel + "minTemp_heute").val);

    setState(idChannel + "maxTemp_heute", tempJetzt);
    setState(idChannel + "minTemp_heute", tempJetzt);

});

// 00:00:10 Uhr an jedem Montag
schedule("10 0 0 * * 1", function() {
    log("max/minTemp_Woche zuruecksetzen", "info");
    var tempJetzt = getState(source).val;
    if (!tempJetzt || isNaN(tempJetzt)) { return;}

    log("Temperatur: " + tempJetzt + " °C", "info");
    
    setState(idChannel + "maxTemp_Vorwoche", getState(idChannel + "maxTemp_Woche").val);
    setState(idChannel + "minTemp_Vorwoche", getState(idChannel + "minTemp_Woche").val);

    setState(idChannel + "maxTemp_Woche", tempJetzt);
    setState(idChannel + "minTemp_Woche", tempJetzt);

});

// 00:00:05 Uhr am 1. jeden Monats'10 0 0 1 * *'
schedule("5 1 0 1 * *", function() {
    log("max/minTemp_Monat zuruecksetzen", "info");
    var tempJetzt = getState(source).val; 
    if (!tempJetzt || isNaN(tempJetzt)) { return;}

    log("Temperatur: " + tempJetzt + " °C", "info");
    
    setState(idChannel + "maxTemp_Vormonat", getState(idChannel + "maxTemp_Monat").val);
    setState(idChannel + "minTemp_Vormonat", getState(idChannel + "minTemp_Monat").val);

    setState(idChannel + "maxTemp_Monat", tempJetzt);
    setState(idChannel + "minTemp_Monat", tempJetzt);
});




