<?php

/**
 * ownCloud - Recover
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Marcus Mundt <marmu@mailbox.tu-berlin.de>
 * @copyright Marcus Mundt 2015
 */

namespace OCA\Recover\Controller;

use OCP\IRequest;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\Controller;

use OCP\JSON;


// for own DB entries, tables etc. - for standard trashbin stuff obsolete
//use \OCA\Recover\Db\Item; -> gibts nicht mehr ggf aus backup holen
// for trashbin use (standard?) mapper
use \OCA\Recover\Db\TrashBinMapper;
use \OCA\Files_Trashbin;

class PageController extends Controller {
    private $userId;
    public function __construct($AppName, IRequest $request, $UserId,
                                TrashBinMapper $trashBinMapper) {
        parent::__construct($AppName, $request);
        $this->userId = $UserId;
        $this->request = $request;
        $this->trashBinMapper = $trashBinMapper;
    }
    /**
     * @NoAdminRequired
     * @NoCSRFRequired
     */
    public function index() {
        return new TemplateResponse($this->appName, 'main', [
            'user' => $this->userId,
            'appname' => $this->appName,
            'request' => $this->request
        ]);
    }

    /**
     * @NoAdminRequired
     *   get trashbin from mySQL DB
     */
    public function getRecentlyDeleted() {
        return $this->trashBinMapper->find($this->userId);
    }

    // wenn ich route manuell aufrufe, redirect zu files app!
    //public function listTrashBin($dir, $sort, $sortdirection) {
    // "/trashlist?dir=%2F&sort=mtime&sortdirection=desc"
    public function listTrashBin() {
        // original trashbin/ajax/list.php
        // Deprecated Use annotation based ACLs from the AppFramework instead
        // is checked by app framework automatically
        //\OCP\JSON::checkLoggedIn();
        \OC::$server->getSession()->close();

        // adapt https://github.com/owncloud/core/blob/master/settings/controller/userscontroller.php#L200
        // and /apps/files_trashbin/ajax/list.php (?)
        // Load the files
        $dir = isset( $_GET['dir'] ) ? $_GET['dir'] : '';
        // zu viel in dir!!!
        // throw new \Exception verursacht schon CRASH!?!?
        // wirkt nur als sei da zu viel drin in "dir" exception spuckt viel zusatzinfos
        //throw new \Exception( "\$dir = $dir" );
        //printf($dir);
        $sortAttribute = isset( $_GET['sort'] ) ? $_GET['sort'] : 'name';
        $sortDirection = isset( $_GET['sortdirection'] ) ? ($_GET['sortdirection'] === 'desc') : false;
        $data = array();
        
        // make filelist
        try {
            $files = \OCA\Files_Trashbin\Helper::getTrashFiles($dir, \OCP\User::getUser(), $sortAttribute, $sortDirection);
        } catch (Exception $e) {
            header("HTTP/1.0 404 Not Found");
            //throw new \Exception( "pageCtrl error in make filelist" );
            exit();
        }
        //printf($files);
        //throw new \Exception( "nach make filelist list = $files");
        // encodeDir crashes!!!
        $encodedDir = \OCP\Util::encodePath($dir);
        
        $data['permissions'] = 0;
        $data['directory'] = $dir;
        //throw new \Exception( "PAGECONTROLLER vor data files" );
        $data['files'] = \OCA\Files_Trashbin\Helper::formatFileInfos($files);
        //throw new \Exception( "PAGECONTROLLER after data files" );
        //printf($data);
        //throw new \Exception( "\$data.files = $data.files" );
        return new DataResponse($data);
        // original trashbin/ajax/list.php
        // OCP\JSON::success(array('data' => $data));
        //return true;
      
    }
}
