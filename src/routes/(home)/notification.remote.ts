import { form } from "$app/server";
import * as v from 'valibot'
import { clearAllNotifications, removeNotification } from "./notifications";
import { extractUser } from "$lib/server/user";

export const dismissNotificationForm = form(v.object({
    notificationId: v.pipe(v.string(), v.uuid()),
}), async ({ notificationId }) => {
    try {
        await removeNotification(notificationId)
    } catch (e) {
        return { error: `could not dismiss notification: ${(e as Error).message}` }
    }
})

export const clearAllNotificationsForm = form(v.object({}), async () => {
    try {
        const user = extractUser()

        await clearAllNotifications(user.id)
    } catch (e) {
        return { error: `could not dismiss notifications: ${(e as Error).message}` }
    }
})