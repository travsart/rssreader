import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource, MatTable } from '@angular/material/table';

import { Rss } from '../../model/rss';
import { RssService } from '../../services/rss.service';
import { PreferenceService } from '../../services/preference.service';
import { GlobalConstants } from '../../services/globals-constants';
import { RssDialogComponent } from '../../rssdialog/rssdialog.component';
import { ConfirmDialogComponent } from '../../confirmdialog/confirmdialog.component';

@Component({
  selector: 'rsscard',
  templateUrl: './rsscard.component.html',
  styleUrls: ['./rsscard.component.css']
})
export class RssCardComponent implements OnInit {
  dataSource: MatTableDataSource<Rss>;
  @ViewChild('filterinput', { static: true }) input: ElementRef;
  @ViewChild(MatTable, { static: true }) matTable: MatTable<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  sort = 'name';
  dir = 'ASC';
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 100];
  displayedColumns = ['card'];
  selectColumns = GlobalConstants.mobileColumns;

  constructor(
    private rssService: RssService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private prefService: PreferenceService
  ) { }
  ngOnInit() {
    this.dataSource = new MatTableDataSource<Rss>();
    this.dataSource.paginator = this.paginator;
    this.prefService.findPreferenceByCurrentUser().subscribe(p => {
      if (p.filterCol != '') {
        this.input.nativeElement.value = p.filterVal;
        this.filterRss(p.filterVal);
      }
      this.sort = p.sortCol;
      this.dir = p.sortDir;
      this.loadRss(false);
    });
  }
  loadRss(display: boolean) {
    this.rssService.findAllRssEx(this.sort, this.dir).subscribe(rss => {
      if (rss == null) {
        this.dataSource.data = [];
      } else {
        this.dataSource.data = rss as Rss[];
      }
      this.dataSource._updateChangeSubscription();
      this.matTable.renderRows();
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
    this.dataSource.filter = value.trim().toLowerCase();
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
        this.matTable.renderRows();
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
      this.rssService.updateRss(val).subscribe(updated => {
        if (updated != null) {
          const index = this.dataSource.data.findIndex(rss => rss.id == updated.id);
          this.dataSource.data[index] = updated;
          this.dataSource._updateChangeSubscription();
          this.matTable.renderRows();
        }
      });
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
            this.matTable.renderRows();
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
      this.rssService.createRss(val).subscribe(added => {
        if (added != null) {
          this.dataSource.data.push(added);
          this.dataSource._updateChangeSubscription();
          this.matTable.renderRows();
        }
      });
    });
  }
}
