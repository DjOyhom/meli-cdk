const { Construct } = require("constructs");

const dynamodb = require("aws-cdk-lib/aws-dynamodb");
const elasticache = require("aws-cdk-lib/aws-elasticache");
const iam = require("aws-cdk-lib/aws-iam");

class Resources extends Construct {
    constructor(scope, id, props) {
        super(scope, id );
        this.vpc = props.vpc
        this.redisSecurityGroup = props.redisSecurityGroup

        this.table = new dynamodb.Table(this, "table",{
            partitionKey: { name: "shortCode", type: dynamodb.AttributeType.STRING}
        });

        this.redisCluster = new elasticache.CfnCacheCluster(this, "MyCluster", {
            cacheNodeType: "cache.t2.micro",
            engine: "redis",
            numCacheNodes: 1,
            vpcSecurityGroupIds: [this.redisSecurityGroup.securityGroupId],
            cacheSubnetGroupName: new elasticache.CfnSubnetGroup(this, "SubnetGroup", {
                subnetIds: this.vpc.selectSubnets().subnetIds,
                description: "subnet group for redis",
            }).ref,
        });

    }
}

module.exports = { Resources }
