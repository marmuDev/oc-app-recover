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

//use \OCA\MyNewApp\Db\Item;
use \OCA\MyNewApp\Db\TrashBinMapper;

class PageController extends Controller {

    private $userId;

    public function __construct($appName, IRequest $request, $userId, 
            TrashBinMapper $itemMapper) {
        parent::__construct($appName, $request);
        $this->userId = $userId;
        $this->request = $request;
        $this->trashBinMapper = $itemMapper;
    }

    /**
     * CAUTION: the @Stuff turn off security checks, for this page no admin is
     *          required and no CSRF check. If you don't know what CSRF is, read
     *          it up in the docs or you might create a security hole. This is
     *          basically the only required method to add this exemption, don't
     *          add it to any other method if you don't exactly know what it does
     * 
     * index = recently deleted -> db stuff in here
     *
     * @NoAdminRequired
     * @NoCSRFRequired
     */
    public function index() {
        $params = [
            'user' => $this->userId,
            'appname' => $this->appName,
            'request' => $this->request
            //'recentlyDeleted' => $recentlyDelFiles
        ];
        return new TemplateResponse($this->appName, 'main', $params);
    }
    
    /**
     * 
     * @return type
     * 
     * var_dump does not work, therefore writeLog
     */
    public function getRecentlyDeleted() {
        $recentlyDelFiles = $this->trashBinMapper->find($this->userId);
        // transform array to JSON string
        $recDelFilesJson = $this->arrayToJson($recentlyDelFiles);
        
        //$msg = 'recDelFiles JSON = '.$recDelFilesJson;
        //\OCP\Util::writeLog('mynewapp.page.getRDF', $msg, \OCP\Util::ERROR);
        /* RDF nicht leer!
         * [{\"id\":\"1\",\"filename\":\"app.svg\",\"user\":\"admin\",
         * \"timestamp\":\"1415358201\",\"location\":\"\\\/\",\"type\":null,
         * \"mime\":null},...
         */
        // ändert nichts!
//        $msg = 'recDelFiles StrReplace = '.str_replace("\\","",$recDelFilesJson);
//        \OCP\Util::writeLog('mynewapp.page.getRDF', $msg, \OCP\Util::ERROR);
        // replace ggf überflüssig oder es funzt nicht, JS gibt weiterin "\" aus
        //return str_replace("\\","",$recDelFilesJson);
        return $recDelFilesJson;
        
        // // a durch Z ersetzen geht!
        //return str_replace("a","Z",$recDelFilesJson);
        //echo $recentlyDelFiles;
    }

    /** kann auch mal als route (also mittels ajax) angesprochen werden
     * funktioniert nur durch json-kram in trashbin.php
     * -> besser in eigenen controller bzw. service
     * 
     * json_encode() only escapes things that need to be escaped 
     * for the string to work when you read it in your Javascript.
     * It will be 'unescaped' automatically when you execute the JSON response. 
     * 
     * @param type $array
     * @return type
     */
    
    public function arrayToJson($array) {
        // geht auch nicht, weiterhin \"id\"
        //return json_encode($array, JSON_UNESCAPED_SLASHES);
        return json_encode($array);
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
