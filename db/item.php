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
 * Description of Item
 *
 * @author Marcus Mundt <marmu@mailbox.tu-berlin.de>
 */
class Item extends Entity {

    /** Note: a field id is set automatically by the parent class
     * Getters and setters will automatically be created for all public attributes
     * Holds app data
     * @var type 
     */
    public $name;
    public $path;
    public $user;
    public $timestamp;

    public function __construct(){
        // cast timestamp to an int when fromRow is being called
        // the second parameter is the argument that is passed to
        // the php function settype()
        $this->addType('timestamp', 'int');
    }


    // transform username to lower case
    public function setName($name){
        $name = strtolower($name);
        parent::setName($name);
    }

}