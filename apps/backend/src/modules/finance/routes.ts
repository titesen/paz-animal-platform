/** @file Finance Routes - Placeholder */
import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import * as financeController from "./controller";

const router = Router();
router.post("/donations", authenticate, financeController.createDonation);

export default router;
