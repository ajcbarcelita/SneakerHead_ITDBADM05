import ShoppingCart from "../models/ShoppingCart.js";
import RefCurrency from "../models/RefCurrency.js";

export async function updateCartCurrency(user_id, cart_id, currency_code, currency_rate_to_peso) {
    // Fetch cart and verify ownership
    const cart = await ShoppingCart.query().findById(cart_id);
    if (!cart || cart.user_id !== user_id) {
        throw { status: 404, message: "Cart not found or not owned by user." };
    }

    // Validate currency code if provided
    if (currency_code) {
        const currency = await RefCurrency.query().findById(currency_code);
        if (!currency) {
            throw { status: 400, message: "Currency not found."};
        }
    }

    // If user has provided a new currency code, use it; otherwise, keep existing
    const updatedCurrencyCode = currency_code || cart.currency_code;
    // If user has provided a new conversion rate, use it; otherwise, keep existing
    const updatedCurrencyRate = currency_rate_to_peso !== undefined ? currency_rate_to_peso : cart.currency_rate_to_peso;

    // Only update if something changed
    if (
    updatedCurrencyCode === cart.currency_code &&
    updatedCurrencyRate === cart.currency_rate_to_peso
    ) {
    return cart; // nothing to update
    }

    const updatedCart = await ShoppingCart.query().patchAndFetchById(cartId, {
        currency_code: updatedCurrencyCode,
        currency_rate_to_peso: updatedCurrencyRate,
  });

    return updatedCart;
}