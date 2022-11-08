export const Consumer = {
  name: 'sqs-consumer',
  queueUrl: process.env.AWS_SQS_SERVER_URL,
  region: process.env.AWS_SQS_SERVER_REGION,
};

export const Producer = {
  name: 'sqs-producer',
  queueUrl: process.env.AWS_SQS_SERVER_URL,
  region: process.env.AWS_SQS_SERVER_REGION,
};

export const ErrorEvents = {
  processingError: 'processing_error',
};
