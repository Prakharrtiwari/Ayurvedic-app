import { useEffect, useRef } from 'react';

/**
 * useModalBackButton hook
 * Intercepts the browser / mobile hardware Back button when a modal, drawer,
 * or side-sheet is open so pressing Back dismisses the modal instead of
 * navigating to previous page or logging the user out.
 *
 * @param {boolean} isOpen - Whether the modal/sheet is currently open
 * @param {function} onClose - Callback invoked to close the modal
 */
export default function useModalBackButton(isOpen, onClose) {
  const isPopStateRef = useRef(false);
  const stateIdRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    // Generate unique modal history state ID
    const modalId = 'modal_' + Math.random().toString(36).substring(2, 9);
    stateIdRef.current = modalId;
    isPopStateRef.current = false;

    // Push dummy history entry for this modal
    window.history.pushState({ isModal: true, modalId }, '');

    const handlePopState = (e) => {
      // User pressed the browser Back button or swiped back
      isPopStateRef.current = true;
      if (typeof onCloseRef.current === 'function') {
        onCloseRef.current();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);

      // If closed by UI action (X button, backdrop click, Escape key, submit),
      // we must pop the dummy history entry so the browser history stack stays clean!
      if (!isPopStateRef.current && window.history.state?.modalId === modalId) {
        window.history.back();
      }
    };
  }, [isOpen]);
}
