<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
session_set_cookie_params(['httponly'=>true,'samesite'=>'Strict','secure'=>!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off']);
session_start();
function reply(int $code, array $body): never { http_response_code($code); echo json_encode($body); exit; }
$raw=file_get_contents(__DIR__.'/config/config.js');
$config=json_decode(trim(substr($raw,strpos($raw,'=')+1), " \t\n\r;"),true);
if (!is_array($config)) reply(503,['success'=>false,'error'=>'Contact configuration is unavailable.']);
$f=$config['form'];
if ($_SERVER['REQUEST_METHOD']==='GET' && isset($_GET['token'])) {
    if (empty($f['enabled'])) reply(503,['success'=>false,'error'=>'Enquiries are not enabled yet.']);
    if (empty($_SESSION['csrf'])) $_SESSION['csrf']=bin2hex(random_bytes(32));
    reply(200,['token'=>$_SESSION['csrf']]);
}
if ($_SERVER['REQUEST_METHOD']!=='POST') {header('Allow: POST, GET');reply(405,['success'=>false,'error'=>'Method not allowed.']);}
if (empty($f['enabled'])) reply(503,['success'=>false,'error'=>'Enquiries are not enabled yet.']);
if ((int)($_SERVER['CONTENT_LENGTH']??0)>20000) reply(413,['success'=>false,'error'=>'Your message is too large.']);
if (!isset($_POST['csrf'],$_SESSION['csrf']) || !is_string($_POST['csrf']) || !hash_equals($_SESSION['csrf'],$_POST['csrf'])) reply(403,['success'=>false,'error'=>'Please refresh the page and try again.']);
foreach (['name','email','message','budget','website','consent','started'] as $key) if (isset($_POST[$key]) && !is_string($_POST[$key])) reply(400,['success'=>false,'error'=>'Invalid request.']);
if (!empty($_POST['website'])) reply(422,['success'=>false,'error'=>'Unable to process this request.']);
$name=trim($_POST['name']??'');$email=trim($_POST['email']??'');$message=trim($_POST['message']??'');$budget=trim($_POST['budget']??'Not decided');
if (strlen($name)<1 || strlen($name)>100 || preg_match('/[\r\n]/',$name) || !filter_var($email,FILTER_VALIDATE_EMAIL) || strlen($email)>254 || preg_match('/[\r\n]/',$email) || strlen($message)<10 || strlen($message)>5000 || ($_POST['consent']??'')!=='1' || strlen($budget)>100) reply(422,['success'=>false,'error'=>'Please complete all required fields correctly.']);
$elapsed=microtime(true)-(float)($_POST['started']??0)/1000;
if ($elapsed<($f['minSeconds']??3) || $elapsed>86400) reply(422,['success'=>false,'error'=>'Please refresh the form and take a moment before sending.']);
if (time()-(int)($_SESSION['last_submission']??0)<60) reply(429,['success'=>false,'error'=>'Please wait a minute before sending another enquiry.']);
$recipient=$f['recipient']??$config['email'];$sender=$f['sender']??$config['email'];
if (!filter_var($recipient,FILTER_VALIDATE_EMAIL) || !filter_var($sender,FILTER_VALIDATE_EMAIL) || str_ends_with($recipient,'.example') || str_ends_with($sender,'.example')) reply(503,['success'=>false,'error'=>'The corporate mailbox has not been configured.']);
$services=$_POST['services']??[];
if (!is_array($services) || count($services)>4) reply(422,['success'=>false,'error'=>'Invalid service selection.']);
$allowed=['Google Ads','Meta Ads','Brand strategy','Collaboration'];
foreach($services as $service) if(!is_string($service) || !in_array($service,$allowed,true)) reply(422,['success'=>false,'error'=>'Invalid service selection.']);
$subject=preg_replace('/[\r\n]+/',' ',(string)($f['subject']??'New website enquiry'));
$body="Name: $name\nEmail: $email\nServices: ".implode(', ',$services)."\nBudget: $budget\n\nMessage:\n$message\n\nPrivacy consent: confirmed\n";
$headers=['From'=>$sender,'Reply-To'=>$email,'MIME-Version'=>'1.0','Content-Type'=>'text/plain; charset=UTF-8'];
$_SESSION['last_submission']=time();
if (!mail($recipient,'=?UTF-8?B?'.base64_encode($subject).'?=',$body,$headers)) reply(502,['success'=>false,'error'=>'The mail server did not accept your request. Please try again later.']);
unset($_SESSION['csrf']);
reply(200,['success'=>true,'message'=>$f['successMessage']]);
