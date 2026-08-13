export const FORGE_PRODUCT = Object.freeze({
  id: 'arnes-forgecr',
  name: 'Arnés ForgeCR',
  unitPrice: 14900,
  currency: 'CRC'
});

export const SHIPPING_COST = 3000;
export const SHIPPING_COURIER = 'Correos de Costa Rica';

export function calculateOrderTotals(quantity) {
  const normalizedQuantity = Number(quantity);

  if (!Number.isInteger(normalizedQuantity) || normalizedQuantity < 1) {
    throw new TypeError('Product quantity must be a positive integer');
  }

  const subtotal = FORGE_PRODUCT.unitPrice * normalizedQuantity;

  return {
    subtotal,
    shippingCost: SHIPPING_COST,
    total: subtotal + SHIPPING_COST
  };
}

export function normalizeTrustedOrder(input = {}) {
  const quantity = Number(input.product?.quantity);
  const { subtotal, shippingCost, total } = calculateOrderTotals(quantity);

  return {
    ...input,
    product: {
      ...input.product,
      id: FORGE_PRODUCT.id,
      name: FORGE_PRODUCT.name,
      quantity,
      unitPrice: FORGE_PRODUCT.unitPrice
    },
    shipping: {
      ...input.shipping,
      cost: shippingCost,
      courier: SHIPPING_COURIER
    },
    subtotal,
    total
  };
}
