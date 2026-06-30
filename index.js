import 'dotenv/config';
import cron from 'node-cron';
import { run } from './pipeline.js';

cron.schedule('0 */6 * * *', run);

console.log('Scheduler started — running every 6 hours');
run();
