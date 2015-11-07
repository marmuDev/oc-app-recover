<?php
/**
 * ownCloud - Recover
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Marcus Mundt <marmu@mailbox.tu-berlin.de>
 * @copyright Marcus Mundt 2014
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
	public function testIndex () {
		$result = $this->container->query('PageController')->index();

		$this->assertEquals(array('user' => 'john'), $result->getParams());
		$this->assertEquals('main', $result->getTemplateName());
		$this->assertTrue($result instanceof TemplateResponse);
	}
*/

	
}