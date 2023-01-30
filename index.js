const express = require('express');

const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const app = express();
require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SECRET);

//middleware
app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7jx70jr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {

        const Allproduct = client.db("Finnal_project").collection("Allproduct");
        const Allcategory = client.db("Finnal_project").collection("category");
        const AllBooking = client.db("Finnal_project").collection("booking");
        const AllAdds = client.db("Finnal_project").collection("Adds");
        const AllUser = client.db("Finnal_project").collection("alluser");
        const AllPayment = client.db("Finnal_project").collection("allPayment");


        // app.get('/product', async (req, res) => {

        //     const query = {}
        //     const cursor = Allproduct.find(query);

        //     const products = await cursor.toArray();

        //     res.send(products);
        // });
        app.post('/create-payment-intent', async (req, res) => {
            const booking = req.body;
            const price = booking.price;
            const amount = price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                currency: "usd",
                amount: amount,
                "payment_method_types": [
                    "card"
                ]

            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        })

        app.post('/payments', async (req, res) => {
            const payment = req.body;
            const result = await AllPayment.insertOne(payment);
            const id = payment.bookingId;
            const filter = {_id: ObjectId(id)}

            const updateDoc ={

                $set:{
                    paid: true,
                    transactionId : payment.transactionId
                }
            }

            const updatedResult = await AllBooking.updateOne(filter , updateDoc)
            res.send(result);
        })








        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { mail: email };
            const user = await AllUser.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1hr' })

                return res.send({ accessToken: token });
            }

            res.status(403).send({ accessToken: " " });
        })

        app.get('/product', async (req, res) => {

            let query = {}
            if (req.query.mail) {
                query = {
                    mail: req.query.mail
                }
            }
            const cursor = Allproduct.find(query);

            const products = await cursor.toArray();

            res.send(products);
        });
        app.get('/users', async (req, res) => {

            let query = {}
            console.log(req.query.mail);
            if (req.query.mail) {
                query = {
                    mail: req.query.mail
                }
            }
            const cursor = AllUser.find(query);

            const products = await cursor.toArray();

            res.send(products);
        });




        app.get('/booking', async (req, res) => {

            let query = {}
            if (req.query.mail) {
                query = {
                    mail: req.query.mail
                }
            }
            const cursor = AllBooking.find(query);

            const products = await cursor.toArray();

            res.send(products);
        });

        app.post('/product', async (req, res) => {
            const product = req.body;

            const result = await Allproduct.insertOne(product);
            res.send(result);

        })
        app.post('/users', async (req, res) => {
            const product = req.body;

            const result = await AllUser.insertOne(product);
            res.send(result);

        })
        app.get('/users', async (req, res) => {

            const query = {}
            const add = AllUser.find(query);

            const adds = await add.toArray();

            res.send(adds);
        });

        app.put('/users/admin/:id', async (req, res) => {

            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await AllUser.updateOne(filter, updateDoc, options);
            res.send(result);
        })



        app.put('/users/verify/:id', async (req, res) => {

            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {

                    verified: 'verified'
                }
            }
            const result = await AllUser.updateOne(filter, updateDoc, options);
            res.send(result);
        })





        app.get('/users/admin/:email', async (req, res) => {

            const email = req.params.email;
            const query = { mail: email }
            const user = await AllUser.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' })
        })
        app.get('/users/buyer/:email', async (req, res) => {

            const email = req.params.email;
            const query = { mail: email }
            const user = await AllUser.findOne(query);
            res.send({ isBuyer: user?.role === 'buyer' })
        })
        app.get('/users/seller/:email', async (req, res) => {

            const email = req.params.email;
            const query = { mail: email }
            const user = await AllUser.findOne(query);


            res.send({ isSeller: user?.role === 'seller' })
        })




        app.post('/adds', async (req, res) => {
            const product = req.body;

            const result = await AllAdds.insertOne(product);
            res.send(result);

        })


        app.get('/adds', async (req, res) => {

            const query = {}
            const add = AllAdds.find(query);

            const adds = await add.toArray();

            res.send(adds);
        });

        app.get('/booking/:id', async (req, res) => {

            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const booking = await AllBooking.findOne(query);
            res.send(booking);
        })


        app.post('/booking', async (req, res) => {
            const product = req.body;

            const result = await AllBooking.insertOne(product);
            res.send(result);

        })

        app.get('/category', async (req, res) => {

            const query = {}
            const cat = Allcategory.find(query);

            const category = await cat.toArray();

            res.send(category);
        });



        app.get('/product/:category', async (req, res) => {
            const id = req.params.category;

            const query = { category: id };

            const cat = Allproduct.find(query);

            const category = await cat.toArray();

            res.send(category);
        });


    }
    finally {



    }

}

run().catch(err => console.error(err));









app.get('/', async (req, res) => {
    res.send('doctors portal server is running')
})

app.listen(port, () => console.log(`project server running on ${port}`));

