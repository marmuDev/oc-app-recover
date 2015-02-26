<?php

/**
 * ownCloud - recover
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Marcus Mundt <marmu@mailbox.tu-berlin.de>
 * @copyright Marcus Mundt 2014
 */

namespace extClasses\Mailer;

/**
 * Description of MailInterface
 *
 * @author Marcus Mundt <marmu@mailbox.tu-berlin.de>
 */
class MailInterface {
    public function sendMessage($recipientEmail, $subject, $message, $from);
}
