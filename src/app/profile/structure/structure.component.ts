import { Input, Component, OnInit } from "@angular/core";
import { ModifyMediaComponent } from "src/app/components/structure/modify-media/modify-media.component"
import { User, UserService } from "src/app/service/user.service";
import { ModalController } from "@ionic/angular";
import { NewNodeComponent } from "./new-node/new-node.component";
import { take } from "rxjs/operators";
import { ActivatedRoute } from "@angular/router";
import { ReusableComponentsIonic } from "src/app/service/reusable-components-ionic.service"

interface UserData {
  user: User;
  friends: {
    followers: number;
    followings: number;
  };
  posts: number;
  connected: boolean;
}

export interface INode {
  /*
   * Id del nodo numerico unicamente representativo
   */
  id?:number;
  /*
   * Contenido multimedia maximo 3 imagenes o videos
   */
  media:string[];
  /*
   * Que contiene el nodo
   */
  subtitle: string;
  /*
   * Titulo del nodo
   */
  title: string;
  /*
   * Texto descriptivo del nodo
   */
  text:string;
  /*
   * Estructuras de menor gerarquia
   */
  childs:this;
}

@Component({
  selector: "app-structure",
  templateUrl: "./structure.component.html",
  styleUrls: ["./structure.component.scss"],
})
export class StructureComponent implements OnInit {

  /*
   * Slide Options para darle estilo al componente slide de html
   */
  slideOpts = {
    on: {
      beforeInit() {
        const swiper = this;
        swiper.classNames.push(`${swiper.params.containerModifierClass}flip`);
        swiper.classNames.push(`${swiper.params.containerModifierClass}3d`);
        const overwriteParams = {
          slidesPerView: 1,
          slidesPerColumn: 1,
          slidesPerGroup: 1,
          watchSlidesProgress: true,
          spaceBetween: 0,
          virtualTranslate: true,
        };
        swiper.params = Object.assign(swiper.params, overwriteParams);
        swiper.originalParams = Object.assign(
          swiper.originalParams,
          overwriteParams
        );
      },
      setTranslate() {
        const swiper = this;
        const { $, slides, rtlTranslate: rtl } = swiper;
        for (let i = 0; i < slides.length; i += 1) {
          const $slideEl = slides.eq(i);
          let progress = $slideEl[0].progress;
          if (swiper.params.flipEffect.limitRotation) {
            progress = Math.max(Math.min($slideEl[0].progress, 1), -1);
          }
          const offset$$1 = $slideEl[0].swiperSlideOffset;
          const rotate = -180 * progress;
          let rotateY = rotate;
          let rotateX = 0;
          let tx = -offset$$1;
          let ty = 0;
          if (!swiper.isHorizontal()) {
            ty = tx;
            tx = 0;
            rotateX = -rotateY;
            rotateY = 0;
          } else if (rtl) {
            rotateY = -rotateY;
          }

          $slideEl[0].style.zIndex =
            -Math.abs(Math.round(progress)) + slides.length;

          if (swiper.params.flipEffect.slideShadows) {
            // Set shadows
            let shadowBefore = swiper.isHorizontal()
              ? $slideEl.find(".swiper-slide-shadow-left")
              : $slideEl.find(".swiper-slide-shadow-top");
            let shadowAfter = swiper.isHorizontal()
              ? $slideEl.find(".swiper-slide-shadow-right")
              : $slideEl.find(".swiper-slide-shadow-bottom");
            if (shadowBefore.length === 0) {
              shadowBefore = swiper.$(
                `<div class="swiper-slide-shadow-${
                  swiper.isHorizontal() ? "left" : "top"
                }"></div>`
              );
              $slideEl.append(shadowBefore);
            }
            if (shadowAfter.length === 0) {
              shadowAfter = swiper.$(
                `<div class="swiper-slide-shadow-${
                  swiper.isHorizontal() ? "right" : "bottom"
                }"></div>`
              );
              $slideEl.append(shadowAfter);
            }
            if (shadowBefore.length)
              shadowBefore[0].style.opacity = Math.max(-progress, 0);
            if (shadowAfter.length)
              shadowAfter[0].style.opacity = Math.max(progress, 0);
          }
          $slideEl.transform(
            `translate3d(${tx}px, ${ty}px, 0px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
          );
        }
      },
      setTransition(duration) {
        const swiper = this;
        const { slides, activeIndex, $wrapperEl } = swiper;
        slides
          .transition(duration)
          .find(
            ".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left"
          )
          .transition(duration);
        if (swiper.params.virtualTranslate && duration !== 0) {
          let eventTriggered = false;
          // eslint-disable-next-line
          slides.eq(activeIndex).transitionEnd(function onTransitionEnd() {
            if (eventTriggered) return;
            if (!swiper || swiper.destroyed) return;

            eventTriggered = true;
            swiper.animating = false;
            const triggerEvents = ["webkitTransitionEnd", "transitionend"];
            for (let i = 0; i < triggerEvents.length; i += 1) {
              $wrapperEl.trigger(triggerEvents[i]);
            }
          });
        }
      },
    },
  };

  /*
   * DAta default para club
   */

  public canteraMasculina = {
    id: 2,
    media: null,
    subtitle: `Equipo / Cantera Masculina`,
    title: `Cantera Masculina`,
    text: `Categorias`,
    childs: [],
  };
  public canteraFemenina = {
    id: 3,
    media: null,
    subtitle: `Equipo / Cantera Femenina`,
    title: `Cantera Femenina`,
    text: `Categorias`,
    childs: [],
  };
  public primerEquipo = {
    id: 4,
    media: null,
    subtitle: `Equipo / Primer Equipo`,
    title: `Primer Equipo`,
    text: `Plantilla`,
    childs: [],
  };
  public equipoFemenino = {
    id: 5,
    media: null,
    subtitle: `Equipo / Equipo Femenino`,
    title: `Equipo Femenino`,
    text: `Plantilla`,
    childs: [],
  };
  public otrosEquipos = {
    id: 6,
    media: null,
    subtitle: `Equipo / Otros Equipos`,
    title: `Otros Equipos`,
    text: `Equipos`,
    childs: [],
  };
  public structureDefault = {
    id: 1,
    media: null,
    subtitle: `Equipo`,
    title: `structure.title.club`,
    text: `Aquí encontraras toda la información de nuestro club.`,
    childs: [
      this.canteraMasculina,
      this.canteraFemenina,
      this.primerEquipo,
      this.equipoFemenino,
      this.otrosEquipos,
    ],
  };

  /*
   * Variables
   */

  @Input() public ID: string;
  showSlides: boolean = false
  public structure = JSON.parse(JSON.stringify(this.structureDefault));

  public actualNode = this.structure;
  public creator: boolean = false;
  public structureStatus: boolean = true;
  public defaultImg: string = `./assets/images/logox.png`;
  public seleccion: any = this.structure.childs[0];

  constructor(
    public uS: UserService,
    public mc: ModalController,
    public userService: UserService,
    public route: ActivatedRoute,
    public reusableCI: ReusableComponentsIonic
  ) {}

  openImg(i:INode){
    if(i.media){
      if(i.media.length > 0)
      this.reusableCI.openImg(i.media[0],null)
      else this.reusableCI.openImg(this.defaultImg,null)
    }
  }

  async editMedia(node: INode){
    const modal = await this.mc.create({
      component: ModifyMediaComponent,
      cssClass: "my-custom-class",
      componentProps: {
        media: node.media ? node.media: [this.defaultImg],
        idUser:this.ID !== this.userService.User._id 
                ? this.route.snapshot.paramMap.get("username")
                : this.userService.User.username
      }
    })
    await modal.present()
    const { data } = await modal.onDidDismiss()
    if(data){
      console.log(data)
      const newMedia = data
      node.media = newMedia
      this.searchEdit(node, node)
    }
  }

  eliminar(i){}

  getStructure() {
    // Obtenemos la estructura organizacional del usuario si y solo si, dicha estructura existe.
    if (this.ID === this.uS.User._id) {
      this.uS.User.structure !== undefined
        ? (this.structure = this.uS.User.structure)
        : null;
      this.actualNode = this.structure;
      this.creator = true;
    } else {
      this.uS
        .getUserByUsername(this.route.snapshot.paramMap.get("username"))
        .pipe(take(1))
        .subscribe((r: UserData) => {
          if (r.user.structure) {
            this.structure = r.user.structure;
            this.actualNode = this.structure.childs[0]
          } else {
            this.structureStatus = false;
          }
        });
    }
  }

  ngOnInit() {
    setTimeout(() => {
      this.showSlides = true;
    }, 300);
    this.getStructure();
  }
  async editNodes(node: any) {
    const modal = await this.mc.create({
      component: NewNodeComponent,
      cssClass: "my-custom-class",
      componentProps: {
        structure: this.structure,
        actualNode: node,
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      node ? this.searchEdit(this.actualNode, data) : this.createNode();
    }
  }

  async createNode() {
    //this.actualnode es el node padre
    const modal = await this.mc.create({
      component: NewNodeComponent,
      cssClass: "my-custom-class",
      componentProps: {
        structure: this.structure,
        actualNode: undefined,
        parentNode: this.actualNode,
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      data.childs = [];
      this.insertNode(this.structure, data, this.actualNode);
    }
  }

  insertNode(node: any, newNode: any, parentNode: any) {
    if (node.id === parentNode.id) {
      node.childs.push(newNode);
      this.as();
    } else if (node.childs !== null) {
      for (let i in node.childs) {
        this.insertNode(node.childs[i], newNode, parentNode);
      }
    }
  }

  searchEdit(node: any, newNode: any) {
    // Se buscara dentro de la estructura el nodo otorgado para su remplazo
    if (node.id === newNode.id) {
      node.media = newNode.media;
      node.title = newNode.title;
      node.subtitle = newNode.subtitle;
      node.text = newNode.text;
      console.log(node)
      console.log("Nodo actualizado")
      this.as();
    } else if (node.childs.length != 0) {
      for (let i = 0; i < node.childs.length; i++) {
        this.searchEdit(node.childs[i], newNode);
      }
    }
  }

  deleteNode(node: any, nodeId: number) {
    if (node.childs !== null) {
      for (let i in node.childs) {
        let filtered = node.childs.filter((f: any) => f.id === nodeId);
        if (filtered && filtered.length > 0) {
          node.childs = node.childs.filter((f: any) => f.id !== nodeId);
          this.as();
          return;
        }
        this.deleteNode(node.childs[i], nodeId);
      }
    }
  }

  goBack(actualNode: INode, node: any) {
    console.log("#####################");
    console.log("Entrando en GoBack",actualNode,node)
    /*
     * Se almacena el subtitle anterior
     */
    const subtitleToGo: string = actualNode .subtitle.split(" / ") .reverse()[1]
    const subtitleOfActualNode = node.subtitle.split(" / ").reverse()[0]
    console.log("Actual Node Subtitle",actualNode.subtitle)
    console.log("Split",actualNode.subtitle.split(" / ").reverse())
    console.log("Subtitle to go",subtitleToGo)
    /*
     * Si coiciden los subtitles se devuelve a dicho nodo
     */
    if (subtitleToGo === subtitleOfActualNode) {
      this.actualNode = node;
    } else if (node.childs.length != 0) {
      for (let i in node.childs) {
        this.goBack(actualNode, node.childs[i]);
      }
    }
  }

  /* 
   * Actualizar estructura
   */
  as() {
    this.userService.User.structure = this.structure;
    this.userService
      .update(this.userService.User)
      .pipe(take(1))
      .subscribe((r: any) => {
        this.reusableCI.toast(`Estructura Actualizada`) 
      })
  }

  /*
   * Reiniciar Estructura Default
   */
  async restart(){
    const data = await this.reusableCI.desicionAlert(
      `¿Esta seguro de reiniciar su estructura?`,
      `Todas las configuraciones volveran a su estado original`
    )
    if(data){
      this.structure = JSON.parse(JSON.stringify(this.structureDefault))
      this.actualNode = this.structure
      this.as()
    }
  }
}
