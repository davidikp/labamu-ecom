import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EditorialCollectionDetailPage from './EditorialCollectionDetailPage';
import Canvas from './Canvas';

const THEME = { colors: { primary: '#111', primary_text: '#fff' }, buttons: {} };
const HEADER = { type: 'header', data: {} };
const MENUS = { 'main-menu': { items: [{ id: 'h', label: 'Shop Now', url: '/shop' }] } };
const FOOTER = { type: 'footer', data: { copyright_text: 'Copyright Collection Co.' } };
const PAGE = { slug: '/collection/:slug', sections: [{ type: 'editorial_collection_detail', data: {} }] };

function renderPage(props = {}) {
  return render(
    <EditorialCollectionDetailPage
      theme={THEME}
      header={HEADER}
      footer={FOOTER}
      mediaLibrary={[]}
      menus={MENUS}
      page={PAGE}
      slug="forma"
      isMobile={false}
      breakpoint="desktop"
      {...props}
    />
  );
}

describe('EditorialCollectionDetailPage — resolves a known slug', () => {
  it('resolves "forma" and renders its title', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Forma' })).toBeInTheDocument();
  });

  it('renders the header via the same HeaderRenderer/SectionShell path Canvas uses for Home/Shop', () => {
    renderPage();
    expect(screen.getByText('Shop Now')).toBeInTheDocument();
  });

  it('renders the footer, matching Canvas footer rendering', () => {
    renderPage();
    expect(screen.getByText('Copyright Collection Co.')).toBeInTheDocument();
  });
});

describe('EditorialCollectionDetailPage — invalid slug', () => {
  it('renders a Not Found state instead of crashing for an unknown slug', () => {
    renderPage({ slug: 'does-not-exist' });
    expect(screen.getByText('Collection Not Found')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Forma' })).toBeNull();
  });

  it('still renders header/footer chrome around the Not Found state', () => {
    renderPage({ slug: 'does-not-exist' });
    expect(screen.getByText('Shop Now')).toBeInTheDocument();
    expect(screen.getByText('Copyright Collection Co.')).toBeInTheDocument();
  });

  it('navigates back to the collection list when the Not Found action is used', () => {
    const onBackToCollectionList = vi.fn();
    renderPage({ slug: 'does-not-exist', onBackToCollectionList });
    fireEvent.click(screen.getByText('Back to collections'));
    expect(onBackToCollectionList).toHaveBeenCalledTimes(1);
  });
});

describe('EditorialCollectionDetailPage vs Canvas — identical frame markup', () => {
  it('produces the same top-level frame classes as Canvas at the same viewport', () => {
    const { container: pageContainer } = renderPage({ breakpoint: 'tablet', isMobile: false });
    const { container: canvasContainer } = render(
      <Canvas viewport="tablet" header={HEADER} footer={FOOTER} sections={[]} theme={THEME} mediaLibrary={[]} menus={MENUS} selectedId={null} readOnly />
    );
    const pageFrame = pageContainer.querySelector('.mx-auto.bg-white');
    const canvasFrame = canvasContainer.querySelector('.mx-auto.bg-white');
    expect(pageFrame.className).toBe(canvasFrame.className);
    expect(pageFrame.style.width).toBe(canvasFrame.style.width);
  });
});
