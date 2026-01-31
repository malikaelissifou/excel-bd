import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface CreateTableModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (region: string, assembly: string) => void;
}

export default function CreateTableModal({ open, onClose, onCreate }: CreateTableModalProps) {
  const [region, setRegion] = useState('');
  const [assembly, setAssembly] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!region.trim() || !assembly.trim()) {
      return;
    }

    console.log('📝 Création tableau:', { region, assembly });
    onCreate(region.trim(), assembly.trim());
    
    // Reset
    setRegion('');
    setAssembly('');
  };

  const handleClose = () => {
    setRegion('');
    setAssembly('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[500px] bg-white border-[#d1d5db] shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-[#1b5e20] tracking-tight text-xl">
            Créer un nouveau tableau
          </DialogTitle>
          <DialogDescription className="text-[#6b7280] tracking-tight">
            Chaque tableau est identifié par une région et une assemblée
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-6">
            <div>
              <Label htmlFor="region" className="text-[#374151] font-medium mb-2 block">
                Région
              </Label>
              <Input
                id="region"
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Ex: Borgou, Atacora..."
                className="bg-[#f9fafb] border-[#d1d5db] focus:ring-[#4caf50] focus:border-[#4caf50]"
                required
                autoFocus
              />
            </div>

            <div>
              <Label htmlFor="assembly" className="text-[#374151] font-medium mb-2 block">
                Assemblée
              </Label>
              <Input
                id="assembly"
                type="text"
                value={assembly}
                onChange={(e) => setAssembly(e.target.value)}
                placeholder="Ex: Parakou, Natitingou..."
                className="bg-[#f9fafb] border-[#d1d5db] focus:ring-[#4caf50] focus:border-[#4caf50]"
                required
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#9ca3af] transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!region.trim() || !assembly.trim()}
              className="px-4 py-2 bg-[#00c853] text-white rounded-lg hover:bg-[#4caf50] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Créer le tableau
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}