import {Component, Output, Input, EventEmitter, SimpleChange, OnInit, AfterViewInit, OnChanges, DoCheck} from 'angular2/core';

export interface IAeroPagination {

}

@Component({
    selector: 'aero-pagination',
    template: ` 

        <ul class="pagination pagination-sm pull-right" >
         <li [class.no-active]="true">
              <a style="padding:0px;margin:0px; height:29px">
               <div style="width:81px;border:none; text-align: center;padding-top:5px;margin:0px;" >Registros: {{totalRecords}}</div>
             </a>
            </li>
           <li  >
             <a  style="padding:0px;margin:0px;width:111px; height:29px">
             <span style="padding-left:5px;padding-right:3px;" > Exibir:</span><input  [(ngModel)]="numberOfRecordsPage" (ngModelChange)="loadData(true)" style="width:63px; height:26px; border:none; text-align: center;padding:0px;margin:0px;" type="number" min="1" max="{{totalRecords}}"  name="aero-page"  value="" />  
             </a>
            </li>
            <li  [class.no-active]="activePage==1"><a  style="height:29px" (click)="goToNextRecords('first')" >«</a></li>
            <li  [class.no-active]="activePage==1"  ><a  style="height:29px"  (click)="goToNextRecords('prev')" >‹</a></li>
            <li [class.no-active]="true" >
             <a style="padding:0px;margin:0px; height:29px ">
               <div style="width:37px;height:25px; border:none; text-align: center;padding-top:5px;margin:0px;" >{{activePage}}/{{totalPages}}</div>
             </a>
            </li>
            <li  [class.no-active]="activePage==totalPages" ><a  style="height:29px" (click)="goToNextRecords('next')"  >›</a></li>
            <li [class.no-active]="activePage==totalPages"><a  style="height:29px"  (click)="goToNextRecords('last')"   >»</a></li>
            <li>
             <a style="padding:0px;margin:0px;height:29px">
               <span style="padding-left:3px;padding-right:2px;">Página: </span><select  [(ngModel)]="pageSelected"  (ngModelChange)="goToNextRecords('page')" style="width:51px; height:26px; border:none; text-align: center;padding:0px;margin:0px;" type="text" name="aero-page" >
                    
                     <option *ngFor=" let item of pages"  value="{{item.id}}">{{item.id}}</option>
                   </select>
             </a>
            </li>
            <li style="display:block">
              <div *ngIf="showProgressBar" class="progress pull-left" style="padding-lef:5px;width:400px; height:1px;">
  <div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" [ngStyle]="{'width':percentComplet+'%'}">
  </div>
</div>
            </li>
        </ul>
        <style>
          .no-active {
       pointer-events: none;
       cursor: not-allowed;
    } 
        </style>
      
        <div style="display:none">Create By Alberto Aeraph @version 0.1 17-06-2016 </div>
        `,
    inputs: ['aeroRowsPagination']

})

export /**
 * AeroPagination
 */
    class AeroPagination implements OnChanges {

    @Input() aeroRowsPagination: any;
    @Input() numberOfRecordsPage: number;
    @Output() aeroPaginationRowsEvent = new EventEmitter<Array<Object>>();
    @Output() paginationDataEvent = new EventEmitter<number>();



    private _next: number = 0;
    private _back: number = 0;
    public activePage: number;
    public totalPages: number;
    public pages: Array<Object> = [];
    public pageSelected: number;
    public totalRecords: number;
    public percentComplet: number = 0;
    public showProgressBar: boolean = true;


    constructor() {

    }


    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        this.loadData();
    }

    loadData(loadTime: any = null) {
        var self = this;
        var time = loadTime == true && loadTime != null ? 1000 : 0;
        setTimeout(function () {
            if (self.aeroRowsPagination.length > 0 && self.numberOfRecordsPage > 0) {

                self._next = 0;
                self._back = 0;
                self.activePage = 0;
                self.totalPages = self.getTotalPages();
                self.paginationDataEvent.emit(self.totalPages);
                self.goToNextRecords('next');
            }

        }, time);
    }


    //
    goToNextRecords(direction: string): void {
        let records: Array<any> = this.getRecords(direction);
        this.aeroPaginationRowsEvent.emit(records);

    };


    //Calculate and return the records
    getRecords(direction: string): any {
  
        var result: Array<any> = [];
        let index: number;
        index = this._setRecordsDirectionQuery(direction);
        this.showProgressBar = true;
        this.percentComplet = 0;
        let count: number = 0;
        while (count < this.numberOfRecordsPage && this.numberOfRecordsPage > 0) {
            if (this.aeroRowsPagination[index]) {

                this.percentComplet += (1 / this.numberOfRecordsPage) * 100;
                result.push(this.aeroRowsPagination[index]);
                index++;

            }
            count++;
        };

        this.showHidProgressBar(Math.round(this.percentComplet));
        return result;
    };


    private showHidProgressBar(percent: number) {
        if (percent === 100) {
            var self = this;
            setTimeout(function () {
                self.showProgressBar = false;
            }, 1000);
        }
    }

    private _setRecordsDirectionQuery(direction: string): number {
        let index: number = 0;

        if (direction === "next" && this.activePage <= this.totalPages && this._next < this.totalRecords) {

            index = this._next;
            this._back = this._next;
            this._next = this._next + this.numberOfRecordsPage;
            if (this.activePage === this.totalPages) {
                this.activePage = this.totalPages;
            } else {
                this.activePage++;
            }

        } else if (direction === "prev" && this.activePage > 1) {
            index = this._back - this.numberOfRecordsPage;
            this._next = this._back;
            this._back = index;
            this.activePage--;

        } else if (direction === "page") {

            index = this.goToPage();
        } else {
            index = this.goToFirsOrLastRecords(direction);
        }

        return index;
    };


    goToFirsOrLastRecords(direction: string) {
        var index: number;
        if (direction === "first" && this.activePage > 1) {
            index = 0;
            this._next = this.numberOfRecordsPage;
            this._back = 0;
            this.activePage = 1;
        } else if (direction === "last" && this.activePage < this.totalPages) {
            index = this.totalRecords - this.numberOfRecordsPage;
            this._next = this.numberOfRecordsPage;
            this._back = index;
            this.activePage = this.totalPages;
        }
        return index;
    }

    goToPage(): number {
        var index: number;

        if (this.pageSelected == 1) {
            index = 0;
            this._back = 0;
            this._next = this.numberOfRecordsPage;
            this.activePage = 1;
        } else if (this.pageSelected > 1 && this.pageSelected <= this.totalPages) {

            index = (this.pageSelected - 1) * this.numberOfRecordsPage;
            this._next = index;
            this._back = index;
            this.activePage = this.pageSelected;
        }


        return index;
    }

    getTotalPages(): number {

        let pageNumber: number;

        this.numberOfRecordsPage
        this.totalRecords = this.aeroRowsPagination.length;

        if (this.numberOfRecordsPage > 0) {

            pageNumber = (Math.ceil(this.totalRecords / this.numberOfRecordsPage) >= this.totalRecords ? this.totalRecords : Math.ceil(this.totalRecords / this.numberOfRecordsPage));
            let count: number = 1;
            this.pages = [];
            while (count <= pageNumber) {

                this.pages.push({ id: count });
                count++;
            }

        } else if (this.numberOfRecordsPage <= 0) {
            pageNumber = 1;
        };

        return pageNumber;
    };



}