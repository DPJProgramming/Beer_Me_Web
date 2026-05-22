import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: 'us-east-1' }); 
const ddb = DynamoDBDocumentClient.from(client);
const IMAGE_BASE_URL = 'https://d1f2cmzbzpgnnt.cloudfront.net/img/';

const items = [
  {
    id: '1',
    name: 'Summer Ale',
    brewery: 'Sierra Nevada',
    type: 'Ale',
    description: 'A crisp and refreshing summer beer.',
    rating: 4.2,
    date: '2025-08-01',
    image: `${IMAGE_BASE_URL}${encodeURIComponent('01 (1).png')}`,
    location: 'Chico, CA'
  },
  {
    id: '2',
    name: 'Amber Lager',
    brewery: 'Brooklyn Brewery',
    type: 'Lager',
    description: 'Smooth amber lager with malty notes.',
    rating: 4.0,
    date: '2025-08-02',
    image: `${IMAGE_BASE_URL}${encodeURIComponent('01 (2).png')}`,
    location: 'Brooklyn, NY'
  },
  {
    id: '3',
    name: 'Stout Supreme',
    brewery: 'Guinness',
    type: 'Stout',
    description: 'Rich and creamy stout with roasted flavors.',
    rating: 4.5,
    date: '2025-08-03',
    image: `${IMAGE_BASE_URL}${encodeURIComponent('01 (3).png')}`,
    location: 'Dublin, Ireland'
  },
  {
    id: '4',
    name: 'IPA Extreme',
    brewery: 'Stone Brewing',
    type: 'IPA',
    description: 'Hoppy IPA with citrus and pine notes.',
    rating: 4.3,
    date: '2025-08-04',
    image: `${IMAGE_BASE_URL}${encodeURIComponent('01 (4).png')}`,
    location: 'Escondido, CA'
  },
  {
    id: '5',
    name: 'Pale Ale',
    brewery: 'Sierra Nevada',
    type: 'Ale',
    description: 'Classic pale ale with balanced hops.',
    rating: 4.5,
    date: '2025-08-05',
    image: `${IMAGE_BASE_URL}${encodeURIComponent('01 (5).png')}`,
    location: 'Chico, CA'
  },
  {
    id: '6',
    name: 'Wheat Wonder',
    brewery: 'Blue Moon',
    type: 'Wheat',
    description: 'Smooth wheat beer with hints of orange.',
    rating: 4.1,
    date: '2025-08-06',
    image: `${IMAGE_BASE_URL}${encodeURIComponent('01 (6).png')}`,
    location: 'Golden, CO'
  },
  {
    id: '7',
    name: 'Porter Classic',
    brewery: 'Founders',
    type: 'Porter',
    description: 'Dark porter with chocolate and coffee notes.',
    rating: 4.4,
    date: '2025-08-07',
    image: `${IMAGE_BASE_URL}${encodeURIComponent('01 (7).png')}`,
    location: 'Grand Rapids, MI'
  }
];

async function seedForDynamo() {
  for (const item of items) {
    await ddb.send(new PutCommand({ TableName: 'mybeers', Item: item }));
    console.log('Seeded:', item.id);
  }
  console.log('Done!');
}
seedForDynamo()