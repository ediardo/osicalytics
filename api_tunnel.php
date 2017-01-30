<?php
  /*
   * This script serves a tunnel between the browser and stackalytics
   * Stackalytics does not provide valid HTTPS certs for requests, making
   * the application to fail.
   * Browser (AngularJS) <---HTTPS---> Apache (PHP) <---HTTP---> Stackalytics
  */
	$url = 'http://stackalytics.com/api/1.0'.urldecode($_GET['q']);
	echo file_get_contents($url);
?>
