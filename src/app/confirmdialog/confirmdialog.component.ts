import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
    selector: "confirmdialog",
    templateUrl: "./confirmdialog.component.html",
    styleUrls: ["./confirmdialog.component.css"]
})
export class ConfirmDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<ConfirmDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public message: string
    ) { }
    onNoClick(): void {
        this.dialogRef.close();
    }
}
