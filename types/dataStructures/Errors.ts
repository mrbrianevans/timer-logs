/**
 * Postgres error type thrown by pg library
 */
export type PostgresError = {
  message: string;
  errno: string;
  length: number;
  name: string;
  severity: string;
  code: string;
  detail?: string;
  hint?: string;
  position: string;
  internalPosition?: string;
  internalQuery?: string;
  where?: string;
  schema?: string;
  table?: string;
  column?: string;
  dataType?: string;
  constraint?: string;
  file: string;
  line: string;
  routine: string;
};
