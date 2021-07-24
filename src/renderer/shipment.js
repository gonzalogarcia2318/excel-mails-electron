class Shipment {

    constructor(userName, weliveryId, status, date) {
        this.userName = userName;
        this.weliveryId = weliveryId;
        this.status = status;
        this.date = date;
    }


    compareByName(name) {
        const userNameSplitted = this.removeEmptySpaces(this.userName).toLowerCase().split(' ');
        const nameSplitted = this.removeEmptySpaces(name).toLowerCase().split(' ');
        //
        return userNameSplitted.length === nameSplitted.length
            && userNameSplitted.every(part => nameSplitted.includes(part));
    }

    removeEmptySpaces(string) {
        // Trim removes spaces at the begining and end, and then replace multiple spaces in between by just one 
        return string.trim().replace(/\s+/g, " ");
    }

}