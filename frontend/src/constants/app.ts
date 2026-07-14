// App-wide constants
export const APP_NAME = 'ExampForge';
export const APP_VERSION = '1.0.0';

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Timeouts (in milliseconds)
export const API_TIMEOUT = 30000;
export const TOAST_DURATION = 5000;
export const DEBOUNCE_DELAY = 300;
export const THROTTLE_DELAY = 1000;

// Validation
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_NAME_LENGTH = 50;
export const MAX_BIO_LENGTH = 500;
export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 2000;

// File uploads
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];

// Exam
export const MIN_EXAM_DURATION = 5; // minutes
export const MAX_EXAM_DURATION = 480; // minutes
export const MIN_PASSING_SCORE = 0;
export const MAX_PASSING_SCORE = 100;
export const DEFAULT_PASSING_SCORE = 70;

// UI
export const SIDEBAR_WIDTH = 256;
export const SIDEBAR_COLLAPSED_WIDTH = 64;
export const HEADER_HEIGHT = 64;
export const MOBILE_BREAKPOINT = 768;
export const TABLET_BREAKPOINT = 1024;
export const DESKTOP_BREAKPOINT = 1280;
