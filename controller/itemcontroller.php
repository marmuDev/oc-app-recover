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

namespace OCA\MyNewApp\Controller;

use \OCP\Appframework\IAppContainer;
use \OCP\AppFramework\Controller;
use \OCP\IRequest;

use \OCA\MyNewApp\Db\Item;
use \OCA\MyNewApp\Db\ItemMapper;

/**
 * Description of itemcontroller
 *
 * @author Marcus Mundt <marmu@mailbox.tu-berlin.de>
 */
class ItemController extends Controller {
    	
    
        /**
         * from 
         * https://github.com/georgehrke/kraft-owncloud-app/
         * blob/master/controller/itemcontroller.php
         * 
        * @param Request $request: an instance of the request
        * @param API $api: an api wrapper instance
        * @param ItemMapper $itemMapper: an itemwrapper instance
        */
        public function __construct(IAppContainer $app, IRequest $request, 
                ItemMapper $itemMapper){
            parent::__construct($app, $request);
            $this->itemMapper = $itemMapper;
        }
        
        // recent = index, somit erstmal egal
        public function index() {
            $params = [
                'user' => $this->userId,
                'appname' => $this->appName,
                'request' => $this->request
            ];
        return new TemplateResponse($this->appName, 'main', $params);
    }
}
