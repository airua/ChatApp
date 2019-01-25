import { Component, ViewChild } from '@angular/core';
import { IonicPage, Platform, NavController, NavParams, Content, ToastController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { PubnubProvider, PubNubEvent, PubNubEventType } from '../../providers/pubnub/pubnub';
import { Hotspot } from '@ionic-native/hotspot';

/* El código es exactamente el mismo que para la página común, solo que en este caso,
al antes de entrar en la página, se obtiene la MAC del router al que está conectado el
smartphone desde la página Home, y el channel de la página se establece como la MAC del
router, para que el canal de comunicación sea único. */

@IonicPage()

@Component({
    selector: 'page-local',
    templateUrl: 'local.html'
})

export class LocalPage {
    @ViewChild(Content) content: Content;
    private messageForm: any;
    private message: string;
    channel: string = "salalocal";

    messages: Array<any> = ['1', '2'];
    uuid: string;
    constructor(public navCtrl: NavController,
        private pubNubService: PubnubProvider,
        private platform: Platform,
        private builder: FormBuilder,
        private param: NavParams,
        private toast: ToastController,
        private h: Hotspot) {
      
        // Create reference to message field
        this.messageForm = this.builder.group({
            'message': ['', Validators.required]
        });
        
    }


 /* Toast para avisar al usuario */
 mensaje (texto:string)
 {
   const toast = this.toast.create({
     message: texto,
     duration: 5000,
     position: 'middle'
   });
   toast.present();
 }  

  ionViewWillEnter()/*onPageWillEnter()*/ {
              if (this.platform.is('cordova')) {
                  this.channel = this.param.get("mac");
              }
              //al id del usuario le paso el nick de la pantalla home    
              //console.log(this.param.get('id'));
              this.uuid = this.param.get("id");
              //console.log(this.uuid);
            this.pubNubService.connectionuuid(this.uuid);

            // Get history for channel
            this.pubNubService.history(this.channel).subscribe((event: PubNubEvent) => {
                let messages:Array<any> = [];
               // console.log(event);
                let dataReverse=event.value[0].reverse();
                for (let i = 0; i < dataReverse.length; i++) {
                    messages.push(this.createMessage(dataReverse[i].message));
                }
                this.messages = messages.reverse();
                this.scrollToTop();
            }, (error) => {
                //console.log(JSON.stringify(error));
            });
            // Subscribe to messages channel
            this.pubNubService.subscribe(this.channel).subscribe((event: PubNubEvent) => {
                if (event.type === PubNubEventType.MESSAGE) {
                    this.messages.push(this.createMessage(event.value));
                    this.scrollToTop();
                }
            }, (error) => {
                //console.log(JSON.stringify(error));
            }); 
    }

    createMessage(message:any):any {
        return {
            content: message && message.content ? message.content.message : message,
            date: message.date,
            user:message.sender_uuid.split("-")[0],
            sender: message.sender_uuid.split("-")[1]==this.uuid.split("-")[1] ? 'sender' : 'reciever'
        };
    }

    sendMessage(messageContent: string) {
        if (this.platform.is('cordova')) {
            this.h.isConnectedToInternetViaWifi().then((bo: Boolean) => {
                if (!bo) {
                    this.mensaje("No hay conexión a internet por WIFI.");
                    this.navCtrl.popToRoot();
                } else {
                    // Don't send an empty message 
                    if (messageContent && messageContent !== '') {
                        this.pubNubService.publish(this.channel, {
                            content: messageContent,
                            sender_uuid:this.uuid,
                            date: new Date()
                        }).subscribe((event: PubNubEvent) => {
                            //console.log('Published', event.value);
                            // Reset the messageContent input
                            (this.messageForm.controls['message']).updateValueAndValidity();
                            //console.log(this.messages);
                            //console.log(this.message);
                            this.scrollToTop();
                            this.message = '';
                        }, (error) => {
                            // Handle error here
                          //  console.log('Publish error', JSON.stringify(error));
                        }
                        );
                    }
                }
            });
        } else {
           // console.log("Comprobación.");
        }

    }

    scrollToTop() {
        var t=this.content;
        setTimeout(function(){
      t.scrollToBottom();
    }, 100);
  }  

  loadingMore = false;
  previousScrollPosition = 0;
  onScroll = (e) => {
    let page = e.target.clientHeight;
    let scrolled = e.target.scrollTop;
    let direction = this.previousScrollPosition > scrolled ? 'top' : 'bottom';
    this.previousScrollPosition = scrolled;
    if(scrolled < page * 0.10) { //trigger infinite when we are at 10% from top
      if(!this.loadingMore && direction == 'top') {
        this.loadingMore = true;
          setTimeout( ()=> {
            this.loadingMore = false;
          }, 100);
      }
    }
  }

}