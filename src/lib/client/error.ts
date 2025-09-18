import type { enhance, } from '$app/forms';
import { writable } from 'svelte/store';

export const errorState = writable<null | string>(null);