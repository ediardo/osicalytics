import argparse
import csv
import json
import requests
import urllib2

options = argparse.ArgumentParser(
    description='Script that validates launchpad_ids and generates a JSON ' +
                'with all of its members')
group = options.add_mutually_exclusive_group(required=True)
group.add_argument('--validate', action='store_true',
                    help='Validates Launchpad IDs')
group.add_argument('--parse', action='store_true',
                    help='Prints to stdout a JSON object with all members')
options.add_argument('--roster', required=True,
                     help='The source file (MUST BE CSV)')
args = options.parse_args()

with open(args.roster, 'rb') as roster:
    members = csv.reader(roster)
    # Skip headers
    next(members)
    members_json =[] 
    for member in members:
        if member[14]:
            r = requests.get('http://stackalytics.com/api/1.0/activity?user_id=' + 
                             member[14])
            valid_id = True if r.status_code == 200 else False
        else:
            valid_id = False
        dedicated = True if member[8] == 'OSIC' else False
        members_json.append({
          'first_name': member[0],
          'last_name': member[1],
          'full_name': member[15],
          'email': member[9],
          'location': member[10],
          'launchpad_id': member[14],
          'dedicated': dedicated,
          'hat': member[7],
          'group': member[6],
          'position': member[5],
          'irc_handle': member[2],
          'valid_id': valid_id,
          'project': [member[4]]})

    if args.validate:
        for member in members_json:
            print '{} ({}): {}'.format(member['full_name'] 
                                  or member['launchpad_id']
                                  or member['email'],
                                  member['group'],
                                  str(member['valid_id']).upper())
    elif args.parse:
        print json.dumps({'members': members_json})
