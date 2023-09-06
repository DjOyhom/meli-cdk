const { Stack, Duration } = require('aws-cdk-lib');
// const sqs = require('aws-cdk-lib/aws-sqs');

const vpc_sg_import = require('../lib/vpc_sg');
const api_gateway_import = require('../lib/api_gateway');
const dynamo_redis_import = require('../lib/dynamo_redis');
const lambdas_import = require('../lib/lambdas');
const permission_policies_import = require('../lib/permission_policies');


class MeliCdkStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);
    
    const vpc_sg = new vpc_sg_import.Resources(this, "MeliVpcSG")  
    
    const dynamo_redis = new dynamo_redis_import.Resources(this, "MeliDynamoRedis",{
      vpc: vpc_sg.vpc,
      redisSecurityGroup: vpc_sg.redisSecurityGroup
    })  

    const lambdas = new lambdas_import.Resources(this, "MeliLambdas", {
      dynamo_table: dynamo_redis.table.tableName,
      redis_address: dynamo_redis.redisCluster.attrRedisEndpointAddress,
      vpc: vpc_sg.vpc,
      subnetType: vpc_sg.subnetType,
      redisSecurityGroup: vpc_sg.redisSecurityGroup
    })  
    
    const api_gateway = new api_gateway_import.Resources(this, "MeliApiGateway", {
      lambda_proxy: lambdas.lambda_proxy,
      lambda_docu: lambdas.lambda_docu,
      lambda_shortmanagement_get: lambdas.lambda_shortmanagement_get,
      lambda_shortmanagement_post: lambdas.lambda_shortmanagement_post,
      lambda_shortmanagement_put: lambdas.lambda_shortmanagement_put,
      lambda_shortmanagement_delete: lambdas.lambda_shortmanagement_delete,
      lambda_redis_get: lambdas.lambda_redis_get,
      lambda_redis_sync: lambdas.lambda_redis_sync
    })  

    const permission_policies = new permission_policies_import.Resources(this, "MeliPermissionPolicies",{
      dynamo_table: dynamo_redis.table,
      lambda_dynamo_list: [
        lambdas.lambda_shortmanagement_get,
        lambdas.lambda_shortmanagement_post,
        lambdas.lambda_shortmanagement_put,
        lambdas.lambda_shortmanagement_delete,
        lambdas.lambda_redis_sync
      ],
      lambda_redis_list: [        
        lambdas.lambda_proxy,
        lambdas.lambda_redis_sync
      ],
      lambda_sync_arn: lambdas.lambda_redis_sync.functionArn,
      lambda_to_lambda_list:[
        lambdas.lambda_shortmanagement_post,
        lambdas.lambda_shortmanagement_put,
        lambdas.lambda_shortmanagement_delete
      ]
    })

  }
}

module.exports = { MeliCdkStack }
