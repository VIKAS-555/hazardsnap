/**
 * Security & Anti-Malware Defense Layer for HazardSnap
 * Protects against:
 * 1. Malicious executable uploads & masqueraded binaries (magic bytes verification)
 * 2. Stored Cross-Site Scripting (XSS) & HTML injection in civic reports
 * 3. Buffer overflow / DoS file bombs
 */

export interface FileValidationResult {
  valid: boolean;
  isValid: boolean;
  error?: string;
  sanitizedFileName?: string;
}

// Strictly allowed MIME types for civic evidence
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

// Dangerous extensions known for malware execution
const DANGEROUS_EXTENSIONS = new Set([
  'exe', 'bat', 'cmd', 'sh', 'vbs', 'scr', 'msi', 'dll', 'com', 'pif',
  'ps1', 'apk', 'php', 'phtml', 'jsp', 'asp', 'aspx', 'cgi', 'pl',
  'jar', 'war', 'bin', 'elf', 'wsf', 'hta', 'cpl', 'iso', 'img', 'dmg'
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB max

/**
 * Validates file headers (magic bytes) to ensure file is genuinely an image
 * and not an executable / script masquerading as .jpg/.png
 */
export async function validateUploadedFile(file: File): Promise<FileValidationResult> {
  // 1. Check file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      isValid: false,
      error: 'File exceeds maximum safe size limit of 5MB.',
    };
  }

  // 2. Check extension against dangerous executables
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  if (DANGEROUS_EXTENSIONS.has(extension)) {
    return {
      valid: false,
      isValid: false,
      error: `Security Alert: Executable file extension (.${extension}) blocked to protect system against malware.`,
    };
  }

  // 3. Check declared MIME type
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return {
      valid: false,
      isValid: false,
      error: 'Invalid file format. Only verified JPEG, PNG, and WebP images are permitted.',
    };
  }

  // 4. Magic bytes inspection (read first 8 bytes of the binary)
  try {
    const buffer = await file.slice(0, 12).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // JPEG signature: FF D8 FF
    const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;

    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    const isPng =
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a;

    // WEBP signature: "RIFF" .... "WEBP"
    const isWebp =
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50;

    if (!isJpeg && !isPng && !isWebp) {
      return {
        valid: false,
        isValid: false,
        error: 'Security Warning: File signature does not match safe image headers (Potential disguised binary).',
      };
    }
  } catch (err) {
    return {
      valid: false,
      isValid: false,
      error: 'Integrity check failed. Unable to inspect file header.',
    };
  }

  // Sanitize filename to prevent path traversal
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

  return { valid: true, isValid: true, sanitizedFileName };
}

/**
 * Strips HTML tags, script injection patterns, and dangerous protocol handlers
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // remove iframes
    .replace(/javascript:[^"'\s]*/gi, '') // remove javascript: URIs
    .replace(/data:text\/html[^"'\s]*/gi, '') // remove data:html
    .replace(/on\w+\s*=/gi, '') // remove inline event handlers (onerror=, onclick=)
    .replace(/[<>]/g, '') // remove raw bracket characters
    .trim();
}
