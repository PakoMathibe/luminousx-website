<?php
/**
 * Luminous X Technologies - CSRF Token Endpoint
 *
 * Generates and returns a CSRF token for the session.
 * Called on page load to ensure the client has a fresh token.
 *
 * @version 1.0.0
 */

// Secure session config (must match contact-handler.php)
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.cookie_samesite', 'Strict');
ini_set('session.use_strict_mode', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.gc_maxlifetime', 1800);

session_start();

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

// Generate or reuse token
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

echo json_encode([
    'token' => $_SESSION['csrf_token'],
    'expires_in' => 1800
]);