import ModalPortal from '../common/ModalPortal'
import { X } from 'lucide-react'

/**
 * InsightsDrillDownModal - Simple modal for insights drill-down
 * Accepts children for flexible content rendering
 */
const InsightsDrillDownModal = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <ModalPortal isOpen={true}>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        {/* Backdrop with blur */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl max-h-[90vh] animate-modal-in">
        {/* Glass Card */}
        <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-surface-200/50 bg-white/50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-surface-900 text-lg">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-surface-100/80 active:bg-surface-200/80 text-surface-400 hover:text-surface-600 transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 p-6">
            {children}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modal-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modal-in {
          animation: modal-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
    </ModalPortal>
  )
}

export default InsightsDrillDownModal
