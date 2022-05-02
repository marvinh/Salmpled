import boto3

# Create SQS client
sqs = boto3.client('sqs')

# Create a SQS queue with long polling enabled
response = sqs.create_queue(
    QueueName='TEMPO_EXTRACT_QUEUE',
    Attributes={'ReceiveMessageWaitTimeSeconds': '20'}
)

print(response['QueueUrl'])