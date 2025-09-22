import nodeCron from "node-cron";
import { checkExpirations } from "./checkExpirations";

// every 5 minutes
nodeCron.schedule('*/5 * * * *', async () => {
    await checkExpirations();
});