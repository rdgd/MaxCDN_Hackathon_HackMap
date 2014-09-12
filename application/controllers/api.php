<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Api extends CI_Controller {
  public function get_data()
  {
    $this->load->model('api_model', 'api');
    $data = $this->api->get_data();

    $this->output->set_content_type('application/json');
    $this->output->set_output($data);
  }

  public function reverse_geocode($lat, $lng)
  {
    $this->load->model('api_model', 'api');
    $address = $this->api->reverse_geocode($lat, $lng);
    $this->output->set_content_type('application/json');
    $this->output->set_output(json_encode($address));
  }
}