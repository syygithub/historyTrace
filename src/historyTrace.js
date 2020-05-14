// duration [2000]  [1000,2000]

L.Marker.HistoryTrace = L.Marker.extend({
    hisOptions: {
        durationTimes: [2000],
        lineColor: "red"
    },
    curDurationTime: 2000,
    curLineIndex: 0, //当前线段的index
    totalLineIndex: 0, //线段的length 
    _animateId: null,
    polyline: null,
    startLatlng: null,
    endLatlng: null,
    remaining: null,
    status: {
        start: 0
    },

    initialize: function(latlngs, hisOptions, options) {
        Object.assign(this.hisOptions, hisOptions);

        if (Array.isArray(this.hisOptions.durationTimes)) {
            if (this.hisOptions.durationTimes.length > 1 && latlngs.length - 1 == this.hisOptions.durationTimes.length) {
                this.curDurationTime = this.hisOptions.durationTimes;
            } else {
                throw new Error('durationTimes参数的length应为1或者是坐标点个数-1')
            }
        } else {
            throw new Error('durationTimes参数输入格式不正确，应为[number,number]')
        }
        L.Marker.prototype.initialize.call(this, latlngs[0], options);

        this.startLatlng = L.latLng(latlngs[0]);
        this.endLatlng = L.latLng(latlngs[latlngs.length - 1]);
        this.fromLatlng = L.latLng(latlngs[0]);
        this.toLatlng = L.latLng(latlngs[1]);
        this.curLineIndex = 0;
        this.totalLineIndex = latlngs.length - 1;
    },
    _getCurrLatlng: function(index) {
        this.fromLatlng = L.latLng(latlngs[index]);
        this.toLatlng = L.latLng(latlngs[index + 1]);
    },
    start: function() {
        console.log("start" + performance.now());
        this.fire('movestart');
        this.polyline = L.polyline([this.startLatlng, this.startLatlng], { color: this.hisOptions.lineColor }).addTo(this._map);
        this._getCurrLatlng(this.curLineIndex);
        this.moveToUntil = performance.now() + this.hisOptions.durationTimes[this.curLineIndex];
        this._moveTo();
        return this;
    },
    _clearLine: function() {
        if (this._map.hasLayer(this.polyline)) {
            this._map.removeLayer(this.polyline);
            this.polyline = null;
        }
    },
    reset: function() {
        this.curLineIndex = 0;
        this._clearLine();
        this._getCurrLatlng(this.curLineIndex);
        this.start();
    },
    _calcelAnim: function() {
        if (this._animateId) {
            L.Util.cancelAnimFrame(this._animateId);
            this._animateId = null;
        }
    },
    _moveTo: function() {
        if (!this._map) return;
        if (this.remaining < 0) {
            this.curLineIndex++;
            if (this.curLineIndex == this.totalLineIndex) {
                console.log('end');
                console.log(L.latLng([this.endLatlng.lat, this.endLatlng.lng]));
                this.setLatLng(L.latLng([this.endLatlng.lat, this.endLatlng.lng]));
                this.polyline.addLatLng(L.latLng([this.endLatlng.lat, this.endLatlng.lng]));
                L.Util.cancelAnimFrame(this._animateId);
                this._animateId = null;
                this.fire('moveend');
                return this;
            }
            this._getCurrLatlng(this.curLineIndex);
            this.setLatLng(L.latLng([this.fromLatlng.lat, this.fromLatlng.lng]));
            this.polyline.addLatLng(L.latLng([this.fromLatlng.lat, this.fromLatlng.lng]));
            this.moveToUntil = performance.now() + this.hisOptions.durationTimes[this.curLineIndex];
        }
        this.remaining = this.moveToUntil - performance.now();
        var persent = (this.hisOptions.durationTimes[this.curLineIndex] - this.remaining) / this.hisOptions.durationTimes[this.curLineIndex];
        // 会出现persent>1的情况
        if (persent < 1) {
            var lat = this.fromLatlng.lat + persent * (this.toLatlng.lat - this.fromLatlng.lat);
            var lng = this.fromLatlng.lng + persent * (this.toLatlng.lng - this.fromLatlng.lng);
            this.setLatLng(L.latLng([lat, lng]));
            this.polyline.addLatLng(L.latLng([lat, lng]));

        }
        this._animateId = L.Util.requestAnimFrame(this._moveTo, this);
    }
})
L.Marker.historyTrace = function(latlngs, hisOptions, options) {
    return new L.Marker.HistoryTrace(latlngs, hisOptions, options);
};