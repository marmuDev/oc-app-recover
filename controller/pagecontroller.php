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
     *   get trashbin from mySQL DB - obsolete
     */
    public function getRecentlyDeleted() {
        return $this->trashBinMapper->find($this->userId);
    }
    /*
     * call functions to get backed up files depending on sources
     * if no source is specified, we want all backed up files of user from any possible source
     * route: ['name' => 'page#list_backups', 'url' => '/listbackups{dir}/-/{source}/{sort}/{sortdirection}', 'verb' => 'GET'],
     * @param String $dir directory to be listed
     * @param String $sort attribut to sort files by
     * @param String $sortdirection asc | desc (ascending or descending)
     * @param String $source source of backup files octrash| ext4 | gpfsss (oc trashbin, local ext4 files or GPFS Snapshots)
     * @return JSONResponse $data inclunding permissions, directory, files and source within files
     */
    
    public function listBackups($dir = '/', $source = '', $sort = 'mtime', $sortdirection = 'desc') {
        //      dir = / | "/folder1.d1437920477", sortAttribute = mtime, sortDirection = 1 -> desc
        // OC app framework way would be to pass those via the URL as params
        $dirGet = isset( $_GET['dir'] ) ? $_GET['dir'] : '';
        $sortAttribute = isset( $_GET['sort'] ) ? $_GET['sort'] : 'mtime';
        //$sortDirection = isset( $_GET['sortdirection'] ) ? ($_GET['sortdirection'] === 'desc') : false;
        $sortDirection = isset( $_GET['sortdirection'] ) ? $_GET['sortdirection'] : 'desc';
        $sourceGet = isset( $_GET['source'] ) ? $_GET['source'] : '';
         
        // a clicked dir can only have one source -> list contents of dir from source
        switch ($sourceGet) {
            case 'octrash':
                $data = $this->listTrashBin($dirGet, $sortAttribute, $sortDirection);
                break;
            /* add files from other sources 
            * Problem: filesFromJson is String, needs to be OC\Files\FileInfo
            * thats seems a bit too much work for now
            * trying to append JSON data to $data['files'], JSON is string!!
            * 
            * other file info needs to be formated too in some kind of way!!!
            * webservice will do that for each source, so in here only the correct format is available
            * 
            */
            // work around for testing purposes - but omits default listing of all sources!
            //case 'undefined':
            //    $data = $this->listTrashBin($dirGet, $sortAttribute, $sortDirection);
            //    break;
            case 'ext4':
                $data = $this->listTestdir($dirGet, $sourceGet, $sortAttribute, $sortDirection);
                break;
            case 'gpfsss':
                $data = $this->listGpfsSs($dirGet, $sourceGet, $sortAttribute, $sortDirection);
                break;
            // list files of root directory -> collect data from all sources
            // initial no source available, set manually!
            default:
                $data = $this->listTrashBin($dirGet, $sortAttribute, $sortDirection);
                $filesFromExt4 = $this->listTestdir($dirGet, 'ext4', $sortAttribute, $sortDirection);
                $filesFromGpfsSs = $this->listGpfsSs($dirGet, 'gpfsss', $sortAttribute, $sortDirection);
                // merge arrays from all sources
                $mergedFiles = array_merge($data['files'], $filesFromExt4['files'], $filesFromGpfsSs['files']);
                $data['files'] = $mergedFiles;
        }
        ////return new DataResponse($data); this was missing one layer 
        // gotta be result.data.files in myfilelist.js!!!
        // Use a AppFramework JSONResponse instead!!!
        // http://api.owncloud.org/classes/OCP.JSON.html
        //return new DataResponse(array('data' => $data));
        return new JSONResponse(['data' => $data, "statusCode" => "200"]);
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
     * @param String $dir directory to be listed
     * @param String $sort attribut to sort files by
     * @param String $sortdirection asc | desc (ascending or descending)
     * @return Array $data with inclunding permissions, directory, files and source within files
     * 
     */
    public function listTrashBin($dir='/', $sort='name', $sortdirection=false) {
    //public function listTrashBin($dir, $sort, $sortdirection) {
        // Deprecated Use annotation based ACLs from the AppFramework instead
        // is checked by app framework automatically
        //\OCP\JSON::checkLoggedIn();
        // also obsolete!
        //\OC::$server->getSession()->close();

        // adapt https://github.com/owncloud/core/blob/master/settings/controller/userscontroller.php#L200
        // and /apps/files_trashbin/ajax/list.php (?)
        // Load the files
        $data = array();
        
        // make filelist - must be ommitted when files from external source are requested!
        try {
            // this is OC\Files\FileInfo format
            $files = \OCA\Files_Trashbin\Helper::getTrashFiles($dir, \OCP\User::getUser(), $sort, $sortdirection);
        } catch (Exception $e) {
            // what about returning JSONResponse with "statusCode" => "500"
            // how is result.status === error in original trashbin (filelist->reloadCallback)
            // don't use the header method but return a Response with the Http::STATUS_NOT_FOUND
            //header("HTTP/1.0 404 Not Found");
            $notFound = new NotFoundResponse();
            $notFound.setStatus(404);
            return $notFound;
        }
                 
        $encodedDir = \OCP\Util::encodePath($dir);
        $data['permissions'] = 0;
        $data['directory'] = $dir;
        $data['files'] = \OCA\Files_Trashbin\Helper::formatFileInfos($files);
        
        return $data;
        
        // original trashbin/ajax/list.php
        // OCP\JSON::success(array('data' => $data));
        //return true;
      
    }
    /* I guess all sources could have one function in the future
     * list EXT4 files via webservice4recover
     * To do: implement one function for all external sources?
     * @param String $dir directory to get contents of
     * @return Array $filesFromExt4['files'] contents of given directory
     */
    function listTestdir($dir, $sourceGet, $sortAttribute, $sortDirection) {
        // add other file source | get files from webservice -> could become foreach loop with sources-array
        // better: implement function which is called with source and dir as param
        try {
            //$filesFromJsonFile = \OCA\Recover\Helper::getJsonFiles('http://localhost/fileData.json');
            // maybe getFilesFromSources + Source(s) as parameter, 
            // instead of calling a helper function for every source
            // TO DO: build Url based on selected dir
            //$serviceUrl = 'http://localhost/webservice4recover/index.php/files/listTestdir/testdir';
            // testdir has to be replaced with root-folder of snapshots etc.
            // hack to prepend slash in front of subdir, or list root dir!            
            if ($dir !== '/') {
                $dir = '%2F'.$dir;
                $dir = \str_replace('/', '%2F', $dir); // -> hier %2F nicht unten in serviceUrl!
                //$serviceUrl = 'http://localhost/webservice4recover/index.php/files/listTestdir/testdir'.$dir;
                $serviceUrl = 'http://localhost/webservice4recover/index.php/files/listDirGeneric/var%2Fwww%2Fwebservice4recover%2Ftestdir'.$dir.'/'.$sourceGet.'/'.$sortAttribute.'/'.$sortDirection;
            } else {
                //$serviceUrl = 'http://localhost/webservice4recover/index.php/files/listTestdir/testdir';
                $serviceUrl = 'http://localhost/webservice4recover/index.php/files/listDirGeneric/var%2Fwww%2Fwebservice4recover%2Ftestdir'.$dir.$sourceGet.'/'.$sortAttribute.'/'.$sortDirection;
            }
            // getting json here, therefore decoding to array!
            $filesFromSourceExt4 = json_decode(\OCA\Recover\Helper::getWebserviceFiles($serviceUrl), true);
        } catch (Exception $e) {
            $notFound = new NotFoundResponse();
            $notFound.setStatus(404);
            return $notFound;
        }
        return $filesFromSourceExt4;
    }
    
    /* I guess all sources could have one function in the future
     * list GPFS Snapshot files via webservice4recover
     * @param String $dir directory to get contents of
     * @return Array $filesFromSourceGpfsSs contents of given directory
     */
    function listGpfsSs($dir, $sourceGet, $sortAttribute, $sortDirection) {
        $baseDir = '/gpfs%2F.snapshots';
        try {
            // hack to prepend slash in front of subdir, or list root dir!            
            if ($dir !== '/') {
                $dir = '%2F'.$dir;
                $dir = \str_replace('/', '%2F', $dir);
                $dir = $baseDir.$dir;
                $serviceUrl = 'http://localhost/webservice4recover/index.php/files/listDirGeneric'.$dir.'/'.$sourceGet.'/'.$sortAttribute.'/'.$sortDirection;
            } else {
                $dir = $baseDir.$dir;
                $serviceUrl = 'http://localhost/webservice4recover/index.php/files/listDirGeneric'.$dir.$sourceGet.'/'.$sortAttribute.'/'.$sortDirection;
            }
            // getting json here, therefore decoding to array!
            $filesFromSourceGpfsSs = json_decode(\OCA\Recover\Helper::getWebserviceFiles($serviceUrl), true);
        } catch (Exception $e) {
            $notFound = new NotFoundResponse();
            $notFound.setStatus(404);
            return $notFound;
        }
        return $filesFromSourceGpfsSs;
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
