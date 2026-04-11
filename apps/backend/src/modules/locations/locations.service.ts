import { NotFoundError } from "../../common/errors";
import * as locationsRepo from "./locations.repository";
import type { CreateCityDTO, CreateProvinceDTO } from "./locations.dto";

export async function getAllCountries(isActive?: boolean) {
  return locationsRepo.findAllCountries(isActive);
}

export async function getAllCurrencies() {
  return locationsRepo.findAllCurrencies();
}

export async function getAllProvinces() {
  return locationsRepo.findAllProvinces();
}

export async function createProvince(data: CreateProvinceDTO) {
  return locationsRepo.createProvince(data.name);
}

export async function getCitiesByProvince(provinceId: number) {
  const province = await locationsRepo.findProvinceById(provinceId);
  if (!province) {
    throw new NotFoundError("Province not found", "PROVINCE_NOT_FOUND");
  }
  return locationsRepo.findCitiesByProvince(provinceId);
}

export async function createCity(data: CreateCityDTO) {
  const province = await locationsRepo.findProvinceById(data.provinceId);
  if (!province) {
    throw new NotFoundError("Province not found", "PROVINCE_NOT_FOUND");
  }
  return locationsRepo.createCity(data);
}
