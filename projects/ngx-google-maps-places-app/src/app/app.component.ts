import { ChangeDetectionStrategy, Component } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatLineModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgxGoogleMapsPlacesAutocompleteDirective } from 'ngx-google-maps-places-autocomplete';

/** The main application component. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  standalone: true,
  imports: [
    JsonPipe,
    FormsModule,
    ReactiveFormsModule,
    GoogleMapsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatLineModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatToolbarModule,
    NgxGoogleMapsPlacesAutocompleteDirective
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  /** Address reactive form. */
  public readonly addressForm = new FormGroup({
    address: new FormControl<string>('', [ Validators.required ]),
    streetNumber: new FormControl<string>('', [ Validators.required ]),
    street: new FormControl<string>('', [ Validators.required ]),
    city: new FormControl<string>('', [ Validators.required ]),
    region: new FormControl<string>('', [ Validators.required ]),
    regionCode: new FormControl<string>('', [ Validators.required ]),
    country: new FormControl<string>('', [ Validators.required ]),
    countryCode: new FormControl<string>('', [ Validators.required ]),
    postalCode: new FormControl<string>('', [ Validators.required ]),
    addressLine2: new FormControl<string>('')
  });
}
