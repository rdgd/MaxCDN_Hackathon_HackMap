<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Api_model extends CI_Model {
  public function get_data()
  {
    $loader = require_once("./third_party/vendor/autoload.php");

    $api = new MaxCDN("jqueryrawlogs","2e0b12c4584b848abd184a91e64e7dbd0540f751b","d48df2a470438dfe5d05cc90263c2b67");
    $results = $api->get('/v3/reporting/logs.json?limit=1000&status=200');
    $results = json_decode($results, TRUE)['records'];
    return json_encode($results);
  }

  public function reverse_geocode($lat, $lng)
  { 
    $response = json_decode(file_get_contents('http://api.decarta.com/v1/3fcc39fe18c206b4f77e8e20a49e71ac/reverseGeocode/'.$lat.','.$lng.'.json'), TRUE);
    if(count($response['addresses']) == 0){
      return $response['addresses'] = array('error' => 'Unavailable');
    } else {
      return $response['addresses'][0]['address'];
    }
  }
}