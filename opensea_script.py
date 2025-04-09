import requests

'
# Your OpenSea API key
'
api_key = "a3831140b686486796da1b3b9b1033fe"

'
# URL for the Doodles collection assets on OpenSea
'
url = "https://api.opensea.io/api/v1/assets"

'
# Parameters for the API request
'
params = {
'
    "collection": "doodles-official",  # The collection slug
'
    "limit": 50  # Number of assets per request (max is 50)
'
}

'
# Headers to include your API key
'
headers = {
'
    "Accept": "application/json",
'
    "X-API-KEY": api_key
'
}

'
# Making the request to the OpenSea API
'
response = requests.get(url, headers=headers, params=params)

'
# Check if the request was successful
'
if response.status_code == 200:
'
    data = response.json()
'
    # Process and use the metadata as needed
'
    for asset in data['assets']:
'
        print(f"Name: {asset['name']}, Traits: {asset['traits']}, Image URL: {asset['image_url']}")
'
else:
'
    print(f"Error: {response.status_code} - {response.text}")
'
