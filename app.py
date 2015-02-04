# -*- coding: utf-8 -*-
"""
    Enertiv API Demo
"""
import os, sys
from functools import wraps
from flask import Flask, jsonify, render_template, request, abort, Markup, Response
from jinja2 import TemplateNotFound
from flask.ext.assets import Environment, Bundle
from api_client.enertiv_oauth_client import EnertivOAuthClient
import requests


#instatntiate the web app
app = Flask(__name__)
app.debug = True

#sets the asset environment to allow for scss compiling :)
assets = Environment(app)
assets.url = app.static_url_path
scss = Bundle('stylyn.scss', filters='pyscss', output='all.css')
assets.register('scss_all', scss)

client = None
api_url = "api.enertiv.com"


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/client')
def client_info():
    print "Client\n", client
    if client is not None:
        response_raw = client.get("https://" + api_url + "/api/client")
        response = response_raw.text
    else:
        with open("static/data/client.json", "r") as f:
            response = f.readlines()[0]
    return response


@app.route('/client/<uuid>')
def client_lookup(uuid):
    response = client.get("https://%s/api/client/%s" % (api_url,uuid))
    return response.text


@app.route('/location')
def location_info():
    location_uuid = request.args.get('location_uuid')
    # print "Request string: " + request.query_string
    url = "https://%s/api/location/%s" % (api_url,location_uuid)
    response = client.get(url)
    print "\n/location/location\n\t"
    return response.text


@app.route('/client/location')
def client_location():
    if client != None:
        uuid = request.args.get('uuid')
        url = "https://%s/api/client/%s/location" % (api_url,uuid)
        response_raw = client.get(url)
        response = response_raw.text
        print uuid
        print "/client/location"
    else:
        with open("static/data/location.json", "r") as f:
            response = f.readlines()[0]
    return response


@app.route('/location/data')
def location_data():
    """fromTime         The start time (yyyy-mm-dd hh:mm:ssZ) (in UTC Timezone) or (yyyy-mm-dd hh:mm:ss±ZZ) (ZZ = offset)   query
       toTime           The end time (yyyy-mm-dd hh:mm:ssZ) (in UTC Timezone) or (yyyy-mm-dd hh:mm:ss±ZZ) (ZZ = offset) query
       interval         The interval period {min, 15min, hour, day, week, month}    query
       profile          The profile for location data {operational, equipment}  query
       aggregate        Aggregate all data or break out data per equipment {true, false}. By default: true. query
       reading_type     Comma delimited list of reading types. By default {3,8,9}.  query
       data_format      Data format. {default, rickshaw}. If not specified, then default.   query"""
    if client is not None:
        location_uuid = request.args.get('location_uuid')
        q_string = request.args.get('q_string')
        print "\n/location/data\n\t", q_string
        url = "https://%s/api/location/%s/data?%s" % (api_url, location_uuid, q_string)
        response_raw = client.get(url)
        response = response_raw.text
    else:
        with open("static/data/location_data.json", "r") as f:
            response = f.readlines()[0]
    return response


#this nifty code just makes it so routes will be queried based on what
# the user enters in the URI if the page exists it is displayed :)
@app.route('/<page>')
def show(page):
    try:
        return render_template('%s.html' % page)
    except TemplateNotFound:
        abort(404)



def main(argv):
    # Updates the global client email
    global client
    if len(argv) > 3:
        client = EnertivOAuthClient(argv[0],argv[1], "https", api_url, 443, argv[2], argv[3])
        client.timeout = 600
    # client.get("https://ems.enertiv.com/api/client")
    # print client.access_token
    # Bind to PORT if defined, otherwise default to 5000.
    port = int(os.environ.get('PORT', 11999))
    app.run(host='0.0.0.0', port=port)


#this makes the app initiate
if __name__ == '__main__':
    main(sys.argv[1:])
