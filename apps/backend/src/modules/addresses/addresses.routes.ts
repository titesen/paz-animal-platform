import { Router } from "express";
import { validate } from "../../common/middlewares";
import { authenticate } from "../../common/middlewares/auth";
import * as addressesController from "./addresses.controller";
import {
  addressIdSchema,
  createAddressSchema,
  entityParamsSchema,
  updateAddressSchema,
} from "./addresses.dto";

const router = Router();

router.get(
  "/entity/:entityType/:entityId",
  authenticate,
  validate(entityParamsSchema, "params"),
  addressesController.getAddressesForEntity,
);

router.post("/", authenticate, validate(createAddressSchema), addressesController.createAddress);

router.patch(
  "/:addressId",
  authenticate,
  validate(addressIdSchema, "params"),
  validate(updateAddressSchema),
  addressesController.updateAddress,
);

router.delete(
  "/:addressId",
  authenticate,
  validate(addressIdSchema, "params"),
  addressesController.deleteAddress,
);

export default router;
