import { Component, OnInit } from '@angular/core';
import { ImageLoaderService} from '../image-loader.service';



@Component({  
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss']
})
export class ImageViewerComponent implements OnInit {

  imageData: any;
  imageUrl:string;

  constructor(private imageLoaderService : ImageLoaderService ) {
    this.imageUrl= "assets/testImage_2.JPG";
  }

  ngOnInit() {
    
    var counter=0;
     setInterval(()=> {
      console.log("setting picture");
      counter++;
      //this.imageUrl = `http://localhost:3000/api/getPicture/${counter}`;

         this.imageLoaderService.getNewImage()
           .subscribe(x=> {
            var id =x.counter;
            this.imageUrl = `http://localhost:3000/api/getPicture/${id}`;
            console.log("show hello-world",x);}
            );
    //     this.imageLoaderService.getNewImage()
    //     .subscribe(x=>this.imageUrl = x.label);
     },4000);
  

  }
}