# iobroker.mobile-alerts

Einfacher Adapter, um regelmäßig Werte vom Mobile Alerts Server herunterzuladen.


Manuelle Installation

- Kopiere alle Dateien in das Verzeichnis /opt/iobroker/iobroker.mobile-alerts.

- Berechtigungen, User und Group anpasssen:

	sudo chmod -R 775  /opt/iobroker/iobroker.mobile-alerts
	
	sudo chown -R iobroker.iobroker /opt/iobroker/iobroker.mobile-alerts

- ioBroker starten: sudo ioBroker start
  oder iobroker neu starten: sudo iobroker restart

- In der WebGui von ioBroker unter "Adapter" eine Instanz von "Mobile Alerts" erzeugen.

- In der Adapterkonfiguration muss die PhoneId eingetragen werden.
  Die PhoneID kann in der Mobile-Alerts-App (für iOS bzw. Android) unter "Einstellungen" 
  gefunden werden.
  
- Nach dem Speichern der PhoneID sollten innerhalb von ca. 7 Minuten die entsprechenden 
  Objekte erzeugt werden. Siehe in der ioBroker-Gui unter Objekte >> "mobile-alerts.0"
  
  
Hinweis:

- Es können mehrere Instanzen für verschiedene PhoneIDs erzeugt werden.

- Wenn eine aktive Phone-ID spezifiziert wurde, kann in der Übersicht die Webseite "Überblick für Phone ID ..." aufgerufen
  werden. Die Werte werden dieser Seite entnommen.
  
- Wurde bisher her nur mit eingen der Sensoren für Temperatur und Luftfeuchte, sowie 
  mit einer Wetterstation getestet. Hinweise und Ergänzungen zu weiteren Sensoren sind 
  willkommen.
  
  
  Stand: 15.10.2019


