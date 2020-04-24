import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  NgZone
} from '@angular/core';
import { MatSort, SortDirection, MatSortHeader } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Rss } from '../../model/rss';
import { Search } from '../../model/search';
import { RssService } from '../../services/rss.service';
import { PreferenceService } from '../../services/preference.service';
import { GlobalConstants } from '../../services/globals-constants';
import { RssDialogComponent } from '../../rssdialog/rssdialog.component';
import { ConfirmDialogComponent } from '../../confirmdialog/confirmdialog.component';

@Component({
  selector: 'rsstable',
  templateUrl: './rsstable.component.html',
  styleUrls: ['./rsstable.component.css']
})
export class RssTableComponent implements OnInit, AfterViewInit {
  rss: Rss;
  search: Search;
  dataSource: MatTableDataSource<Rss>;

  displayedColumns = GlobalConstants.displayedColumns;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('namefilter') nameFilter: ElementRef;
  @ViewChild('startfilter') startFilter: ElementRef;
  @ViewChild('prefilter') preFilter: ElementRef;
  @ViewChild('ratingfilter') ratingFilter: ElementRef;
  @ViewChild('descriptionfilter') descriptionFilter: ElementRef;
  @ViewChild('typefilter') typeFilter: ElementRef;
  @ViewChild('checkfilter') checkFilter: ElementRef;

  constructor(
    private rssService: RssService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private _ngZone: NgZone,
    private prefService: PreferenceService
  ) { }
  ngOnInit() {
    this.dataSource = new MatTableDataSource<Rss>();
    this.dataSource.filterPredicate = this.createFilter();
    this.search = {
      name: '',
      start: '',
      pre: '',
      rating: '',
      description: '',
      _check: '',
      _type: '',
      overall: ''
    };
    this.dataSource.paginator = this.paginator;
    this.loadRss(false);
  }
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.rssService.getData().subscribe(data => {
      if (data['data'].length > 0) {
        this._ngZone.run(() => this.loadRss(false));
      }
    });

    this.prefService.findPreferenceByCurrentUser().subscribe(p => {
      if (p.filterCol != '') {
        switch (p.filterCol) {
          case 'name':
            this.nameFilter.nativeElement.value = p.filterVal;
            break;
          case 'start':
            this.startFilter.nativeElement.value = p.filterVal;
            break;
          case 'pre':
            this.preFilter.nativeElement.value = p.filterVal;
            break;
          case 'rating':
            this.ratingFilter.nativeElement.value = p.filterVal;
            break;
          case 'description':
            this.descriptionFilter.nativeElement.value = p.filterVal;
            break;
          case '_check':
            this.checkFilter.nativeElement.value = p.filterVal;
            break;
          case '_type':
            this.typeFilter.nativeElement.value = p.filterVal;
            break;
        }
        this.filterColumn(p.filterCol, p.filterVal);
      }

      this.sort.direction = p.sortDir.toLowerCase() as SortDirection;
      this.sort.active = p.sortCol;
      this.sort.sortChange.emit();
      const header = this.sort.sortables.get(p.sortCol) as MatSortHeader;
      header._setAnimationTransitionState({ toState: 'active' });
    });
  }
  loadRss(display: boolean) {
    this.rssService.findAllRss().subscribe(rss => {
      if (rss == null) {
        this.dataSource.data = [];
      } else {
        this.dataSource.data = rss as Rss[];
      }
      this.dataSource._updateChangeSubscription();

      if (display) {
        this.snackBar.open('Data reloaded', null, {
          duration: 1 * 1000,
          verticalPosition: 'top',
          horizontalPosition: 'left',
          panelClass: ['green-snackbar']
        });
      }
    });
  }
  filterRss(value: string) {
    this.search.overall = value;
    this.dataSource.filter = JSON.stringify(this.search);
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  filterColumn(column: string, value: string) {
    this.search[column] = value;
    this.dataSource.filter = JSON.stringify(this.search);
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  runCheck() {
    this.rssService.runCheck().subscribe(result => {
      if (result['success']) {
        this.snackBar.open(result['msg'], null, {
          duration: 2 * 1000,
          verticalPosition: 'top',
          horizontalPosition: 'left',
          panelClass: ['green-snackbar']
        });
        this.loadRss(false);
      }
    });
  }
  check(data: Rss) {
    data.updateUrl = '';
    data._check = !data._check;

    this.rssService.updateRss(data).subscribe(updated => {
      if (updated != null) {
        const index = this.dataSource.data.findIndex(rss => rss.id == updated.id);
        this.dataSource.data[index] = updated;
        this.dataSource._updateChangeSubscription();
      }
    });
  }
  edit(data: Rss) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.disableClose = true;
    dialogConfig.data = { title: `Edit ${data.name}`, rss: data };
    dialogConfig.width = '800px';
    dialogConfig.height = '500px';
    const dialogRef = this.dialog.open(RssDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(val => {
      if (val != undefined && val != null) {
        this.rssService.updateRss(val).subscribe(updated => {
          if (updated != null) {
            const index = this.dataSource.data.findIndex(rss => rss.id == updated.id);
            this.dataSource.data[index] = updated;
            this.dataSource._updateChangeSubscription();
          }
        });
      }
    });
  }
  delete(data: Rss) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: `Are you sure you want to delete ${data.name}?`
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.rssService.deleteRss(data.id).subscribe(result => {
          if (result) {
            const index = this.dataSource.data.findIndex(rss => rss.id == data.id);
            this.dataSource.data.splice(index, 1);
            this.dataSource._updateChangeSubscription();
          }
        });
      }
    });
  }
  addEntry() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.disableClose = true;
    dialogConfig.data = { title: 'Add New Entry', rss: null };
    dialogConfig.width = '800px';
    dialogConfig.height = '500px';
    const dialogRef = this.dialog.open(RssDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(val => {
      if (val != undefined && val != null) {
        this.rssService.createRss(val).subscribe(added => {
          if (added != null) {
            this.dataSource.data.push(added);
            this.dataSource._updateChangeSubscription();
          }
        });
      }
    });
  }
  createFilter() {
    let filterFunction = function (data: any, filter: string): boolean {
      let searchTerms = JSON.parse(filter);
      let overall = null;
      let found = true;
      let overallFound = false;
      if (searchTerms.hasOwnProperty('overall')) {
        if (searchTerms.overall != null && searchTerms.overall != undefined && searchTerms.overall != '') {
          overall = searchTerms.overall.trim().toLowerCase();
        }
        else {
          overallFound = true;
        }
        delete searchTerms.overall;
      }
      else {
        overallFound = true;
      }

      Object.keys(searchTerms).forEach(column => {
        if (searchTerms[column] != null && searchTerms[column] != undefined && searchTerms[column] != '') {
          if (typeof (data[column]) == 'string') {
            found = found && data[column].toLowerCase().includes(searchTerms[column].trim().toLowerCase());
          }
          else if (typeof (data[column]) == 'boolean') {
            const val = searchTerms[column].trim().toLowerCase().startsWith('t');
            found = found && (data[column] == val);
          }
          else {
            found = found && (data[column] == searchTerms[column]);
          }
        }

        if (overall) {
          if (typeof (data[column]) == 'string') {
            overallFound = overallFound || data[column].toLowerCase().includes(overall);
          }
          else if (typeof (data[column]) != 'boolean') {
            overallFound = overallFound || (data[column] == overall);
          }
        }
      });

      return found && overallFound;
    };
    return filterFunction;
  }
}
