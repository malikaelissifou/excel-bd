import { useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { importExcel } from '../lib/api';
import { ImportResult } from '../types';

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<void>;
}

export default function ImportModal({ open, onClose, onImport }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      console.log('📁 Fichier sélectionné:', selectedFile.name);
      setFile(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      setImporting(true);
      setError(null);
      console.log('🔄 Import en cours:', file.name);
      
      const importResult = await importExcel(file);
      console.log('✅ Import terminé:', importResult);
      
      setResult(importResult);
      await onImport(file);
      
      // Auto-fermeture après 3s si succès
      if (importResult.success && importResult.errors.length === 0) {
        setTimeout(() => {
          handleClose();
        }, 3000);
      }
    } catch (err: any) {
      console.error('❌ Erreur import:', err);
      setError(err.message || 'Erreur lors de l\'importation');
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[550px] bg-white border-[#d1d5db] shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-[#1b5e20] tracking-tight text-xl flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Importer un fichier Excel
          </DialogTitle>
          <DialogDescription className="text-[#6b7280] tracking-tight">
            Importez un fichier Excel multi-feuilles. Les tableaux seront fusionnés automatiquement.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-4">
          {/* File Input */}
          {!result && (
            <div className="border-2 border-dashed border-[#d1d5db] rounded-lg p-8 text-center hover:border-[#00c853] transition-colors">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <FileSpreadsheet className="w-12 h-12 text-[#9ca3af] mx-auto mb-3" strokeWidth={1.5} />
                {file ? (
                  <div>
                    <p className="text-[#1b5e20] font-medium mb-1">{file.name}</p>
                    <p className="text-sm text-[#6b7280]">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-[#374151] font-medium mb-1">
                      Cliquez pour sélectionner un fichier
                    </p>
                    <p className="text-sm text-[#9ca3af]">
                      Formats acceptés : .xlsx, .xls
                    </p>
                  </div>
                )}
              </label>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-800 font-medium">Erreur</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-green-800 font-medium">Import réussi !</p>
                  <p className="text-green-700 text-sm mt-1">{result.message}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-600 font-medium">{result.tables_added}</p>
                  <p className="text-blue-700">Tableau(x) créé(s)</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-purple-600 font-medium">{result.tables_merged}</p>
                  <p className="text-purple-700">Tableau(x) fusionné(s)</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-600 font-medium">{result.rows_added}</p>
                  <p className="text-green-700">Ligne(s) ajoutée(s)</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-orange-600 font-medium">{result.rows_skipped}</p>
                  <p className="text-orange-700">Doublon(s) ignoré(s)</p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 font-medium mb-2">
                    ⚠️ {result.errors.length} erreur(s) détectée(s)
                  </p>
                  <div className="space-y-1 text-sm text-yellow-700">
                    {result.errors.map((err, idx) => (
                      <div key={idx}>
                        <span className="font-medium">{err.sheet}:</span> {err.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#9ca3af] transition-colors"
          >
            {result ? 'Fermer' : 'Annuler'}
          </button>
          {!result && (
            <button
              onClick={handleImport}
              disabled={!file || importing}
              className="px-4 py-2 bg-[#00c853] text-white rounded-lg hover:bg-[#4caf50] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Importation...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Importer
                </>
              )}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}