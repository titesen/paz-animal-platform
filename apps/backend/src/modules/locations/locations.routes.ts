import { Router } from "express";
import { validate } from "../../common/middlewares";
import { authenticate, requireRole } from "../../common/middlewares/auth";
import { publicLimiter } from "../../common/middlewares/rateLimiter";
import * as locationsController from "./locations.controller";
import { createCitySchema, createProvinceSchema, provinceIdSchema } from "./locations.dto";

const router = Router();

router.get("/countries", publicLimiter, locationsController.getAllCountries);
router.get("/currencies", publicLimiter, locationsController.getAllCurrencies);

router.get("/provinces", publicLimiter, locationsController.getAllProvinces);

router.post(
  "/provinces",
  authenticate,
  requireRole("ADMIN"),
  validate(createProvinceSchema),
  locationsController.createProvince,
);

router.get(
  "/provinces/:provinceId/cities",
  publicLimiter,
  validate(provinceIdSchema, "params"),
  locationsController.getCitiesByProvince,
);

router.post(
  "/cities",
  authenticate,
  requireRole("ADMIN"),
  validate(createCitySchema),
  locationsController.createCity,
);

export default router;
