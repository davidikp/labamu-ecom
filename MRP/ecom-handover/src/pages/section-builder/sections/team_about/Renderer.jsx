import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveColor } from '../../ui/fields/colorValue';
import { resolveMedia } from '../../ui/fields/imageValue';
import EditableText from '../../ui/EditableText';
import BlockBoundary from '../../ui/BlockBoundary';
import BlockStream from '../../ui/BlockStream';
import AddBlockControl from '../../ui/AddBlockControl';
import { HEADING_SIZE_CLASS } from '../shared/headingSize';
import { useResponsiveMobile } from '../shared/useResponsiveMobile';

const COLS_CLASS = { '1': 'grid-cols-1', '2': 'grid-cols-2', '3': 'grid-cols-3', '4': 'grid-cols-4' };

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function MemberCard({ block, photoStyle, showBio, showSocialLink, mediaLibrary, theme, blockCtx }) {
  const { t } = useTranslation();
  const photo = resolveMedia(block.data?.photo, mediaLibrary);
  const shapeClass = photoStyle === 'circle' ? 'rounded-full' : 'rounded-md';
  const name = block.data?.name || t('sectionBuilder:sections.teamAbout.defaultName');

  return (
    <div className="text-center">
      <div className={`mx-auto mb-3 flex h-24 w-24 items-center justify-center overflow-hidden text-sm font-semibold text-white ${shapeClass}`} style={{ backgroundColor: photo ? undefined : resolveColor({ slot: 'primary' }, theme.colors) }}>
        {photo ? <img src={photo.url} alt={name} className="h-full w-full object-cover" /> : initials(name) || '?'}
      </div>
      {blockCtx ? (
        <EditableText
          as="p"
          className="text-sm font-medium text-gray-900"
          value={block.data?.name}
          placeholder={t('sectionBuilder:sections.teamAbout.defaultName')}
          onCommit={(v) => blockCtx.onEdit(block.id, 'name', v)}
        />
      ) : (
        <p className="text-sm font-medium text-gray-900">{name}</p>
      )}
      {blockCtx ? (
        <EditableText
          as="p"
          className="text-xs text-gray-500"
          value={block.data?.role}
          placeholder={t('sectionBuilder:sections.teamAbout.rolePlaceholder', 'Add a role…')}
          onCommit={(v) => blockCtx.onEdit(block.id, 'role', v)}
        />
      ) : (
        block.data?.role && <p className="text-xs text-gray-500">{block.data.role}</p>
      )}
      {showBio && (
        blockCtx ? (
          <EditableText
            as="p"
            multiline
            className="mt-1 text-xs text-gray-500"
            value={block.data?.bio}
            placeholder={t('sectionBuilder:sections.teamAbout.bioPlaceholder', 'Add a bio…')}
            onCommit={(v) => blockCtx.onEdit(block.id, 'bio', v)}
          />
        ) : (
          block.data?.bio && <p className="mt-1 text-xs text-gray-500">{block.data.bio}</p>
        )
      )}
      {showSocialLink && (
        blockCtx ? (
          <EditableText
            as="p"
            className="mt-1 text-xs text-gray-400 underline"
            value={block.data?.social_link}
            placeholder={t('sectionBuilder:sections.teamAbout.socialLinkPlaceholder', 'Add a social link…')}
            onCommit={(v) => blockCtx.onEdit(block.id, 'social_link', v)}
          />
        ) : (
          block.data?.social_link && <p className="mt-1 text-xs text-gray-400 underline">{block.data.social_link}</p>
        )
      )}
    </div>
  );
}

function TeamAboutRenderer({ data, blocks = [], theme, mediaLibrary, onEdit, blockCtx, isMobile }) {
  const { t } = useTranslation();
  const mobile = useResponsiveMobile(isMobile);
  const items = blocks.filter((b) => b.type === 'member');
  const genericBlocks = blocks.filter((b) => b.type !== 'member');
  const colsClass = COLS_CLASS[mobile ? data.columns_mobile ?? '1' : data.columns_desktop ?? '3'] ?? 'grid-cols-1';
  const headingSizeClass = HEADING_SIZE_CLASS[data.heading_size] ?? HEADING_SIZE_CLASS.medium;

  return (
    <section className="px-6">
      {onEdit ? (
        <EditableText
          as="h2"
          className={`mb-2 font-semibold text-gray-900 ${headingSizeClass}`}
          value={data.heading}
          placeholder={t('sectionBuilder:sections.teamAbout.defaultHeading')}
          onCommit={(v) => onEdit('heading', v)}
        />
      ) : (
        <h2 className={`mb-2 font-semibold text-gray-900 ${headingSizeClass}`}>{data.heading || t('sectionBuilder:sections.teamAbout.defaultHeading')}</h2>
      )}
      {onEdit ? (
        <EditableText
          as="p"
          multiline
          className="mb-6 text-sm text-gray-500"
          value={data.subtext}
          placeholder={t('sectionBuilder:sections.teamAbout.subtextPlaceholder', 'Add supporting text…')}
          onCommit={(v) => onEdit('subtext', v)}
        />
      ) : (
        data.subtext && <p className="mb-6 text-sm text-gray-500">{data.subtext}</p>
      )}
      {(genericBlocks.length > 0 || blockCtx) && (
        <BlockStream sectionType="team_about" blocks={genericBlocks} theme={theme} mediaLibrary={mediaLibrary} blockCtx={blockCtx} hideAdd className="mb-6 flex flex-col gap-3" isMobile={isMobile} />
      )}
      {items.length === 0 && !blockCtx ? (
        <p className="text-sm text-gray-400">{t('sectionBuilder:sections.teamAbout.emptyState')}</p>
      ) : (
        <div className={`grid gap-6 ${colsClass}`}>
          {items.map((b) => (
            <BlockBoundary
              key={b.id}
              selected={blockCtx?.selectedBlockId === b.id}
              onSelect={blockCtx ? () => blockCtx.onSelect(b.id) : undefined}
              label={t('sectionBuilder:sections.teamAbout.blockLabel', 'Team member')}
            >
              <MemberCard
                block={b}
                photoStyle={data.photo_style}
                showBio={data.show_bio !== false}
                showSocialLink={Boolean(data.show_social_link)}
                mediaLibrary={mediaLibrary}
                theme={theme}
                blockCtx={blockCtx}
              />
            </BlockBoundary>
          ))}
        </div>
      )}

      {blockCtx && (blockCtx.selectedBlockId || blockCtx.sectionActive) && !blockCtx.atMax && (
        <div className="mt-4"><AddBlockControl sectionType="team_about" atMax={false} onAdd={(ty) => blockCtx.onAdd(ty)} variant="canvas" /></div>
      )}
    </section>
  );
}

export default memo(TeamAboutRenderer);
