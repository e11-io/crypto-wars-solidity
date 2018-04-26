import { Component } from '@angular/core';
import { Router, NavigationEnd, UrlSegment, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/skip';
import 'rxjs/add/observable/combineLatest';

import * as packageJson from '../../package.json';

import { ContractsService } from '../core/shared/contracts.service';
import { PlayerResourcesState } from '../core/player/resources/player-resources.state';
import { PlayerState } from '../core/player/player.state';
import { Web3Actions } from '../core/web3/web3.actions';
import { Web3Service } from '../core/web3/web3.service';
import { Web3State } from '../core/web3/web3.state';

import { AbstractContainerComponent } from './shared/components/abstract-container.component';

import { CryptoWarsState } from './app.state';
import { AppActions } from './app.actions';

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
  lastBlock: number;
  loading: boolean = true;
  locationData: UrlSegment;
  navbarEnabled: boolean;
  section = 'village';
  status: any = {};
  playerResources: PlayerResourcesState;

  web3State$: Observable<Web3State>;
  playerState$: Observable<PlayerState>;

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
      this.setUnitsState(),
      this.setPlayerResources(),
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
    this.playerState$ = this.store.select('player');
    return this.playerState$.subscribe(player => {
      this.ethBalance = player.tokens.ethBalance;
      this.e11Balance = player.tokens.e11Balance;
    });
  }

  setPlayerResources() {
    return this.store.select(s => s.player.resources).subscribe(playerResources => {
      this.playerResources = playerResources;
    });
  }

  setWeb3() {
    this.web3State$ = this.store.select('web3');
    return this.web3State$.distinctUntilChanged().subscribe((web3) => {
      let error = web3.status.error;
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
      this.store.select(s => s.assets.buildings.data.listMap).distinctUntilChanged(),
      this.store.select(s => s.assets.buildings.queue.list).distinctUntilChanged(),
      this.store.select(s => s.assets.buildings.queue.localList).distinctUntilChanged(),
      this.store.select(s => s.assets.requirements.listMap).distinctUntilChanged(),
      this.store.select(s => s.player.assets.buildings.list).distinctUntilChanged(),
      this.store.select(s => s.web3.lastBlock).distinctUntilChanged(),
    )
    .subscribe(data => {
      let obj = {
        buildingsData: Object.values(data[0]),
        buildingsQueue: data[1],
        localBuildings: data[2],
        assetsRequirements: data[3],
        playerBuildings: data[4],
        blockNumber: data[5],
      }
      if (!obj.buildingsData.length || !obj.playerBuildings.length || !obj.blockNumber) {
        return;
      }
      this.store.dispatch(new AppActions.SetBuildings(obj));
    })
  }

  setUnitsState() {
    return Observable.combineLatest(
      this.store.select(s => s.app.buildingsList).distinctUntilChanged(),
      this.store.select(s => s.assets.units.data.listMap).distinctUntilChanged(),
      this.store.select(s => s.assets.units.queue.list).distinctUntilChanged(),
      this.store.select(s => s.assets.units.queue.localList).distinctUntilChanged(),
      this.store.select(s => s.assets.requirements.listMap).distinctUntilChanged(),
      this.store.select(s => s.player.assets.units.list).distinctUntilChanged(),
      this.store.select(s => s.web3.lastBlock).distinctUntilChanged(),
    )
    .subscribe(data => {
      let obj = {
        buildings: data[0],
        unitsData: Object.values(data[1]),
        unitsQueue: data[2],
        localUnits: data[3],
        assetsRequirements: data[4],
        playerUnits: data[5],
        blockNumber: data[6],
      }
      if (!obj.buildings.length || !obj.unitsData.length || !obj.blockNumber) {
        return;
      }
      this.store.dispatch(new AppActions.SetUnits(obj));
    })
  }

}
