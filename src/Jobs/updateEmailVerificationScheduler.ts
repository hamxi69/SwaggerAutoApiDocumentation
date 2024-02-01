import moment from 'moment';
import * as cron from 'node-cron';
import { EmailVerificationModel } from '../Models/EmailVerificationModel/EmailVerificationModel';

const runUpdateEmailSchedulerJob = async () => {
    try {
        const twelveHoursAgo = moment().subtract(12, 'hours').toDate();

        const result = await EmailVerificationModel.updateMany(
            {
                IsActive: true,
                CreatedOn: { $lte: twelveHoursAgo },
            },
            {
                $set: { IsActive: false }
            }
        );

        if (result.modifiedCount > 0) {
            console.log(`Updated ${result.modifiedCount} documents older than 12 hours to set isActive as false at ${moment().format()}`);
        } else {
            console.log('Already all documents have status false');
        }
    } catch (error) {
        console.error('Error in email scheduler job:', error);
    }
};

const emailSchedulerJob = async () => {
    try {
        const task = cron.schedule('0 */6 * * *', async () => {
            await runUpdateEmailSchedulerJob();
        });

        await runUpdateEmailSchedulerJob();

        return task;
    } catch (error) {
        console.error('Error initializing email scheduler job:', error);
    }
};

export { emailSchedulerJob };
