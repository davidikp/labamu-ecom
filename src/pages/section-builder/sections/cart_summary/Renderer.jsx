import { memo } from 'react';
import { resolveColor } from '../../ui/fields/colorValue';
import { themedButtonStyle } from '../shared/themedButtonStyle';
import catalog from '../../mocks/catalog.json';
import EditableText from '../../ui/EditableText';

// Demo-only: real cart line items need a backend cart/session, which this
// codebase doesn't have yet, so this always shows the first two mock products.
const DEMO_LINE_ITEMS = catalog.products.slice(0, 2).map((product) => ({ product, quantity: 1 }));

function CartSummaryRenderer({ data, theme, onEdit }) {
  const subtotal = DEMO_LINE_ITEMS.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);

  return (
    <section className="px-6">
      {onEdit ? (
        <EditableText as="h2" className="mb-6 text-2xl font-bold" value={data.heading} placeholder="Your cart" onCommit={(v) => onEdit('heading', v)} />
      ) : (
        <h2 className="mb-6 text-2xl font-bold">{data.heading || 'Your cart'}</h2>
      )}

      {DEMO_LINE_ITEMS.length === 0 ? (
        <p className="text-sm opacity-80">{data.empty_state_message || 'Your cart is empty.'}</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            {DEMO_LINE_ITEMS.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center gap-4 border-b border-gray-200 pb-3">
                <div className="flex h-16 w-16 flex-none items-center justify-center rounded-md bg-gray-100 text-xs text-gray-300">
                  {product.image ? <img src={product.image} alt={product.name} className="h-full w-full rounded-md object-cover" /> : 'No image'}
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-medium">{product.name}</span>
                  <span className="text-xs opacity-60">Qty {quantity}</span>
                </div>
                <span className="text-sm font-medium">${(product.price * quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {data.show_subtotal !== false && (
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          )}

          <span
            style={themedButtonStyle(theme.buttons, { primary: resolveColor({ slot: 'primary' }, theme.colors), primaryText: resolveColor({ slot: 'primary_text' }, theme.colors) })}
            className="w-fit"
          >
            {onEdit ? (
              <EditableText value={data.button_label} placeholder="Checkout" onCommit={(v) => onEdit('button_label', v)} />
            ) : (
              data.button_label || 'Checkout'
            )}
          </span>
        </div>
      )}
    </section>
  );
}

export default memo(CartSummaryRenderer);
