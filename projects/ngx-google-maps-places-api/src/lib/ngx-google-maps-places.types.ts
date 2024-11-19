/** Defines the keys that can be used in the `AddressModel` type. */
export type AddressKey = 'streetNumber' | 'postalCode' | 'street' | 'region' | 'regionCode'
  | 'city' | 'countryCode' | 'country' | 'addressLine2';

/**
 * Defines a type for an address model, where the values can be of type `T`.
 * The keys that can be used in the `AddressModel` type are defined in the `AddressKey` type.
 * @template T The type of the values in the address model.
 */
export type AddressModel<T = string> = Record<AddressKey, T>;
