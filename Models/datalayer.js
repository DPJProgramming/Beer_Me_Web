import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

let docClient = null;

function initializeDynamoDB() {
  if (docClient) return docClient;

  console.log('Initializing DynamoDB client...');
  const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
  docClient = DynamoDBDocumentClient.from(client);
  console.log('DynamoDB client created');
  return docClient;
}

const getAllBeers = async () => {
  try {
    console.log('getAllBeers: Scanning DynamoDB...');
    const db = initializeDynamoDB();
    const tableName = process.env.BEERS_TABLE || 'beers';
    const result = await db.send(new ScanCommand({ TableName: tableName }));
    const rows = (result.Items || []).sort((a, b) => new Date(b.date) - new Date(a.date));
    console.log('getAllBeers: Query returned', rows.length, 'rows');
    return rows;
  } catch (err) {
    console.error('getAllBeers error:', err.message);
    throw err;
  }
};

const getTopBeers = async () => {
  const db = initializeDynamoDB();
  const tableName = process.env.BEERS_TABLE || 'beers';
  const result = await db.send(new ScanCommand({ TableName: tableName }));
  const rows = (result.Items || []).sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0)).slice(0, 10);
  return rows;
};

const addBeer = async (beer) => {
  const db = initializeDynamoDB();
  const tableName = process.env.BEERS_TABLE || 'beers';
  const id = Date.now().toString();
  const item = {
    id,
    name: beer.name || '',
    type: beer.type || '',
    brewery: beer.brewery || '',
    description: beer.description || '',
    location: beer.location || '',
    rating: beer.rating || 0,
    image: beer.image || 'placeholder.png',
    date: beer.date || new Date().toISOString(),
  };
  await db.send(new PutCommand({ TableName: tableName, Item: item }));
  return { insertId: id, image: beer.image, id };
};

const getBeerById = async (id) => {
  const db = initializeDynamoDB();
  const tableName = process.env.BEERS_TABLE || 'beers';
  const result = await db.send(new GetCommand({ TableName: tableName, Key: { id } }));
  return result.Item || null;
};

const editBeer = async (beer) => {
  const db = initializeDynamoDB();
  const tableName = process.env.BEERS_TABLE || 'beers';

  // Build update expression dynamically
  const updateParts = [];
  const expressionAttrValues = {};
  const expressionAttrNames = {};

  const addUpdate = (fieldName, value) => {
    const nameKey = `#${fieldName}`;
    const valueKey = `:${fieldName}`;
    updateParts.push(`${nameKey} = ${valueKey}`);
    expressionAttrNames[nameKey] = fieldName;
    expressionAttrValues[valueKey] = value;
  };

  if (beer.name !== undefined) addUpdate('name', beer.name);
  if (beer.type !== undefined) addUpdate('type', beer.type);
  if (beer.brewery !== undefined) addUpdate('brewery', beer.brewery);
  if (beer.description !== undefined) addUpdate('description', beer.description);
  if (beer.location !== undefined) addUpdate('location', beer.location);
  if (beer.rating !== undefined) addUpdate('rating', beer.rating);
  if (beer.image !== undefined) addUpdate('image', beer.image);
  if (beer.updatedDate !== undefined) addUpdate('updatedDate', beer.updatedDate);

  if (updateParts.length === 0) return { affectedRows: 0, updatedDate: beer.updatedDate };

  try {
    await db.send(new UpdateCommand({
      TableName: tableName,
      Key: { id: beer.id },
      UpdateExpression: 'SET ' + updateParts.join(', '),
      ExpressionAttributeValues: expressionAttrValues,
      ExpressionAttributeNames: Object.keys(expressionAttrNames).length > 0 ? expressionAttrNames : undefined,
    }));
    return { affectedRows: 1, image: beer.image, updatedDate: beer.updatedDate };
  } catch (err) {
    console.error('editBeer error:', err.message);
    throw err;
  }
};

const deleteBeer = async (id) => {
  const db = initializeDynamoDB();
  const tableName = process.env.BEERS_TABLE || 'beers';

  try {
    await db.send(new DeleteCommand({ TableName: tableName, Key: { id } }));
    return { ok: true, message: 'Beer deleted successfully' };
  } catch (err) {
    console.error('deleteBeer error:', err.message);
    return { ok: false, message: 'Beer not found' };
  }
};

export default {
  getAllBeers,
  addBeer,
  getBeerById,
  editBeer,
  deleteBeer,
  getTopBeers,
};
