/**
 * @file Volunteers Routes - Placeholder
 */

import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import * as volunteersController from "./controller";

const router = Router();

router.post("/", authenticate, volunteersController.createVolunteerApplication);

export default router;
