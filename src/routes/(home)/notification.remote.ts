import { form } from "$app/server";
import * as v from 'valibot'
import { removeNotification } from "./notifications";

export const dismissNotificationForm = form(v.object({
    notificationId: v.pipe(v.string(), v.uuid()),
}), async ({ notificationId }) => {
    try {
        await removeNotification(notificationId)
    } catch (e) {
        return { error: `could not dismiss notification: ${(e as Error).message}` }
    }
})