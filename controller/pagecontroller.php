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

// use OCP namespace for all classes that are considered public.
// This means that they should be used by apps instead of the internal ownCloud classes
use OCP\IRequest;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\AppFramework\Controller;

//use OCP\JSON;
use OCP\AppFramework\Http\JSONResponse;


// for own DB entries, tables etc. - for standard trashbin stuff obsolete
//use \OCA\Recover\Db\Item; -> gibts nicht mehr ggf aus backup holen
// for trashbin use (standard?) mapper
use OCA\Recover\Db\TrashBinMapper;
use OCA\Files_Trashbin;

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
    // get template data with JS and replace app-content
    public function search() {
        return new TemplateResponse($this->appname, 'part.search');
    }

    /**
     * @NoAdminRequired
     *   get trashbin from mySQL DB
     */
    public function getRecentlyDeleted() {
        return $this->trashBinMapper->find($this->userId);
    }

    // adapted from files_trashbin/ajax/list
    // http get: "/trashlist?dir=%2F&sort=mtime&sortdirection=desc"
    public function listTrashBin() {
        // Deprecated Use annotation based ACLs from the AppFramework instead
        // is checked by app framework automatically
        //\OCP\JSON::checkLoggedIn();
        // maybe also obsolete!
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
            // what about returning JSONResponse with "statusCode" => "500"
            // how is result.status === error in original trashbin (filelist->reloadCallback)
            header("HTTP/1.0 404 Not Found");
            // throw new \Exception("pagecontroller error in make filelist");
            exit();
        }
        $encodedDir = \OCP\Util::encodePath($dir);
        
        $data['permissions'] = 0;
        $data['directory'] = $dir;
        //throw new \Exception( "PAGECONTROLLER vor data files" );
        $data['files'] = \OCA\Files_Trashbin\Helper::formatFileInfos($files);
        //throw new \Exception( "PAGECONTROLLER after data files" );
        //printf($data);
        //throw new \Exception( "\$data.files = $data.files" );
        //return new DataResponse($data); this was missing one layer 
        // gotta be result.data.files in myfilelist.js!!!
        // Use a AppFramework JSONResponse instead!!!
        // http://api.owncloud.org/classes/OCP.JSON.html
        //return new DataResponse(array('data' => $data));
        return new JSONResponse(array('data' => $data, "statusCode" => "200"));
        
        // original trashbin/ajax/list.php
        // OCP\JSON::success(array('data' => $data));
        //return true;
      
    }

    // adapted from files_trashbin/ajax/undelete
    // http post: http://localhost/core/index.php/apps/files_trashbin/ajax/undelete.php
    // => http://localhost/core/index.php/apps/recover/recover
    public function recover() {
        \OC::$server->getSession()->close();
        $files = $_POST['files'];
        $dir = '/';
        if (isset($_POST['dir'])) {
            $dir = rtrim($_POST['dir'], '/'). '/';
        }
        $allFiles = false;
        if (isset($_POST['allfiles']) and $_POST['allfiles'] === 'true') {
            $allFiles = true;
            $list = array();
            $dirListing = true;
            if ($dir === '' || $dir === '/') {
                $dirListing = false;
            }
            foreach (\OCA\Files_Trashbin\Helper::getTrashFiles($dir, \OCP\User::getUser()) as $file) {
                $fileName = $file['name'];
                if (!$dirListing) {
                    $fileName .= '.d' . $file['mtime'];
                }
                $list[] = $fileName;
            }
        } else {
            $list = json_decode($files);
        }
        $error = array();
        $success = array();
        $i = 0;
        foreach ($list as $file) {
            $path = $dir . '/' . $file;
            if ($dir === '/') {
                $file = ltrim($file, '/');
                $delimiter = strrpos($file, '.d');
                $filename = substr($file, 0, $delimiter);
                $timestamp =  substr($file, $delimiter+2);
            } else {
                $path_parts = pathinfo($file);
                $filename = $path_parts['basename'];
                $timestamp = null;
            }
            if ( !\OCA\Files_Trashbin\Trashbin::restore($path, $filename, $timestamp) ) {
                $error[] = $filename;
                // "Class 'OCA\\Recover\\Controller\\OC_Log' not found
                // at \/var\/www\/core\/apps\/recover\/controller\/pagecontroller.php#159
                // dev manual says to use... for debugging, 
                //but exceptions make app crash, since they are exceptions...
                throw new \Exception( "recover can't restore \$filename = $filename" );
                // maybe OC_LOG is used for OC.dialogs.alert
                //OC_Log::write('trashbin', 'can\'t restore ' . $filename, OC_Log::ERROR);
            } else {
                $success[$i]['filename'] = $file;
                $success[$i]['timestamp'] = $timestamp;
                $i++;
            }
        }
        if ( $error ) {
            $filelist = '';
            foreach ( $error as $e ) {
                $filelist .= $e.', ';
            }
            //$l = OC::$server->getL10N('files_trashbin');
            // ?
            $l = OC::$server->getL10N('recover');
            $message = $l->t("Couldn't restore %s", array(rtrim($filelist, ', ')));
            // port to App Framework
            //OCP\JSON::error(array("data" => array("message" => $message,
            //                                    "success" => $success, "error" => $error)));
            return new JSONResponse(array("data" => array
                                        ("message" => $message,
                                        "success" => $success, "error" => $error), "statusCode" => "500"));
        } else {
            //OCP\JSON::success(array("data" => array("success" => $success)));
            // how to better imitate a JSON success message?
            // Use a AppFramework JSONResponse instead!!
            //return new DataResponse(array('data' => array("success" => $success)));
            //return new JSONResponse(array("data" => array("success" => $success)), "200");
            return new JSONResponse(array("data" => array("success" => $success), "statusCode" => "200"));
            // funzt auch, aber View nicht aktualisiert!
            //return new JSONResponse(array("success" => $success));
        }
    }

    public function delete() {
        \OC::$server->getSession()->close();
        $folder = isset($_POST['dir']) ? $_POST['dir'] : '/';
        // "empty trash" command
        if (isset($_POST['allfiles']) and $_POST['allfiles'] === 'true'){
            $deleteAll = true;
            if ($folder === '/' || $folder === '') {
                OCA\Files_Trashbin\Trashbin::deleteAll();
                $list = array();
            } else {
                $list[] = $folder;
                $folder = dirname($folder);
            }
        }
        else {
            $deleteAll = false;
            $files = $_POST['files'];
            $list = json_decode($files);
        }
        $folder = rtrim($folder, '/') . '/';
        $error = array();
        $success = array();
        $i = 0;
        foreach ($list as $file) {
            if ($folder === '/') {
                $file = ltrim($file, '/');
                $delimiter = strrpos($file, '.d');
                $filename = substr($file, 0, $delimiter);
                $timestamp =  substr($file, $delimiter+2);
            } else {
                $filename = $folder . '/' . $file;
                $timestamp = null;
            }
            \OCA\Files_Trashbin\Trashbin::delete($filename, \OCP\User::getUser(), $timestamp);
            if (\OCA\Files_Trashbin\Trashbin::file_exists($filename, $timestamp)) {
                $error[] = $filename;
                OC_Log::write('trashbin','can\'t delete ' . $filename . ' permanently.', OC_Log::ERROR);
            }
            // only list deleted files if not deleting everything
            else if (!$deleteAll) {
                $success[$i]['filename'] = $file;
                $success[$i]['timestamp'] = $timestamp;
                $i++;
            }
        }
        if ( $error ) {
            $filelist = '';
            foreach ( $error as $e ) {
                $filelist .= $e.', ';
            }
            $l = \OC::$server->getL10N('files_trashbin');
            $message = $l->t("Couldn't delete %s permanently", array(rtrim($filelist, ', ')));
            //OCP\JSON::error(array("data" => array("message" => $message,
            //                                       "success" => $success, "error" => $error)));
            return new JSONResponse(array("data" => array("message" => $message,
                                  "success" => $success, "error" => $error), "statusCode" => "500"));
        } else {
            //OCP\JSON::success(array("data" => array("success" => $success)));
            return new JSONResponse(array("data" => array("success" => $success), "statusCode" => "200"));
        }
    }

    
}
