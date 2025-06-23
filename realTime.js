
class RealTime {
    constructor(count, busno, list, dirList, vehicleList) {
        this.count       = count
        this.busno       = busno
        this.list        = list
        this.dirList     = dirList
        this.vehicleList = vehicleList
    }

    getCount() {
        return this.count
    }

    getBusno() {
        return this.busno
    }

    getList() {
        return this.list
    }

    getDirList() {
        return this.dirList
    }

    getVehicleList() {
        return this.vehicleList
    }
    
}

class Vehicle {
    constructor(vehId, routeNm, busNo, fromStationId, toStationId, upDnbound, positionX, positionY) {
        this.vehId         = vehId
        this.routeNm       = routeNm
        this.busNo         = busNo
        this.fromStationId = fromStationId
        this.toStationId   = toStationId
        this.upDnbound     = upDnbound
        this.positionX     = positionX
        this.positionY     = positionY
    }
}

module.exports = {
    RealTime,
    Vehicle
}