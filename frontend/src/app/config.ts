import { isDevMode } from '@angular/core';

export const API_URL = isDevMode() ? 'http://localhost:5001' : '';
