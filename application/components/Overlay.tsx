"use client";

import { useEffect, useRef, type HTMLAttributes } from "react";
import { createPortal } from "react-dom";

type Props = HTMLAttributes<HTMLDivElement> & { onClose: () => void };

/**
 * Full-screen layer in a portal on <body> (Show the vendor, Say it yourself). A tap on it or Escape closes it.
 * Portal events still bubble through the React tree: it stops them so they never reach the card or bubble
 * underneath (both play on tap). Put `onClick={(e) => e.stopPropagation()}` on inner content that must not close.
 */
export function Overlay({ onClose, children, ...rest }: Props) {
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close.current();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return createPortal(
    <div
      {...rest}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body,
  );
}
