import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface QuantitySelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  initialQuantity: number;
  onConfirm: (quantity: number) => void;
}

export default function QuantitySelectDialog({
  open,
  onOpenChange,
  title,
  description,
  initialQuantity,
  onConfirm
}: QuantitySelectDialogProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setQuantity(isNaN(value) ? 0 : value);
  };
  
  const handleConfirm = () => {
    onConfirm(quantity);
    setQuantity(initialQuantity); // Reset quantity
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Cantidad
            </Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              step="0.1"
              value={quantity}
              onChange={handleQuantityChange}
              className="col-span-3"
              autoFocus
            />
          </div>
          <div className="text-xs text-gray-500 col-start-2 col-span-3">
            <p>Gramos totales a preparar</p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}