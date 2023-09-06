const { Construct } = require("constructs");
const lambda = require("aws-cdk-lib/aws-lambda");

class Resources extends Construct {
    constructor(scope, id, props) {
        super(scope, id);

        this.dynamo_table       = props.dynamo_table;
        this.redis_address      = props.redis_address;
        this.vpc                = props.vpc;
        this.subnetType         = props.subnetType;
        this.redisSecurityGroup = props.redisSecurityGroup;
        
        
        //////////Lambda Proxy------------------------------------------------------------------------------
        this.lambda_proxy = new lambda.Function(this, "lambda_proxy", {
            runtime: lambda.Runtime.NODEJS_14_X,
            code: lambda.Code.fromAsset("lambdas-functions"),
            handler: "lambda_proxy.main",
            environment: {
                DYNAMO_TABLE: this.dynamo_table,
                REDIS_ADDRESS: this.redis_address
            },
            vpc:  this.vpc,
            vpcSubnets: { subnetType: this.subnetType },
            securityGroup: this.redisSecurityGroup
        });
        //////////Lambda Proxy------------------------------------------------------------------------------
        
        //////////Lambda DOCU-------------------------------------------------------------------------------
        this.lambda_docu = new lambda.Function(this, "lambda_docu", {
            runtime: lambda.Runtime.NODEJS_14_X, // So we can use async in widget.js
            code: lambda.Code.fromAsset("lambdas-functions"),
            handler: "lambda_docu.main",
        });
        //////////Lambda DOCU-------------------------------------------------------------------------------
        
        //////////Lambda Redis GET--------------------------------------------------------------------------
        this.lambda_redis_get = new lambda.Function(this, "lambda_redis_get", {
            runtime: lambda.Runtime.NODEJS_14_X, // So we can use async in widget.js
            code: lambda.Code.fromAsset("lambdas-functions"),
            handler: "lambda_redis_get.main",
            environment: {
                REDIS_ADDRESS: this.redis_address
            },
            vpc:  this.vpc,
            vpcSubnets: { subnetType: this.subnetType },
            securityGroup: this.redisSecurityGroup
        });
        //////////Lambda Redis Sync-------------------------------------------------------------------------
        this.lambda_redis_sync = new lambda.Function(this, "lambda_redis_sync", {
            runtime: lambda.Runtime.NODEJS_14_X, // So we can use async in widget.js
            code: lambda.Code.fromAsset("lambdas-functions"),
            handler: "lambda_redis_sync.main",
            environment: {
                REDIS_ADDRESS: this.redis_address,
                DYNAMO_TABLE: this.dynamo_table
            },
            vpc:  this.vpc,
            vpcSubnets: {  subnetType: this.subnetType },
            securityGroup: this.redisSecurityGroup
        });
        //////////Lambda Redis------------------------------------------------------------------------------
        
        //////////Lambda Shortmanagement GET----------------------------------------------------------------
        this.lambda_shortmanagement_get = new lambda.Function(this, "lambda_shortmanagement_get", {
            runtime: lambda.Runtime.NODEJS_14_X, // So we can use async in widget.js
            code: lambda.Code.fromAsset("lambdas-functions"),
            handler: "lambda_shortmanagement_get.main",
            environment: {
                DYNAMO_TABLE: this.dynamo_table,
                REDIS_ADDRESS: this.redis_address
            },
            vpc:  this.vpc,
            vpcSubnets: { subnetType: this.subnetType },
            securityGroup: this.redisSecurityGroup
        });
        //////////Lambda Shortmanagement POST---------------------------------------------------------------
        this.lambda_shortmanagement_post = new lambda.Function(this, "lambda_shortmanagement_post", {
            runtime: lambda.Runtime.NODEJS_14_X, // So we can use async in widget.js
            code: lambda.Code.fromAsset("lambdas-functions"),
            handler: "lambda_shortmanagement_post.main",
            environment: {
                DYNAMO_TABLE: this.dynamo_table,
                REDIS_ADDRESS: this.redis_address,
                LAMBDA_SYNC: this.lambda_redis_sync.functionName
            },
            vpc:  this.vpc,
            vpcSubnets: { subnetType: this.subnetType },
            securityGroup: this.redisSecurityGroup
        });
        //////////Lambda Shortmanagement PUT----------------------------------------------------------------
        this.lambda_shortmanagement_put = new lambda.Function(this, "lambda_shortmanagement_put", {
            runtime: lambda.Runtime.NODEJS_14_X, // So we can use async in widget.js
            code: lambda.Code.fromAsset("lambdas-functions"),
            handler: "lambda_shortmanagement_put.main",
            environment: {
                DYNAMO_TABLE: this.dynamo_table,
                REDIS_ADDRESS: this.redis_address,
                LAMBDA_SYNC: this.lambda_redis_sync.functionName
            },
            vpc:  this.vpc,
            vpcSubnets: { subnetType: this.subnetType },
            securityGroup: this.redisSecurityGroup
        });
        //////////Lambda Shortmanagement DELETE-------------------------------------------------------------
        this.lambda_shortmanagement_delete = new lambda.Function(this, "lambda_shortmanagement_delete", {
            runtime: lambda.Runtime.NODEJS_14_X, // So we can use async in widget.js
            code: lambda.Code.fromAsset("lambdas-functions"),
            handler: "lambda_shortmanagement_delete.main",
            environment: {
                DYNAMO_TABLE: this.dynamo_table,
                REDIS_ADDRESS: this.redis_address,
                LAMBDA_SYNC: this.lambda_redis_sync.functionName
            },
            vpc:  this.vpc,
            vpcSubnets: { subnetType: this.subnetType },
            securityGroup: this.redisSecurityGroup
        });
        //////////Lambda Shortmanagement--------------------------------------------------------------------

    }
}

module.exports = { Resources }