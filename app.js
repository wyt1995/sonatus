import express from 'express';
import log_routes from "./routes/log_routes";
import error_handler from "./utils/error_handler";

const app = express();

app.use(express.json());
app.use('/', log_routes);
app.use(error_handler);

export default app;
