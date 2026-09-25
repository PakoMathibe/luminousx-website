<?php
/**
 * Luminous X Technologies - Secure Contact Form Handler
 * 
 * Implements OWASP-aligned security best practices:
 * - CSRF protection via token
 * - Server-side validation
 * - Honeypot bot protection
 * - Header-injection prevention
 * - Input length limits
 * - Secure session configuration
 * - HTTPS enforcement
 * - Security headers
 * - Output escaping
 * 
 * @author Luminous X Technologies
 * @version 1.0.0
 */

// ============================================
// 1. SECURE SESSION CONFIGURATION
// ============================================
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.cookie_samesite', 'Strict');
ini_set('session.use_strict_mode', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.gc_maxlifetime', 1800); // 30 minutes

session_start();

// ============================================
// 2. HTTPS ENFORCEMENT
// ============================================
if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === 'off') {
    // In production, uncomment and set your domain:
    // $redirect = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    // header('Location: ' . $redirect, true, 301);
    // exit;
}

// ============================================
// 3. SECURITY HEADERS
// ============================================
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Content-Type: application/json; charset=utf-8');

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

// ============================================
// 4. CSRF PROTECTION
// ============================================
if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

$csrf_token = $_POST['csrf_token'] ?? '';
if (!hash_equals($_SESSION['csrf_token'], $csrf_token)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Invalid security token. Please refresh and try again.']);
    exit;
}

// ============================================
// 5. HONEYPOT BOT PROTECTION
// ============================================
if (!empty($_POST['website'])) {
    // Bot detected - pretend success but don't send
    echo json_encode(['success' => true, 'message' => 'Thank you for your message.']);
    exit;
}

// ============================================
// 6. INPUT SANITIZATION & VALIDATION
// ============================================
function sanitize_input($data, $max_length = 255) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    if (strlen($data) > $max_length) {
        $data = substr($data, 0, $max_length);
    }
    return $data;
}

function validate_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// Collect and sanitize inputs
$name    = sanitize_input($_POST['name'] ?? '', 100);
$email   = sanitize_input($_POST['email'] ?? '', 254);
$phone   = sanitize_input($_POST['phone'] ?? '', 20);
$company = sanitize_input($_POST['company'] ?? '', 150);
$service = sanitize_input($_POST['service'] ?? '', 100);
$message = sanitize_input($_POST['message'] ?? '', 5000);

// ============================================
// 7. SERVER-SIDE VALIDATION
// ============================================
$errors = [];

// Name validation
if (empty($name)) {
    $errors[] = 'Full name is required.';
} elseif (strlen($name) < 2) {
    $errors[] = 'Name must be at least 2 characters.';
} elseif (!preg_match('/^[a-zA-Z\s\-\'\.]+$/', $name)) {
    $errors[] = 'Name contains invalid characters.';
}

// Email validation
if (empty($email)) {
    $errors[] = 'Email address is required.';
} elseif (!validate_email($email)) {
    $errors[] = 'Please enter a valid email address.';
}

// Phone validation (optional)
if (!empty($phone)) {
    if (!preg_match('/^[\d\s\+\-\(\)]{7,20}$/', $phone)) {
        $errors[] = 'Please enter a valid phone number.';
    }
}

// Service validation
$allowed_services = [
    'Custom Software Development',
    'Hardware & IT Infrastructure',
    'Digital Transformation',
    'IT Consulting & Advisory',
    'Cloud Solutions',
    'Cybersecurity',
    'Networking Solutions',
    'VoIP & Communications',
    'Managed IT Services',
    'Data Analytics & BI',
    'ERP & Business Systems',
    'ICT Training',
    'Other'
];

if (empty($service)) {
    $errors[] = 'Please select a service.';
} elseif (!in_array($service, $allowed_services, true)) {
    $errors[] = 'Invalid service selection.';
}

// Message validation
if (empty($message)) {
    $errors[] = 'Message is required.';
} elseif (strlen($message) < 10) {
    $errors[] = 'Message must be at least 10 characters.';
}

// ============================================
// 8. HEADER INJECTION PREVENTION
// ============================================
function prevent_header_injection($value) {
    return str_replace(["\r", "\n", "%0a", "%0d"], '', $value);
}

$name  = prevent_header_injection($name);
$email = prevent_header_injection($email);

// ============================================
// 9. RATE LIMITING (Simple session-based)
// ============================================
$now = time();
if (isset($_SESSION['last_submit'])) {
    $time_diff = $now - $_SESSION['last_submit'];
    if ($time_diff < 30) {
        http_response_code(429);
        echo json_encode(['success' => false, 'message' => 'Please wait 30 seconds before submitting again.']);
        exit;
    }
}

// ============================================
// 10. RETURN ERRORS IF ANY
// ============================================
if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

// ============================================
// 11. SEND EMAIL
// ============================================
$to = 'info@luminousxtech.co.za';
$subject = 'New Contact Form Submission - Luminous X Technologies';

$body = "New contact form submission:\n\n";
$body .= "Name: $name\n";
$body .= "Email: $email\n";
$body .= "Phone: $phone\n";
$body .= "Company: $company\n";
$body .= "Service: $service\n\n";
$body .= "Message:\n$message\n\n";
$body .= "---\n";
$body .= "Submitted: " . date('Y-m-d H:i:s') . "\n";
$body .= "IP: " . $_SERVER['REMOTE_ADDR'] . "\n";

$headers = [
    'From' => 'noreply@luminousxtech.co.za',
    'Reply-To' => $email,
    'X-Mailer' => 'PHP/' . phpversion(),
    'MIME-Version' => '1.0',
    'Content-Type' => 'text/plain; charset=UTF-8'
];

$header_string = '';
foreach ($headers as $key => $value) {
    $header_string .= "$key: $value\r\n";
}

$mail_sent = mail($to, $subject, $body, $header_string);

// ============================================
// 12. UPDATE SESSION & RESPOND
// ============================================
$_SESSION['last_submit'] = $now;

if ($mail_sent) {
    echo json_encode(['success' => true, 'message' => 'Thank you for your message. We will be in touch shortly.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Unable to send message. Please try again or call us directly.']);
}