import { Component , ViewChild} from '@angular/core';
import { IonicPage, Platform, NavController, NavParams ,Content, ToastController} from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { PubnubProvider, PubNubEvent, PubNubEventType } from '../../providers/pubnub/pubnub';
import { Hotspot } from '@ionic-native/hotspot';

@IonicPage()

@Component({
  selector: 'page-comun',
  templateUrl: 'comun.html'
})
export class ComunPage {
//para el ion-content que permite el scroll de la pagina:
@ViewChild(Content) content: Content;
   private  messageForm: any;
   private message:string;
    channel:string = 'salacomun';
    
    messages:Array<any> = ['1', '2'];
    uuid:string;
  constructor(public navCtrl: NavController,
    private pubNubService:PubnubProvider,
    private platform: Platform,
    private builder: FormBuilder,
    private param:NavParams,
    private hotspot:Hotspot,
    private toast:ToastController) {
 
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

  /*Al entrar recibo el uuid de usuario de la página home, que contiene el nick y 
  la MAC del dispositivo, para poder permitir al usuario cambiar de nick, sin que eso varíe
  su disposición de mensajes.
  Se conecta con pubnub con el canal establecido y se reciben los mensajes guardados en
  el historial de pubnub, que en mi caso tienen una permanencia de 1 día, se puede variar
  el tiempo de guardado del historial.
    */
  ionViewWillEnter() {
        //al id del usuario le paso el nick de la pantalla home    
        //console.log(this.param.get('id'));
       
        this.uuid=this.param.get("id");
        //console.log("uuid"+this.uuid);        
            this.pubNubService.connectionuuid(this.uuid);
           // Get history for channel
            this.pubNubService.history(this.channel).subscribe((event: PubNubEvent) => {
                let messages:Array<any> = [];
               //console.log(event);
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

    /* Permite crear mensajes con un patrón determinado: contenido, fecha(para futuras
        ampliaciones de la app), usuario y emisario. En este último caso
        se hace la diferenciación de si es emisor o receptor, para la colocación adecuada
        a través del html y css en la pantalla de los mensajes que envía/recibe. */
    createMessage(message:any):any {
        return {
            content: message && message.content ? message.content.message : message,
            date: message.date,
            user: message.sender_uuid.split("-")[0],
            sender: message.sender_uuid.split("-")[1]==this.uuid.split("-")[1] ? 'sender' : 'reciever'
        };
    }
    
    /* Envía mensajes. En el momento que se dispara este evento en el botón, se revisa si
    el usuario tiene o no internet a través de wifi. Si no dispone de ella, se envía un toast
    al usuario con el aviso de que no tiene conexión y se retorna a la página principal.
    Si tiene internet, se envía el mensaje a pubnub y se hace la petición subscribe para 
    recibir. */
    sendMessage(messageContent: string) {
        if (this.platform.is('cordova')) {
            this.hotspot.isConnectedToInternetViaWifi().then((bo: Boolean) => {
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
                           // console.log('Publish error', JSON.stringify(error));
                        }
                        );
                    }
                }
            });
        } else {
           // console.log("Comprobación.");
        }

    }

    /* Permite el scroll automático de los mensajes en la pantalla, de manera
    infinita */
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