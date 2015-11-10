<?php
/**
 * ownCloud - Recover
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
namespace OCA\Recover\Controller;

// use OCP namespace for all classes that are considered public.
// This means that they should be used by apps instead of the internal ownCloud classes
use OCP\IRequest;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\Http\Response;
use OCP\AppFramework\Http\NotFoundResponse;
use OCP\AppFramework\Http\JSONResponse;
use OCP\AppFramework\Controller;

// obsolete, trash bin won't be supported any more
//use OCA\Recover\Db\TrashBinMapper;
//use OCA\Files_Trashbin;

class PageController extends Controller {
    private $userId;
    //public function __construct($AppName, IRequest $request, $UserId,
    //                            TrashBinMapper $trashBinMapper) {
    public function __construct($AppName, IRequest $request, $UserId) {
        parent::__construct($AppName, $request);
        $this->userId = $UserId;
        $this->request = $request;
        //$this->trashBinMapper = $trashBinMapper;
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
    /** improvement: get template data with JS and replace app-content via handlebars client-side templating
     *  are routes + controllers needed at all for this?
     *  back to trashbin-style, load different contents via ajax
     *  __construct(string $appName, string $templateName, array $params, string $renderAs)
     * @return TemplateResponse blank template response to be loaded in app-content
     * 
     * @NoAdminRequired
     * 
    */
    public function recently() {
        return new TemplateResponse($this->appName, 'part.recent', [
                'user' => $this->userId,
                'appname' => $this->appName,
                'request' => $this->request
            ],
            // don't include in web interface, solely render the template (blank)
            ''
        );
    }
    /**
     * @return TemplateResponse blank template response to be loaded in app-content
     * 
     * @NoAdminRequired
     */
    public function search() {
        return new TemplateResponse($this->appName, 'part.search', [
                'user' => $this->userId,
                'appname' => $this->appName,
                'request' => $this->request
            ],
            ''
        );
    }
    /**
     * 
     * @return TemplateResponse blank template response to be loaded in app-content
     * 
     * @NoAdminRequired
     */
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
     * calls functions to get backed up files depending on sources
     * if no source is specified, we want all backed up files of user from any possible source
     * route: ['name' => 'page#list_backups', 'url' => '/listbackups', 'verb' => 'GET'],
     * 
     * To DO: more secure usage of $_GET variables!
     * 
     * @param String $dir directory to be listed
     * @param String $source source of backup files: octrash | ext4 | gpfsss | tubfss 
     * (oc trashbin, local ext4 files or GPFS/TUBFS Snapshots, removed trash bin compatibility, now only tubfsss)
     * @param String s$sort attribut to sort files by
     * @param String $sortdirection asc | desc (ascending or descending)
     * @return JSONResponse $data inclunding permissions, directory, files and source within files
     * 
     * @NoAdminRequired
     * 
     */
    public function listBackups($dir = '/', $source = '', $sort = 'mtime', $sortdirection = 'desc') {
        //      dir = / | "/folder1.d1437920477", sortAttribute = mtime, sortDirection = 1 -> desc
        // with other routes and requests we could pass those via the URL as params(?)
        $dirGet = isset($_GET['dir']) ? (string)$_GET['dir'] : '';
        // sanitize dir 
        $dirGet = str_replace(array('/', '\\'), '', $dirGet);
        
        $sortAttribute = isset($_GET['sort']) ? (string)$_GET['sort'] : 'mtime';
        $sortDirection = isset( $_GET['sortdirection'] ) ? $_GET['sortdirection'] : 'desc';
        $sourceGet = isset( $_GET['source'] ) ? $_GET['source'] : '';
        $snapshotGet = isset( $_GET['snapshot'] ) ? $_GET['snapshot'] : '';
         
        // a clicked dir can only have one source -> list contents of dir from source
        switch ($sourceGet) {
            case 'octrash':
                $data = $this->listTrashBin($dirGet, $sortAttribute, $sortDirection);
                break;
            /* add files from other sources - only tubfsss for now
            * filesFromJson is String, OC uses OC\Files\FileInfo
            * thats seems a bit too much work for now
            */
            case 'ext4':
                $files = $this->listTestdir($dirGet, $sourceGet);
                $data = $this->sortFilesArray($files, $sortAttribute, $sortDirection);
                break;
            case 'gpfsss':
                $files = $this->listGpfsSs($dirGet, $sourceGet);
                $data = $this->sortFilesArray($files, $sortAttribute, $sortDirection);
                break;
            case 'tubfsss':
                $files = $this->listTubfsSs("/snap_".$snapshotGet."/owncloud/data/".\OCP\User::getUser()."/files/".$dirGet, 'tubfsss');
                $data['files'] = $this->sortFilesArray($files['files'], $sortAttribute, $sortDirection);
                break;
            // list files of root directory -> collect data from all sources
            // tubfsss only for now
            default:
                //$data = $this->listTrashBin($dirGet, $sortAttribute, $sortDirection);
                //$filesFromExt4 = $this->listTestdir($dirGet, 'ext4');
                //$filesFromGpfsSs = $this->listGpfsSs($dirGet, 'gpfsss');
                // need to iterate through snapshots 0-5
                $filesFromTubfsSs = array();
                for ($snapCount = 0; $snapCount<6; $snapCount++) {
                    // initially no source available, set manually!
                    $tmpTubfs = $this->listTubfsSs("/snap_".$snapCount."/owncloud/data/".\OCP\User::getUser()."/files".$dirGet, 'tubfsss');
                    //array_push($filesFromTubfsSs['files'][], $tmpTubfs['files']);
                    $filesFromTubfsSs = array_merge($filesFromTubfsSs, $tmpTubfs['files']);
                }
                // merge arrays from all sources - only if array is not empty?!
                //$mergedFiles = array_merge($data['files'], $filesFromExt4['files'], $filesFromGpfsSs['files'], $filesFromTubfsSs);
                // sort Files and update ID
                //$sortedFiles = $this->sortFilesArray($mergedFiles, $sortAttribute, $sortDirection);
                $sortedFiles = $this->sortFilesArray($filesFromTubfsSs, $sortAttribute, $sortDirection);
                // is already run for OC trashbin by listTrashbin: \OCA\Files_Trashbin\Helper::getTrashFiles 
                // trying to sort with OC Files helper Class -> only works with FileInfo-Objects!
                //$sortedFiles = \OCA\Files\Helper::sortFiles($mergedFiles, $sortAttribute, $sortDirection);
                //$data['files'] = $mergedFiles;
                $data['files'] = $sortedFiles;
        }
        ////return new DataResponse($data); this was missing one layer 
        // gotta be result.data.files in filelist.js!
        // Use a AppFramework JSONResponse instead!
        return new JSONResponse(['data' => $data, "statusCode" => "200"]);
    }
    
    /** adapted from files_trashbin/ajax/list
     * http get: "/trashlist?dir=%2F&sort=mtime&sortdirection=desc"
     * 
     * lists trashbin files for current directory
     * ==> directory structure of available files muss be present at this time!
     * 
     * @param String $dir directory to be listed
     * @param String $sort attribut to sort files by
     * @param String $sortdirection asc | desc (ascending or descending)
     * @return Array $data with inclunding permissions, directory, files and source within files
     */
    public function listTrashBin($dir='/', $sort='name', $sortdirection=false) {
        // is checked by app framework automatically
        //\OCP\JSON::checkLoggedIn();
        // also obsolete!
        //\OC::$server->getSession()->close();
        // Load the files
        $data = array();
        try {
            // this is OC\Files\FileInfo format
            $files = \OCA\Files_Trashbin\Helper::getTrashFiles($dir, \OCP\User::getUser(), $sort, $sortdirection);
        } catch (Exception $e) {
            // don't use the header method but return a Response with the Http::STATUS_NOT_FOUND
            $notFound = new NotFoundResponse();
            $notFound.setStatus(404);
            return $notFound;
        }
        $encodedDir = \OCP\Util::encodePath($dir);
        $data['permissions'] = 0;
        $data['directory'] = $dir;
        $data['files'] = \OCA\Files_Trashbin\Helper::formatFileInfos($files);
        return $data;
    }
    /** Calls webservice via Helper using cURL
     * path to be listed (base directory of user):
     * /tubfs/.snapshots/snap_<snapshotId>/owncloud/data/<user>/files/ (snap_0 - snap_5)
     * @param String $dir directory to be listed 
     * @param String $sourceGet source filesystem from $_GET variable
     * @return String JSON $filesFromSourceTubfsSs filelist
     * 
     * 
     */
    function listTubfsSs($dir, $sourceGet) {
        $baseDir = '/tubfs%2F.snapshots';
        try {
            $dir = str_replace('/', '%2F', $dir);
            $dir = $baseDir.$dir;
            $serviceUrl = 'http://localhost/webservice4recover/index.php/files/listDirGeneric'.$dir.'/'.$sourceGet;
            // getting json here, therefore decoding to array!
            $filesFromSourceTubfsSs = json_decode(\OCA\Recover\Helper::callWebservice($serviceUrl), true);
        } catch (Exception $e) {
            $notFound = new NotFoundResponse();
            $notFound.setStatus(404);
            return $notFound;
        }
        return $filesFromSourceTubfsSs;
    }
    
    /**
     * list EXT4 files via webservice4recover -> listDirGeneric
     * 
     * @param String $dir directory to get contents of
     * @param String $sourceGet source filesystem from $_GET variable
     * @return Array $filesFromExt4['files'] contents of given directory
     */
    function listTestdir($dir, $sourceGet) {
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
                $dir = str_replace('/', '%2F', $dir); // -> hier %2F nicht unten in serviceUrl!
                //$serviceUrl = 'http://localhost/webservice4recover/index.php/files/listTestdir/testdir'.$dir;
                $serviceUrl = 'http://localhost/webservice4recover/index.php/files/listDirGeneric/var%2Fwww%2Fwebservice4recover%2Ftestdir'.$dir.'/'.$sourceGet;
            } else {
                //$serviceUrl = 'http://localhost/webservice4recover/index.php/files/listTestdir/testdir';
                $serviceUrl = 'http://localhost/webservice4recover/index.php/files/listDirGeneric/var%2Fwww%2Fwebservice4recover%2Ftestdir'.$dir.$sourceGet;
            }
            // getting json here, therefore decoding to array!
            $filesFromSourceExt4 = json_decode(\OCA\Recover\Helper::callWebservic($serviceUrl), true);
        } catch (Exception $e) {
            $notFound = new NotFoundResponse();
            $notFound.setStatus(404);
            return $notFound;
        }
        return $filesFromSourceExt4;
    }
    
    /** 
     * list GPFS Snapshot files via webservice4recover
     * 
     * @param String $dir directory to get contents of
     * @param String $sourceGet source filesystem from $_GET variable
     * @return Array $filesFromSourceGpfsSs contents of given directory
     */
    function listGpfsSs($dir, $sourceGet) {
        $baseDir = '/gpfs%2F.snapshots';
        try {
            // hack to prepend slash in front of subdir, or list root dir!            
            if ($dir !== '/') {
                $dir = '%2F'.$dir;
                $dir = str_replace('/', '%2F', $dir);
                $dir = $baseDir.$dir;
                $serviceUrl = 'http://localhost/webservice4recover/index.php/files/listDirGeneric'.$dir.'/'.$sourceGet;
            } else {
                $dir = $baseDir.$dir;
                $serviceUrl = 'http://localhost/webservice4recover/index.php/files/listDirGeneric'.$dir.$sourceGet;
            }
            // getting json here, therefore decoding to array!
            $filesFromSourceGpfsSs = json_decode(\OCA\Recover\Helper::callWebservice($serviceUrl), true);
        } catch (Exception $e) {
            $notFound = new NotFoundResponse();
            $notFound.setStatus(404);
            return $notFound;
        }
        return $filesFromSourceGpfsSs;
    }
    
    /**
     * Recovers files from different sources. tubfsss implemented others prepared
     * Route: ['name' => 'page#recover', 'url' => '/recover', 'verb' => 'POST']
     * 
     * To DO: more secure usage of $_GET variables!
     * 
     * not really using parameters, but $_POST variables:
     * @param String $_POST['files'] files to be recovered
     * @param String $_POST['dir'] source directory of files
     * @param String $_POST['sources'] sources (filesystem, directory, mount point) of files
     * @param String $_POST['snapshotIds'] files may be located in different shnapshots
     * @return JSONResponse array with statusCode and success or error message
     * 
     * @NoAdminRequired
     * 
     * 
     */
    public function recover() {
        //\OC::$server->getSession()->close(); -> obsolete, see above
        $files = $_POST['files'];
        $dir = '/';
        if (isset($_POST['dir'])) {
            $dir = rtrim($_POST['dir'], '/'). '/';
            // to do sanitize dir, but messes with recovery process
            //$dir = str_replace(array('/', '\\'), '', $dir);
        }
        // work around needed, otherwise sources is empty! need array below
        // when dir != "/" there is only one source and snapshot
        if (isset($_POST['sources'])) {
            $sourcesCount = count(json_decode($_POST['sources']));
            if ($sourcesCount > 1) { 
                $sources = json_decode($_POST['sources']);
            }
            else {
                $sources = json_decode($_POST['sources']);
            }
        }
        if (isset($_POST['snapshotIds'])) {
            $snapshotCount = count(json_decode($_POST['snapshotIds']));
            if ($snapshotCount > 1) {
                $snapshotIds = json_decode($_POST['snapshotIds']);
            }
            else {
                $snapshotIds = json_decode($_POST['snapshotIds']);
            }
        }
        $list = json_decode($files);
        $error = array();
        $success = array();
        // counter only increases on success, might be problematic!
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
            // use sources[$i] for each file, when files from different sources,
            if ($sourcesCount > 1){
                $nextSource = $sources[$i];
            } 
            else {
                $nextSource = $sources[0];
            }
            switch ($nextSource) {
                case 'octrash':
                    if ( !\OCA\Files_Trashbin\Trashbin::restore($path, $filename, $timestamp) ) {
                        $error[] = $filename;
                        // dev manual says to use exceptions for debugging
                        //but exceptions make app crash, since they are exceptions
                        //throw new \Exception( "recover can't recover \$filename = $filename" );
                        // "Class 'OCA\\Recover\\Controller\\OC_Log' not found
                        //-> netbeans + x-debug! 
                    } else {
                        $success[$i]['filename'] = $file;
                        $success[$i]['timestamp'] = $timestamp;
                        $i++;
                    }
                    break;
                case 'ext4':
                    $error[] = $filename;
                    break;
                case 'gpfsss':
                    $error[] = $filename;
                    break;
                case 'tubfsss':
                    // use shapshotIds[i] for each file, but [0] if same snapshot!
                    if ($snapshotCount > 1){
                        $nextSnapshotId = $snapshotIds[$i];
                    } 
                    else {
                        $nextSnapshotId = $snapshotIds[0];
                    }
                    $jsonResult = $this->recoverTubfsSs($dir, $filename, 'tubfsss', $nextSnapshotId);
                    // of course only works with valid json! 
                    // if not valid, then have output of service (HTML Error Page) in jsonResult for later usage
                    $result = json_decode($jsonResult, true);
                    if (($result === null) || ($result['statusCode'] !== 200)) {
                        $error[] = $filename;                    
                        // exceptions suck, since execution is stopped, but I (the user) want(s) to see the message
                        // // different behavior when not in debug mode?
                        //throw new \Exception( "recover can't restore \$filename = $filename" );
                    }
                    else {
                        $success[$i]['filename'] = $file;
                        $success[$i]['timestamp'] = $timestamp;
                        $i++;
                    }
                    break;
                default:
                    $error[] = $filename;
            }
        }
        if ( $error ) {
            $filelist = '';
            foreach ( $error as $e ) {
                $filelist .= $e.', ';
            }
            // translation via transiflex, ignore for now -> TO DO
            //$l = OC::$server->getL10N('recover');
            //$message = $l->t("Couldn't restore %s", array(rtrim($filelist, ', ')));
            // Unsupported operand types!?!
            //$message = "Couldn't restore " + array(rtrim($filelist, ', ')).toString();
            if (isset($result['message'])) {
                $message = "Couldn't recover ".substr($filelist, 0, -2).". Webservice says: ".$result['message'];   
            }
            else {
                $message = "Couldn't recover ".substr($filelist, 0, -2).". Webservice says: ".$jsonResult;
            }
            ////$message = $l->t("Couldn't restore %s", array(rtrim($filelist, ', ')));
            //OCP\JSON::error(array("data" => array("message" => $message,
            //                                    "success" => $success, "error" => $error)));
            return new JSONResponse(array("data" => array
                                        ("message" => $message,
                                        "success" => $success, "error" => $error), "statusCode" => "500"));
        } else {
            //OCP\JSON::success(array("data" => array("success" => $success)));
            $message = "Success! The file(s) have been moved to your home directory (/home/".\OCP\User::getUser()."/recovered).";
            return new JSONResponse(array("data" => array
                                        ("message" => $message,
                                        "success" => $success), "statusCode" => "200"));
        }
    }
    /** 
     * Recovers file/folder from tubfsss via helper class using cURL  
     * what if files and folders?!?! php rename() does not care,
     *  but problem if directory exists and is not empty
     * file/folder source path important, destination path depends on source path
     *
     * reminder: /tubfs/.snapshots/snap_<snapshotId>/owncloud/data/<user>/files/<dir>/<filename> (snap_0 - snap_5)
     * 
     * @param String $dir directory in which the recover target is located
     * @param String $filename file/folder below $dir to be recovered
     * @param String $source stically set to "tubfsss" in recover()
     * @param Int $snapshotId snapshotId of file/folder to be recovered
     */
    public function recoverTubfsSs($dir, $filename, $source, $snapshotId) {
        // attention: dir = "snap_3_folder_1/" if not root -> remove last char
        // does not work for recovering folders in root! -> adapt service source_dir
        if ($dir != '/') {
            $dir = substr($dir, 0, -1);
        }
        $dir = str_replace('/', '%2F', $dir);
        $filename = str_replace(' ', '%20',$filename);
        try {
            $serviceUrl = 'http://localhost/webservice4recover/index.php/files/recover/'.$filename.'/'.$source.'/'.$dir.'/'.\OCP\User::getUser().'/'.$snapshotId;
            //$result = json_decode(\OCA\Recover\Helper::callWebservice($serviceUrl), true);
            $result = \OCA\Recover\Helper::callWebservice($serviceUrl);
        } catch (Exception $ex) {

        }
        return $result;
    }

    /**
     * Sort whole Files-Array to belisted in OC Filelist before encoding to JSON
     * need to reindex Array, IDs important for file selection
     * 
     * @param Array $files all files ($mergedFiles)
     * @param String $sortAttribute sort by mtime or name
     * @param String $sortDirection sort desc or asc
     * @return Array sorted $files
     * 
     */
    public function sortFilesArray($files, $sortAttribute, $sortDirection) {
        if ($sortAttribute === 'name'){
            //($sortDirection === 'desc')? rsort($hash, SORT_STRING | SORT_FLAG_CASE) : sort($hash, SORT_STRING | SORT_FLAG_CASE);
            if ($sortDirection === 'desc') {
                usort($files, function($a, $b) { 
                    return strcasecmp( $b['name'], $a['name'] );
                });
            }
            else {
                usort($files, function($a, $b) { 
                    return strcasecmp( $a['name'], $b['name'] );
                });
            }
        } elseif ($sortAttribute === 'mtime') {
            //($sortDirection === 'desc')? rsort($hash, SORT_NUMERIC) : sort($hash, SORT_NUMERIC);
            if ($sortDirection === 'desc') {
                usort($files, function($a, $b) { 
                    return $b['mtime'] - $a['mtime']; 
                });
            }
            else {
                usort($files, function($a, $b) { 
                    return $a['mtime'] - $b['mtime']; 
                });
            }
        }
        // putting new ID in after sorting
        $idCounter = 0;
        foreach($files as $file) {
            $file['id'] = $idCounter;
            $files[$idCounter] = $file;
            $idCounter++;
        }
        return $files;
    }
}
