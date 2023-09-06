## Pre-reqs
aws-cli - https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
Node.js - https://nodejs.org/en/download
cdk - npm install aws-cdk

## Step by Step to deploy the solution

### You need to bootstraping the project
export AWS_ACCOUNT_NUMBER=  
export AWS_REGION=  
export AWS_ACCESS_KEY_ID=  
export AWS_SECRET_ACCESS_KEY=  

cdk bootstrap aws://account_number/region

### Download dependencies
npm install 
cd ./lambdas-functions && npm install && cd ..

### Deploy the solution
cdk deploy

## Useful commands
* `npm run test`         perform the jest unit tests
* `cdk deploy`           deploy this stack to your default AWS account/region
* `cdk diff`             compare deployed stack with current state
* `cdk synth`            emits the synthesized CloudFormation template

