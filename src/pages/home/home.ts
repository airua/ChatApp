import { Component } from '@angular/core';
import { NavController, ToastController, App, Platform } from 'ionic-angular';
import { Hotspot, HotspotNetworkConfig, HotspotConnectionInfo} from '@ionic-native/hotspot';
import { Device } from '@ionic-native/device';

/*
  Hotspot: https://ionicframework.com/docs/native/hotspot/ 
  Como no retorna valor al consultar la MAC con este plugin (está en fase beta),
  descargo plugin WifiWizard2
*/

/*
//Fuente WifiWizard2: https://github.com/tripflex/WifiWizard2#global-functions
//instalamos WifiWizard2 (con plugin Hotspot no era capaz de sacar la MAC del router)
ionic cordova plugin add cordova-plugin-wifiwizard2

//declaramos variable fuera de la clase, encima de component:
declare var WifiWizard2: any;

//metodo para sacar la MAC dentro de la clase donde es utilizado el plugin
getMAC(){
  WifiWizard2.getConnectedBSSID().then((a:any)=>{});
}*/

//Device-> https://ionicframework.com/docs/native/device/


declare var WifiWizard2: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  nick:string="";
  mac:string="123";
  dev:string="123";
  id:string;
  constructor(public navCtrl: NavController,
              public toast:ToastController,
              private platform: Platform,
              private hotspot:Hotspot,
              private device:Device) {

            if(this.platform.is('cordova')){
              this.getMAC();               
              this.dev=this.device.uuid;  
            }                         
              
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

  /*Para obtener MAC*/
  getMAC(){
    WifiWizard2.getConnectedBSSID().then((a:any)=>{this.mac=a});
  }

  //canLeave probado pero no funcionaba correctamente, puede que debido al plugin hotspot

  /* Para ir a la página local con comprobaciones pertinentes */
  irPaginaLocal()
  {
    if(this.platform.is('cordova'))
    {
      if(this.nick=="" || this.nick.includes('-')){
        this.mensaje("Introduce un nick para acceder al chat. Recuerda no utilizar guiones.");
       
      }else{
        this.hotspot.isWifiOn().then((bob:boolean)=>{
          if(!bob){
            this.mensaje("Habilita el WIFI.");
            
          }else{
            this.hotspot.isConnectedToInternetViaWifi().then((bo:Boolean)=>{
              if(!bo){
                this.mensaje("No hay conexión a internet por WIFI.");
                
              }else{
               //    console.log("abro local");
                this.id=this.nick+"-"+this.dev;
                this.navCtrl.push("LocalPage", {"id":this.id, "mac":this.mac});
                  
              }
            });
          }
        }); 
      }
    }else{
      if(this.nick==""|| this.nick.includes('-')){
        this.mensaje("Introduce un nick para acceder al chat. Recuerda no utilizar guiones.");
    
      }else{        
        //console.log("abro local");
        this.id=this.nick+"-"+this.dev;
        this.navCtrl.push("LocalPage", {"id":this.id, "mac":this.mac});
   
         
      }
     }
  }

  /* Para ir a la página común con comprobaciones pertinentes */
  irPaginaComun()
  {  
    if(this.platform.is('cordova'))
    {
      if(this.nick==""|| this.nick.includes('-')){
        this.mensaje("Introduce un nick para acceder al chat. Recuerda no utilizar guiones.");
      
      }else{
        this.hotspot.isWifiOn().then((bob:boolean)=>{
          if(!bob){
            this.mensaje("Habilita el WIFI.");
            
          }else{
            this.hotspot.isConnectedToInternetViaWifi().then((bo:Boolean)=>{
              if(!bo){
                this.mensaje("No hay conexión a internet por WIFI.");
                
              }else{
              //      console.log("abro comun");
                this.id=this.nick+"-"+this.dev;               
                this.navCtrl.push("ComunPage",{"id": this.id});      
           
              }
            });
          }
        }); 
      }
    }else{
      if(this.nick=="" || this.nick.includes('-')){
        this.mensaje("Introduce un nick para acceder al chat. Recuerda no utilizar guiones.");
      
      }else{        
        //console.log("abro comun");
        this.id=this.nick+"-"+this.dev;               
        this.navCtrl.push("ComunPage",{"id": this.id});  
         
      }
     }
  }

  /* Para salir de la App */
  salirApp()
  {
    if(!this.platform.is('cordova'))
    {
      this.mensaje("Aquí cierro la App.");
    }
    else
    {      
      this.platform.exitApp();
    }   
  }
 
}