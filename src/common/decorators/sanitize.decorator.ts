import { SetMetadata } from '@nestjs/common';
export const SANITIZE_RESPONSE = 'sanitize_response';
export const SanitizeResponse = () => SetMetadata(SANITIZE_RESPONSE, true);
