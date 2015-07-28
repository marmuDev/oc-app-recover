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
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\Http\Response;
use OCP\AppFramework\Http\NotFoundResponse;
//use OCP\JSON;
use OCP\AppFramework\Http\JSONResponse;

use OCP\AppFramework\Controller;




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
    /** get template data with JS and replace app-content via handlebars client-side templating
     *  are routes + controllers needed at all for this?
     *  back to trashbin-style, trying to load different contents via ajax
     *  __construct(string $appName, string $templateName, array $params, string $renderAs)
    */
    public function recently() {
        return new TemplateResponse($this->appName, 'part.recent', [
                'user' => $this->userId,
                'appname' => $this->appName,
                'request' => $this->request
            ],
            // don't include in web interface, solely render the template
            //'blank'
            ''
        );
    }
    
    public function search() {
        return new TemplateResponse($this->appName, 'part.search', [
                'user' => $this->userId,
                'appname' => $this->appName,
                'request' => $this->request
            ],
            ''
        );
    }
    public function help() {
        return new TemplateResponse($this->appName, 'part.help', [
                'user' => $this->userId,
                'appname' => $this->appName,
                'request' => $this->request
            ],
            ''
        );
    }

    /**
     * @NoAdminRequired
     *   get trashbin from mySQL DB
     */
    public function getRecentlyDeleted() {
        return $this->trashBinMapper->find($this->userId);
    }

    /** adapted from files_trashbin/ajax/list
     * http get: "/trashlist?dir=%2F&sort=mtime&sortdirection=desc"
     * raydiation: listTrashBin($dir='', $sort='name', $sortdirection=false)
     *  -> setting default parameter values
     * 
     * lists trashbin files for current directory!!!
     * -> how will I get the directory structure of another source working?!
     * ==> directory structure of avalable files muss be present at this time!
     * 
     */
    public function listTrashBin($dir, $sort, $sortdirection) {
    // trying to get parameters (dir, sort and sortdirection) working
    //public function listTrashBin($dir='/', $sort='name', $sortdirection=false) {
        // Deprecated Use annotation based ACLs from the AppFramework instead
        // is checked by app framework automatically
        //\OCP\JSON::checkLoggedIn();
        // also obsolete!
        //\OC::$server->getSession()->close();

        // adapt https://github.com/owncloud/core/blob/master/settings/controller/userscontroller.php#L200
        // and /apps/files_trashbin/ajax/list.php (?)
        // Load the files
        $dir = isset( $_GET['dir'] ) ? $_GET['dir'] : '';
        $sortAttribute = isset( $_GET['sort'] ) ? $_GET['sort'] : 'name';
        $sortDirection = isset( $_GET['sortdirection'] ) ? ($_GET['sortdirection'] === 'desc') : false;
        $data = array();
        
        // make filelist
        try {
            // this is OC\Files\FileInfo format
            $files = \OCA\Files_Trashbin\Helper::getTrashFiles($dir, \OCP\User::getUser(), $sortAttribute, $sortDirection);
        } catch (Exception $e) {
            // what about returning JSONResponse with "statusCode" => "500"
            // how is result.status === error in original trashbin (filelist->reloadCallback)
            // don't use the header method but return a Response with the Http::STATUS_NOT_FOUND
            //header("HTTP/1.0 404 Not Found");
            $notFound = new NotFoundResponse();
            $notFound.setStatus(404);
            return $notFound;
            throw new \Exception("pagecontroller error in make filelist");
        }
        // add other file source | get files from webservice
        try {
            //$filesFromJsonFile = \OCA\Recover\Helper::getJsonFiles('http://localhost/fileData.json');
            // maybe getFilesFromSources + Source(s) as parameter, 
            // instead of calling a helper function for every source
            // TO DO: build Url based on selected dir
            $serviceUrl = 'http://localhost/webservice4recover/index.php/files/listExt4/testdir';
            // getting json here, therefore decoding to array!
            $filesFromSourceX = json_decode(\OCA\Recover\Helper::getTestWebserviceFiles($serviceUrl), true);
        } catch (Exception $e) {
            $notFound = new NotFoundResponse();
            $notFound.setStatus(404);
            return $notFound;
            throw new \Exception("pagecontroller error in make filelist from SourceX");
        }  
        $encodedDir = \OCP\Util::encodePath($dir);
        $data['permissions'] = 0;
        $data['directory'] = $dir;
        $data['files'] = \OCA\Files_Trashbin\Helper::formatFileInfos($files);
        
        /* add files from other source to array
         * Problem: filesFromJson is String, needs to be OC\Files\FileInfo
         * thats seems a bit too much work for now
         * trying to append JSON data to $data['files'], JSON is string!!
         * 
         * other file info needs to be formated too in some kind of way!!!
         * webservice will do that for each source, so in here only the correct format is available
         * 
         */
        //$data['files'] .= array_push($filesFromJsonFile['files'], $data['files']);
        $mergedFiles = array_merge($data['files'], $filesFromSourceX['files']);
        $data['files'] = $mergedFiles;
        
        ////return new DataResponse($data); this was missing one layer 
        // gotta be result.data.files in myfilelist.js!!!
        // Use a AppFramework JSONResponse instead!!!
        // http://api.owncloud.org/classes/OCP.JSON.html
        //return new DataResponse(array('data' => $data));
        return new JSONResponse(['data' => $data, "statusCode" => "200"]);
        
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
