#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { UserProfileStack } from '../lib/user-profile-stack';

const app = new cdk.App();

new UserProfileStack(app, 'UserProfileStack', {
  env: {
    account: '661303382183',
    region: 'ap-northeast-1',
  },
});
