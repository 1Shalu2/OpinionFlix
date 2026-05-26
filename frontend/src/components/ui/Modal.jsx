import { motion, AnimatePresence } from 'framer-motion';
import { HiX } from 'react-icons/hi';

export default function Modal({ isOpen, onClose, children, title }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          >
            <div className="glass-card w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 relative">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors z-10"
              >
                <HiX size={18} />
              </button>

              {title && (
                <h2 className="text-xl font-display font-bold text-white mb-4 pr-10">{title}</h2>
              )}

              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
