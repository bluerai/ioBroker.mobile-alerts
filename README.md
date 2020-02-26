# iobroker.mobile-alerts

Einfacher Adapter, um regelmäßig Werte vom Mobile Alerts Server herunterzuladen.

Installation des Adapters:

- Verzeichnis wechseln: <code>cd /opt/iobroker</code>

- ioBroker stoppen: <code>iobroker stop</code>

- Alle Dateien in das Verzeichnis /opt/iobroker/node_modules/iobroker.mobile-alerts:
  
    <code>iobroker url "https://github.com/bluerai/ioBroker.mobile-alerts.git"</code>

- ioBroker starten: <code>iobroker start</code>

Konfiguration:

- In der WebGui von ioBroker unter "Adapter" eine Instanz von "Mobile Alerts" erzeugen.

- In der Adapterkonfiguration muss die PhoneID eingetragen werden.
  Die PhoneID kann in der Mobile-Alerts-App (für iOS bzw. Android) unter "Einstellungen" 
  gefunden werden.
  
- Nach dem Speichern der PhoneID sollten innerhalb von ca. 7 Minuten (je nach Einstellung der Zeitplanung) die
  entsprechenden Objekte erzeugt und mit den aktuellen Daten gefüllt werden 
  (siehe in der ioBroker-Gui unter Objekte >> "mobile-alerts.0").
  
  
Hinweise:

- Es können mehrere Instanzen für verschiedene PhoneIDs erzeugt werden.

- Wenn eine aktive Phone-ID spezifiziert wurde, kann in der Übersicht die Webseite "Überblick für Phone ID ..." aufgerufen
  werden. Die Werte werden dieser Seite entnommen.
  
- Wurde bisher her nur mit eingen der Sensoren für Temperatur und Luftfeuchte, sowie 
  mit einer Wetterstation getestet. Hinweise und Ergänzungen zu weiteren Sensoren sind 
  willkommen.
  
  
  Stand: 18.10.2019


