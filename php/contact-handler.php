<?php
/**
 * ============================================================
 * Luminous X Technologies — Enterprise Contact Form Handler
 * Version: 2.0.0
 * ============================================================
 *
 * Security:
 *   - CSRF token validation
 *   - Honeypot bot detection
 *   - Server-side field validation
 *   - Header injection prevention
 *   - Rate limiting (session + IP)
 *   - Input length limits
 *   - Secure session config
 *   - Security headers
 *   - Structured logging
 *   - Email header injection guard
 *   - Time-based bot detection
 *
 * Features:
 *   - Rich HTML email notification to Luminous X (well-formatted, one-click reply)
 *   - Branded HTML confirmation email to user
 *   - Plain text fallback for both
 *   - Reply-To set to user's email (so Luminous X can reply directly)
 *   - Optional logging to file
 *
 * @version 2.0.0
 */

// ============================================
// 1. SECURE SESSION CONFIGURATION
// ============================================
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.cookie_samesite', 'Strict');
ini_set('session.use_strict_mode', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.gc_maxlifetime', 1800);

session_start();

// ============================================
// 2. HTTPS ENFORCEMENT (enable in production)
// ============================================
if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === 'off') {
    // Uncomment in production:
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
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

// ============================================
// 4. METHOD CHECK
// ============================================
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

// ============================================
// 5. CONFIGURATION
// ============================================
const ADMIN_EMAIL      = 'info@luminousxtech.co.za';
const FROM_EMAIL       = 'noreply@luminousxtech.co.za';
const FROM_NAME        = 'Luminous X Technologies';
const REPLY_TO_NAME    = 'Luminous X Technologies';
const LOG_FILE         = __DIR__ . '/../logs/contact.log';
const RATE_LIMIT_SECS  = 30;
const MIN_SUBMIT_MS    = 3000; // Bot detection: minimum time on form (milliseconds)

// Allowed services (must match frontend select options)
const ALLOWED_SERVICES = [
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
    'Other',
];

// ============================================
// 6. HELPER FUNCTIONS
// ============================================

/**
 * Sanitize a string input: trim, strip tags, limit length.
 */
function sanitize_input(?string $data, int $max_length = 255): string {
    $data = trim((string)($data ?? ''));
    $data = strip_tags($data);
    // Remove null bytes
    $data = str_replace("\0", '', $data);
    if (mb_strlen($data, 'UTF-8') > $max_length) {
        $data = mb_substr($data, 0, $max_length, 'UTF-8');
    }
    return $data;
}

/**
 * Prevent header injection in email fields.
 */
function prevent_header_injection(string $value): string {
    return str_replace(["\r", "\n", "%0a", "%0d"], '', $value);
}

/**
 * Validate email with FILTER_VALIDATE_EMAIL + length check.
 */
function validate_email(string $email): bool {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false && strlen($email) <= 254;
}

/**
 * Escape output for HTML contexts.
 */
function e(?string $str): string {
    return htmlspecialchars((string)($str ?? ''), ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

/**
 * Generate a reference number for the submission.
 */
function generate_reference(): string {
    return 'LXT-' . date('Ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));
}

/**
 * Write to log file (best-effort, never fails the request).
 */
function write_log(string $message, array $context = []): void {
    try {
        $log_dir = dirname(LOG_FILE);
        if (!is_dir($log_dir)) {
            @mkdir($log_dir, 0755, true);
        }
        $line = date('Y-m-d H:i:s') . ' | ' . $message;
        if (!empty($context)) {
            $line .= ' | ' . json_encode($context, JSON_UNESCAPED_SLASHES);
        }
        $line .= PHP_EOL;
        @file_put_contents(LOG_FILE, $line, FILE_APPEND | LOCK_EX);
    } catch (Throwable $e) {
        // Silent — logging must never break the flow
    }
}

/**
 * Send email with both HTML and plain text (multipart/alternative).
 * Returns true on success, false on failure.
 */
function send_multipart_email(
    string $to,
    string $subject,
    string $htmlBody,
    string $textBody,
    array $extraHeaders = []
): bool {
    // Generate boundary
    $boundary = '----=_LXT_' . bin2hex(random_bytes(16));

    // Build headers
    $headers = [
        'MIME-Version' => '1.0',
        'Content-Type' => 'multipart/alternative; boundary="' . $boundary . '"',
        'From' => FROM_NAME . ' <' . FROM_EMAIL . '>',
        'X-Mailer' => 'LuminousX-Mailer/2.0 (PHP/' . phpversion() . ')',
    ];

    // Merge extra headers (Reply-To, etc.)
    foreach ($extraHeaders as $key => $value) {
        $headers[$key] = $value;
    }

    // Build header string
    $headerString = '';
    foreach ($headers as $key => $value) {
        $headerString .= $key . ': ' . prevent_header_injection($value) . "\r\n";
    }

    // Build body (multipart/alternative — plain text first, then HTML)
    $body = "This is a multi-part message in MIME format.\r\n\r\n";
    $body .= "--{$boundary}\r\n";
    $body .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
    $body .= $textBody . "\r\n\r\n";
    $body .= "--{$boundary}\r\n";
    $body .= "Content-Type: text/html; charset=UTF-8\r\n";
    $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
    $body .= $htmlBody . "\r\n\r\n";
    $body .= "--{$boundary}--\r\n";

    // Encode subject for non-ASCII safety
    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

    return @mail($to, $encodedSubject, $body, $headerString);
}

/**
 * Build the HTML email for Luminous X (admin notification).
 */
function build_admin_email(array $data): string {
    $name    = e($data['name']);
    $email   = e($data['email']);
    $phone   = e($data['phone'] ?: '—');
    $company = e($data['company'] ?: '—');
    $service = e($data['service']);
    $message = nl2br(e($data['message']));
    $ref     = e($data['reference']);
    $time    = e(date('l, d F Y \a\t H:i'));
    $ip      = e($data['ip']);

    return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>New Contact Enquiry</title>
</head>
<body style="margin:0;padding:0;background:#F8F5F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#2A211A;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F5F0;padding:32px 16px;">
  <tr>
    <td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,11,8,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#C27A3F 0%,#A0642D 100%);padding:32px 32px 28px;color:#FFFFFF;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:middle;">
                  <div style="font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;opacity:0.9;">New Contact Enquiry</div>
                  <div style="font-size:24px;font-weight:700;margin-top:6px;letter-spacing:-0.02em;">Luminous X Technologies</div>
                </td>
                <td align="right" style="vertical-align:middle;">
                  <div style="display:inline-block;padding:6px 12px;background:rgba(255,255,255,0.18);border-radius:999px;font-size:11px;font-weight:600;letter-spacing:0.06em;">{$ref}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Intro -->
        <tr>
          <td style="padding:28px 32px 8px;">
            <h1 style="margin:0 0 6px;font-size:20px;font-weight:700;color:#0F0B08;letter-spacing:-0.02em;">New message from your contact form</h1>
            <p style="margin:0;font-size:14px;color:#6B5D4F;line-height:1.6;">Received on {$time}</p>
          </td>
        </tr>

        <!-- Reply CTA -->
        <tr>
          <td style="padding:20px 32px 8px;">
            <a href="mailto:{$email}?subject=Re: {$ref} — Your enquiry to Luminous X Technologies"
               style="display:inline-block;padding:12px 22px;background:#0F0B08;color:#FFFFFF;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;">
              Reply to {$name} →
            </a>
          </td>
        </tr>

        <!-- Contact details -->
        <tr>
          <td style="padding:24px 32px 8px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #EDE7DE;">
              <tr>
                <td style="padding:16px 0;border-bottom:1px solid #EDE7DE;width:140px;font-size:12px;font-weight:600;color:#8A7A6A;text-transform:uppercase;letter-spacing:0.08em;vertical-align:top;">Name</td>
                <td style="padding:16px 0;border-bottom:1px solid #EDE7DE;font-size:14px;color:#0F0B08;font-weight:600;">{$name}</td>
              </tr>
              <tr>
                <td style="padding:16px 0;border-bottom:1px solid #EDE7DE;font-size:12px;font-weight:600;color:#8A7A6A;text-transform:uppercase;letter-spacing:0.08em;vertical-align:top;">Email</td>
                <td style="padding:16px 0;border-bottom:1px solid #EDE7DE;font-size:14px;color:#0F0B08;"><a href="mailto:{$email}" style="color:#A0642D;text-decoration:none;">{$email}</a></td>
              </tr>
              <tr>
                <td style="padding:16px 0;border-bottom:1px solid #EDE7DE;font-size:12px;font-weight:600;color:#8A7A6A;text-transform:uppercase;letter-spacing:0.08em;vertical-align:top;">Phone</td>
                <td style="padding:16px 0;border-bottom:1px solid #EDE7DE;font-size:14px;color:#0F0B08;">{$phone}</td>
              </tr>
              <tr>
                <td style="padding:16px 0;border-bottom:1px solid #EDE7DE;font-size:12px;font-weight:600;color:#8A7A6A;text-transform:uppercase;letter-spacing:0.08em;vertical-align:top;">Company</td>
                <td style="padding:16px 0;border-bottom:1px solid #EDE7DE;font-size:14px;color:#0F0B08;">{$company}</td>
              </tr>
              <tr>
                <td style="padding:16px 0;border-bottom:1px solid #EDE7DE;font-size:12px;font-weight:600;color:#8A7A6A;text-transform:uppercase;letter-spacing:0.08em;vertical-align:top;">Service</td>
                <td style="padding:16px 0;border-bottom:1px solid #EDE7DE;font-size:14px;color:#0F0B08;"><span style="display:inline-block;padding:4px 10px;background:#FAF0E4;color:#7A4A1E;border-radius:6px;font-weight:600;font-size:13px;">{$service}</span></td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Message -->
        <tr>
          <td style="padding:20px 32px 8px;">
            <div style="font-size:12px;font-weight:600;color:#8A7A6A;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">Message</div>
            <div style="padding:20px;background:#F8F5F0;border-left:3px solid #C27A3F;border-radius:8px;font-size:14px;color:#2A211A;line-height:1.7;">
              {$message}
            </div>
          </td>
        </tr>

        <!-- Action buttons -->
        <tr>
          <td style="padding:24px 32px 32px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:12px;">
                  <a href="mailto:{$email}" style="display:inline-block;padding:11px 20px;background:#C27A3F;color:#FFFFFF;text-decoration:none;border-radius:8px;font-size:13px;font-weight:600;">Reply by Email</a>
                </td>
                <td>
                  <a href="tel:{$phone}" style="display:inline-block;padding:11px 20px;background:#FFFFFF;color:#0F0B08;text-decoration:none;border-radius:8px;font-size:13px;font-weight:600;border:1px solid #EDE7DE;">Call Back</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer meta -->
        <tr>
          <td style="padding:20px 32px;background:#0F0B08;color:rgba(255,255,255,0.6);font-size:12px;line-height:1.6;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>Submitted from IP: {$ip}</td>
                <td align="right">Luminous X Technologies (Pty) Ltd</td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>
HTML;
}

/**
 * Build plain text version of admin email.
 */
function build_admin_text(array $data): string {
    return "NEW CONTACT ENQUIRY — Luminous X Technologies\n"
         . str_repeat('=', 60) . "\n\n"
         . "Reference: {$data['reference']}\n"
         . "Received:  " . date('l, d F Y \a\t H:i') . "\n\n"
         . "NAME:     {$data['name']}\n"
         . "EMAIL:    {$data['email']}\n"
         . "PHONE:    " . ($data['phone'] ?: '—') . "\n"
         . "COMPANY:  " . ($data['company'] ?: '—') . "\n"
         . "SERVICE:  {$data['service']}\n\n"
         . "MESSAGE:\n"
         . str_repeat('-', 60) . "\n"
         . $data['message'] . "\n"
         . str_repeat('-', 60) . "\n\n"
         . "Reply directly to this email to respond to {$data['name']}.\n\n"
         . "Submitted from IP: {$data['ip']}\n";
}

/**
 * Build the HTML confirmation email for the user.
 */
function build_user_email(array $data): string {
    $name    = e($data['name']);
    $service = e($data['service']);
    $ref     = e($data['reference']);
    $message = nl2br(e($data['message']));

    return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>We've received your message</title>
</head>
<body style="margin:0;padding:0;background:#F8F5F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#2A211A;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F5F0;padding:32px 16px;">
  <tr>
    <td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,11,8,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0F0B08 0%,#2A211A 100%);padding:36px 32px 32px;color:#FFFFFF;text-align:center;">
            <div style="display:inline-block;width:56px;height:56px;background:linear-gradient(135deg,#C27A3F,#A0642D);border-radius:50%;line-height:56px;font-size:24px;font-weight:700;color:#FFFFFF;margin-bottom:16px;font-family:Georgia,serif;">✓</div>
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;letter-spacing:-0.02em;">Thank you, {$name}.</h1>
            <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.75);line-height:1.6;">We've received your message and our team will respond within one business day.</p>
          </td>
        </tr>

        <!-- Reference -->
        <tr>
          <td style="padding:24px 32px 8px;text-align:center;">
            <div style="display:inline-block;padding:8px 16px;background:#FAF0E4;border-radius:999px;font-size:12px;font-weight:600;color:#7A4A1E;letter-spacing:0.06em;">Reference: {$ref}</div>
          </td>
        </tr>

        <!-- Summary -->
        <tr>
          <td style="padding:24px 32px 8px;">
            <div style="font-size:12px;font-weight:600;color:#8A7A6A;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;">Your Enquiry Summary</div>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F5F0;border-radius:10px;padding:20px;">
              <tr>
                <td style="padding:10px 20px;font-size:13px;color:#6B5D4F;width:120px;vertical-align:top;">Service</td>
                <td style="padding:10px 20px;font-size:14px;color:#0F0B08;font-weight:600;">{$service}</td>
              </tr>
              <tr>
                <td style="padding:10px 20px;font-size:13px;color:#6B5D4F;vertical-align:top;border-top:1px solid #EDE7DE;">Message</td>
                <td style="padding:10px 20px;font-size:14px;color:#2A211A;line-height:1.6;border-top:1px solid #EDE7DE;">{$message}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- What happens next -->
        <tr>
          <td style="padding:24px 32px 8px;">
            <div style="font-size:12px;font-weight:600;color:#8A7A6A;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;">What happens next</div>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:32px;vertical-align:top;padding:6px 0;font-size:14px;font-weight:700;color:#C27A3F;">1.</td>
                <td style="padding:6px 0;font-size:14px;color:#2A211A;line-height:1.6;">Our team reviews your enquiry within one business day.</td>
              </tr>
              <tr>
                <td style="width:32px;vertical-align:top;padding:6px 0;font-size:14px;font-weight:700;color:#C27A3F;">2.</td>
                <td style="padding:6px 0;font-size:14px;color:#2A211A;line-height:1.6;">We'll reach out to schedule a free consultation at a time that suits you.</td>
              </tr>
              <tr>
                <td style="width:32px;vertical-align:top;padding:6px 0;font-size:14px;font-weight:700;color:#C27A3F;">3.</td>
                <td style="padding:6px 0;font-size:14px;color:#2A211A;line-height:1.6;">Together we'll scope your project and outline next steps.</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:24px 32px 32px;text-align:center;">
            <div style="font-size:14px;color:#6B5D4F;margin-bottom:16px;">Need to reach us sooner?</div>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
              <tr>
                <td style="padding-right:10px;">
                  <a href="tel:+27732529507" style="display:inline-block;padding:11px 20px;background:#C27A3F;color:#FFFFFF;text-decoration:none;border-radius:8px;font-size:13px;font-weight:600;">Call 073 252 9507</a>
                </td>
                <td>
                  <a href="mailto:info@luminousxtech.co.za" style="display:inline-block;padding:11px 20px;background:#FFFFFF;color:#0F0B08;text-decoration:none;border-radius:8px;font-size:13px;font-weight:600;border:1px solid #EDE7DE;">Email Us</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 32px;background:#F8F5F0;border-top:1px solid #EDE7DE;font-size:12px;color:#8A7A6A;line-height:1.7;text-align:center;">
            <strong style="color:#0F0B08;font-size:13px;">Luminous X Technologies (Pty) Ltd</strong><br>
            100% Black-Owned · Level 1 B-BBEE Contributor<br>
            1362 Tsheko Moloko Street, Montshioa, Mmabatho, North West, 2735<br><br>
            <span style="color:#B5A595;">This is an automated confirmation. Please do not reply directly to this message.</span>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>
HTML;
}

/**
 * Build plain text version of user email.
 */
function build_user_text(array $data): string {
    return "Thank you, {$data['name']}.\n\n"
         . "We've received your message and our team will respond within one business day.\n\n"
         . "REFERENCE: {$data['reference']}\n\n"
         . "YOUR ENQUIRY SUMMARY\n"
         . str_repeat('-', 60) . "\n"
         . "Service: {$data['service']}\n\n"
         . "Message:\n{$data['message']}\n\n"
         . str_repeat('-', 60) . "\n\n"
         . "WHAT HAPPENS NEXT\n"
         . "1. Our team reviews your enquiry within one business day.\n"
         . "2. We'll reach out to schedule a free consultation at a time that suits you.\n"
         . "3. Together we'll scope your project and outline next steps.\n\n"
         . "Need to reach us sooner?\n"
         . "  Call: 073 252 9507\n"
         . "  Email: info@luminousxtech.co.za\n\n"
         . "—\n"
         . "Luminous X Technologies (Pty) Ltd\n"
         . "100% Black-Owned · Level 1 B-BBEE Contributor\n"
         . "1362 Tsheko Moloko Street, Montshioa, Mmabatho, North West, 2735\n";
}

// ============================================
// 7. CSRF PROTECTION
// ============================================
if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

$csrf_token = $_POST['csrf_token'] ?? '';
if (!hash_equals($_SESSION['csrf_token'], $csrf_token)) {
    write_log('CSRF token mismatch', ['ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown']);
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Invalid security token. Please refresh the page and try again.']);
    exit;
}

// ============================================
// 8. HONEYPOT
// ============================================
if (!empty($_POST['website'])) {
    write_log('Honeypot triggered', ['ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown']);
    // Pretend success so bot doesn't retry
    echo json_encode(['success' => true, 'message' => 'Thank you for your message.']);
    exit;
}

// ============================================
// 9. TIME-BASED BOT DETECTION
// ============================================
$form_ts = (int)($_POST['form_timestamp'] ?? 0);
if ($form_ts > 0) {
    $elapsed_ms = (int)((microtime(true) * 1000) - $form_ts);
    if ($elapsed_ms < MIN_SUBMIT_MS) {
        write_log('Form submitted too quickly', [
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'elapsed_ms' => $elapsed_ms,
        ]);
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Submission failed. Please refresh the page and try again.']);
        exit;
    }
}

// ============================================
// 10. RATE LIMITING
// ============================================
$now = time();

// Session-based
if (isset($_SESSION['last_submit']) && ($now - (int)$_SESSION['last_submit']) < RATE_LIMIT_SECS) {
    $remaining = RATE_LIMIT_SECS - ($now - (int)$_SESSION['last_submit']);
    http_response_code(429);
    echo json_encode(['success' => false, 'message' => "Please wait {$remaining} seconds before submitting again."]);
    exit;
}

// IP-based (simple file-based check)
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rate_file = sys_get_temp_dir() . '/lxt_rate_' . md5($ip);
if (file_exists($rate_file)) {
    $last_ip_submit = (int)@file_get_contents($rate_file);
    if (($now - $last_ip_submit) < RATE_LIMIT_SECS) {
        $remaining = RATE_LIMIT_SECS - ($now - $last_ip_submit);
        http_response_code(429);
        echo json_encode(['success' => false, 'message' => "Please wait {$remaining} seconds before submitting again."]);
        exit;
    }
}

// ============================================
// 11. INPUT COLLECTION + SANITIZATION
// ============================================
$name    = sanitize_input($_POST['name'] ?? '', 100);
$email   = sanitize_input($_POST['email'] ?? '', 254);
$phone   = sanitize_input($_POST['phone'] ?? '', 20);
$company = sanitize_input($_POST['company'] ?? '', 150);
$service = sanitize_input($_POST['service'] ?? '', 100);
$message = sanitize_input($_POST['message'] ?? '', 5000);
$consent = !empty($_POST['consent']);

// ============================================
// 12. SERVER-SIDE VALIDATION
// ============================================
$errors = [];

if (empty($name)) {
    $errors[] = 'Full name is required.';
} elseif (mb_strlen($name) < 2) {
    $errors[] = 'Name must be at least 2 characters.';
} elseif (!preg_match('/^[\p{L}\s\'\-\.]+$/u', $name)) {
    $errors[] = 'Name contains invalid characters.';
}

if (empty($email)) {
    $errors[] = 'Email address is required.';
} elseif (!validate_email($email)) {
    $errors[] = 'Please enter a valid email address.';
}

if (!empty($phone) && !preg_match('/^[\d\s+\-()]{7,20}$/', $phone)) {
    $errors[] = 'Please enter a valid phone number.';
}

if (empty($service)) {
    $errors[] = 'Please select a service.';
} elseif (!in_array($service, ALLOWED_SERVICES, true)) {
    $errors[] = 'Invalid service selection.';
}

if (empty($message)) {
    $errors[] = 'Message is required.';
} elseif (mb_strlen($message) < 10) {
    $errors[] = 'Message must be at least 10 characters.';
}

if (!$consent) {
    $errors[] = 'You must accept the privacy policy to continue.';
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

// ============================================
// 13. HEADER INJECTION PREVENTION
// ============================================
$name  = prevent_header_injection($name);
$email = prevent_header_injection($email);

// ============================================
// 14. BUILD PAYLOAD
// ============================================
$reference = generate_reference();

$payload = [
    'name'      => $name,
    'email'     => $email,
    'phone'     => $phone,
    'company'   => $company,
    'service'   => $service,
    'message'   => $message,
    'reference' => $reference,
    'ip'        => $ip,
];

// ============================================
// 15. SEND ADMIN EMAIL
// ============================================
$adminSubject = "[New Enquiry] {$service} — {$name} ({$reference})";
$adminHtml    = build_admin_email($payload);
$adminText    = build_admin_text($payload);

$adminSent = send_multipart_email(
    ADMIN_EMAIL,
    $adminSubject,
    $adminHtml,
    $adminText,
    [
        'Reply-To' => "{$name} <{$email}>",
    ]
);

// ============================================
// 16. SEND USER CONFIRMATION EMAIL
// ============================================
$userSubject = "We've received your message — Luminous X Technologies";
$userHtml    = build_user_email($payload);
$userText    = build_user_text($payload);

$userSent = send_multipart_email(
    $email,
    $userSubject,
    $userHtml,
    $userText,
    [
        'Reply-To' => REPLY_TO_NAME . ' <' . ADMIN_EMAIL . '>',
    ]
);

// ============================================
// 17. LOG SUBMISSION
// ============================================
write_log('Contact form submitted', [
    'reference' => $reference,
    'name'      => $name,
    'email'     => $email,
    'service'   => $service,
    'admin_sent' => $adminSent,
    'user_sent'  => $userSent,
    'ip'         => $ip,
]);

// ============================================
// 18. UPDATE RATE LIMIT TRACKERS
// ============================================
$_SESSION['last_submit'] = $now;
@file_put_contents($rate_file, (string)$now, LOCK_EX);

// Rotate CSRF token after successful use (defense in depth)
$_SESSION['csrf_token'] = bin2hex(random_bytes(32));

// ============================================
// 19. RESPOND
// ============================================
if ($adminSent) {
    echo json_encode([
        'success'   => true,
        'message'   => 'Thank you for your message. We will be in touch shortly.',
        'reference' => $reference,
    ]);
} else {
    write_log('Admin email failed to send', ['reference' => $reference, 'email' => $email]);
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Unable to send your message right now. Please try again, or call us directly at 073 252 9507.',
    ]);
}