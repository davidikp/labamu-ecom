import React from 'react';
import InputField from '../components/InputField';

const CustomPagePanel = React.memo(({ panelId, pageName, onRename, t }) => (
  <div style={{ padding: '40px 48px', maxWidth: '100%', margin: '0' }}>
    <InputField
      label={t('studio.features.pageName')}
      value={pageName}
      onChange={val => onRename(panelId, val)}
      placeholder={t('studio.features.pageName')}
    />
  </div>
));

export default CustomPagePanel;
