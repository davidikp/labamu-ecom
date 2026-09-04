import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SECTION_DEFINITIONS } from './index';
import { defaultTheme } from '../state/defaultTheme';
import { SITE_TEMPLATES } from '../state/siteTemplates';

/**
 * Renders every section type (Header/Footer + all 25 addable types) with
 * empty data against the default theme — the "every component must be
 * useful on day one" principle (component design rule #2) as an automated
 * check rather than a manual click-through in a browser.
 */
describe('section renderers', () => {
  for (const [type, { Renderer }] of Object.entries(SECTION_DEFINITIONS)) {
    it(`${type} renders with empty data and default theme without crashing`, () => {
      const { container } = render(
        <Renderer data={{}} theme={defaultTheme} mediaLibrary={[]} isBuilder />
      );
      expect(container.firstChild).not.toBeNull();
    });
  }
});

/**
 * Renders every SITE_TEMPLATES entry's actual shipped content (real theme,
 * real section data/blocks, real media references resolved against that
 * template's bundled media library) — catches crashes in the specific data
 * being shipped that empty-data smoke tests above wouldn't (e.g. a typo'd
 * mediaId, an image field shape mismatch, a block preset a Renderer doesn't
 * expect).
 */
describe('SITE_TEMPLATES content renders without crashing', () => {
  for (const template of SITE_TEMPLATES) {
    const theme = { ...defaultTheme, ...template.theme };
    for (const page of template.pages) {
      for (const section of page.sections) {
        const Renderer = SECTION_DEFINITIONS[section.type]?.Renderer;
        it(`${template.id} / ${page.id} / ${section.id} (${section.type}) renders without crashing`, () => {
          const { container } = render(
            <Renderer data={section.data} blocks={section.blocks ?? []} theme={theme} mediaLibrary={template.media} isBuilder />
          );
          expect(container.firstChild).not.toBeNull();
        });
      }
    }
    it(`${template.id} header renders without crashing`, () => {
      const headerData = { ...template.header };
      const { container } = render(
        <SECTION_DEFINITIONS.header.Renderer data={headerData} theme={theme} mediaLibrary={template.media} isBuilder />
      );
      expect(container.firstChild).not.toBeNull();
    });
  }
});
