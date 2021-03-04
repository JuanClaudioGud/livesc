import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IPost,INew } from 'src/app/models/iPost';
import { UserService } from 'src/app/service/user.service';
import { NewsService } from 'src/app/service/news.service';
import { response } from 'express';

@Component({
  selector: 'post-shared',
  templateUrl: './post-shared.component.html',
  styleUrls: ['./post-shared.component.scss'],
})
export class PostSharedComponent implements OnInit {

  constructor(
    public userService:UserService,
    private router:Router,
    public newsService:NewsService,
  ) { }

  @Input() post:IPost
  @Input() news: INew
  @Input() newsShared: INew

  @Input() disabled:boolean = false
  ngOnInit() {
    if(this.news){
      this.userService.getUserById(this.news.user).subscribe((response:any)=>{
        delete(response.password)
        delete(response.email)
        this.news.user = response
      })
    }
  }

goToStream(){
  this.newsService.idNews = this.news._id
  this.router.navigate([`/news/streamNews/${this.news.postStream}`])
}

  goToProfile(id,username){
    if(id == this.userService.User._id){
      this.router.navigate(["/profile"])
    }else{
      this.router.navigate([`/user/${username}`])
  
    }
  }

  goToPost(id){
    this.router.navigate([`/post/${id}`])
  }
  
  OpenNews(){
    this.router.navigate([`news/read/${this.news._id}`])
  }

}
