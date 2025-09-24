import { writable } from 'svelte/store';

export const errorState = writable<null | string>(null);
export const infoState = writable<null | string>(null);