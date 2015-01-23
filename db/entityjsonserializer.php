<?php

/**
 * ownCloud - mynewapp - copied from news App
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Marcus Mundt <marmu@mailbox.tu-berlin.de>
 * @copyright Marcus Mundt 2014
 */


trait EntityJSONSerializer {
    
    public function serializeFields($properties) {
        $result = [];
        foreach($properties as $property) {
            $result[$property] = $this->$property;
        }
        return $result;
    }
    
}
