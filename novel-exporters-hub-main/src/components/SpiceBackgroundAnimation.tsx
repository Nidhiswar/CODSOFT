import { memo } from 'react';

/**
 * FooterSpiceDecoration - Professional subtle decorative elements for footer only
 * - Elegant floating particles with gentle animations
 * - Minimal and non-distracting design
 */
const FooterSpiceDecoration = memo(() => {
  return (
    <div className="footer-spice-decoration" aria-hidden="true">
      {/* Elegant floating particles */}
      <div className="spice-particle particle-1" />
      <div className="spice-particle particle-2" />
      <div className="spice-particle particle-3" />
      <div className="spice-particle particle-4" />
      <div className="spice-particle particle-5" />
      <div className="spice-particle particle-6" />
      <div className="spice-particle particle-7" />
      <div className="spice-particle particle-8" />
      
      {/* Decorative accent lines */}
      <div className="accent-line line-1" />
      <div className="accent-line line-2" />
    </div>
  );
});

FooterSpiceDecoration.displayName = 'FooterSpiceDecoration';

export default FooterSpiceDecoration;
