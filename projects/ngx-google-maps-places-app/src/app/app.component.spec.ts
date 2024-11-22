import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIcon } from '@angular/material/icon';
import { NgxGoogleMapsPlacesApiService } from 'ngx-google-maps-places-api';

import { initialize } from '../../../../mocks/jest-google-maps-places';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(async () => {
    initialize();

    await TestBed
      .configureTestingModule({
        imports: [ AppComponent, MatIcon ],
        providers: [ NgxGoogleMapsPlacesApiService ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(component).toBeDefined();
  });

  it(`should have addressForm`, () => {
    expect(component.addressForm).toBeDefined();
  });
});
