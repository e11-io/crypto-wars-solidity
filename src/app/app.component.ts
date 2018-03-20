import { Component } from '@angular/core';
import { Router, NavigationEnd, UrlSegment, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import 'rxjs/add/operator/skip';
import 'rxjs/add/observable/combineLatest';

import { Store } from '@ngrx/store';
import { Web3Actions } from '../core/web3/web3.actions';
import { UserState } from '../core/user/user.reducer';
import { Web3State } from '../core/web3/web3.reducer';

import { AbstractContainerComponent } from './shared/components/abstract-container.component';
import { ContractsService } from './shared/services/contracts.service';
import { Web3Service } from './shared/services/web3.service';
import { CryptoWarsState } from './app.reducer';

import { BuildingsActions } from '../core/buildings/buildings.actions';

import * as packageJson from '../../package.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent  extends AbstractContainerComponent {

  appVersion: number = (<any>packageJson).version;

  childNavDisabled: boolean = false;
  e11Balance: any;
  ethBalance: any;
  error: string;
  section = 'village';
  lastBlock: number;
  status: any = {};
  locationData: UrlSegment;
  loading: boolean = true;
  navbarEnabled: boolean;
  userResources: any;

  web3State$: Observable<Web3State>;
  userState$: Observable<UserState>;

  constructor(private contracts: ContractsService,
              private web3Service: Web3Service,
              public store: Store<CryptoWarsState>,
              private router: Router,
              private route: ActivatedRoute,
              private translate: TranslateService) {
    super(store);
    translate.setDefaultLang('en');
    translate.use('en');
    this.addToSubscriptions(
      this.setBalances(),
      this.setWeb3(),
      this.setBuildingsState(),
      this.setUserResources(),
      this.router.events.filter(event => event instanceof NavigationEnd).subscribe((event: NavigationEnd) => {
        this.navbarEnabled = route.root.firstChild.snapshot.data['navbar'];
        this.childNavDisabled = route.root.firstChild.snapshot.data['childNavigationDisabled'];
      }),
    );
  }

  ngOnInit(): void {
    this.store.dispatch(new Web3Actions.Bootstrap());
  }

  mineBlock() {
    this.web3Service.mineBlock();
  }

  changeSection(section) {
    this.section = section;
  }

  getAccounts() {
    this.store.dispatch(new Web3Actions.GetAccounts());
  }

  startPull() {
    this.store.dispatch(new Web3Actions.StartPull);
  }

  setBalances() {
    this.userState$ = this.store.select('userState');
    return this.userState$.subscribe(user => {
      this.ethBalance = user.ethBalance;
      this.e11Balance = user.e11Balance;
    });
  }

  setUserResources() {
    return this.store.select('userResourcesState').subscribe(userResources => {
      this.userResources = userResources;
    });
  }

  setWeb3() {
    this.web3State$ = this.store.select('web3State');
    return this.web3State$.distinctUntilChanged().subscribe((web3) => {
      let error = web3.error;
      if (!error) {
        this.error = null;
        this.loading = !web3.bootstraped;
        return;
      }
      this.loading = false;
      switch (error) {
        case 'invalid_state':
        case 'loading':
          this.loading = true;
          break;
        case 'mainnet':
        case 'not_e11_poa':
          this.error = 'not_e11_poa';
          break;
        case 'locked':
          this.error = 'locked';
          break;
        case 'no_web3_provider':
          this.error = 'no_web3_provider';
          break;
        case 'metamask_error':
          this.error = 'metamask_error';
          break;
        default:
          console.log('unexpected error: ', error);
          this.error = 'metamask_error';
      }
    });
  }

  setBuildingsState() {
    return Observable.combineLatest(
      this.store.select('buildingsDataState').map(s => s.buildings).distinctUntilChanged(),
      this.store.select('userBuildingsState').map(s => s.buildings).distinctUntilChanged(),
      this.store.select('buildingsQueueState').map(s => s.buildings).distinctUntilChanged(),
      this.store.select('buildingsQueueState').map(s => s.localBuildings).distinctUntilChanged(),
      this.store.select('web3State').map(s => s.lastBlock).distinctUntilChanged()
    ).subscribe(data => {
      let obj = {
        buildingsData: Object.values(data[0]),
        userBuildings: data[1],
        buildingsQueue: data[2],
        localBuildings: data[3],
        blockNumber: data[4]
      }
      if (!obj.buildingsData.length || !obj.userBuildings.length || !obj.blockNumber) {
        return;
      }
      this.store.dispatch(new BuildingsActions.SetBuildings(obj));
    })
  }

}
