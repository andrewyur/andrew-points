import { writable } from 'svelte/store';

export const errorState = writable<null | string>(null);