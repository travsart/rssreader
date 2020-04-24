import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { RssDialog } from "../model/rssdialog";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
    selector: 'rssdialog',
    templateUrl: './rssdialog.component.html',
    styleUrls: ['./rssdialog.component.css']
})
export class RssDialogComponent {
    form: FormGroup;
    title: string;
    id: number;
    user: string;

    constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<RssDialogComponent>, @Inject(MAT_DIALOG_DATA) data: RssDialog) {
        this.title = data.title;

        // Adding
        if (data.rss == null) {
            this.form = this.fb.group({
                name: ['', Validators.required],
                start: [1, [Validators.required, Validators.min(0)]],
                pre: [0, [Validators.required, Validators.min(0)]],
                rating: [0, [Validators.required, Validators.min(0), Validators.max(10)]],
                description: [''],
                _type: ['Manga', [Validators.required, Validators.pattern('Manga|Anime')]],
                updateUrl: [''],
                _check: [true, Validators.required]
            });
        }
        else {
            this.id = data.rss.id;
            this.user = data.rss.user;
            this.form = this.fb.group({
                name: [data.rss.name, Validators.required],
                start: [data.rss.start, [Validators.required, Validators.min(0)]],
                pre: [data.rss.pre, [Validators.required, Validators.min(0)]],
                rating: [data.rss.rating, [Validators.required, Validators.min(0), Validators.max(10)]],
                description: [data.rss.description],
                _type: [data.rss._type, [Validators.required, Validators.pattern('Manga|Anime')]],
                updateUrl: [data.rss.updateUrl],
                _check: [data.rss._check, Validators.required]
            });
        }
    }
    save() {
        if (this.form.valid) {
            this.form.value['user'] = this.user;
            this.form.value['id'] = this.id;
            this.dialogRef.close(this.form.value);
        }
        else {
            alert("Error: Missing required fields.");
        }
    }
    cancel() {
        this.dialogRef.close();
    }
}
