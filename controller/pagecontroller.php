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

// for own DB entries, tables etc. - for standard trashbin stuff obsolete
//use \OCA\MyNewApp\Db\Item;
// for trashbin use (standard?) mapper
use \OCA\MyNewApp\Db\TrashBinMapper;

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
    public function listTrashBin() {
        printf("IN LISTTRASHBIN.PHP"); //-> isn't redirection properly
        // adapt https://github.com/owncloud/core/blob/master/settings/controller/userscontroller.php#L200
        // and /apps/files_trashbin/ajax/list.php (?)
        // Load the files
        $dir = isset( $_GET['dir'] ) ? $_GET['dir'] : '';
        printf($dir);
        $sortAttribute = isset( $_GET['sort'] ) ? $_GET['sort'] : 'name';
        $sortDirection = isset( $_GET['sortdirection'] ) ? ($_GET['sortdirection'] === 'desc') : false;
        $data = array();

        // make filelist
        try {
            $files = \OCA\Files_Trashbin\Helper::getTrashFiles($dir, \OCP\User::getUser(), $sortAttribute, $sortDirection);
        } catch (Exception $e) {
            header("HTTP/1.0 404 Not Found");
            exit();
        }
        //printf($files);

        $encodedDir = \OCP\Util::encodePath($dir);

        $data['permissions'] = 0;
        $data['directory'] = $dir;
        $data['files'] = \OCA\Files_Trashbin\Helper::formatFileInfos($files);
        
        //printf($data);

        return new DataResponse($data);
        //return true;
    }

}
