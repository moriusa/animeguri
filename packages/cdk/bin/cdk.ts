#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ApiStack } from "../lib/api-stack";
import { InfraStack } from "../lib/infra-stack";

const app = new cdk.App();

const infra = new InfraStack(app, "InfraStack", {
  env: { account: "661303382183", region: "ap-northeast-1" }, // 必要に応じて
});

new ApiStack(app, "ApiStack", {
  env: {
    account: "661303382183",
    region: "ap-northeast-1",
  },
  userPool: infra.userPool,
  userPoolClient: infra.userPoolClient,
  supabaseUrlParam: infra.supabaseUrlParam,
  supabaseAnonKeyParam: infra.supabaseAnonKeyParam,
  imagesBucket: infra.imagesBucket,
  cloudFrontDistribution: infra.imagesDistribution,
});
