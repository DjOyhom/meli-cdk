const { Construct } = require("constructs");

const iam = require("aws-cdk-lib/aws-iam");

class Resources extends Construct {
    constructor(scope, id, props) {
        super(scope, id );

        this.dynamo_table = props.dynamo_table
        this.lambda_dynamo_list = props.lambda_dynamo_list
        this.lambda_redis_list = props.lambda_redis_list
        this.lambda_to_lambda_list = props.lambda_to_lambda_list

        
        /////////Dynamo permissions
        this.lambda_dynamo_list.forEach(element => {
            this.dynamo_table.grantReadWriteData(element);
        });
        /////////Dynamo permissions---------------------------------------------------------------------------
        
        /////////IAM Policies Lambdas-Redis-------------------------------------------------------------------
        const redisPolicy = new iam.PolicyStatement({
            actions: ["elasticache:*"],
            resources: ["*"], 
        });

        this.lambda_redis_list.forEach(element => {
            element.addToRolePolicy(redisPolicy);
        });
        /////////IAM Policies Lambdas-Redis-------------------------------------------------------------------        


        /////////IAM Policies Lambdas-Lambda-------------------------------------------------------------------
        const lambdaInvokePolicy  = new iam.PolicyStatement({
            actions: ["lambda:InvokeFunction"],
            resources: ["*"], 
        });

        this.lambda_to_lambda_list.forEach(element => {
            element.addToRolePolicy(lambdaInvokePolicy);
        });
        /////////IAM Policies Lambdas-Redis-------------------------------------------------------------------        


    }
}

module.exports = { Resources }
