import React from 'react';
import { X } from 'lucide-react';

const DeleteIconButton = React.memo(({ onClick, style }) => (
  <button
    className="delete-icon-button"
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    style={{
      width: '20px', height: '20px', borderRadius: '50%',
      backgroundColor: '#FEF2F2', border: '1px solid #EF4444',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', padding: 0, color: '#EF4444',
      zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', ...style
    }}
  >
    <X size={12} strokeWidth={3} />
  </button>
));

export default DeleteIconButton;
