import { Router } from "express";
import { testMicrosoftScraper } from "../controllers/scraper.controller";

const router = Router();

router.get("/microsoft", testMicrosoftScraper);

export default router;