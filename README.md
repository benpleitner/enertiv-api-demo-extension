# Enertiv API Demo

Working example for using the Enertiv API.

## Getting Started
`bash`

    # If not already present install virtualenv and virtualenvwrapper to your system
    $ pip install virtualenv && pip install virtualenvwrapper

    # fire up your virtual environment
    $ mkvirtualenv api_demo

    # Install requirements
    (api_demo)$ pip install -r requirements.txt

    # Run the proxy server, you get these from EMS
    (api_demo)$ python app.py SERVER_NAME SERVER_PASSWORD CLIENT_ID CLIENT_SECRET

## Inspiration

This D3 code was borrowed from a couple fantastic examples: `http://www.jasondavies.com/coffee-wheel/` and `http://bl.ocks.org/kerryrodden/477c1bfb081b783f80ad`