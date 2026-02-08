import { createPortal } from 'react-dom'

/**
 * ModalPortal - Wrapper component for rendering modals via React Portal
 *
 * Fixes modal positioning issues caused by CSS stacking contexts (e.g., parent
 * elements with `position: relative` or `transform`). By rendering directly to
 * document.body, modals are positioned relative to the viewport as expected.
 *
 * Usage:
 *   <ModalPortal isOpen={isOpen}>
 *     <div className="fixed inset-0 z-50">...</div>
 *   </ModalPortal>
 */
const ModalPortal = ({ children, isOpen }) => {
  if (!isOpen) return null
  return createPortal(children, document.body)
}

export default ModalPortal
