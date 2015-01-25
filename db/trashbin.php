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

namespace OCA\MyNewApp\Db;

use \OCP\AppFramework\Db\Entity;

/**
 * Description of TrashBin:
 * Item-Class for oc_files_trash
 * Naming convention: ItemMapper -> Item, so it is "MapperName" minus "Mapper"!
 * Item is a deleted/altered file of a user.
 * There are different sources for such an item, first one is the oc trashbin
 * database: ocdev, table: oc_files_trash
 *
 * @author Marcus Mundt <marmu@mailbox.tu-berlin.de>
 */
class TrashBin extends Entity implements IAPI, \JsonSerializable {

    /** Note: a field id is set automatically by the parent class
     * Getters and setters will automatically be created for all public attributes
     * Following attributes from rows in table oc_files_trash
     * @var filename - id is filename in the oc_files_trash table
     * @var location - path within OC folder structure
     * @var type - data type required?
     */
    // autoID required? no error using it
    // ABER: a field id is set automatically by the parent class
    protected $autoId;
    protected $filename;
    protected $user;
    protected $timestamp;
    protected $location;
    protected $type;
    // not part of oc_files_trash!
    //protected $source;
    protected $mime;

    public function __construct(){
        $this->addType('timestamp', 'string');
    }

    // map attribute filename to the database column id
    // in addition one could map autoId to id and the other way round
    public function columnToProperty($column) {
        if ($column === 'id') {
            return 'filename';
        } else {
            return parent::columnToProperty($column);
        }
    }

    public function propertyToColumn($property) {
        if ($column === 'filename') {
            return 'id';
        } else {
            return parent::propertyToColumn($property);
        }
    }

     /**
    * Turns entitie attributes into an array
    */
    public function jsonSerialize() {
        return [
            'id' => $this->getAutoId(),
            'filename' => $this->getFilename(),
            'user' => $this->getUser(),
            'timestamp' => $this->getTimestamp(),
            'location' => $this->getLocation(),
            'type' => $this->getType(),
            //'source' => $this->getSource(),
            'mime' => $this->getMime()
        ];
    }
    public function toAPI() {
        return [
            'id' => $this->getAutoId(),
            'filename' => $this->getFilename(),
            'user' => $this->getUser(),
            'timestamp' => $this->getTimestamp(),
            'location' => $this->getLocation(),
            'type' => $this->getType(),
            //'source' => $this->getSource(),
            'mime' => $this->getMime()
        ];
    }

    // transform username to lower case
    public function userToLowerCase($name){
        $name = strtolower($name);
        parent::setName($name);
    }

}