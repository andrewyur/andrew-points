import type { RequestHandler } from '@sveltejs/kit';
import { runJobs } from './cron';
import { CRON_SECRET } from '$env/static/private';


export const GET: RequestHandler = async ({ url }) => {
    const secret = url.searchParams.get('secret');
    if (secret !== CRON_SECRET) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        await runJobs();
        return new Response('Cron jobs executed', { status: 200 });
    } catch (err) {
        console.error('Cron error', err);
        return new Response('Error executing cron jobs', { status: 500 });
    }
};
