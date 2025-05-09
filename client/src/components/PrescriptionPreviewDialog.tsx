import React, { useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, X } from "lucide-react";
import { PrescriptionData } from "@/types";
import PrintablePrescription from "./PrintablePrescription";

interface PrescriptionPreviewDialogProps {
  prescription: PrescriptionData;
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
}

export default function PrescriptionPreviewDialog({
  prescription,
  isOpen,
  onClose,
  onPrint
}: PrescriptionPreviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vista Previa de Prescripción</DialogTitle>
        </DialogHeader>
        
        <div className="my-4">
          <PrintablePrescription prescription={prescription} />
        </div>
        
        <DialogFooter>
          <div className="flex gap-2 justify-end">
            <DialogClose asChild>
              <Button variant="ghost" className="gap-1">
                <X className="h-4 w-4" /> Cerrar
              </Button>
            </DialogClose>
            <Button 
              variant="default" 
              className="gap-1"
              onClick={onPrint}
            >
              <Printer className="h-4 w-4" /> Imprimir
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}