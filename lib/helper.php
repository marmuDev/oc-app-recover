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
     * @return array $files 
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

     /* Get JSON data from webservice
     * @param string $serviceUrl URL of webservice, defines directory to be listed, source and sorting parameters
     * @return string $files Files and Folders of path in JSON
     */
    public static function callWebservice($serviceUrl) {
        $ch = curl_init();
        // Disable SSL verification
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        // Will return the response. If false, it prints the response
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        // Set the url
        curl_setopt($ch, CURLOPT_URL, $serviceUrl);
        // Execute
        try {
            $result=curl_exec($ch);
        } catch (Exception $e) {
            $notFound = new NotFoundResponse();
            $notFound.setStatus(404);
            return $notFound;
        }
        // Closing
        curl_close($ch);
        return $result;
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