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
/** Vergeleiche News App
 * https://github.com/owncloud/news/blob/master/db/newsmapper.php
 * -> Mapper pro App-Tabelle 
 * + mapperfactory (für x DB-Backends, ggf auch für x tables?) 
 * in appinfo/application.php Instanziiert
 * 
 */
//use \OCP\IDb;
//use \OCP\AppFramework\Db\Entity;
use \OCP\AppFramework\Db\Mapper;

/**
 * Description of TrashBinMapper
 * For querying data defined in trashbinitem.php
 *
 * @author Marcus Mundt <marmu@mailbox.tu-berlin.de>
 */
class TrashBinMapper extends Mapper {

    //__construct(IDb $db, string $tableName, string $entityClass)
    //public function __construct(API $api) {
    public function __construct($idb) {
        parent::__construct($idb, 'files_trash'); // tablename 
    }

    /**
     * Always use ? to mark placeholders for arguments in SQL queries and
     * pass the arguments as a second parameter to the execute function
     * to prevent SQL Injection
     * should be limited to XXX entities, 
     * if first select doesn't show wanted files,
     * then there there should be a "next" button, 
     * triggering another sql select
     * @param type $userId
     * @return 
     */
    public function find($userId){
        $sql = 'SELECT * FROM `' . $this->getTableName() . '` ' .
        'WHERE `user` = ? ';
        $result = $this->findEntities($sql, array($userId));
//        $result = $this->findEntity($sql, array($userId));
//        var_dump($result);
        return $result;
        //$params = [$userId, "foo"];
//        $result = $this->execute($sql, array($userId));

    }
    
//    public function findOne($userId){
//      $sql = 'SELECT * FROM `' . $this->getTableName() . '` ' .
//        'WHERE `user` = ?';
//
//      // use findOneQuery to throw exceptions when no entry or more than one
//      // entries were found
//      $row = $this->findOneQuery($sql, array($userId));
//    }


//    public function findByName($name){
//      $sql = 'SELECT * FROM `' . $this->getTableName() . '` ' .
//      'WHERE `name` = ? ';
//
//      $row = $this->execute($sql, array($name));
//      $deletedItem = new TrashBin();
//      $deletedItem->fromRow($row);
//
//      return $deletedItem;
//    }

}