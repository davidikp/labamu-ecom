import React from 'react';

/**
 * Stepper Component
 * Renders a horizontal numbered step progress indicator.
 * 
 * @param {Array} steps - Array of strings for step labels, e.g. ['Basic Information', 'Styling', ...]
 * @param {number} currentStep - 0-indexed integer of the active step
 */
export default function Stepper({ steps, currentStep }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '800px', gap: '8px' }}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isPast = index < currentStep;
        
        let circleColor = '#FFFFFF';
        let circleBorder = '#D4D4D4'; // --neutral-line-separator-2
        let textColor = '#A9A9A9'; // --neutral-on-surface-tertiary
        
        if (isActive) {
          circleBorder = '#006BFF'; // --feature-brand-primary
          textColor = '#006BFF';
        } else if (isPast) {
          circleBorder = '#006BFF';
          circleColor = '#F3F7FE'; // --feature-brand-container-lighter
          textColor = '#282828'; // --neutral-on-surface-primary
        }

        return (
          <React.Fragment key={index}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'default' }}>
              <div 
                style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%',
                  border: `1.5px solid ${circleBorder}`,
                  background: circleColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: isPast ? '#006BFF' : textColor,
                  transition: 'all 0.3s ease'
                }}
              >
                {index + 1}
              </div>
              <span style={{ 
                fontSize: '14px', 
                fontWeight: isActive ? 600 : 400, 
                color: isPast ? '#282828' : textColor,
                whiteSpace: 'nowrap',
                transition: 'color 0.3s ease'
              }}>
                {step}
              </span>
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div 
                style={{
                  height: '1px',
                  flex: 1,
                  minWidth: '24px',
                  background: isPast ? '#006BFF' : '#E9E9E9',
                  transition: 'background 0.3s ease'
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
