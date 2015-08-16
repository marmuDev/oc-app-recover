<?php
/**
 * @author Marcus Mundt <marmu@mailbox.tu-berlin.de>
 *
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
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 *
 * 
 * needs more params, check files-app lib/helper and trashbin lib/helper:
 * ($dir, \OCP\User::getUser(), $sortAttribute, $sortDirection);
 * 
 */
namespace OCA\Recover;
use OC\Files\FileInfo;
class Helper {
    /**
     * Retrieves the contents of a JSON file
     *
     * called from pagecontroller like this:
     * \OCA\Recover\Helper::getJsonFiles('http://localhost/fileData.json');
     * 
     * @param string $jsonFile with path to JSON file
     * @return php array files 
     */
    public static function getJsonFiles($jsonPath){
        $filesJson = file_get_contents($jsonPath);
        // transform json to php array. possible to not convert from json to array and to json again (in pagecontroller)?
        $files = json_decode($filesJson, true);
        // should return array
        return $files;
        // returns string
        //return $filesJson;
    }
    public static function getLocalExt4Files($localPath){
        $filesLocal = scandir($localPath);
        return $files;
    }
    /*
     * Get JSON data from webservice
     * @param $serviceUrl: URL of webservice, defines directory to be listed, source and sorting parameters
     * @return $files: Files and Folders of path in JSON
     */
    public static function getWebserviceFiles($serviceUrl) {
/*
* allow_url_fopen can be used to retrieve data from remote servers or websites. 
* However, if incorrectly used, this function can compromise the security of your site.
*  now with curl?
*/            
        // perhaps returning wrong type in webservice - noch echo instead of return
        //$files = file_get_contents($serviceUrl);
        //  Initiate curl
        $ch = curl_init();
        // Disable SSL verification
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        // Will return the response, if false it print the response
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        // Set the url
        curl_setopt($ch, CURLOPT_URL,$serviceUrl);
        // Execute
        $files=curl_exec($ch);
        // Closing
        curl_close($ch);
        
        // call to undefined function
        // further I got JSON now, would need an array to format dates!
        // --> format in webservice!
        //$filesTest=formatFilesDates($files);

        return $files;
    }
    
    /* not used for now, maybe obsolete or implement later if needed
     * format file dates to "right" format, see 
     * http://fossies.org/dox/owncloud-8.1.0/classOC_1_1DateTimeFormatter.html#a94300c31995ffdc60920f5fa0509ee66
     */
    //public static function formatFilesDates($files, $format, $timeZone, $l){
    public static function formatFilesDates($files){
        $dateTimeFormatter = OC::$server->query('DateTimeFormatter');
        
        //foreach ($files as $file) {
            // OC::$server->query('DateTimeFormatter')
            // OC\DateTimeFormatter::format($file['date'], 'datetime', $format, $timeZone, $l);
          //  $file['date']= OC\DateTimeFormatter::format($file['date'], 'datetime', "d F Y H:i:s", "MESZ", $l);
        //}
        
    }
}