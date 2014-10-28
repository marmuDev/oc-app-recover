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


use \OCP\IRequest;
use \OCP\AppFramework\Http\TemplateResponse;
use \OCP\AppFramework\Controller;

class PageController extends Controller {

    private $userId;

    public function __construct($appName, IRequest $request, $userId){
        parent::__construct($appName, $request);
        $this->userId = $userId;
    }


    /**
     * CAUTION: the @Stuff turn off security checks, for this page no admin is
     *          required and no CSRF check. If you don't know what CSRF is, read
     *          it up in the docs or you might create a security hole. This is
     *          basically the only required method to add this exemption, don't
     *          add it to any other method if you don't exactly know what it does
     *
     * @NoAdminRequired
     * @NoCSRFRequired
     */
    public function index() {
        $params = array('user' => $this->userId);
        return new TemplateResponse($this->appName, 'main', $params);  // templates/main.php
    }


    /**
     * Simple method that posts back the payload of the request
     * @NoAdminRequired
     */
    public function doEcho($echo) {
        return array('echo' => $echo);
    }
    
    /**
     * Simple method that renders notify settings
     * @NoAdminRequired
     */
    public function showNotifySettings() {
        // templates/notifysettings.php
        return new TemplateResponse($this->appName, 'notifysettings');  
        
        
    }


}