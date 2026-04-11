import { NotFoundError } from "../../common/errors";
import * as addressesRepo from "./addresses.repository";
import type { CreateAddressDTO, UpdateAddressDTO } from "./addresses.dto";

export async function getAddressesForEntity(entityType: string, entityId: string) {
  return addressesRepo.findAddressesByEntity(entityType, entityId);
}

export async function createAddress(data: CreateAddressDTO) {
  return addressesRepo.createAddress(data);
}

export async function updateAddress(addressId: string, data: UpdateAddressDTO) {
  const address = await addressesRepo.findAddressById(addressId);
  if (!address) {
    throw new NotFoundError("Address not found", "ADDRESS_NOT_FOUND");
  }
  return addressesRepo.updateAddress(addressId, data);
}

export async function deleteAddress(addressId: string) {
  const address = await addressesRepo.findAddressById(addressId);
  if (!address) {
    throw new NotFoundError("Address not found", "ADDRESS_NOT_FOUND");
  }
  await addressesRepo.softDeleteAddress(addressId);
}
