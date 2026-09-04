import React from 'react';
import LangPillsBar from '../components/LangPillsBar';
import InputField from '../components/InputField';

const ReviewsPanel = React.memo(({ reviews, langBarProps, updateConfig, t }) => (
  <div style={{ padding: '40px 48px', maxWidth: '100%', margin: '0' }}>
    <LangPillsBar {...langBarProps} />
    <InputField label={t('studio.panelContent.reviews.titleLabel')} value={reviews?.title || ''} onChange={val => updateConfig('reviews', { ...reviews, title: val })} placeholder={t('template_houzez.reviews.title')} />
  </div>
));

export default ReviewsPanel;
