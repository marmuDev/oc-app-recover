<?php
/**
 * ownCloud - mynewapp
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Marcus Mundt <marmu@mailbox.tu-berlin.de>
 * @copyright Marcus Mundt 2014
 */

namespace OCA\MyNewApp\AppInfo;


use \OCP\AppFramework\App;
use \OCP\AppFramework\IAppContainer;
use \OCP\IContainer;

use \OCA\MyNewApp\Controller\PageController;
use \OCA\MyNewApp\Db\TrashBinMapper;


class Application extends App {


	public function __construct (array $urlParams=array()) {
		parent::__construct('mynewapp', $urlParams);

		$container = $this->getContainer();

		/**
		 * Controllers
		 */
		$container->registerService('PageController', function(IContainer $c) {
			return new PageController(
				// Look up a service for a given name
                                // in the container.
                                $c->query('AppName'), 
				$c->query('Request'),
				$c->query('UserId'),
                                $c->query('TrashBinMapper')
			);
		});
                /**
                 * When to use IContainer and when IAppContainer?
                 
                $container->registerService('ItemController', function(IAppContainer $c) {
                   return new ItemController(
                        $c->query('AppName'), 
			$c->query('Request'),
                        $c->query('UserId')
                    );
                });*/

		/**
		 * Core
		 */
		$container->registerService('UserId', function(IContainer $c) {
			return \OCP\User::getUser();
		});	
                
                /**
                 * Database Layer
                 * nutze ich aber bisher anscheinend noch nicht als service
                 * wie in part.recent.php nutzen?
                 */
                $container->registerService('TrashBinMapper', function($c) {
                    return new TrashBinMapper($c->query('ServerContainer')->getDb());
                    //return new ItemMapper($c->query('Db'));
                });
                
                /**
                 * Services
                 * Notifier
                 
                $container->registerService('SendNotifications', function(IContainer $c) {
                    return new \extClasses\Mailer\SendNotifications(
                            $c->query('pdo'),
                            $c->query('mailer')
                    );
                });
                 * 
                 */
                 $container->registerService('SendNotifications', function(IContainer $c) {
                    return new \extClasses\Mailer\SendNotifications();
                    
                });
                
                /**
                 * ggf macht das später sinn...
                 * The config allows the app to set global, app and
                 * user settings can be injected from the ServerContainer.
                 * All values are saved as strings and must be casted 
                 * to the correct value.
                 */
                $container->registerService('ConfigService', function($c) {
                    return $c->query('ServerContainer')->getConfig();
                });
	}


}