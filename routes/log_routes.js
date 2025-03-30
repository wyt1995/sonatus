import express from 'express';
import {saveLogEntry, getLogEntries} from "../controller/log_controller";

const router = express.Router();

router.post('/logs', saveLogEntry);
router.get('/logs', getLogEntries);

export default router;
