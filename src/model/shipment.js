export class Shipment {

    constructor(userName, trackingId, platform, status) {
        this.userName = userName;
        this.trackingId = trackingId;
        this.platform = platform;
        this.status = status;
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

    setEmailMessage(emailMesssage){
        this.emailMessage = emailMesssage;
    }

    getEmailMessage(){
        return this.emailMessage;
    }

    setEmailSubject(emailSubject){
        this.emailSubject = emailSubject;
    }

    getEmailSubject(){
        return this.emailSubject;
    }

}

export const PlatformTypes = {
    WELIVERY: 'WELIVERY',
    OCA: 'OCA'
};
