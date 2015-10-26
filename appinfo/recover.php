<?php
/**
 * ownCloud - Recover - Extends App Class and registers Pagecontroller
 *
 * @author Marcus Mundt <marmu@mailbox.tu-berlin.de>
 * @copyright Marcus Mundt 2015
 * @license AGPL-3.0
 *
 * This code is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License, version 3,
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License, version 3,
 * along with this program. If not, see <http://www.gnu.org/licenses/>
 */
namespace OCA\Recover\AppInfo;
use \OCP\AppFramework\App;
use \OCA\Recover\Controller\PageController;
use \OCA\Recover\Db\TrashBinMapper;

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
                $c->query('Request'),
                $c->query('UserId')
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