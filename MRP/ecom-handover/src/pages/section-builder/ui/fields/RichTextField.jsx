import Editor, { Toolbar, BtnBold, BtnItalic, BtnLink, BtnBulletList, BtnNumberedList } from 'react-simple-wysiwyg';

/**
 * US-4.10 — WYSIWYG restricted to bold/italic/link/lists only, matching the
 * spec's explicit exclusion of font-size/family/color controls (those are
 * theme-level, Phase 4).
 */
export default function RichTextField({ field, value, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-700">{field.label}</label>
      <Editor
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        containerProps={{ style: { minHeight: 120 } }}
        className="rounded-md border border-gray-200 text-sm"
      >
        <Toolbar>
          <BtnBold />
          <BtnItalic />
          <BtnLink />
          <BtnBulletList />
          <BtnNumberedList />
        </Toolbar>
      </Editor>
    </div>
  );
}
