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

namespace OCA\MyNewApp\Service;

use OCP\IConfig;

/**
 * Description of configservice
 *
 * @author Marcus Mundt <marmu@mailbox.tu-berlin.de>
 */
class ConfigService {

    private $config;
    private $appName;

    public function __construct(IConfig $config, $AppName){
        $this->config = $config;
        $this->appName = $AppName;
    }

    public function getUserValue($key, $userId) {
        return $this->config->getUserValue($userId, $this->appName, $key);
    }

    public function setUserValue($key, $userId, $value) {
        $this->config->setUserValue($userId, $this->appName, $key, $value);
    }

}
