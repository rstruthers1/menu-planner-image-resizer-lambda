aws lambda create-function --function-name ImageResizer --zip-file fileb://menu-planner-image-resizer-lambda.zip --handler src/index.handler --runtime nodejs20.x --role arn:aws:iam::777605092423:role/lambda-s3-role
