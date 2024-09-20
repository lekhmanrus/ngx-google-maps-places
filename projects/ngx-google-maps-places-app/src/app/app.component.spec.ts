import { TestBed } from '@angular/core/testing';
import { MatIcon } from '@angular/material/icon';
import { MockComponent } from 'ng-mocks';
import { NgxGoogleMapsPlacesApiService } from 'ngx-google-maps-places-api';

import { initialize } from '../../../../mocks/jest-google-maps-places';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    initialize();

    await TestBed.configureTestingModule({
      imports: [ AppComponent ],
      declarations: [ MockComponent(MatIcon) ],
      providers: [ NgxGoogleMapsPlacesApiService ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have addressForm`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.addressForm).toBeDefined();
  });
});
