import { Component, OnInit,ViewChild,ElementRef } from '@angular/core';
import AgoraRTC, { IAgoraRTCClient } from "agora-rtc-sdk-ng"
import { UserService } from "../../../service/user.service";
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ModalController, Platform } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";

const client: IAgoraRTCClient = AgoraRTC.createClient({ mode: "live", codec: "vp8" });

@Component({
  selector: 'app-stream',
  templateUrl: './stream.component.html',
  styleUrls: ['./stream.component.scss'],
})
export class StreamComponent implements OnInit {

  @ViewChild("localPlayer") localPlayer: ElementRef;

  constructor(
    public userService: UserService,
    private route:ActivatedRoute,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,

  ) {
    //client.setClientRole("audience")
  
    this.channel = route.snapshot.paramMap.get('id')
      this.rtc.client = AgoraRTC.createClient({ mode: "live", codec: "vp8" ,role:"audience"});
     this.subscribe()
    //this.join()
   }
   isSubscribe:boolean = true
  rtc = {
    // For the local client.
    client: null,
    // For the local audio and video tracks.
    localAudioTrack: null,
    localVideoTrack: null,
  };
  channel
   options = {
    // Pass your app ID here.
    appId: "73cf40b7571b42b4a6d85473006ae348",
    // Set the channel name.
    channel: "demo_channel_name",
    // Pass a token if your project enables the App Certificate.
    token: null,
    // Set the user role in the channel.
    role: "audience",

    uid:null
  };
  videoProfiles = [
    { label: "480p_1", detail: "640×480, 15fps, 500Kbps", value: "480p_1" },
    { label: "480p_2", detail: "640×480, 30fps, 1000Kbps", value: "480p_2" },
    { label: "720p_1", detail: "1280×720, 15fps, 1130Kbps", value: "720p_1" },
    { label: "720p_2", detail: "1280×720, 30fps, 2000Kbps", value: "720p_2" },
    { label: "1080p_1", detail: "1920×1080, 15fps, 2080Kbps", value: "1080p_1" },
    { label: "1080p_2", detail: "1920×1080, 30fps, 3000Kbps", value: "1080p_2" },
  ]
formateSelected

  uid
  async join(){
    this.uid = await this.rtc.client.join(this.options.appId, this.channel,  this.options.token, null);
  }

  async  leave() {//retiro del canal
    client.localTracks.forEach((v) => v.close());
    await client.leave();
  }

  /* async onAgoraUserPublished(user, mediaType) {
    const track = await client.subscribe(user, mediaType);
    track.play();
  } */




  async  subscribe(){
    let loading = await this.loadingCtrl.create({
      message: this.translate.instant("loading"),
    });
    loading.present();
    this.isSubscribe = true
  await this.join()
    this.rtc.client.on("user-published", async (user, mediaType) => {
      // Subscribe to a remote user.
      await this.rtc.client.subscribe(user, mediaType);
      console.log("subscribe success");
      // If the subscribed track is video.
      if (mediaType === "video") {
        // Get `RemoteVideoTrack` in the `user` object.
        const remoteVideoTrack = user.videoTrack;
        // Dynamically create a container in the form of a DIV element for playing the remote video track.
        const playerContainer = document.createElement("div");
        console.log('me creo VIDEO VIDEO VIDEO VIDEO VIDEO  ')
        // Specify the ID of the DIV container. You can use the `uid` of the remote user.
        playerContainer.id = user.uid.toString();
        playerContainer.style.width = "100%";
        playerContainer.style.height = "100%";
        playerContainer.style.marginLeft = "auto"
        playerContainer.style.marginRight = "auto"
        document.getElementById("localPlayer").appendChild(playerContainer);

        // Play the remote video track.
        // Pass the DIV container and the SDK dynamically creates a player in the container for playing the remote video track.
        remoteVideoTrack.play(playerContainer);
        var textnode = document.createTextNode(user.uid.toString());
        document.getElementById("remotePlayerlist").appendChild(textnode);
       
        // Or just pass the ID of the DIV container.
        // remoteVideoTrack.play(playerContainer.id);
        
      }
    
      // If the subscribed track is audio.
      if (mediaType === "audio") {
        // Get `RemoteAudioTrack` in the `user` object.
        const remoteAudioTrack = user.audioTrack;
        // Play the audio track. No need to pass any DOM element.
        remoteAudioTrack.play();
        console.log('me creo AUDIO AUDIO AUDIO AUDIO AUDIO  ')

      }
    });
    loading.dismiss();

  } 

 async unSubscribe(){
  let loading = await this.loadingCtrl.create({
    message: this.translate.instant("loading"),
  });
  loading.present();
  this.isSubscribe = false;
    this.rtc.client.on("user-unpublished", user => {
      // Get the dynamically created DIV container.
      const playerContainer = document.getElementById(user.uid);
      // Destroy the container.
       playerContainer.remove();
    });

    
      // Leave the channel.
      await this.rtc.client.leave();
    
      loading.dismiss();
  }
  async  leaveCall() {

    // Destroy the local audio and video tracks.
    if(this.rtc.localAudioTrack){
      this.rtc.localAudioTrack.close();

    }
    this.rtc.localVideoTrack.close();
  
    // Traverse all remote users.
    this.rtc.client.remoteUsers.forEach(user => {
      // Destroy the dynamically created DIV container.
      const playerContainer = document.getElementById(user.uid);
      playerContainer && playerContainer.remove();
    });
  
    // Leave the channel.
    await this.rtc.client.leave();
  }
   
  ngOnInit() {}

}