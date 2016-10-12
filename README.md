# Table of Contents
* Introduction 
* Prerequitities
* Installing
* Deployment
* Contributing
* Authors
* License

## Introduction


## Prerequisities
Install npm and bower.

## Installing
Install npm dependencies
`
$ cd osicalytics
$ npm install
`

Install bower dependencies
`$ bower install`


### Updating the roster (members.json)
Download the latest CSV version of the OSIC Roster and use the roster_parter.py script to generate a JSON object
`$ tools/roster_parser.py > members.json`

## Deployment
### Development
`
$ cd osicalytics
$ grunt`

### Production
Just set the docroot as the project directory

## Authors
Awesome contributors that make this happen are:
* Eddie Ramirez <eddie.ramirez@intel.com>
* Daniel Castellanos <luis.daniel.castellanos@intel.com>

## Contributing
Find a bug? Request a new feature? Submit an issue or PR

## License
This project is licensed under the Apache 2.0 License - see the LICENSE.md file for details
