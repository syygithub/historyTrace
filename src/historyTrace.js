// duration [2000]  [1000,2000]

L.Marker.HistoryTrace = L.Marker.extend({
    hisOptions: {
        durationTimes: [2000],
        lineColor: "red",
        loop: false
    },
    curLineIndex: 0, //当前线段的index
    totalLineIndex: 0, //线段的length 
    _animateId: null,
    polyline: null,
    startLatlng: null,
    endLatlng: null,
    remaining: null,
    stoptime: null,
    status: 0, //0未开始 1isrunning 2已结束 3stop

    initialize: function(latlngs, hisOptions, options) {
        Object.assign(this.hisOptions, hisOptions);

        if (Array.isArray(this.hisOptions.durationTimes)) {
            if (this.hisOptions.durationTimes.length > 1 && latlngs.length - 1 == this.hisOptions.durationTimes.length) {

            } else if (this.hisOptions.durationTimes.length == 1) {
                this.hisOptions.durationTimes = new Array(latlngs.length - 1).fill(this.hisOptions.durationTimes[0]);
                console.log(this.hisOptions.durationTimes);
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
    _getStartStatus: function() {
        this._clearLine();
        this.curLineIndex = 0;
        this.remaining = 0;
        this.status = 0;
        this._calcelAnim();
        this.setLatLng(L.latLng([this.startLatlng.lat, this.startLatlng.lng]));
    },
    stop: function() {
        if (this.status == 0 || this.status == 2) {
            return
        } else {
            this._calcelAnim();
            this.stoptime = this.remaining;
        }
        this.status = 3;
        this.fire("stop");
    },
    start: function() {
        console.log(this.status);
        if (this.status == 3) {
            this.status = 1;
            this.moveToUntil = performance.now() + this.stoptime;
            this._animateId = L.Util.requestAnimFrame(this._moveTo, this);
        } else {
            this._getStartStatus();
            this.polyline = L.polyline([this.startLatlng, this.startLatlng], { color: this.hisOptions.lineColor }).addTo(this._map);
            this._getCurrLatlng(this.curLineIndex);
            this.moveToUntil = performance.now() + this.hisOptions.durationTimes[this.curLineIndex];
            this.fire('movestart');
            this.status = 1;
            this._moveTo();
        }
        return this;
    },
    _clearLine: function() {
        if (this._map.hasLayer(this.polyline)) {
            this._map.removeLayer(this.polyline);
            this.polyline = null;
        }
    },
    restart: function() {
        this._getStartStatus();
        this.start();
    },
    reset: function() {
        this._getStartStatus();
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
            if (this.curLineIndex >= this.totalLineIndex) {
                this.setLatLng(L.latLng([this.endLatlng.lat, this.endLatlng.lng]));
                this.polyline.addLatLng(L.latLng([this.endLatlng.lat, this.endLatlng.lng]));
                L.Util.cancelAnimFrame(this._animateId);
                this._animateId = null;
                this.remaining = 0;
                this.fire('moveend');
                this.status = 2;
                if (this.hisOptions.loop) {
                    this.restart();
                }
                return this;
            }
            this._getCurrLatlng(this.curLineIndex);
            this.setLatLng(L.latLng([this.fromLatlng.lat, this.fromLatlng.lng]));
            this.polyline.addLatLng(L.latLng([this.fromLatlng.lat, this.fromLatlng.lng]));
            this.moveToUntil = performance.now() + this.hisOptions.durationTimes[this.curLineIndex];
        }
        this.remaining = this.moveToUntil - performance.now();
        console.log("this.remaining" + this.remaining);
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