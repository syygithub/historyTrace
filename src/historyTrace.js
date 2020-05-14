// duration [2000]  [1000,2000]

L.Marker.HistoryTrace = L.Marker.extend({
    durations: [2000],
    startLatlng: undefined,
    endLatlng: undefined,
    _animateId: undefined,
    polyline: undefined,
    initialize: function(latlngs, durations, options) {
        this.durations = durations ? durations : this.durations;
        L.Marker.prototype.initialize.call(this, latlngs[0], options);
        this.startLatlng = L.latLng(latlngs[0]);
        this.endLatlng = L.latLng(latlngs[1]);
    },
    start: function() {
        console.log("start" + performance.now());
        this.moveToUntil = performance.now() + this.durations[0];
        this.fire('movestart');
        this._moveTo();
        this.polyline = L.polyline([this.startLatlng, this.endLatlng], { color: 'green' }).addTo(this._map);
        return this;
    },
    _moveTo: function() {
        if (!this._map) return;
        var remaining = this.moveToUntil - performance.now();
        // console.log("remaining___" + remaining);
        if (remaining < 0) {
            this.setLatLng(L.latLng([this.endLatlng.lat, this.endLatlng.lng]));
            this.fire('moveend');
            return this;
        }
        var persent = (this.durations[0] - remaining) / this.durations[0];
        // console.log("persent" + persent);

        var lat = this.startLatlng.lat + persent * (this.endLatlng.lat - this.startLatlng.lat);
        var lng = this.startLatlng.lng + persent * (this.endLatlng.lng - this.startLatlng.lng);

        this.setLatLng(L.latLng([lat, lng]));
        this.polyline = L.polyline(L.latLng([lat, lng]), { color: 'red' }).addTo(this._map);

        this._animateId = L.Util.requestAnimFrame(this._moveTo, this)

    }
})
L.Marker.historyTrace = function(latlngs, options) {
    return new L.Marker.HistoryTrace(latlngs, options);
};