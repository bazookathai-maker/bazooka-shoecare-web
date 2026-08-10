<?php
/**
 * Plugin Name: BAZOOKA Shipping Rates Debug (TEMPORARY MU)
 * Description: Temporary Must-Use plugin — proves which callback empties shipping rates. DELETE after test.
 * Version: 0.1.0
 * Author: BAZOOKA Debug
 *
 * Install: copy this file to wp-content/mu-plugins/bazooka-shipping-rates-debug.php
 * Log file: wp-content/uploads/bazooka-shipping-rates-debug.log
 * Remove: delete this file from mu-plugins after testing.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Bazooka_Shipping_Rates_Debug {

	const LOG_BASENAME = 'bazooka-shipping-rates-debug.log';
	const MAX_LOG_BYTES = 2097152; // 2 MB rotate

	/** @var array<string, mixed> */
	private static $request_meta = array();

	/** @var array<int, array<string, mixed>> */
	private static $package_snapshots = array();

	/** @var bool */
	private static $wrapped = false;

	public static function boot() {
		add_action( 'woocommerce_init', array( __CLASS__, 'on_woocommerce_init' ), 5 );
		// Wrap as late as possible so ParcelPanel / Omise / theme filters are already registered.
		add_action( 'wp_loaded', array( __CLASS__, 'wrap_package_rates_callbacks' ), PHP_INT_MAX );

		add_action( 'woocommerce_before_get_rates_for_package', array( __CLASS__, 'on_before_get_rates' ), 1, 2 );
		add_action( 'woocommerce_after_get_rates_for_package', array( __CLASS__, 'on_after_get_rates' ), 9999, 2 );

		// Bust cached package rates so filters actually run during debug.
		add_filter( 'woocommerce_shipping_packages', array( __CLASS__, 'bust_shipping_rate_cache' ), 1 );
	}

	public static function on_woocommerce_init() {
		self::$request_meta = array(
			'time'   => gmdate( 'c' ),
			'uri'    => isset( $_SERVER['REQUEST_URI'] ) ? (string) $_SERVER['REQUEST_URI'] : '',
			'method' => isset( $_SERVER['REQUEST_METHOD'] ) ? (string) $_SERVER['REQUEST_METHOD'] : '',
		);

		self::log(
			'BOOT',
			array(
				'request' => self::$request_meta,
				'note'    => 'Temporary shipping debug MU plugin active',
			)
		);
	}

	/**
	 * Clear WC session stored rates so woocommerce_package_rates runs every time.
	 *
	 * @param array $packages Shipping packages.
	 * @return array
	 */
	public static function bust_shipping_rate_cache( $packages ) {
		if ( ! function_exists( 'WC' ) || ! WC()->session ) {
			return $packages;
		}

		if ( ! is_array( $packages ) ) {
			return $packages;
		}

		foreach ( array_keys( $packages ) as $key ) {
			WC()->session->set( 'shipping_for_package_' . $key, false );
		}

		self::log(
			'CACHE_BUST',
			array(
				'package_keys' => array_keys( $packages ),
				'request'      => self::$request_meta,
			)
		);

		return $packages;
	}

	/**
	 * @param array              $package         Package.
	 * @param WC_Shipping_Method $shipping_method Method about to calculate.
	 */
	public static function on_before_get_rates( $package, $shipping_method ) {
		$method_label = self::describe_shipping_method( $shipping_method );
		$rates_before = self::summarize_rates( isset( $package['rates'] ) ? $package['rates'] : array() );

		self::log(
			'woocommerce_before_get_rates_for_package',
			array(
				'request'                 => self::$request_meta,
				'current_filter_callback' => 'N/A (action — method about to run: ' . $method_label . ')',
				'package_destination'     => self::destination_from_package( $package ),
				'package_contents'        => self::contents_from_package( $package ),
				'shipping_methods_before' => $rates_before,
				'shipping_methods_after'  => $rates_before,
				'shipping_method'         => $method_label,
			)
		);
	}

	/**
	 * @param array              $package         Package (rates accumulated so far).
	 * @param WC_Shipping_Method $shipping_method Method that just ran.
	 */
	public static function on_after_get_rates( $package, $shipping_method ) {
		$method_label = self::describe_shipping_method( $shipping_method );
		$rates_after  = self::summarize_rates( isset( $package['rates'] ) ? $package['rates'] : array() );

		self::log(
			'woocommerce_after_get_rates_for_package',
			array(
				'request'                 => self::$request_meta,
				'current_filter_callback' => 'N/A (action — method just ran: ' . $method_label . ')',
				'package_destination'     => self::destination_from_package( $package ),
				'package_contents'        => self::contents_from_package( $package ),
				'shipping_methods_before' => '(see previous before hook for this method)',
				'shipping_methods_after'  => $rates_after,
				'shipping_method'         => $method_label,
				'rates_count'             => is_array( $rates_after ) ? count( $rates_after ) : 0,
			)
		);

		// Snapshot last known pre-filter rates for this destination hash.
		$hash = self::package_hash( $package );
		self::$package_snapshots[ $hash ] = array(
			'destination' => self::destination_from_package( $package ),
			'contents'    => self::contents_from_package( $package ),
			'rates'       => $rates_after,
		);
	}

	/**
	 * Replace every woocommerce_package_rates callback with a wrapper that logs
	 * before/after and flags which callback emptied a non-empty rate list.
	 */
	public static function wrap_package_rates_callbacks() {
		if ( self::$wrapped ) {
			return;
		}
		self::$wrapped = true;

		global $wp_filter;

		$collected = array();
		$registry  = array();

		if ( ! empty( $wp_filter['woocommerce_package_rates'] ) && $wp_filter['woocommerce_package_rates'] instanceof WP_Hook ) {
			/** @var WP_Hook $hook */
			$hook = $wp_filter['woocommerce_package_rates'];

			foreach ( $hook->callbacks as $priority => $callbacks ) {
				foreach ( $callbacks as $id => $cb ) {
					$original = isset( $cb['function'] ) ? $cb['function'] : null;
					if ( ! $original ) {
						continue;
					}

					// Never wrap our own sentinels if re-run.
					if ( is_array( $original ) && isset( $original[0] ) && $original[0] === __CLASS__ ) {
						continue;
					}

					$label         = self::callback_label( $original );
					$accepted_args = isset( $cb['accepted_args'] ) ? (int) $cb['accepted_args'] : 2;

					$registry[]  = array(
						'priority' => (int) $priority,
						'id'       => $id,
						'label'    => $label,
						'accepted' => $accepted_args,
					);
					$collected[] = array(
						'priority'      => (int) $priority,
						'original'      => $original,
						'label'         => $label,
						'accepted_args' => $accepted_args,
					);
				}
			}
		}

		self::log(
			'WRAP_REGISTRY',
			array(
				'registered_woocommerce_package_rates_callbacks' => $registry,
				'count' => count( $collected ),
			)
		);

		// Rebuild hook from a snapshot so we do not mutate while iterating.
		remove_all_filters( 'woocommerce_package_rates' );

		add_filter( 'woocommerce_package_rates', array( __CLASS__, 'filter_package_rates_start' ), PHP_INT_MIN, 2 );

		foreach ( $collected as $item ) {
			$original      = $item['original'];
			$label         = $item['label'];
			$priority      = $item['priority'];
			$accepted_args = $item['accepted_args'];

			$wrapper = function ( $rates, $package = array() ) use ( $original, $label, $priority, $accepted_args ) {
				return Bazooka_Shipping_Rates_Debug::run_wrapped_callback(
					$original,
					$label,
					$priority,
					$accepted_args,
					$rates,
					$package
				);
			};

			add_filter( 'woocommerce_package_rates', $wrapper, $priority, 2 );
		}

		add_filter( 'woocommerce_package_rates', array( __CLASS__, 'filter_package_rates_end' ), PHP_INT_MAX, 2 );
	}

	/**
	 * @param mixed $original      Original callback.
	 * @param string $label        Human label.
	 * @param int    $priority     Priority.
	 * @param int    $accepted_args Accepted args.
	 * @param mixed  $rates        Rates in.
	 * @param array  $package      Package.
	 * @return mixed
	 */
	public static function run_wrapped_callback( $original, $label, $priority, $accepted_args, $rates, $package ) {
		$before = self::summarize_rates( $rates );
		$before_count = is_array( $rates ) ? count( $rates ) : 0;

		$result = self::call_user_func_shipping( $original, $accepted_args, $rates, $package );

		$after = self::summarize_rates( $result );
		$after_count = is_array( $result ) ? count( $result ) : 0;

		$emptied = ( $before_count > 0 && $after_count === 0 );

		$payload = array(
			'request'                 => self::$request_meta,
			'hook'                    => 'woocommerce_package_rates',
			'current_filter_callback' => $label,
			'priority'                => $priority,
			'package_destination'     => self::destination_from_package( $package ),
			'package_contents'        => self::contents_from_package( $package ),
			'shipping_methods_before' => $before,
			'shipping_methods_after'  => $after,
			'before_count'            => $before_count,
			'after_count'             => $after_count,
			'emptied_rates'           => $emptied,
		);

		if ( $emptied ) {
			$payload['CULPRIT'] = $label;
			$payload['message'] = 'SHIPPING METHODS HAD VALUES THEN BECAME [] — this callback removed them';
			self::log( 'CULPRIT_EMPTIED_RATES', $payload );
		} else {
			self::log( 'woocommerce_package_rates', $payload );
		}

		return $result;
	}

	/**
	 * First filter in chain — snapshot rates entering apply_filters.
	 *
	 * @param array $rates   Rates.
	 * @param array $package Package.
	 * @return array
	 */
	public static function filter_package_rates_start( $rates, $package ) {
		self::log(
			'woocommerce_package_rates:ENTER',
			array(
				'request'                 => self::$request_meta,
				'current_filter_callback' => __CLASS__ . '::filter_package_rates_start',
				'package_destination'     => self::destination_from_package( $package ),
				'package_contents'        => self::contents_from_package( $package ),
				'shipping_methods_before' => self::summarize_rates( $rates ),
				'shipping_methods_after'  => self::summarize_rates( $rates ),
				'note'                    => 'Rates entering woocommerce_package_rates filter chain (pre-plugin filters)',
				'count'                   => is_array( $rates ) ? count( $rates ) : 0,
			)
		);

		if ( is_array( $rates ) && count( $rates ) === 0 ) {
			self::log(
				'EMPTY_BEFORE_FILTERS',
				array(
					'message'             => 'Rates already [] BEFORE woocommerce_package_rates callbacks — not emptied by a filter; shipping methods returned nothing for this destination/zone',
					'package_destination' => self::destination_from_package( $package ),
					'package_contents'    => self::contents_from_package( $package ),
					'pre_filter_snapshot' => isset( self::$package_snapshots[ self::package_hash( $package ) ] )
						? self::$package_snapshots[ self::package_hash( $package ) ]
						: null,
				)
			);
		}

		return $rates;
	}

	/**
	 * Last filter in chain — final rates after all callbacks.
	 *
	 * @param array $rates   Rates.
	 * @param array $package Package.
	 * @return array
	 */
	public static function filter_package_rates_end( $rates, $package ) {
		self::log(
			'woocommerce_package_rates:EXIT',
			array(
				'request'                 => self::$request_meta,
				'current_filter_callback' => __CLASS__ . '::filter_package_rates_end',
				'package_destination'     => self::destination_from_package( $package ),
				'package_contents'        => self::contents_from_package( $package ),
				'shipping_methods_before' => '(see ENTER / per-callback logs)',
				'shipping_methods_after'  => self::summarize_rates( $rates ),
				'final_count'             => is_array( $rates ) ? count( $rates ) : 0,
			)
		);

		return $rates;
	}

	/**
	 * @param mixed $callback      Callback.
	 * @param int   $accepted_args Args count.
	 * @param mixed $rates         Rates.
	 * @param array $package       Package.
	 * @return mixed
	 */
	private static function call_user_func_shipping( $callback, $accepted_args, $rates, $package ) {
		if ( $accepted_args <= 1 ) {
			return call_user_func( $callback, $rates );
		}
		return call_user_func( $callback, $rates, $package );
	}

	/**
	 * @param mixed $callback Callback.
	 * @return string
	 */
	private static function callback_label( $callback ) {
		if ( is_string( $callback ) ) {
			return $callback;
		}

		if ( is_array( $callback ) ) {
			$obj  = $callback[0];
			$meth = isset( $callback[1] ) ? (string) $callback[1] : '';
			if ( is_object( $obj ) ) {
				return get_class( $obj ) . '::' . $meth;
			}
			return (string) $obj . '::' . $meth;
		}

		if ( $callback instanceof Closure ) {
			try {
				$ref  = new ReflectionFunction( $callback );
				$file = $ref->getFileName();
				$line = $ref->getStartLine();
				return 'Closure@' . $file . ':' . $line;
			} catch ( Exception $e ) {
				return 'Closure@unknown';
			}
		}

		return 'unknown_callback';
	}

	/**
	 * @param mixed $method Shipping method instance.
	 * @return string
	 */
	private static function describe_shipping_method( $method ) {
		if ( ! is_object( $method ) ) {
			return 'unknown_method';
		}
		$id   = method_exists( $method, 'get_id' ) ? $method->get_id() : ( isset( $method->id ) ? $method->id : '' );
		$inst = method_exists( $method, 'get_instance_id' ) ? $method->get_instance_id() : 0;
		$title = method_exists( $method, 'get_title' ) ? $method->get_title() : '';
		return sprintf( '%s (instance=%s, title=%s)', $id, $inst, $title );
	}

	/**
	 * @param array $package Package.
	 * @return array
	 */
	private static function destination_from_package( $package ) {
		$dest = isset( $package['destination'] ) && is_array( $package['destination'] )
			? $package['destination']
			: array();

		return array(
			'country'  => isset( $dest['country'] ) ? $dest['country'] : '',
			'state'    => isset( $dest['state'] ) ? $dest['state'] : '',
			'postcode' => isset( $dest['postcode'] ) ? $dest['postcode'] : '',
			'city'     => isset( $dest['city'] ) ? $dest['city'] : '',
			'address'  => isset( $dest['address'] ) ? $dest['address'] : ( isset( $dest['address_1'] ) ? $dest['address_1'] : '' ),
			'address_1'=> isset( $dest['address_1'] ) ? $dest['address_1'] : '',
			'address_2'=> isset( $dest['address_2'] ) ? $dest['address_2'] : '',
		);
	}

	/**
	 * @param array $package Package.
	 * @return array
	 */
	private static function contents_from_package( $package ) {
		$contents = isset( $package['contents'] ) && is_array( $package['contents'] )
			? $package['contents']
			: array();

		$out = array();
		foreach ( $contents as $key => $item ) {
			$product = isset( $item['data'] ) ? $item['data'] : null;
			$name    = '';
			$pid     = 0;
			if ( is_object( $product ) && method_exists( $product, 'get_name' ) ) {
				$name = $product->get_name();
				$pid  = method_exists( $product, 'get_id' ) ? $product->get_id() : 0;
			}
			$out[] = array(
				'key'           => $key,
				'product_id'    => $pid,
				'name'          => $name,
				'quantity'      => isset( $item['quantity'] ) ? $item['quantity'] : null,
				'variation_id'  => isset( $item['variation_id'] ) ? $item['variation_id'] : null,
				'shipping_class'=> ( is_object( $product ) && method_exists( $product, 'get_shipping_class' ) )
					? $product->get_shipping_class()
					: '',
			);
		}

		return $out;
	}

	/**
	 * @param mixed $rates Rates map.
	 * @return array
	 */
	private static function summarize_rates( $rates ) {
		if ( ! is_array( $rates ) || array() === $rates ) {
			return array();
		}

		$out = array();
		foreach ( $rates as $rate_id => $rate ) {
			if ( is_object( $rate ) ) {
				$out[] = array(
					'rate_id'   => method_exists( $rate, 'get_id' ) ? $rate->get_id() : (string) $rate_id,
					'method_id' => method_exists( $rate, 'get_method_id' ) ? $rate->get_method_id() : '',
					'label'     => method_exists( $rate, 'get_label' ) ? $rate->get_label() : '',
					'cost'      => method_exists( $rate, 'get_cost' ) ? $rate->get_cost() : '',
				);
			} else {
				$out[] = array(
					'rate_id' => (string) $rate_id,
					'raw'     => is_scalar( $rate ) ? $rate : wp_json_encode( $rate ),
				);
			}
		}

		return $out;
	}

	/**
	 * @param array $package Package.
	 * @return string
	 */
	private static function package_hash( $package ) {
		$dest = self::destination_from_package( $package );
		return md5( wp_json_encode( $dest ) . '|' . wp_json_encode( self::contents_from_package( $package ) ) );
	}

	/**
	 * @param string               $event   Event name.
	 * @param array<string, mixed> $payload Payload.
	 */
	private static function log( $event, $payload ) {
		$line = wp_json_encode(
			array(
				'event'   => $event,
				'payload' => $payload,
			),
			JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
		);

		if ( ! is_string( $line ) ) {
			$line = '{"event":"encode_failed"}';
		}

		$line = '[' . gmdate( 'Y-m-d H:i:s' ) . ' UTC] ' . $line . PHP_EOL;

		// PHP error log (visible in host logs).
		error_log( '[BAZOOKA_SHIP_DBG] ' . $event . ' ' . substr( $line, 0, 2000 ) );

		$path = self::log_path();
		if ( ! $path ) {
			return;
		}

		$dir = dirname( $path );
		if ( ! is_dir( $dir ) ) {
			wp_mkdir_p( $dir );
		}

		if ( file_exists( $path ) && filesize( $path ) > self::MAX_LOG_BYTES ) {
			@rename( $path, $path . '.' . gmdate( 'YmdHis' ) . '.bak' );
		}

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		file_put_contents( $path, $line, FILE_APPEND | LOCK_EX );
	}

	/**
	 * @return string
	 */
	private static function log_path() {
		if ( function_exists( 'wp_upload_dir' ) ) {
			$uploads = wp_upload_dir();
			if ( empty( $uploads['error'] ) && ! empty( $uploads['basedir'] ) ) {
				return trailingslashit( $uploads['basedir'] ) . self::LOG_BASENAME;
			}
		}

		if ( defined( 'WP_CONTENT_DIR' ) ) {
			return trailingslashit( WP_CONTENT_DIR ) . self::LOG_BASENAME;
		}

		return '';
	}
}

Bazooka_Shipping_Rates_Debug::boot();
