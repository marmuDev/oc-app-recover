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
 */
namespace OCA\Recover;
use OC\Files\FileInfo;
class Helper {
	// some private vars
	/**
	 * Retrieves the contents of a JSON file
	 *
	 * @param string $jsonFile with path to JSON file
	 * @return files array? in JSON format?
	 */
	public static function getJsonFiles($jsonPath){
		
            $filesJson = file_get_contents($jsonPath);
            // transform json to php array. possible to not convert from json to array to json again (in pagecontroller)?
            $files = json_decode($filesJson, true);
            // should return array
            return $files;
            // returns string
            //return $filesJson;
	}
}