import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Trash2, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemText?: string;
}

export default function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmar Eliminación", 
  message = "¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.",
  itemText
}: DeleteConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-[#0D0D0D] border border-white/10 rounded-[40px] p-10 shadow-2xl overflow-hidden"
          >
            {/* Background Grain/Glow */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-40 h-40 bg-red-500/10 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-8 rotate-3 border border-red-500/20">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              
              <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4 text-white">
                {title}
              </h3>
              
              <p className="text-white/40 text-sm font-medium leading-relaxed mb-10">
                {message}
                {itemText && <span className="block mt-2 text-white/60 font-black italic uppercase italic">{itemText}</span>}
              </p>
              
              <div className="flex flex-col w-full gap-3">
                <button 
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="w-full py-5 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-red-600 transition-all shadow-xl shadow-red-500/20 group"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar permanentemente
                </button>
                <button 
                  onClick={onClose}
                  className="w-full py-5 bg-white/5 border border-white/5 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>

            {/* Close button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 text-white/20 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
