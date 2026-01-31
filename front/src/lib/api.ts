const BASE = import.meta.env.VITE_API_URL || 'http://10.43.240.107:8000';

// ============================================================================
// HELPERS
// ============================================================================

async function handleResponse(res: Response) {
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  if (!res.ok) {
    const err = json || { status: res.status, message: res.statusText };
    throw err;
  }
  return json;
}

function logDebug(endpoint: string, data: any) {
  console.log(`🔍 [API] ${endpoint}:`, data);
}

// ============================================================================
// TABLES MANAGEMENT
// ============================================================================

export async function getTables() {
  try {
    const res = await fetch(`${BASE}/tables`);
    const data = await handleResponse(res);
    logDebug('GET /tables', data);
    return data;
  } catch (error) {
    console.error('❌ [API] GET /tables error:', error);
    throw error;
  }
}

export async function createTable(region: string, assembly: string) {
  try {
    const res = await fetch(`${BASE}/tables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ region, assembly }),
    });
    const data = await handleResponse(res);
    logDebug('POST /tables', data);
    return data;
  } catch (error) {
    console.error('❌ [API] POST /tables error:', error);
    throw error;
  }
}

export async function deleteTable(region: string, assembly: string) {
  try {
    const res = await fetch(`${BASE}/tables/${encodeURIComponent(region)}/${encodeURIComponent(assembly)}`, {
      method: 'DELETE',
    });
    const data = await handleResponse(res);
    logDebug('DELETE /tables', data);
    return data;
  } catch (error) {
    console.error('❌ [API] DELETE /tables error:', error);
    throw error;
  }
}

// ============================================================================
// TABLE DATA
// ============================================================================

export async function getTableData(region: string, assembly: string) {
  try {
    const res = await fetch(`${BASE}/tables/${encodeURIComponent(region)}/${encodeURIComponent(assembly)}`);
    const data = await handleResponse(res);
    logDebug(`GET /tables/${region}/${assembly}`, data);
    
    // Ajouter __row_index aux lignes
    const rows = data.rows.map((row: any, index: number) => ({
      __row_index: index,
      ...row
    }));
    
    return { ...data, rows };
  } catch (error) {
    console.error(`❌ [API] GET /tables/${region}/${assembly} error:`, error);
    throw error;
  }
}

export async function getTableSchema(region: string, assembly: string) {
  try {
    const res = await fetch(`${BASE}/tables/${encodeURIComponent(region)}/${encodeURIComponent(assembly)}/schema`);
    const data = await handleResponse(res);
    logDebug(`GET /tables/${region}/${assembly}/schema`, data);
    return data.headers;
  } catch (error) {
    console.error(`❌ [API] GET schema error:`, error);
    throw error;
  }
}

// ============================================================================
// ROWS MANAGEMENT
// ============================================================================

export async function addRow(region: string, assembly: string, row: Record<string, any>) {
  try {
    const res = await fetch(`${BASE}/tables/${encodeURIComponent(region)}/${encodeURIComponent(assembly)}/rows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ row }),
    });
    const data = await handleResponse(res);
    logDebug('POST /rows', data);
    return data;
  } catch (error) {
    console.error('❌ [API] POST /rows error:', error);
    throw error;
  }
}

export async function updateRow(region: string, assembly: string, rowIndex: number, row: Record<string, any>) {
  try {
    const res = await fetch(`${BASE}/tables/${encodeURIComponent(region)}/${encodeURIComponent(assembly)}/rows/${rowIndex}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ row }),
    });
    const data = await handleResponse(res);
    logDebug('PUT /rows', data);
    return data;
  } catch (error) {
    console.error('❌ [API] PUT /rows error:', error);
    throw error;
  }
}

// ============================================================================
// IMPORT / EXPORT
// ============================================================================

export async function importExcel(file: File) {
  try {
    const form = new FormData();
    form.append('file', file);

    const res = await fetch(`${BASE}/import-excel`, {
      method: 'POST',
      body: form,
    });

    const data = await handleResponse(res);
    logDebug('POST /import-excel', data);
    return data;
  } catch (error) {
    console.error('❌ [API] POST /import-excel error:', error);
    throw error;
  }
}

export async function downloadDatabase() {
  try {
    window.open(`${BASE}/download`, '_blank');
  } catch (error) {
    console.error('❌ [API] GET /download error:', error);
    throw error;
  }
}