
# Steps to get the API keys

We are using [Infura's IPFS API](https://docs.infura.io/infura/networks/ipfs) and its dedicated gateway to connect seamlessly and reliably to the IPFS network. Therefore we need the required API keys from their website.

Lets grab the API keys...

### 1. Sign-up and log in to [infura.io](https://infura.io/). After logging in, go to your dashboard.  
<img src="https://user-images.githubusercontent.com/63467479/190861769-991597fb-ed03-4138-ba84-ea7cc6397b2a.png">

### 2. Click on the Create New Key button on the top right corner. Choose IPFS as network and provide a name to your key.
<img src="https://user-images.githubusercontent.com/63467479/190861933-611da204-dfc8-49a8-8c79-dfd8fa2de747.png">

### 3. Copy the Project id and the API key and paste it inside the .env file. 
<img src="https://user-images.githubusercontent.com/63467479/190862011-0db5fe8c-ef57-4e67-9b24-a3f012632023.png">

### 4. Follow the steps of [client/README.md](../client/README.md) and copy the SECRET Key from the 3rd step and paste it inside the .env file.

### 5. For the MongoDB server, we have already created a test server for the development purpose. Copy the string below and paste it inside the .env file.
```
mongodb+srv://storz-dev:hacktoberfest@cluster0.pvq1ns2.mongodb.net/?retryWrites=true&w=majority
```

Also, you are free to create your own [MongoDB server](https://www.mongodb.com/atlas/database) if required.

</br>

### ⚠️ If you don't have a credit card and unable to generate the API keys from Infura, join our [Discord](https://discord.gg/Z9hbT8RGNG) and DM an admin to get the keys.

</br>

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the express server in the development mode using nodemon.\
Open [http://localhost:8080](http://localhost:8080) to view it in your browser.

You can change the PORT number from the .env file too
You may also see any lint errors in the console.