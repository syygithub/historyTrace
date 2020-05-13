# historyTrace

A Leaflet plug-in to show a history trace

```
    var latlngs = [
        [39.5, 110.5],
        [37.7, 109.1]
    ];
    var duration = [3000];
    var marker = L.Marker.historyTrace(latlngs, duration).addTo(mymap);
    marker.start();
```
