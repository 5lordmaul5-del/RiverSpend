#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

: "${RIVER_BACKUP_S3_BUCKET:?Set a globally unique S3 bucket name}"
AWS_REGION="${RIVER_BACKUP_AWS_REGION:-eu-west-1}"

command -v aws >/dev/null 2>&1 || { echo "AWS CLI v2 is required." >&2; exit 1; }
aws sts get-caller-identity --no-cli-pager >/dev/null

if aws s3api head-bucket --bucket "$RIVER_BACKUP_S3_BUCKET" --no-cli-pager 2>/dev/null; then
  echo "Bucket already exists and is accessible; verifying Object Lock."
  aws s3api get-object-lock-configuration --bucket "$RIVER_BACKUP_S3_BUCKET" --no-cli-pager |
    jq -e '.ObjectLockConfiguration.ObjectLockEnabled == "Enabled"' >/dev/null
else
  echo "Creating a new EU bucket with Object Lock enabled."
  if [[ "$AWS_REGION" == "us-east-1" ]]; then
    aws s3api create-bucket       --bucket "$RIVER_BACKUP_S3_BUCKET"       --object-lock-enabled-for-bucket       --region "$AWS_REGION"       --no-cli-pager >/dev/null
  else
    aws s3api create-bucket       --bucket "$RIVER_BACKUP_S3_BUCKET"       --object-lock-enabled-for-bucket       --create-bucket-configuration "LocationConstraint=$AWS_REGION"       --region "$AWS_REGION"       --no-cli-pager >/dev/null
  fi
fi

aws s3api put-public-access-block   --bucket "$RIVER_BACKUP_S3_BUCKET"   --public-access-block-configuration 'BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true'   --no-cli-pager >/dev/null

aws s3api put-bucket-versioning   --bucket "$RIVER_BACKUP_S3_BUCKET"   --versioning-configuration Status=Enabled   --no-cli-pager >/dev/null

aws s3api put-bucket-encryption   --bucket "$RIVER_BACKUP_S3_BUCKET"   --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"},"BucketKeyEnabled":true}]}'   --no-cli-pager >/dev/null

aws s3api put-object-lock-configuration   --bucket "$RIVER_BACKUP_S3_BUCKET"   --object-lock-configuration '{"ObjectLockEnabled":"Enabled","Rule":{"DefaultRetention":{"Mode":"GOVERNANCE","Days":30}}}'   --no-cli-pager >/dev/null

POLICY_FILE="$(mktemp)"
trap 'rm -f "$POLICY_FILE"' EXIT
cat > "$POLICY_FILE" <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyInsecureTransport",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::$RIVER_BACKUP_S3_BUCKET",
        "arn:aws:s3:::$RIVER_BACKUP_S3_BUCKET/*"
      ],
      "Condition": { "Bool": { "aws:SecureTransport": "false" } }
    }
  ]
}
EOF
aws s3api put-bucket-policy   --bucket "$RIVER_BACKUP_S3_BUCKET"   --policy "file://$POLICY_FILE"   --no-cli-pager >/dev/null

aws s3api get-bucket-versioning --bucket "$RIVER_BACKUP_S3_BUCKET" --no-cli-pager |
  jq -e '.Status == "Enabled"' >/dev/null
aws s3api get-object-lock-configuration --bucket "$RIVER_BACKUP_S3_BUCKET" --no-cli-pager |
  jq -e '.ObjectLockConfiguration.ObjectLockEnabled == "Enabled" and .ObjectLockConfiguration.Rule.DefaultRetention.Mode == "GOVERNANCE" and .ObjectLockConfiguration.Rule.DefaultRetention.Days == 30' >/dev/null

echo "Bucket protections verified: private, TLS-only, versioned, AES256, Object Lock GOVERNANCE 30 days."
echo "Keep administrative and restore credentials separate from the GitHub backup role."
