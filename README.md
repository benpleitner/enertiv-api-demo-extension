<!-- # Enertiv API Demo

The Enertiv Platform makes energy usage data 100% transparent in buildings. Our API lets you traverse the building hierarchy, from portfolio, to individual buildings, to sub-locations within a building, such as rooms and floors, to individual pieces of equipment, such as lights and air conditioners. Customized groups of equipment can also be tracked and managed with the API. The API also supports relevant metadata such as weather, occupancy, square footage, etc. for buildings monitored.

We want to help our users build and enhance products using our energy data. As a result, we have opened up our powerful API and open-sourced this demo to allow you to develop your own creative solutions.

Further [reading](http://www.enertiv.com/api-docs/ "Enertiv API Docs")

## Requirements
The Enertiv API Demo is written using Python for the server-side components and JavaScript for the client-side example. The sample leverages the following components:

- [Python](https://www.python.org/downloads/ "Python")

- Python package management via [pip](http://pip.readthedocs.org/en/latest/installing.html "pip install")

- [Flask](http://flask.pocoo.org/ "Flask") framework

- [Git](https://help.github.com/articles/set-up-git/ "Installing Git") for cloning the repository 


## Getting Started
Run this code in your terminal or command prompt to get the environment ready.


```bash
git clone git@bitbucket.org:enertiv/enertiv_api_demo.git
cd enertiv_api_demo

# If not already present install virtualenv and virtualenvwrapper on your system: Full instructions - http://virtualenvwrapper.readthedocs.org/en/latest/
pip install virtualenv
pip install virtualenvwrapper  
export WORKON_HOME=~/Envs
mkdir -p $WORKON_HOME
source /usr/local/bin/virtualenvwrapper.sh

# or for Windows users: https://pypi.python.org/pypi/virtualenvwrapper-win
pip install virtualenvwrapper-win

# fire up your virtual environment
mkvirtualenv api_demo

# to activate the already created virtualenv
workon api_demo

# Install dependencies via pip
pip install -r requirements.txt
```


## Running the web server

You can preview the service with sample data:

`python app.py`

Or run the full service with your Enertiv credentials (Requires Enertiv API Registration):

`python app.py SERVER_NAME SERVER_PASSWORD CLIENT_ID CLIENT_SECRET`

### Enertiv API Registration
To get your credentials for the Enertiv API and see live data: [API Registration](http://bit.ly/1LMKTlm "Enertiv API Registration")

## Viewing the client

Once the server is up and running simply go to `http://localhost:11999` in your browser.

## Screenshot

![Enertiv API Demo Screenshot](https://bitbucket.org/enertiv/enertiv_api_demo/raw/master/static/img/sunburst.png "Enertiv API Demo")

## Inspiration
This D3 code was inspired by a couple of fantastic examples: `http://www.jasondavies.com/coffee-wheel/` and `http://bl.ocks.org/kerryrodden/477c1bfb081b783f80ad` -->