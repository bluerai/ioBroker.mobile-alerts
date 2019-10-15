# iobroker.mobile-alerts

Einfacher Adapter, um regelmäßig Werte vom Mobile Alerts Server herunterzuladen.

Installation des Adapters:

- Verzeichnis wechseln: cd /opt/iobroker

- ioBroker stoppen: iobroker stop

- Alle Dateien in das Verzeichnis /opt/iobroker/iobroker.mobile-alerts:
  
    iobroker url "https://github.com/bluerai/ioBroker.mobile-alerts.git"

- ggf. Berechtigungen, User und Group anpasssen:

    sudo chmod -R 775  /opt/iobroker/iobroker.mobile-alerts
    
    sudo chown -R iobroker.iobroker /opt/iobroker/iobroker.mobile-alerts

- ioBroker starten: sudo iobroker start

Konfiguration:

- In der WebGui von ioBroker unter "Adapter" eine Instanz von "Mobile Alerts" erzeugen.

- In der Adapterkonfiguration muss die PhoneId eingetragen werden.
  Die PhoneID kann in der Mobile-Alerts-App (für iOS bzw. Android) unter "Einstellungen" 
  gefunden werden.
  
- Nach dem Speichern der PhoneID sollten innerhalb von ca. 3 Minuten (je nach Einstellung der Zeitplanung) die
  entsprechenden Objekte erzeugt und mit den aktuellen Daten werden 
  (siehe in der ioBroker-Gui unter Objekte >> "mobile-alerts.0").
  
  
Hinweise:

- Es können mehrere Instanzen für verschiedene PhoneIDs erzeugt werden.

- Wenn eine aktive Phone-ID spezifiziert wurde, kann in der Übersicht die Webseite "Überblick für Phone ID ..." aufgerufen
  werden. Die Werte werden dieser Seite entnommen.
  
- Wurde bisher her nur mit eingen der Sensoren für Temperatur und Luftfeuchte, sowie 
  mit einer Wetterstation getestet. Hinweise und Ergänzungen zu weiteren Sensoren sind 
  willkommen.
  
  
  Stand: 15.10.2019


