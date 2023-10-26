# Bestove WiNET Wifi requests description

## Change temperature

### URL & method

```
POST http://<winet-ip>/set-registers
```

### Needed headers

```
Content-Type: application/x-www-form-urlencoded; charset=UTF-8
Cookie: winet_lang=fr
Origin: http://192.168.0.13
Referer: http://192.168.0.13/management.html
X-Requested-With: XMLHttpRequest
```

### Body content

```
key=002&memory=1&regId=125&value=18
```

* **key** : Must be 002
* **memory** : Must be 1
* **regId** : 125 to set temperature
* **value** : temperature in celcius


## Change power level

### URL & method

```
POST http://<winet-ip>/set-registers
```

### Needed headers

```
Content-Type: application/x-www-form-urlencoded; charset=UTF-8
Cookie: winet_lang=fr
Origin: http://192.168.0.13
Referer: http://192.168.0.13/management.html
X-Requested-With: XMLHttpRequest
```

### Body content

```
key=002&memory=1&regId=127&value=3
```

* **key** : Must be 002
* **memory** : Must be 1
* **regId** : 127 to set power level
* **value** : level (range 1-5)

## Power on/off

### URL & method

```
POST http://<winet-ip>/get-registers
```

### Needed headers

```
Content-Type: application/x-www-form-urlencoded; charset=UTF-8
Cookie: winet_lang=fr
Origin: http://192.168.0.13
Referer: http://192.168.0.13/management.html
X-Requested-With: XMLHttpRequest
```

### Body content

```
key=022
```

* **key** : Must be 022

## Get stove infos

### URL & method

```
POST http://<winet-ip>/get-registers
```

### Needed headers

```
Content-Type: application/x-www-form-urlencoded; charset=UTF-8
Cookie: winet_lang=fr
Origin: http://192.168.0.13
Referer: http://192.168.0.13/management.html
X-Requested-With: XMLHttpRequest
```

### Body content

```
key=020&category=2
```

* **key** : Must be 020
* **category** : Must be 2

### Response

```
{
  "localWeb": true, // ???
  "bk": 8, // ???
  "authLevel": 0, // ???
  "model": 3, // ???
  "ccode": "731", // ???
  "eep": [ // writable registers state
    [1,125,18,2], // 125=temp register, 18=current temp
    [1,127,3,2] // 125=power level register, 3=current level
  ],
  "ram":[ // read-only registers states
    [0,1,35,2], // Air temperature (offset: 0, mult: 0.5, unit: '°C')
    [0,2,78,2], // Gas flue temperature (offset : 30, mult: 1, unit: '°C')
    [0,3,20,2], // Water temperature
    [0,33,4,2], // Status: 0="OFF" 1="AWAITING FLAME" 3="LIGHTING" 4="WORKING" 5="ASHPAN CLEANING" 6="FINAL CLEANING" 7="STAND-BY"  8="ALARM" 9="ALARM MEMORY"
    [0,51,0,2], // Alarm : 0=" " 1="Gas flue probe" 2="Hot gas flue" 4="Exhaust malfunction" 8="Ignition failed" 16="Pellet ended"  32="No pressure" 64="Hot security" 128="Box pellet open"
    [0,52,1,2], // Real power
    [0,55,105,2] // RPM (offset: 250, mult: 10, unit: 'rpm')
  ]
}
```

#### Status translations

| Id | EN | IT | ES | DE | FR |
|----|----|----|----|----|----|
| 0 | OFF | OFF | OFF | AUS | ARRET |
| 1 | AWAITING FLAME | ATTESA FIAMMA | ESPERANDO LLAMA | WARTEN AUF FLAMME | ALLUMAGE |
| 2 | AWAITING FLAME | ATTESA FIAMMA | ESPERANDO LLAMA | WARTEN AUF FLAMME | PRE-CHAUFFAGE |
| 3 | LIGHTING | ACCENSIONE | QUEMANDO | ANZÜNDEN | CHAUFFAGE EN COURS | 
| 4 | WORKING | LAVORO | TRABAJO | ARBEITET | STABILISATION |
| 5 | ASHPAN CLEANING | PULIZIA BRACIERE | LIMPIEZA BRAZA | REINIGUNG ASCHENKASTEN | NETTOYAGE CENDRIER |
| 6 | FINAL CLEANING | PULIZIA FINALE | LIMPIEZA FINAL | ENDREINIGUNG | NETTOYAGE FINAL |
| 7 | STAND-BY | STAND-BY | STAND-BY | STAND-BY | REFROIDISSEMENT EN COURS |
| 8 | ALARM | ALLARME | ALARMA | ALARM | ALARMES |
| 9 | ALARM MEMORY | MEMORIA ALLARME | MEMORIA DE ALARMA | ERINNERUNG ALARM | MÉMOIRE ALARME |

#### Alarms translations

| Id | EN | IT | ES | DE | FR |
|----|----|----|----|----|----|
| 0 |  |  |  |  |  |
| 1 | Gas flue probe | Guasto sonda fumi | Dampfsondenfehler | Error de la sonda de humos | Défaut sonde gaz de combustion |
| 2 | Hot gas flue | Sovratemperatura fumi | Rauchübertemperatur | Sobrecalentamiento de humo | Limite maximale température gaz de combustion atteinte |
| 4 | Exhaust malfunction | Malfunzionamento estrattore fumi | Rauchabzug Fehlfunktion | Mal funcionamiento del extractor de humo | Défaut extracteur |
| 8 | Ignition failed | Mancata accensione | Zündung fehlgeschlagen | Ignición fallida | Prechauffage insuffisant |
| 16 | Pellet ended | Pellet terminato | Pellet fertig | Pellet acabado | Combustible insuffisant |
| 32 | No pressure | Mancanza pressione | Mangel an Druck | La falta de presión | Défaut pression |
| 64 | Hot security | Sicurezza termica | Thermische Sicherheit | Seguridad térmica | Limite maximale température structure atteinte |
| 128 | Box pellet open | Vano pellet aperto | Pelletfach öffnen | Compartimento de pellets abierto | Défaut acces compartiment combustible |
