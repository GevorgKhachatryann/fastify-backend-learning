import { zodToJsonSchema } from 'zod-to-json-schema';
import type { ZodType } from 'zod';

export function toJsonSchema(schema: ZodType<any>) {
  return zodToJsonSchema(schema as any, { target: 'openApi3' });
}