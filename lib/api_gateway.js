const { Construct } = require("constructs");
const apigateway = require("aws-cdk-lib/aws-apigateway");

class Resources extends Construct {
    constructor(scope, id, props) {
        super(scope, id);

        this.props = props;

        const api = new apigateway.RestApi(this, "gateway", {
            restApiName: "El Api Gateway",
            description: "This service serves widgets."
        });

        ///////Proxy lambda Path - /
        const lambda_proxy = new apigateway.LambdaIntegration(props.lambda_proxy, {requestTemplates: { "application/json": '{ "statusCode": "200" }' }});
        const proxyResource = api.root.addProxy({defaultIntegration: lambda_proxy});
        proxyResource.addMethod('GET');          
        ///////Proxy lambda--------------------------------------------------------------------------------------------------------
                      
        ///////Documentation Path - /docu
        const docu_endpoint = api.root.addResource('docu');
        const lambda_docu = new apigateway.LambdaIntegration(props.lambda_docu);
        docu_endpoint.addMethod("GET", lambda_docu);
        ///////Documentation-------------------------------------------------------------------------------------------------------
        
        ///////Short management Path - /short_management 
        const shortManagement = api.root.addResource('short_management');
        
        const lambda_shortmanagement_get = new apigateway.LambdaIntegration(props.lambda_shortmanagement_get);
        shortManagement.addMethod("GET", lambda_shortmanagement_get);
        
        const lambda_shortmanagement_post = new apigateway.LambdaIntegration(props.lambda_shortmanagement_post);
        shortManagement.addMethod("POST", lambda_shortmanagement_post);
        
        const lambda_shortmanagement_put = new apigateway.LambdaIntegration(props.lambda_shortmanagement_put);
        shortManagement.addMethod("PUT", lambda_shortmanagement_put);
        
        const lambda_shortmanagement_delete = new apigateway.LambdaIntegration(props.lambda_shortmanagement_delete);
        shortManagement.addMethod("DELETE", lambda_shortmanagement_delete);
        ///////Short management----------------------------------------------------------------------------------------------------


        ///////Redis management - Path /redis_management
        const redisManagement = api.root.addResource('redis_management');

        const lambda_redis_get_integration = new apigateway.LambdaIntegration(props.lambda_redis_get);
        redisManagement.addMethod("GET", lambda_redis_get_integration);

        const lambda_redis_sync_integration = new apigateway.LambdaIntegration(props.lambda_redis_sync);
        redisManagement.addMethod("POST", lambda_redis_sync_integration);
        ///////Redis management----------------------------------------------------------------------------------------------------
    }
}

module.exports = { Resources }