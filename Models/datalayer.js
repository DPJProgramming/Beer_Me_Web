import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const db = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'us-east-1' }));
const TABLE = 'mybeers';

const getAllBeers = async () => {
    const result = await db.send(new ScanCommand({ TableName: TABLE }));
    return result.Items || [];
}

const getTopBeers = async () => {
    const result = await db.send(new ScanCommand({ TableName: TABLE }));
    const beers = result.Items || [];
    return beers
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 10);
}

const addBeer = async (beer) => {
    const id = randomUUID();
    const item = { ...beer, id };
    await db.send(new PutCommand({ TableName: TABLE, Item: item }));
    return item;
}

const getBeerById = async (id) => {
    const result = await db.send(new GetCommand({
        TableName: TABLE, Key: { id }
    }));
    return result.Item || null;
}

const editBeer = async (beer) => {
    // Get existing beer to preserve image if no new one provided
    const existing = await getBeerById(beer.id);
    if (!existing) return null;

    const image = beer.image || existing.image;

    const updatedItem = {
        ...existing,
        ...beer,
        image,
        updatedDate: beer.updatedDate
    };

    await db.send(new PutCommand({ TableName: TABLE, Item: updatedItem }));
    return updatedItem;
}

const deleteBeer = async (id) => {
    const existing = await getBeerById(id);
    if (!existing) {
        return { ok: false, message: 'Beer not found' };
    }

    await db.send(new DeleteCommand({ TableName: TABLE, Key: { id } }));
    return { ok: true, message: 'Beer deleted successfully' };
}

export default {
    getAllBeers,
    addBeer,
    getBeerById,
    editBeer,
    deleteBeer,
    getTopBeers
}