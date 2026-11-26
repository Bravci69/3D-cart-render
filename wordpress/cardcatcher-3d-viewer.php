<?php
/**
 * Plugin Name: CardCatcher 3D Product Viewer
 * Description: Pridáva galériu fotiek a prepínač do interaktívneho 3D modelu pre WooCommerce produkty (Pokémon, Magic, One Piece, LoL TCG) s automatickým dohľadávaním obrázkov.
 * Version: 1.0.0
 * Author: CardCatcher
 */

if (!defined('ABSPATH')) {
    exit;
}

define('CARDCATCHER_3D_API_URL', get_option('cardcatcher_3d_api_url', 'http://localhost:3001/api'));
define('CARDCATCHER_3D_LIB_URL', get_option('cardcatcher_3d_lib_url', 'http://localhost:3001/dist/lib/cardcatcher-3d.umd.js'));

/**
 * Registruje embed knižnicu na produktových stránkach WooCommerce.
 */
add_action('wp_enqueue_scripts', function () {
    if (function_exists('is_product') && is_product()) {
        wp_enqueue_script(
            'cardcatcher-3d-lib',
            esc_url(CARDCATCHER_3D_LIB_URL),
            array(),
            '1.0.0',
            true
        );
    }
});

/**
 * Shortcode: [cardcatcher_3d name="Pokémon 151 ETB" default_view="images" height="520px"]
 */
add_shortcode('cardcatcher_3d', function ($atts) {
    $atts = shortcode_atts(array(
        'name'         => '',
        'slug'         => '',
        'default_view' => 'images',
        'height'       => '520px',
    ), $atts, 'cardcatcher_3d');

    if (empty($atts['name']) && function_exists('wc_get_product')) {
        global $product;
        if ($product instanceof WC_Product) {
            $atts['name'] = $product->get_name();
            $atts['slug'] = $product->get_slug();
        }
    }

    return sprintf(
        '<div data-cardcatcher-3d data-api-url="%s" data-product-name="%s" data-product-slug="%s" data-default-view="%s" data-height="%s"></div>',
        esc_attr(CARDCATCHER_3D_API_URL),
        esc_attr($atts['name']),
        esc_attr($atts['slug']),
        esc_attr($atts['default_view']),
        esc_attr($atts['height'])
    );
});

/**
 * Nahradí alebo doplní WooCommerce produktovú galériu komponentom s prepínačom Fotky <-> 3D Render.
 */
add_action('woocommerce_before_single_product_summary', function () {
    echo do_shortcode('[cardcatcher_3d default_view="images"]');
}, 25);
