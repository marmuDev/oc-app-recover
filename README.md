# Recover
Place this app in **owncloud/apps/**


## Running tests
After [Installing PHPUnit](http://phpunit.de/getting-started.html) run:

    phpunit tests/

After [Installing Karma](https://karma-runner.github.io/latest/intro/installation.html)

    edit recover.karma.conf.js
    karma start recover.karma.conf.js

## API

[http://www.marmu.de/apidoc/](http://www.marmu.de/apidoc/)

=======
oc-app-recover - App Name "Recover"
==========

Modular ownCloud App for Accessing Different Data Sources for Recovery.
Based on files and trashbin app it is using filelist to display backed up files 
fetched via a webservice. Recovery of files also via Webservice4Recover:
https://github.com/marmuDev/webservice4recover
