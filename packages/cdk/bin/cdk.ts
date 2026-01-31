#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ApiStack } from "../lib/api-stack";
import { InfraStack } from "../lib/infra-stack";
import * as dotenv from "dotenv";
import * as path from "path";

// .envファイルを読み込み
dotenv.config({ path: path.resolve(__dirname, "../.env") });

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
  imagesBucket: infra.imagesBucket,
  cloudFrontDistribution: infra.imagesDistribution,
});
