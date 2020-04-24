import {
    Component,
    OnInit
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { map }                from 'rxjs/operators';
import { UserService } from '../services/user.service';

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    form: FormGroup;
    public loginInvalid: boolean;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private userService: UserService,
        private route: ActivatedRoute
    ) {
        this.form = this.fb.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
    }
    async ngOnInit() {
        if (await this.userService.isAuthenticated()) {
            this.route.queryParamMap.subscribe(p => {
                if(p.has('route')){
                    this.router.navigate([p.get('route')]);
                }
                else{
                    this.router.navigate(['rss']);
                }
            });            
        }
    }
    async onSubmit() {
        this.loginInvalid = false;
        if (this.form.valid) {
            try {
                if (await this.userService.login(this.form.value).toPromise()) {
                    await this.router.navigate(['rss']);
                }
                else {
                    this.loginInvalid = true;
                }
            } catch (err) {
                this.loginInvalid = true;
            }
        }
    }

}
