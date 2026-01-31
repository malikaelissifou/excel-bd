// Types pour système multi-tableaux

export interface Table {
  region: string;
  assembly: string;
  sheet_name: string;
  total_rows: number;
  total_columns: number;
}

export interface TableListResponse {
  tables: Table[];
  total: number;
}

export interface DataRow {
  __row_index: number;
  [key: string]: any;
}

export interface TableDataResponse {
  region: string;
  assembly: string;
  headers: string[];
  rows: DataRow[];
  meta: {
    total_rows: number;
    total_columns: number;
  };
}

export interface ImportResult {
  success: boolean;
  tables_added: number;
  tables_merged: number;
  rows_added: number;
  rows_skipped: number;
  errors: Array<{
    sheet: string;
    error: string;
    message: string;
  }>;
  message: string;
}

export interface ApiError {
  error: string;
  message?: string;
  expected?: string[];
  found?: string[];
}