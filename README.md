# historyTrace

A Leaflet plug-in to show a history trace

Demo sample.html

## How to use
```
    var latlngs = [
        [39.5, 110.5],
        [37.7, 109.1],
        [37.7, 110.5],
        [38.7, 110.2]
    ];
    var hisOptions = {
        durationTimes: [3000],//[3000,2000,4000]
        lineColor: "green",
        loop:false//loop
    }
    var marker = L.Marker.historyTrace(latlngs, duration).addTo(mymap);
    marker.start();
```
