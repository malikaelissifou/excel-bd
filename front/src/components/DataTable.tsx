import { Edit2 } from 'lucide-react';
import { DataRow } from '../types';

interface DataTableProps {
  headers: string[];
  data: DataRow[];
  onEdit: (row: DataRow) => void;
}

export function DataTable({ headers, data, onEdit }: DataTableProps) {
  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === '') return '—';
    
    // Détection automatique des dates (format ISO ou timestamp)
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      try {
        return new Date(value).toLocaleDateString('fr-FR');
      } catch {
        return value;
      }
    }
    
    return value.toString();
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-md border border-[#d1d5db] overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#e0f2f1] border-b border-[#d1d5db]">
                {headers.map((header) => (
                  <th 
                    key={header} 
                    className="px-4 py-3 text-left text-[#1b5e20] tracking-tight whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-[#1b5e20] tracking-tight sticky right-0 bg-[#e0f2f1]">
                  actions
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr 
                  key={row.__row_index} 
                  className={`border-b border-[#e5e7eb] transition-colors hover:bg-[#e8f5e9] ${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#f9fafb]'
                  }`}
                >
                  {headers.map((header) => (
                    <td key={header} className="px-4 py-3.5 text-[#374151] tracking-tight">
                      {formatValue(row[header])}
                    </td>
                  ))}
                  <td className="px-4 py-3.5 text-right sticky right-0 bg-inherit">
                    <button
                      onClick={() => onEdit(row)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#6b7280] hover:text-[#00c853] hover:bg-[#f0fdf4] rounded transition-all duration-200"
                      aria-label={`Modifier ligne ${row.__row_index}`}
                    >
                      <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                      edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}