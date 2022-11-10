const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ykgjeea.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
function verifyJWT(req,res,next){
    console.log(req.headers.authorization)
}
async function run() {
    try {
        const serviceCollection = client.db('dentFitt').collection('dentalServices');
        const reviewCollection = client.db('dentFitt').collection('reviews');

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn:'1h'});
            res.send({ token })
        })


        app.post('/services', async (req, res) => {
            const service = req.body;
            console.log(service);
            const result = await serviceCollection.insertOne(service)
            res.send(result);
        });
        app.get('/all-services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.limit(3).toArray();
            res.send(services);
        })
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })


        //reviews api
        app.get('/reviews',verifyJWT, async (req, res) => {
            
            let query = {};

            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }

            const cursor = reviewCollection.find(query);

            const reviews = await cursor.toArray();
            res.send(reviews);
        });
        app.get('/service-reviews', async (req, res) => {
            let query = {};

            if (req.query.service) {
                query = {

                    service: req.query.service
                }
            }

            const cursor = reviewCollection.find(query);
            // console.log(req.query)
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        });
    }
    finally {

    }
}
run().catch(err => console.error(err));


app.get('/', (req, res) => {
    res.send('Dental service training server running')
})

app.listen(port, () => {
    console.log(`Dental service server running on: ${port}`)
})