import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Database, Trash2, Download, Upload, AlertCircle } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { getTables, createTable, deleteTable, downloadDatabase } from '../lib/api';
import { Table } from '../types';
import CreateTableModal from '../components/CreateTableModal';
import ImportModal from '../components/ImportModal';

export default function HomePage() {
  const navigate = useNavigate();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des tableaux...');
      const response = await getTables();
      console.log('✅ Tableaux reçus:', response);
      setTables(response.tables || []);
    } catch (error) {
      console.error('❌ Erreur chargement tableaux:', error);
      toast.error('Erreur lors du chargement des tableaux');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTable = async (region: string, assembly: string) => {
    try {
      console.log(`🔄 Création tableau: ${region} - ${assembly}`);
      await createTable(region, assembly);
      toast.success(`Tableau "${region} - ${assembly}" créé`);
      setCreateModalOpen(false);
      await loadTables();
    } catch (error: any) {
      console.error('❌ Erreur création:', error);
      if (error.status === 409) {
        toast.error('Ce tableau existe déjà');
      } else {
        toast.error('Erreur lors de la création');
      }
    }
  };

  const handleDeleteTable = async (region: string, assembly: string) => {
    if (!confirm(`Supprimer le tableau "${region} - ${assembly}" ?`)) return;

    try {
      console.log(`🔄 Suppression: ${region} - ${assembly}`);
      await deleteTable(region, assembly);
      toast.success('Tableau supprimé');
      await loadTables();
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleImport = async (file: File) => {
    console.log('🔄 Import fichier:', file.name);
    await loadTables();
  };

  const handleFixLegacy = async () => {
    if (!confirm('Corriger automatiquement les tableaux legacy (Sheet1, etc.) ?')) return;

    try {
      console.log('🔄 Correction des tableaux legacy...');
      const response = await fetch('http://127.0.0.1:8000/tables/fix-legacy', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la correction');
      }

      const result = await response.json();
      console.log('✅ Résultat correction:', result);

      if (result.sheets_renamed > 0) {
        toast.success(`${result.sheets_renamed} tableau(x) corrigé(s) !`);
      } else {
        toast.info('Aucun tableau à corriger');
      }

      await loadTables();
    } catch (error) {
      console.error('❌ Erreur correction:', error);
      toast.error('Erreur lors de la correction');
    }
  };

  // FONCTION DE NAVIGATION AVEC GESTION ASSEMBLY VIDE
  const handleNavigateToTable = (table: Table) => {
    console.log('🔍 [NAVIGATION DEBUG] ===================');
    console.log('📋 Table complète:', table);
    console.log('🌍 Region brute:', table.region);
    console.log('🏛️ Assembly brute:', table.assembly);
    
    // Si assembly est vide, utiliser la région comme assembly aussi
    const finalRegion = table.region;
    const finalAssembly = table.assembly || table.region;
    
    console.log('🔧 Après correction:');
    console.log('  - Region finale:', finalRegion);
    console.log('  - Assembly finale:', finalAssembly);
    
    const encodedRegion = encodeURIComponent(finalRegion);
    const encodedAssembly = encodeURIComponent(finalAssembly);
    
    console.log('🔐 Region encodée:', encodedRegion);
    console.log('🔐 Assembly encodée:', encodedAssembly);
    
    const url = `/table/${encodedRegion}/${encodedAssembly}`;
    console.log('🔗 URL finale:', url);
    console.log('========================================');
    
    navigate(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f6f7] to-[#e8eaed] flex items-center justify-center">
        <div className="text-[#6b7280] tracking-tight flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00c853]"></div>
          Chargement...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f6f7] to-[#e8eaed]">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white border-b border-[#d1d5db] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-[#00c853]" strokeWidth={1.5} />
              <div>
                <h1 className="text-2xl font-bold text-[#1b5e20] tracking-tight">
                  Excel Database Manager
                </h1>
                <p className="text-sm text-[#6b7280]">
                  {tables.length} tableau{tables.length !== 1 ? 'x' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setImportModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#4caf50] text-white rounded-lg hover:bg-[#66bb6a] transition-colors"
              >
                <Upload className="w-4 h-4" />
                Importer
              </button>
              <button
                onClick={downloadDatabase}
                className="flex items-center gap-2 px-4 py-2 bg-[#1b5e20] text-white rounded-lg hover:bg-[#2e7d32] transition-colors"
              >
                <Download className="w-4 h-4" />
                Télécharger
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {tables.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-[#d1d5db] p-12 text-center">
            <AlertCircle className="w-16 h-16 text-[#9ca3af] mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-xl font-semibold text-[#374151] mb-2">
              Aucun tableau
            </h3>
            <p className="text-[#6b7280] mb-6">
              Créez votre premier tableau pour commencer
            </p>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#00c853] text-white rounded-lg hover:bg-[#4caf50] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Créer un tableau
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tables.map((table) => (
              <div
                key={`${table.region}_${table.assembly || 'empty'}`}
                className="bg-white rounded-xl border border-[#d1d5db] p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => {
                  console.log('🖱️ Clic sur la carte détecté');
                  handleNavigateToTable(table);
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#1b5e20] mb-1 group-hover:text-[#00c853] transition-colors">
                      {table.region}
                    </h3>
                    <p className="text-[#6b7280] text-sm">
                      {table.assembly || '(Feuille legacy)'}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      console.log('🗑️ Clic sur supprimer détecté');
                      e.stopPropagation();
                      handleDeleteTable(table.region, table.assembly || table.region);
                    }}
                    className="p-2 text-[#6b7280] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#9ca3af]">
                    {table.total_rows} ligne{table.total_rows !== 1 ? 's' : ''}
                  </span>
                  <span className="text-[#00c853] font-medium">
                    Ouvrir →
                  </span>
                </div>
              </div>
            ))}

            {/* Carte "Ajouter" */}
            <button
              onClick={() => setCreateModalOpen(true)}
              className="bg-white rounded-xl border-2 border-dashed border-[#d1d5db] p-6 hover:border-[#00c853] hover:bg-[#f0fdf4] transition-all group min-h-[140px] flex flex-col items-center justify-center"
            >
              <Plus className="w-12 h-12 text-[#9ca3af] group-hover:text-[#00c853] transition-colors mb-2" strokeWidth={1.5} />
              <span className="text-[#6b7280] group-hover:text-[#00c853] font-medium transition-colors">
                Nouveau tableau
              </span>
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateTableModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateTable}
      />

      <ImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
}