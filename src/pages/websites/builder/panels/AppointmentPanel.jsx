import React from 'react';
import LangPillsBar from '../components/LangPillsBar';
import InputField from '../components/InputField';

const AppointmentPanel = React.memo(({ appointment, langBarProps, updateConfig, t }) => (
  <div style={{ padding: '40px 48px', maxWidth: '100%', margin: '0' }}>
    <LangPillsBar {...langBarProps} />
    <InputField label={t('studio.panelContent.appointment.titleLabel')} value={appointment?.title || ''} onChange={val => updateConfig('appointment', { ...appointment, title: val })} placeholder={t('template_houzez.appointment.title')} />
    <InputField label={t('studio.panelContent.appointment.subtitleLabel')} value={appointment?.subtitle || ''} onChange={val => updateConfig('appointment', { ...appointment, subtitle: val })} placeholder={t('template_houzez.appointment.subtitle')} isTextarea />
  </div>
));

export default AppointmentPanel;
