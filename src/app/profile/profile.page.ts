import { OpenImgComponent } from "src/app/components/open-img/open-img.component";
import { LoginService } from "./../service/login.service";
import { take } from "rxjs/operators";
import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { PopoverController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { PostService } from "../service/post.service";
import { UserService } from "../service/user.service";
import { ProfileService } from "../service/profile.service";
import { ViewsProfileService } from "../service/views-profile.service";
import { NewsService } from "../service/news.service";
import { ModalController } from "@ionic/angular";
import { GetMediaComponent } from "../components/get-media/get-media.component";
import { ReusableComponentsIonic } from "../service/ionicHelpers.service";
import { User } from "../models/IUser";
import { ISponsor } from "../models/ISponsor";
import { IPost } from "../models/iPost";
import { GroupService } from "../service/group.service";
import { MsgProfileEditComponent } from "./msg-profile-edit/msg-profile-edit.component";
import { OptionNewsComponent } from "../news/news/option-news/option-news.component";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.page.html",
  styleUrls: ["./profile.page.scss"],
})
export class ProfilePage implements OnInit {
  @ViewChild(GetMediaComponent) getMedia: GetMediaComponent;

  @ViewChild("reloadButton", { static: false }) reloadButton: any;

  profile: boolean = true;
  postsB: boolean = false;
  newsB: boolean = false;
  landingButton: boolean = false;
  loadingPost: boolean;
  countPost = 0;
  user: User = this.userService.User;
  creator: boolean = true;
  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public userService: UserService,
    public modalCtrl: ModalController,
    public translate: TranslateService,
    public popoverController: PopoverController,
    private postService: PostService,
    public profileService: ProfileService,
    public loginService: LoginService,
    private viewsProfileService: ViewsProfileService,
    public newsService: NewsService,
    public reusableCI: ReusableComponentsIonic,
    public cd: ChangeDetectorRef,
    private groupService: GroupService
  ) {
    if (this.userService.User.msgProfile == false) {
      this.editProfileMsg();
    }
    this.groupService.groupInvited();
    this.viewsProfileService
      .getProfileView(this.userService.User._id)
      .pipe(take(1))
      .subscribe((views: any) => {
        if (!views) return false;
        this.views = views.visits;
      });
    const uP = this.userService.User.profile_user;
    if (
      uP === "club" ||
      uP === "representative" ||
      uP === "association" ||
      uP === "foundation" ||
      uP === "federation" ||
      uP === "brand" ||
      uP === "sponsor"
    )
      this.landingButton = true;
    else this.landingButton = false;
  }

  async editProfileMsg() {
    let modal = await this.modalCtrl.create({
      component: MsgProfileEditComponent,
      cssClass: "msg-edit-modal",
      backdropDismiss: false,
    });

    modal.onDidDismiss().then(() => {
      this.router.navigate(["/profile/edit"]);
    });

    modal.present();
  }

  news = [];
  posts: IPost[] = [];
  views: [];
  ngOnInit() {
    this.newsService
      .findUserNews(this.userService.User._id)
      .subscribe((response: any) => {
        this.news = response; /* .filter((news)=>{
          return news.stream == false;
        })*/
      });

    this.getPost();
    this.getCountPost();
    this.postService.newPostObservable().subscribe((id) => {
      this.newPost(id);
    });
  }

  /**
   * Busca una publicacion creada
   * @param id id de la pubublicacion
   */
  newPost(id) {
    this.postService
      .getPost(id)
      .toPromise()
      .then((post: IPost) => {
        // una vez tenga todos los datos de esa publicacion, lo mete de primero en  las publicaciones
        this.posts.unshift(post);
      })
      .catch((err) => {
        // handle err
      });
  }



  getCountPost() {
    this.viewsProfileService
      .getProfileView(this.userService.User._id)
      .pipe(take(1))
      .subscribe((views: any) => {
        if (!views) return false;
        this.views = views.visits;
      });
    const uP = this.userService.User.profile_user;
    if (
      uP === "club" ||
      uP === "representative" ||
      uP === "association" ||
      uP === "foundation" ||
      uP === "federation" ||
      uP === "brand" ||
      uP === "sponsor"
    )
      this.landingButton = true;
    else this.landingButton = false;
    this.profileService
      .getCountPostByUser(this.userService.User._id)
      .then((count: number) => {
        this.countPost = count;
      })
      .catch((err) => {});
  }

  goToPost(id) {
    this.router.navigate([`/post/${id}`]);
  }

  goTo(r) {
    this.router.navigate([r]);
  }

  skip = 0;

  getPost(event = null, reload = false) {
    this.loadingPost = true;
    if (reload) {
      this.skip = 0;
      this.posts = [];
    }
    this.postService
      .myPost(this.skip)
      .toPromise()
      .then((posts: IPost[]) => {
        this.posts = this.posts.concat(posts);
        if (event) {
          event.target.complete();
        }
        this.skip += 10;
        this.loadingPost = false;
      })
      .catch((err) => {
        this.loadingPost = false;

        // handler err
      });
  }

  segmentChanged(e: CustomEvent) {
    if (e.detail.value === "posts") {
      this.profile = false;
      this.postsB = true;
    } else if (e.detail.value === "profile") {
      this.postsB = false;
      this.profile = true;
    } 
  }

  async open(img: string) {
    const modal = await this.modalCtrl.create({
      component: OpenImgComponent,
      componentProps: {
        img,
        idUser: this.userService.User.username,
        delete: false,
      },
    });
    modal.present();
  }

  /*
   * CAMBIAR EL BANNER
   */
  changeBanner() {
    this.getMedia.content$.pipe(take(1)).subscribe((media: string) => {
      if (media !== null) {
        this.userService.User.photoBanner = media;
        this.userService
          .update(this.userService.User)
          .pipe(take(1))
          .subscribe((r: any) => {
            this.reusableCI.toast("Banner actualizado con éxito");
          });
      }
    });
    this.getMedia.getMedia(true, false, false, false, true, true);
  }

  /**
   * LOGICA PARA MODIFICAR SPONSORS
   */
  changeSponsors(sponsors: ISponsor[]) {
    this.userService.User.sponsors = sponsors;
    this.userService
      .update(this.userService.User)
      .pipe(take(1))
      .subscribe((r: any) => {
        this.reusableCI.toast(
          this.translate.instant("success.sponsors-updated")
        );
      });
  }

  async logScrolling(ev) {
    let el = await ev.target.getScrollElement();
    this.cd.detectChanges();
    if (el.clientHeight * 0.4 < el.scrollTop) {
      setTimeout(() => {
        this.reloadButton?.el.classList.add(
          "floating-reload",
          "scale-in-center",
          "btn-green"
        );
      }, 100);
    } else {
      this.reloadButton?.el.classList.remove(
        "scale-in-center",
        "floating-reload",
        "btn-green"
      );
    }

    if (
      el.scrollHeight - el.scrollTop < el.clientHeight + 400 &&
      !this.loadingPost
    ) {
      this.getPost();
    }
  }
}
