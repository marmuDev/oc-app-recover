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

/**
 * Description of sendNotifications
 *
 * @author Marcus Mundt <marmu@mailbox.tu-berlin.de>
 */

namespace extClasses\Mailer;

use extClasses\Mailer\MailInterface;

class SendNotifications {
    private $pdo;

    private $mailer;

    public function __construct()
    {
           
    }
    /**
    public function __construct(\PDO $pdo, MailInterface $mailer)
    {
        $this->pdo = $pdo;
        $this->mailer = $mailer;
    }
       */
    public function emailFriends()
    {
        $sql = 'SELECT * FROM people_to_spam';
        foreach ($this->pdo->query($sql) as $row) {
            $this->mailer->sendMessage(
                $row['email'],
                'Yay! We want to send you money for no reason!',
                sprintf(<<<EOF
Hi %s! We've decided that we want to send you money for no reason!

Please forward us all your personal information so we can make a deposit and don't ask any questions!
EOF
                    , $row['name']),
                'YourTrustedFriend@SendMoneyToStrangers.com'
            );
        }
    }
}
