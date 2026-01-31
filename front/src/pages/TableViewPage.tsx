import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Upload, Download } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { getTableData, addRow, updateRow } from '../lib/api';
import { DataRow, TableDataResponse } from '../types';
import { DataTable } from '../components/DataTable';
import AddSequenceModal from '../components/AddSequenceModal';
import EditModal from '../components/EditModal';

export default function TableViewPage() {
  const { region, assembly } = useParams<{ region: string; assembly: string }>();
  const navigate = useNavigate();

  const [tableData, setTableData] = useState<TableDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<DataRow | null>(null);

  useEffect(() => {
    if (region && assembly) {
      loadTableData();
    }
  }, [region, assembly]);

  const loadTableData = async () => {
  if (!region || !assembly) return;

  try {
    setLoading(true);
    // Décodage des paramètres URL
    const decodedRegion = decodeURIComponent(region);
    const decodedAssembly = decodeURIComponent(assembly);
    
    console.log(`🔄 Chargement tableau: ${decodedRegion} - ${decodedAssembly}`);
    const data = await getTableData(decodedRegion, decodedAssembly);
    console.log('✅ Données reçues:', data);
    setTableData(data);
  } catch (error) {
    console.error('❌ Erreur chargement:', error);
    toast.error('Erreur lors du chargement du tableau');
    navigate('/');
  } finally {
    setLoading(false);
  }
};

  const handleAddRow = async (formData: Record<string, any>) => {
    if (!region || !assembly) return;

    try {
      console.log('🔄 Ajout ligne:', formData);
      await addRow(region, assembly, formData);
      toast.success('Ligne ajoutée');
      setAddModalOpen(false);
      await loadTableData();
    } catch (error: any) {
      console.error('❌ Erreur ajout:', error);
      if (error.error === 'duplicate') {
        toast.error('Cette ligne existe déjà');
      } else {
        toast.error('Erreur lors de l\'ajout');
      }
    }
  };

  const handleEdit = (row: DataRow) => {
    console.log('✏️ Édition ligne:', row);
    setEditingRow(row);
    setEditModalOpen(true);
  };

  const handleEditSave = async (rowIndex: number, formData: Record<string, any>) => {
    if (!region || !assembly) return;

    try {
      console.log(`🔄 Modification ligne ${rowIndex}:`, formData);
      await updateRow(region, assembly, rowIndex, formData);
      toast.success('Ligne modifiée');
      setEditModalOpen(false);
      setEditingRow(null);
      await loadTableData();
    } catch (error) {
      console.error('❌ Erreur modification:', error);
      toast.error('Erreur lors de la modification');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f6f7] to-[#e8eaed] flex items-center justify-center">
        <div className="text-[#6b7280] tracking-tight flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00c853]"></div>
          Chargement du tableau...
        </div>
      </div>
    );
  }

  if (!tableData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f6f7] to-[#e8eaed]">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white border-b border-[#d1d5db] shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-[#f0fdf4] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[#6b7280]" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[#1b5e20] tracking-tight">
                  {region} - {assembly}
                </h1>
                <p className="text-sm text-[#6b7280]">
                  {tableData.meta.total_rows} ligne{tableData.meta.total_rows !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <button
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#00c853] text-white rounded-lg hover:bg-[#4caf50] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter une ligne
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {tableData.rows.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-[#d1d5db] p-12 text-center">
            <p className="text-[#6b7280] mb-4">Aucune ligne dans ce tableau</p>
            <button
              onClick={() => setAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#00c853] text-white rounded-lg hover:bg-[#4caf50] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Ajouter la première ligne
            </button>
          </div>
        ) : (
          <DataTable
            headers={tableData.headers}
            data={tableData.rows}
            onEdit={handleEdit}
          />
        )}
      </main>

      {/* Modals */}
      <AddSequenceModal
  open={addModalOpen}
  onClose={() => setAddModalOpen(false)}
  headers={tableData.headers.filter(h => h !== "Region" && h !== "Assembly")}
  onComplete={handleAddRow}
/>

      <EditModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingRow(null);
        }}
        headers={tableData.headers}
        row={editingRow}
        onSave={handleEditSave}
      />
    </div>
  );
}