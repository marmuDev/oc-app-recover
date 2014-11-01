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

use \OCP\AppFramework\Db\Mapper;

/**
 * Description of ItemMapper
 * For querying the app data
 *
 * @author Marcus Mundt <marmu@mailbox.tu-berlin.de>
 */
class ItemMapper extends Mapper {


    public function __construct(API $api) {
      parent::__construct($api, 'yourapp_items'); // tablename is news_feeds
    }


    public function find($id, $userId){
      $sql = 'SELECT * FROM `' . $this->getTableName() . '` ' .
        'WHERE `id` = ? ' .
        'AND `user_id` = ?';

      // use findOneQuery to throw exceptions when no entry or more than one
      // entries were found
      $row = $this->findOneQuery($sql, array($id, $userId));
      $feed = new Item();
      $feed->fromRow($row);

      return $feed;
    }


    public function findByName($name){
      $sql = 'SELECT * FROM `' . $this->getTableName() . '` ' .
      'WHERE `name` = ? ';

      $row = $this->execute($sql, array($name));
      $feed = new Item();
      $feed->fromRow($row);

      return $feed;
    }

}