import csv
import json
import urllib2
import requests

roster_file = 'roster.csv'

with open(roster_file, 'rb') as roster:
    members = csv.reader(roster)
    next(members)
    members_json =[] 
    for member in members:
        if not ('Coordinator' in member[4] or 'Director' in member[4]):
            if member[13]:
                r = requests.get('http://stackalytics.com/api/1.0/activity?user_id=' + member[13])
                valid_id = True if r.status_code == 200 else False
                dedicated = True if member[7] == 'OSIC' else False
                members_json.append({
                  'first_name': member[1],
                  'last_name': member[2],
                  'full_name': member[14],
                  'email': member[8],
                  'location': member[9],
                  'launchpad_id': member[13],
                  'dedicated': dedicated,
                  'hat': member[6],
                  'group': member[5],
                  'position': member[4],
                  'irc_handle': member[2],
                  'valid_id': valid_id,
                  'project': [member[3]]})
                if valid_id:
                    print member[13] + ' SUCCESS'
                else: 
                    print member[13] + '  FAILED'


    print json.dumps({ 'members': members_json })
