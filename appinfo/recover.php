<?php
namespace OCA\Recover\AppInfo;
use \OCP\AppFramework\App;
use \OCA\Recover\Controller\PageController;

class Recover extends App {

    public function __construct(array $urlParams=array()){
        parent::__construct('recover', $urlParams);

        $container = $this->getContainer();

        /**
         * Controllers
         */
        $container->registerService('PageController', function($c) {
            return new PageController(
                $c->query('AppName'),
                $c->query('Request')

                /**
                 * Sometimes its useful to turn a route into a URL 
                 * to make the code independent from the URL design or
                 * to generate an URL for an image in img/.
                 * For that specific use case, the ServerContainer provides 
                 * a service that can be used in your container
                 */
                // inject the URLGenerator into the page controller
                //$c->query('ServerContainer')->getURLGenerator()
            );
        });
    }
}