import fs from 'fs';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const db = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'us-east-1' }));

const getAllBeers = async () => {
    const { beers } = await db.send(new ScanCommand({ TableName: 'mybeers' }));
    return beers;
}

const getTopBeers = async () => {
    const result = db.prepare('SELECT * FROM beers ORDER BY rating DESC LIMIT 10');
    const topBeers = result.all();

    return topBeers;
}

const addBeer = async (beer) => {
    const query = `INSERT INTO beers ( name, type, brewery, description, 
                                       location, rating, image, date
                                     )
                   VALUES (?,?,?,?,?,?,?,?)`;
    const prepare = db.prepare(query)
    const result = prepare.run( 
                                beer.name, beer.type, beer.brewery, beer.description, 
                                beer.location, beer.rating, beer.image, beer.date,
                              );
    
    return {...result, image: beer.image, id: result.lastInsertRowid};
}

const getBeerById = async (id) => {
    const { beer } = await db.send(new GetCommand({
        TableName: 'mybeers', Key: { id }
    }));
    return beer;
}

const editBeer = async (beer) => {
    let result;

    //check if user has defined a new image
    if(beer.image){
        const existingImage = getImageById(beer.id);

        await db.send(new PutCommand({ TableName: 'mybeers', Item: { ...beer, image: existingImage } }));
        
        const image = beer.image || existingImage;

        //delete old image file if it's not the placeholder
        if(image != 'placeholder.png' && image != beer.image){
            fs.promises.unlink(`./public/img/${image}`);
        }

        return {...result, image: image, updatedDate: beer.updatedDate};
    }
    else{
        const query = `UPDATE beers 
                       SET name = ?, type = ?, brewery = ?, description = ?, location = ?, 
                           rating = ?, updatedDate = ?
                       WHERE id = ?`;

        const prepare = db.prepare(query);
        result = prepare.run( 
                                beer.name, beer.type, beer.brewery, beer.description, 
                                beer.location, beer.rating, beer.updatedDate, beer.id
                            );
        return {...result, updatedDate: beer.updatedDate};
    }
}

const deleteBeer = async (id) => {
    //fetchimage file
    const image = getImageById(id);

    //delete beer from database
    const query = `DELETE FROM beers WHERE id = ?`;
    const prepare = db.prepare(query);
    const runDelete = prepare.run(id);

    //remove image file if it's not the placeholder
    if(image && image != 'placeholder.png'){ 
        try{
            await fs.promises.unlink(`./public/img/${image}`);
        } 
        catch (error) {
            console.error('Error deleting image file:', error);
        }
    }

    if(runDelete.changes === 0){
        console.log(`No beer found with id ${id}`);
        return {ok: false, message: 'Beer not found'};
    }

    return {ok: true, message: 'Beer deleted successfully'};
}

const getImageById = (id) => {
    const query = `SELECT image FROM beers WHERE id = ?`
    const prepare = db.prepare(query);
    const image = prepare.get(id);

    return image ? image.image : null;
}

export default {
    getAllBeers,
    addBeer,
    getBeerById,
    editBeer,
    deleteBeer,
    getTopBeers
}