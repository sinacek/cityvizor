import { Component, OnInit, TemplateRef } from '@angular/core';
import { ProfileService } from 'app/services/profile.service';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { Profile, BudgetYear } from 'app/schema';
import { Observable, BehaviorSubject } from 'rxjs';
import { AdminService } from 'app/services/admin.service';

@Component({
  selector: 'admin-profile-data',
  templateUrl: './admin-profile-data.component.html',
  styleUrls: ['./admin-profile-data.component.scss']
})
export class AdminProfileDataComponent implements OnInit {

  profile$: Observable<Profile>;

  profileId: number;

  years: BudgetYear[] = [];

  currentYear: number;

  loading: boolean = false;

  modalRef: BsModalRef;

  constructor(
    private profileService: ProfileService,
    private adminService: AdminService,
    private modalService: BsModalService
  ) { }

  ngOnInit() {
    this.profile$ = this.profileService.profile;


    this.profile$.pipe(map(profile => profile.id), distinctUntilChanged()).subscribe(profileId => {
      this.profileId = profileId;
      this.loadYears(profileId)
    });
  }

  async loadYears(profileId: number | null) {
    this.years = [];

    if (!profileId) return;

    this.loading = true;
    this.years = await this.adminService.getProfileYears(profileId);
    this.loading = false;

    this.years.sort((a, b) => a.year - b.year);
  }

  openModal(modal: TemplateRef<any>) {
    if (this.modalRef) this.modalRef.hide();
    this.modalRef = this.modalService.show(modal);
  }

  closeModal(changed: boolean) {
    this.modalRef.hide();
    delete this.modalRef;

    if (changed) this.loadYears(this.profileId);
  }

  async hideYear(year: BudgetYear) {
    await this.adminService.updateProfileYear(this.profileId, year.year, { hidden: true });
    year.hidden = true;
  }

  async publishYear(year: BudgetYear) {
    await this.adminService.updateProfileYear(this.profileId, year.year, { hidden: false });
    year.hidden = false;
  }

}
