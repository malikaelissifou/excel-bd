import { useState, useRef, useEffect } from 'react';
import { X, ChevronRight, Check, SkipForward, ChevronLeft } from 'lucide-react';

interface AddSequenceModalProps {
  open: boolean;
  onClose: () => void;
  headers: string[];
  onComplete: (formData: Record<string, any>) => Promise<void>;
}

export default function AddSequenceModal({ open, onClose, headers, onComplete }: AddSequenceModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setCurrentIndex(0);
      setFormData({});
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, open]);

  if (!open) return null;

  const currentHeader = headers[currentIndex];
  const isLastField = currentIndex === headers.length - 1;
  const progress = ((currentIndex + 1) / headers.length) * 100;

  const handleNext = () => {
    if (isLastField) {
      handleSubmit();
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // NOUVELLE FONCTION : Laisser vide et passer au suivant
  const handleSkip = () => {
    // Mettre null ou chaîne vide pour le champ actuel
    setFormData({ ...formData, [currentHeader]: null });
    
    if (isLastField) {
      handleSubmit();
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await onComplete(formData);
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNext();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              Nouvelle ligne
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Barre de progression */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Champ {currentIndex + 1} sur {headers.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Corps */}
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {currentHeader}
            </label>
            <input
              ref={inputRef}
              type="text"
              value={formData[currentHeader] || ''}
              onChange={(e) => setFormData({ ...formData, [currentHeader]: e.target.value })}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg"
              placeholder={`Entrez ${currentHeader}...`}
              disabled={loading}
            />
          </div>

          {/* Aperçu des champs remplis */}
          {Object.keys(formData).length > 0 && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs font-semibold text-gray-600 mb-2">Données saisies :</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(formData).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="text-gray-700">
                    <strong>{key}:</strong> {value || '(vide)'}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer avec les boutons */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          {/* BOUTON "RETOUR" */}
          <button
            onClick={handleBack}
            disabled={loading || currentIndex === 0}
            className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            title="Revenir au champ précédent"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* BOUTON "LAISSER VIDE" */}
          <button
            onClick={handleSkip}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
          >
            <SkipForward className="w-5 h-5" />
            Laisser vide
          </button>

          {/* BOUTON PRINCIPAL */}
          <button
            onClick={handleNext}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Envoi...
              </>
            ) : isLastField ? (
              <>
                <Check className="w-5 h-5" />
                Terminer
              </>
            ) : (
              <>
                Suivant
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Indication clavier */}
        <div className="px-6 pb-4 text-center text-xs text-gray-500">
          💡 Astuce : Appuyez sur <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">Entrée</kbd> pour passer au suivant
        </div>
      </div>
    </div>
  );
}