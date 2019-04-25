import { Injectable, EventEmitter } from '@angular/core';
import { OneSignal, OSNotification, OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class PushService {
  mensajes: OSNotificationPayload[] = [];

  userId: string;

  pushListener = new EventEmitter<OSNotificationPayload>();

  constructor(private oneSignal: OneSignal, private storage: Storage) {
    this.cagarMensajes();
  }

  async getMensajes() {
    await this.cagarMensajes();
    return [...this.mensajes];
  }

  configuracionInicial() {
    this.oneSignal.startInit('67764914-16d4-42e2-b878-b63dbb36f611', '190648665240');

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

    this.oneSignal.handleNotificationReceived().subscribe((noti) => {
      // do something when notification is received
      console.log('notificacion recived', noti);
      this.notificacionRecibida(noti);
    });

    this.oneSignal.handleNotificationOpened().subscribe(async(noti) => {
      // do something when a notification is opened
      console.log('notificacion opened', noti);
      await this.notificacionRecibida( noti.notification );
    });

    // obtener id subscritor

    this.oneSignal.getIds().then(info =>{
      this.userId = info.userId;
      console.log(this.userId);
      
    })

    this.oneSignal.endInit();
  }

  async notificacionRecibida(noti: OSNotification) {
    await this.cagarMensajes();
    const payload = noti.payload;
    const existePush = this.mensajes.find((mensaje) => mensaje.notificationID === payload.notificationID);
    if (existePush) {
      return;
    }
    this.mensajes.unshift(payload);
    this.pushListener.emit(payload);
    await this.guardaMensajes();
  }

  guardaMensajes() {
    this.storage.set('mensajes', this.mensajes);
  }

  async cagarMensajes() {
    this.mensajes = await this.storage.get('mensajes') || [];
    return this.mensajes;
  }

  async borrarMensajes(){
    await this.storage.clear();
    // this.storage.remove('mensajes');
    this.mensajes = [];
    this.guardaMensajes();

  }
}
