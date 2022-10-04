
# Steps to get the API keys

We are using [magic.link](https://magic.link/) to authenticate our users. It is a password-less authentication method which is secure, seamless, scalable & future-proof. It is also decentralized which is perfect for authenticating users in web3 apps.

Lets grab the API keys...

### 1. Sign-up and log in to [magic.link](https://magic.link/). After logging in, you will be welcome with this screen. Create an app name of your choice.  
<img src="https://user-images.githubusercontent.com/63467479/190847260-6d9c4b86-87ff-48ac-b301-c002eb1f07fa.png">

### 2. Click on Start with Auth. 
<img src="https://user-images.githubusercontent.com/63467479/190847409-fc620ef2-b7ab-4759-9804-d3f2d86137b0.png">

### 3. Rename the .env.example file to .env

### 4. Now copy the publishable API Key and paste it inside the .env file of the client folder. You will also need the secret key for the server later. 
<img src="https://user-images.githubusercontent.com/63467479/190847663-e7a8544f-abda-4d9f-a7e1-40dd6633e636.png">


## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.