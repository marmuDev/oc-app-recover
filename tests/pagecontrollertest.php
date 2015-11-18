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

namespace OCA\Recover\Tests\Controller;

// phpunit doc says:
//class PageControllerTest extends \PHPUnit_Framework_TestCase {
//oc dev doc says:
class PageControllerTest extends \Test\TestCase {
    private $container;
    private $controller;

    protected function setUp () {
        parent::setUp();
        //$phpunit = $this;
        $app = new \OCA\Recover\AppInfo\Recover();
        $this->container = $app->getContainer();

        //$this->controller = $controller = $this->getMockBuilder($app)
        $this->controller = $controller = $this->getMockBuilder('\OCA\Recover\Controller\PageController')            
            ->disableOriginalConstructor()
            ->getMock();

        $this->container->registerService('PageController', function($c) use ($controller) {
            return $controller;
        });
    }
    /*
     * listBackups($dir = '/', $source = '', $sort = 'mtime', $sortdirection = 'desc')
     */
    //public function testListBackups() {
    public function testWebserviceNotFound() {
        //$this->controller->listBackups('/', 'tubfsss', 'mtime', 'desc');
        $this->container['PageController']->listBackups('/', 'tubfsss', 'mtime', 'desc');
    }
/*
	public function testIndex () {
		$result = $this->container->query('PageController')->index();

		$this->assertEquals(array('user' => 'john'), $result->getParams());
		$this->assertEquals('main', $result->getTemplateName());
		$this->assertTrue($result instanceof TemplateResponse);
	}
*/

	
}