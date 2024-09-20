/** Defines the keys that can be used in the `AddressModel` type. */
export type AddressKey
  = 'streetNumber' | 'postalCode' | 'street' | 'region' | 'city' | 'countryCode' | 'country';

/**
 * Defines a type for an address model, where the values can be of type `T`.
 * The keys that can be used in the `AddressModel` type are defined in the `AddressKey` type.
 * @template T The type of the values in the address model.
 */
export type AddressModel<T = string> = {
  [key in AddressKey]: T;
};
