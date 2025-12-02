#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { UserProfileStack } from '../lib/user-profile-stack';
import { CoreStack } from "../lib/core-stack";

const app = new cdk.App();

const core = new CoreStack(app, "CoreStack", {
  env: { account: "661303382183", region: "ap-northeast-1" }, // 必要に応じて
});


new UserProfileStack(app, 'UserProfileStack', {
  env: {
    account: '661303382183',
    region: 'ap-northeast-1',
  },
  userPool: core.userPool,
  userPoolClient: core.userPoolClient,
  supabaseUrlParam: core.supabaseUrlParam,
  supabaseAnonKeyParam: core.supabaseAnonKeyParam,
  userImagesBucket: core.userImagesBucket,

});
