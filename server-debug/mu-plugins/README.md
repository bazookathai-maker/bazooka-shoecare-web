# BAZOOKA Shipping Rates Debug (MU Plugin)

Temporary Must-Use plugin. Do not commit. Do not leave on production.

## Install (manual — not via this React repo deploy)

1. On the WordPress host, create folder if missing:
   `wp-content/mu-plugins/`
2. Upload:
   `bazooka-shipping-rates-debug.php`
   into that folder (single file, no subfolder).
3. No activation needed — MU plugins load automatically.

## Reproduce

1. Add a product to cart via Store API / checkout.
2. `POST /wp-json/wc/store/v1/cart/update-customer` with `state: TH-10`, `postcode: 10900`, `country: TH`.
3. Also try a cart GET with empty address (control: Flat Rate should appear).

## Read logs

Primary file:

`wp-content/uploads/bazooka-shipping-rates-debug.log`

Also prefixed lines in PHP error log: `[BAZOOKA_SHIP_DBG]`

### What to look for

| Event | Meaning |
|---|---|
| `WRAP_REGISTRY` | Every callback registered on `woocommerce_package_rates` |
| `woocommerce_before_get_rates_for_package` | Per shipping method, before it calculates |
| `woocommerce_after_get_rates_for_package` | Per method, rates accumulated so far |
| `woocommerce_package_rates:ENTER` | Rates entering the filter chain |
| `EMPTY_BEFORE_FILTERS` | Already `[]` before any filter — zone/method returned nothing |
| `CULPRIT_EMPTIED_RATES` | A filter had rates then returned `[]` — **this is the remover** |
| `woocommerce_package_rates:EXIT` | Final rates after all filters |

## Remove after test

Delete:

`wp-content/mu-plugins/bazooka-shipping-rates-debug.php`

and optionally the log file under uploads.
