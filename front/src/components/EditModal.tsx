import { useState, useEffect } from 'react';
import { DataRow } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface EditModalProps {
  open: boolean;
  onClose: () => void;
  headers: string[];
  row: DataRow | null;
  onSave: (rowIndex: number, data: Record<string, any>) => void;
}

export default function EditModal({ open, onClose, headers, row, onSave }: EditModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (row) {
      const data: Record<string, any> = {};
      headers.forEach((header) => {
        data[header] = row[header] || '';
      });
      setFormData(data);
      console.log('✏️ Édition initialisée:', data);
    }
  }, [row, headers]);

  const handleSave = () => {
    if (row) {
      console.log('💾 Sauvegarde modification:', formData);
      onSave(row.__row_index, formData);
      onClose();
    }
  };

  const handleValueChange = (header: string, value: string) => {
    setFormData({
      ...formData,
      [header]: value,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto bg-white border-[#d1d5db] shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-[#1b5e20] tracking-tight">
            Modifier la ligne #{row?.__row_index}
          </DialogTitle>
          <DialogDescription className="text-[#6b7280] tracking-tight">
            Modifiez les valeurs de cet enregistrement
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {headers.map((header) => (
            <div key={header}>
              <Label htmlFor={`edit-${header}`} className="mb-2 block text-[#6b7280] tracking-tight">
                {header}
              </Label>
              <Input
                id={`edit-${header}`}
                type="text"
                value={formData[header] || ''}
                onChange={(e) => handleValueChange(header, e.target.value)}
                placeholder="Entrer une valeur..."
                className="bg-[#f9fafb] border-[#d1d5db] focus:ring-[#4caf50] focus:border-[#4caf50]"
              />
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-[#d1d5db] text-[#374151] rounded hover:bg-[#9ca3af] transition-all duration-200"
          >
            Annuler
          </button>
          <button 
            onClick={handleSave} 
            className="px-4 py-2 bg-[#1b5e20] text-white rounded hover:bg-[#2e7d32] transition-all duration-200"
          >
            Sauvegarder
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}