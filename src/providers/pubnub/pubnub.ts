
import {Injectable, EventEmitter} from '@angular/core';
//Fuente: http://jscodeschool.blogspot.com/2017/01/integrating-pubnub-in-ionic-2.html
//En la página oficial de Pubnub también se encuentra información de cómo implantarlo.
declare var PUBNUB;
type OnMessageFn = (message, envelope, channelOrGroup, time, channel) => void;

export enum PubNubEventType {
    MESSAGE,
    CONNECT,
    DISCONNECT,
    RECONNECT,
    PUBLISHED,
    HISTORY,
    PRESENCE
}

export class PubNubEvent {
    constructor(public type: PubNubEventType, channel:string, public value: any) {}
}

@Injectable()
export class PubnubProvider {
    
    pubnub:any;
    
    /**
     * Call this method after platform becomes to be ready
     */
    // init() {
    constructor() {
        
    }
    connectionuuid(uuid){
     this.pubnub = PUBNUB({
            // Claves de pubnub
            subscribe_key: 'sub-c-4f1596da-e078-11e8-ba32-cec13d9a4fe3',
            publish_key:   'pub-c-9d59fad1-cace-4d2f-8950-8a194337b836',
            uuid:uuid,
            ssl: true
        });
    }
    
    subscribe(channel:string):EventEmitter<PubNubEvent> {
        let eventEmitter:EventEmitter<PubNubEvent> = new EventEmitter<PubNubEvent>();
        this.pubnub.subscribe({
            channel : channel,
            withPresence: true,
            presence : (message) => {
                eventEmitter.emit(new PubNubEvent(PubNubEventType.PRESENCE, channel, message));
            },
            message : (message) => {
                eventEmitter.emit(new PubNubEvent(PubNubEventType.MESSAGE, channel, message));
            },
            connect: (message) => {
                eventEmitter.emit(new PubNubEvent(PubNubEventType.CONNECT, channel, message));
            },
            disconnect: (message) => {
                eventEmitter.emit(new PubNubEvent(PubNubEventType.DISCONNECT, channel, message));
            },
            reconnect: (message) => {
                eventEmitter.emit(new PubNubEvent(PubNubEventType.RECONNECT, channel, message));
            },
            error: (error) => {
                eventEmitter.error(error);
            }, 
        });
        return eventEmitter;
    }
    
    publish(channel:string, message:any, store_in_history:boolean = true):EventEmitter<PubNubEvent> {
        let eventEmitter:EventEmitter<PubNubEvent> = new EventEmitter<PubNubEvent>();
        this.pubnub.publish({
            channel: channel, 
            // The message may be any valid JSON type including objects, arrays, strings, and numbers.       
            message: message, 
            // If true the messages are stored in history, default true.
            store_in_history: store_in_history, 
            // Executes on a successful publish.
            callback : (message) => {
                eventEmitter.emit(new PubNubEvent(PubNubEventType.PUBLISHED, channel, message));
            },
            // Executes on a publish error.
            error: (error) => {
                eventEmitter.error(error);
            }
        });
        return eventEmitter;
    }
   

    history(channel: string, count:number = 100, start:number = null, end:number = null, reverse:boolean = true, include_token: boolean = true):EventEmitter<PubNubEvent> {
        let eventEmitter:EventEmitter<PubNubEvent> = new EventEmitter<PubNubEvent>();
        this.pubnub.history({
            channel: channel,
            callback: (messages) => {
                eventEmitter.emit(new PubNubEvent(PubNubEventType.HISTORY, channel, messages));
            },
            error: (error) => {
                eventEmitter.error(error);
            },
            count: count,
            start: start,
            end: end,
            reverse: reverse,
            include_token: include_token
        });
        return eventEmitter;
    }

}
