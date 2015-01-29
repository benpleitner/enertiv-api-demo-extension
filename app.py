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

client = ""
api_url = "api.enertiv.com"


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/client')
def client():
    response = client.get("https://" + api_url + "/api/client")
    return response.text


@app.route('/client/<uuid>')
def client_lookup(uuid):
    response = client.get("https://%s/api/client/%s" % (api_url,uuid))
    return response.text


@app.route('/client/location')
def client_location():
    uuid = request.args.get('uuid')
    url = "https://%s/api/client/%s/location" % (api_url,uuid)
    # "https://ems.enertiv.com/api/client/" + uuid + "/location/"

    response = client.get(url)
    print uuid
    print "/client/location"
    return response.text


@app.route('/location/data')
def location_data():
    """fromTime         The start time (yyyy-mm-dd hh:mm:ssZ) (in UTC Timezone) or (yyyy-mm-dd hh:mm:ss±ZZ) (ZZ = offset)   query
       toTime           The end time (yyyy-mm-dd hh:mm:ssZ) (in UTC Timezone) or (yyyy-mm-dd hh:mm:ss±ZZ) (ZZ = offset) query
       interval         The interval period {min, 15min, hour, day, week, month}    query
       profile          The profile for location data {operational, equipment}  query
       aggregate        Aggregate all data or break out data per equipment {true, false}. By default: true. query
       reading_type     Comma delimited list of reading types. By default {3,8,9}.  query
       data_format      Data format. {default, rickshaw}. If not specified, then default.   query"""
    location_uuid = request.args.get('location_uuid')
    q_string = request.args.get('q_string')
    print "\n/location/data\n\t", q_string
    url = "https://%s/api/location/%s/data?%s" % (api_url, location_uuid, q_string)
    response = client.get(url)
    return response.text


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
    client = EnertivOAuthClient(argv[0],argv[1], "https", api_url, 443, argv[2], argv[3])
    client.timeout = 600
    # client.get("https://ems.enertiv.com/api/client")
    # print client.access_token
    # Bind to PORT if defined, otherwise default to 5000.
    port = int(os.environ.get('PORT', 11999))
    app.run(host='127.0.0.1', port=port)


#this makes the app initiate
if __name__ == '__main__':
    main(sys.argv[1:])


# @app.route('/client/group')
# def group():
#     # client = EnertivClient("enertiv", cred_n, cred_p, "https", "ems.enertiv.com", 443)
#     uuid = request.args.get('uuid')
#     # print "Request string: " + request.query_string
#     url = "https://ems.enertiv.com/api/client/" + uuid + "/group/"
#     response = client.get(url)
#     return response.text


# @app.route('/client/location')
# def client_location():
#     # client = EnertivClient("enertiv", cred_n, cred_p, "https", "ems.enertiv.com", 443)
#     uuid = request.args.get('uuid')
#     # print "Request string: " + request.query_string
#     url = "https://ems.enertiv.com/api/client/" + uuid + "/location/"
#     response = client.get(url)
#     print "/client/location"
#     return response.text


# @app.route('/location/data')
# def location():
#     # client = EnertivClient("enertiv", cred_n, cred_p, "https", "ems.enertiv.com", 443)
#     location_uuid = request.args.get('location_uuid')
#     q_string = request.args.get('q_string')
#     # fromTime = request.args.get('fromTime')
#     # toTime = request.args.get('toTime')
#     # interval = request.args.get('interval')
#     # profile = request.args.get('profile')
#     # aggregate = request.args.get('aggregate')
#     # reading_type = request.args.get('reading_type')
#     # data_format = request.args.get('data_format')
#     # print "Request string: " + request.query_string
#     print "\n/location/data\n\t", q_string
#     url = "https://ems.enertiv.com/api/location/" + location_uuid + "/data?" + q_string
#     response = client.get(url)
#     return response.text

# @app.route('/group/data')
# def group_data():
#     # client = EnertivClient("enertiv", cred_n, cred_p, "https", "ems.enertiv.com", 443)
#     group_uuid = request.args.get('group_uuid')
#     q_string = request.args.get('q_string')
#     print "\n/group/data\n\t", q_string
#     url = "https://ems.enertiv.com/api/group/" + group_uuid + "/data?" + q_string
#     response = client.get(url)
#     return response.text

# @app.route('/location/temperature')
# def location_temperature():
#     # client = EnertivClient("enertiv", cred_n, cred_p, "https", "ems.enertiv.com", 443)
#     location_uuid = request.args.get('location_uuid')
#     q_string = request.args.get('q_string')
#     print "\n/location/temperature\n\t", q_string
#     url = "https://ems.enertiv.com/api/location/" + location_uuid + "/temperature?" + q_string
#     response = client.get(url)
#     return response.text


# @app.route('/location/weather')
# def location_weather():
#     # client = EnertivClient("enertiv", cred_n, cred_p, "https", "ems.enertiv.com", 443)
#     location_uuid = request.args.get('location_uuid')
#     response = client.get("https://ems.enertiv.com/api/location/" + location_uuid + "/weather")
#     print "\n/location/temperature\n\t", q_string
#     response.encoding = "utf-8"
#     # print response.encoding
#     return response.text


# @app.route('/location/characteristic')
# def location_characteristic():
#     # client = EnertivClient("enertiv", cred_n, cred_p, "https", "ems.enertiv.com", 443)
#     location_uuid = request.args.get('location_uuid')
#     response = client.get("https://ems.enertiv.com/api/location/" + location_uuid + "/characteristic")
#     response.encoding = "utf-8"
#     print "\n/location/characteristic\n\t"
#     return response.text


# @app.route('/location/price')
# def location_price():
#     # client = EnertivClient("enertiv", cred_n, cred_p, "https", "ems.enertiv.com", 443)
#     location_uuid = request.args.get('location_uuid')
#     response = client.get("https://ems.enertiv.com/api/location/" + location_uuid + "/price")
#     response.encoding = "utf-8"
#     print "\n/location/price\n\t"
#     return response.text


# @app.route('/location/environmental_impact')
# def location_environmental_impact():
#     # client = EnertivClient("enertiv", cred_n, cred_p, "https", "ems.enertiv.com", 443)
#     location_uuid = request.args.get('location_uuid')
#     impact = request.args.get('impact')
#     response = client.get("https://ems.enertiv.com/api/location/" + location_uuid + "/environmental_impact?impact=" + impact)
#     response.encoding = "utf-8"
#     print "\n/location/Environmental_impact\n\t"
#     return response.text

# @app.route('/location/occupancy')
# def location_occupancy():
#     # client = EnertivClient("enertiv", cred_n, cred_p, "https", "ems.enertiv.com", 443)
#     location_uuid = request.args.get('location_uuid')
#     # print "Request string: " + request.query_string
#     url = "https://ems.enertiv.com/api/location/" + location_uuid + "/occupancy/"
#     response = client.get(url)
#     print "\n/location/occupancy\n\t"
#     return response.text

# @app.route('/location')
# def location_info():
#     # client = EnertivClient("enertiv", cred_n, cred_p, "https", "ems.enertiv.com", 443)
#     location_uuid = request.args.get('location_uuid')
#     # print "Request string: " + request.query_string
#     url = "https://ems.enertiv.com/api/location/" + location_uuid + "/"
#     response = client.get(url)
#     print "\n/location/location\n\t"
#     return response.text
