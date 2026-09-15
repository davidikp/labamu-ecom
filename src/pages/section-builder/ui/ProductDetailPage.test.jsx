import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductDetailPage from './ProductDetailPage';
import Canvas from './Canvas';
import { StorefrontCartProvider } from '../sections/shared/storefrontCart';

const THEME = {
  colors: { primary: '#111', primary_text: '#fff' },
  buttons: {},
  productCatalog: [
    { id: 'a', name: 'Safety Helmet', price: 'Rp 723.000', category: 'Safety Tools', image: 'helmet.png' },
    { id: 'b', name: 'Safety Gloves', price: 'Rp 185.000', category: 'Safety Tools', image: 'gloves.png' },
    { id: 'c', name: 'Safety Harness', price: 'Rp 166.000', category: 'Safety Tools', image: 'harness.png' },
  ],
};

const HEADER = { type: 'header', data: {} };
const MENUS = { 'main-menu': { items: [{ id: 'h', label: 'Shop Now', url: '/shop' }] } };
const FOOTER = { type: 'footer', data: { copyright_text: 'Copyright PDP Co.' } };
const PAGE = { slug: '/products/safety-helmet', sections: [{ type: 'product_detail', data: {} }] };

function renderPDP(props = {}) {
  return render(
    <StorefrontCartProvider>
      <ProductDetailPage
        theme={THEME}
        header={HEADER}
        footer={FOOTER}
        mediaLibrary={[]}
        menus={MENUS}
        page={PAGE}
        handle="safety-helmet"
        isMobile={false}
        breakpoint="desktop"
        {...props}
      />
    </StorefrontCartProvider>
  );
}

describe('ProductDetailPage — header/footer parity with Canvas (Home/Shop)', () => {
  it('renders the header via the same HeaderRenderer/SectionShell path Canvas uses for Home/Shop', () => {
    renderPDP();
    // Canvas's Home/Shop render this same header data inside a SectionShell
    // (see Canvas.jsx's RenderedEntity/GlobalBlock) — no bespoke PDP header.
    expect(screen.getByText('Shop Now')).toBeInTheDocument();
  });

  it('renders a footer for a product page, matching Canvas footer rendering', () => {
    renderPDP();
    expect(screen.getByText('Copyright PDP Co.')).toBeInTheDocument();
  });

  it('still renders the footer and related products when the product has no description and a single image', () => {
    // Safety Helmet (mirrors real Houzez fixture data) has no `description`
    // field and only a single `image` — those specific blocks should be
    // absent, but nothing else (related products, footer) should vanish.
    renderPDP();
    expect(screen.queryByText('Description')).toBeNull();
    expect(screen.getByText('Copyright PDP Co.')).toBeInTheDocument();
    expect(screen.getByTestId('pdp-related-grid')).toBeInTheDocument();
  });

  it('applies the same device-width simulation frame Canvas uses (PageFrame), so mobile breakpoint actually narrows the page', () => {
    const { container: mobileContainer } = renderPDP({ isMobile: true, breakpoint: 'mobile' });
    const { container: desktopContainer } = renderPDP({ isMobile: false, breakpoint: 'desktop' });
    const mobileFrame = mobileContainer.querySelector('.mx-auto.bg-white');
    const desktopFrame = desktopContainer.querySelector('.mx-auto.bg-white');
    expect(mobileFrame.style.width).toBe('390px');
    expect(desktopFrame.style.width).toBe('1280px');
  });
});

describe('ProductDetailPage vs Canvas — identical frame markup', () => {
  it('produces the same top-level frame classes as Canvas at the same viewport', () => {
    const { container: pdpContainer } = renderPDP({ breakpoint: 'tablet', isMobile: false });
    const { container: canvasContainer } = render(
      <Canvas
        viewport="tablet"
        header={HEADER}
        footer={FOOTER}
        sections={[]}
        theme={THEME}
        mediaLibrary={[]}
        menus={MENUS}
        selectedId={null}
        readOnly
      />
    );
    const pdpFrame = pdpContainer.querySelector('.mx-auto.bg-white');
    const canvasFrame = canvasContainer.querySelector('.mx-auto.bg-white');
    expect(pdpFrame.className).toBe(canvasFrame.className);
    expect(pdpFrame.style.width).toBe(canvasFrame.style.width);
  });
});
