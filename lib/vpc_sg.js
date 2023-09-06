const { Construct } = require("constructs");

const ec2 = require("aws-cdk-lib/aws-ec2");

class Resources extends Construct {
    constructor(scope, id,) {
        super(scope, id );

        const vpc = new ec2.Vpc(this, "Vpc", { maxAzs: 2 }); // crea una nueva VPC
        this.vpc = vpc
        this.subnetType = ec2.SubnetType.PRIVATE;
        
        const redisSecurityGroup = new ec2.SecurityGroup(this, "RedisSecGroup", { vpc });
        redisSecurityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(6379),
            'Allow inbound TCP traffic on port 6379'
        );
        this.redisSecurityGroup = redisSecurityGroup
    }
}

module.exports = { Resources }
