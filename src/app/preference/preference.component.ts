import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder } from '@angular/forms';

import { PreferenceService } from '../services/preference.service';
import { GlobalConstants } from '../services/globals-constants';
import { Preference } from '../model/preference';

@Component({
    selector: 'preference',
    templateUrl: './preference.component.html',
    styleUrls: ['./preference.component.css']
})
export class PreferenceComponent {
    form: FormGroup;
    pref: Preference;
    sortDir: boolean;
    selectColumns = GlobalConstants.selectColumns;
    
    constructor(
        private fb: FormBuilder,
        private preferenceService: PreferenceService,
        private snackBar: MatSnackBar
    ) {
        this.form = this.fb.group({
            sortCol: ['name'],
            sortDir: [this.sortDir],
            filterCol: [''],
            filterVal: ['']
        });
        this.sortDir = true;
        this.preferenceService.findPreferenceByCurrentUser().subscribe(pref => {
            this.pref = pref;
            this.reset();
        });
    }
    save() {
        if (this.form.valid) {
            this.form.value['user'] = this.pref.user;
            this.form.value['id'] = this.pref.id;
            this.form.value['sortDir'] = (this.form.value['sortDir']) ? 'DESC' : 'ASC';
            this.preferenceService.updatePreference(this.form.value).subscribe(p => {
                if (p.hasOwnProperty('code')) {
                    alert(`Preference failed to update. Message: ${p['message']} Details: ${p['details']}`)
                } else {
                    this.snackBar.open('Preference Updated', null, {
                        duration: 2 * 1000,
                        verticalPosition: 'top',
                        horizontalPosition: 'left',
                        panelClass: ['green-snackbar']
                    });
                }
            });
        }
    }
    reset() {
        this.sortDir = (this.pref.sortDir == 'DESC')
        this.form.patchValue({
            sortCol: this.pref.sortCol,
            sortDir: this.sortDir,
            filterCol: this.pref.filterCol,
            filterVal: this.pref.filterVal
        });
    }
}
