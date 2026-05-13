import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: 'us-east-1' }); 
const ddb = DynamoDBDocumentClient.from(client);

const items = [
  { id: '1', name: 'Summer Ale', imageUrl: '/img/01%20(1).png' },
  { id: '2', name: 'Amber Lager', imageUrl: '/img/01%20(2).png' },
  { id: '3', name: 'Stout Supreme', imageUrl: '/img/01%20(3).png' },
  { id: '4', name: 'IPA Extreme', imageUrl: '/img/01%20(4).png' },
  { id: '5', name: 'Pale Ale', imageUrl: '/img/01%20(5).png' },
  { id: '6', name: 'Wheat Wonder', imageUrl: '/img/01%20(6).png' },
  { id: '7', name: 'Porter Classic', imageUrl: '/img/01%20(7).png' }
];

async function seedForDynamo() {
  for (const item of items) {
    await ddb.send(new PutCommand({ TableName: 'mybeers', Item: item }));
    console.log('Seeded:', item.id);
  }
  console.log('Done!');
}
seedForDynamo()