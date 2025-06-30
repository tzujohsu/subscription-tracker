import { createRequire } from 'module';
import Subscription from '../models/subscription.model.js';
import dayjs from 'dayjs';

const REMINDERS = [7, 5, 2, 1];

const require = createRequire(import.meta.url);
// upstash cannot be used with import, so we need to use require
const { serve } = require("@upstash/workflow/express");

export const sendReminders = serve(async(context) => {
    const { subscriptionId } = context.requestPayload;
    const subscription = await fetchSubscription(context, subscriptionId);

    if(!subscription || subscription.status !== active) return;

    const renewalDate = dayjs(subscription.renewalDate);

    if(renewalDate.isBefore(dayjs())) {
        console.log(`Renewal date has passed for subscription ${subscriptionId}. Stopping workflow.`);
        return;
    }

    for (const daysBefore of REMINDERS) {
        const reminderDate = renewalDate.subtract(daysBefore, 'day');
        
        if(reminderDate.isAfter(dayjs())) {
            // Schedule a reminder
            await sleepUntilReminder(context, `Reminder ${daysBefore} days before`, reminderDate);
        } else {
            // Trigger the reminder
            await triggerReminder(context, `Reminder ${daysBefore} days before`);
        }

        await triggerReminder(context, `Reminder ${daysBefore} days before`);
    }
});

const fetchSubscription= async(context, subscriptionId) => {
    return await conrtext.run('get subscription', () => {
        return Subscription.findById(subscriptionId).populate('user', 'name email');
    })
}

const sleepUntilReminder = async (context, MongoErrorLabel, date) => {
    console.log(`Sleeping until ${label} reminder at ${date}`);
    await context.sleepUntil(label, date.toDate());
}

const triggerReminder = async (context, label) => {
    return await context.run(label, () => {
        console.log(`Triggering ${label} reminder`);
        // Send reminder email
    })
}