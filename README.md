# menu-planner-image-resizer-lambda

Node function for resizing images for the menu planner project.

## Installation on AWS Lambda

### Step 1. Clone the repository

```bash
git clone <repository-url>
```

### Step 2. Install the dependencies

```bash
npm install
````

### Step 3. Zip the contents of the repository
```bash
zip -r menu-planner-image-resizer-lambda.zip src node_modules package.json
```

### Step 4. Create IAM role for the Lambda function

Create a JSON file named trust-policy.json with the following content. This policy allows the Lambda service to assume the role.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}

```

Use the AWS CLI to create the IAM role using the trust policy.
```bash
aws iam create-role --role-name lambda-s3-role --assume-role-policy-document file://trust-policy.json
```

### Step 5. Attach a policy to the role
Create an inline policy that grants the necessary S3 permissions. Save the following JSON content to a file named lambda-s3-policy.json.
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject"
            ],
            "Resource": [
                "arn:aws:s3:::YOUR_BUCKET_NAME/*"
            ]
        }
    ]
}

```

Attach the policy to the role using the AWS CLI.
```bash
aws iam put-role-policy --role-name lambda-s3-role --policy-name lambda-s3-policy --policy-document file://lambda-s3-policy.json
```

Attach AWSLambdaBasicExecutionRole Policy to the role
```bash
aws iam attach-role-policy --role-name lambda-s3-role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

### Step 6. Activate Cloud Logs for the Lambda function
1. Create a log group in CloudWatch Logs called /aws/lambda/ImageResizer


### Step 7. Create the Lambda function
Use the ARN of the role you just created to create the Lambda function

```bash
aws lambda create-function --function-name ImageResizer --zip-file fileb://menu-planner-image-resizer-lambda.zip --handler src/index.handler --runtime nodejs20.x --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-s3-role
```

### Step 8. Add S3 Trigger to Lambda function
Add permissions for S3 to invoke your Lambda function:
```bash
aws lambda add-permission --function-name ImageResizer --principal s3.amazonaws.com --statement-id s3invoke --action "lambda:InvokeFunction" --source-arn arn:aws:s3:::YOUR_BUCKET_NAME --source-account YOUR_ACCOUNT_ID

```
Add the notification configuration to your S3 bucket to trigger the Lambda function on object creation events:

Create a file named notification-config.json with the following content:
```json
{
  "LambdaFunctionConfigurations": [
    {
      "LambdaFunctionArn": "arn:aws:lambda:us-east-1:YOUR_ACCOUNT_ID:function:ImageResizer",
      "Events": ["s3:ObjectCreated:*"]
    }
  ]
}
```  

```bash
aws s3api put-bucket-notification-configuration --bucket YOUR_BUCKET_NAME --notification-configuration file://notification-config.json
```

### If you see a timeout error, increase the timeout and memory for the Lambda function
```bash
aws lambda update-function-configuration --function-name ImageResizer --timeout 30
aws lambda update-function-configuration --function-name ImageResizer --memory-size 256
```
