import { Router, type IRouter } from "express";
import healthRouter from "./health";
import novaRouter from "./nova";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(novaRouter);
router.use(storageRouter);

export default router;
