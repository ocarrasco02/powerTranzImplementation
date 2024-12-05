const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const mongoURI = 'mongodb+srv://clubembersmasterdbuser:73CHYW3M0bil3C8APP@dev-clubembers-mongo-db.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000';

mongoose
    .connect(mongoURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

const TransactionSchema = new mongoose.Schema({
    TransactionType: Number,
    Approved: Boolean,
    TransactionIdentifier: String,
    TotalAmount: Number,
    CurrencyCode: String,
    CardBrand: String,
    IsoResponseCode: String,
    ResponseMessage: String,
    RiskManagement: Object,
    PanToken: String,
    OrderIdentifier: String,
    SpiToken: String,
});

const Transaction = mongoose.model('Transaction', TransactionSchema);

app.post('/saveSale', async (req, res) => {
    try {
        const responseEncoded = req.body.Response || req.query.Response;
        if (!responseEncoded) {
            return res.status(400).send({ error: 'Missing Response parameter' });
        }

        const decodedResponse = decodeURIComponent(responseEncoded);
        const parsedResponse = JSON.parse(decodedResponse);

        const transaction = new Transaction(parsedResponse);
        await transaction.save();

        res.status(200).send({
            message: 'Data received and saved successfully',
            data: parsedResponse,
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send({ error: 'Failed to process request' });
    }
});



// app.post('/registerSale', async (req, res) => {
//     try {
//         console.log(req.body);

//         const { SpiToken, Response } = req.body;

//         const parsedResponse = JSON.parse(Response);
//         const { RiskManagement } = parsedResponse;

//         console.log(SpiToken);
//         console.log(RiskManagement);

//         if (!RiskManagement || !SpiToken) {
//             return res.status(400).send({ error: 'RiskManagement and SpiToken are required' });
//         }

//         const authStatus = RiskManagement?.ThreeDSecure?.AuthenticationStatus;

//         if (authStatus === 'Y') {
//             const response = await axios.post(
//                 'https://staging.ptranz.com/api/spi/payment',
//                 `"${SpiToken}"`,
//                 {
//                     headers: {
//                         'PowerTranz-PowerTranzId': '77700583',
//                         'PowerTranz-PowerTranzPassword': 'xhvIG9dodJe7KdzumheCvuBcgyk7Ecqzp6Sj6cMgXb4zu4oxVcoE15',
//                         'Content-Type': 'application/json',
//                     },
//                 }
//             );

//             res.status(200).send({
//                 message: 'AuthenticationStatus is "Y", external API called successfully',
//                 apiResponse: response.data,
//             });
//         } else {
//             res.status(200).send({
//                 message: 'AuthenticationStatus is not "Y", no external API call made',
//             });
//         }
//     } catch (error) {
//         console.error('Error in registerSale:', error.response?.data || error.message);
//         res.status(500).send({
//             error: 'Failed to process transaction or call external API',
//             details: error.response?.data || error.message,
//         });
//     }
// });


app.post('/registerSale', async (req, res) => {
    try {
        console.log(req.body);

        const { SpiToken, Response } = req.body;

        const parsedResponse = JSON.parse(Response);
        const { RiskManagement } = parsedResponse;

        console.log(SpiToken);
        console.log(RiskManagement);

        if (!RiskManagement || !SpiToken) {
            return res.status(400).send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <script src="https://cdn.tailwindcss.com"></script>
                    <title>Error</title>
                </head>
                <body class="bg-gray-100 flex items-center justify-center h-screen">
                    <div class="bg-white shadow-lg rounded-lg p-6 text-center max-w-md">
                        <h1 class="text-2xl font-bold text-red-600 mb-4">Error</h1>
                        <p class="text-gray-600">RiskManagement and SpiToken are required</p>
                    </div>
                </body>
                </html>
            `);
        }

        const authStatus = RiskManagement?.ThreeDSecure?.AuthenticationStatus;

        if (authStatus === 'Y') {
            const response = await axios.post(
                'https://staging.ptranz.com/api/spi/payment',
                `"${SpiToken}"`,
                {
                    headers: {
                        'PowerTranz-PowerTranzId': '77700583',
                        'PowerTranz-PowerTranzPassword': 'xhvIG9dodJe7KdzumheCvuBcgyk7Ecqzp6Sj6cMgXb4zu4oxVcoE15',
                        'Content-Type': 'application/json',
                    },
                }
            );
            const transactionData = {
                ...parsedResponse,
                SpiToken,
            };

            const transaction = new Transaction(transactionData);
            await transaction.save();
            return res.status(200).send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <script src="https://cdn.tailwindcss.com"></script>
                    <title>Success</title>
                </head>
                <body class="bg-gray-100 flex items-center justify-center h-screen">
                    <div class="bg-white shadow-lg rounded-lg p-6 text-center max-w-md">
                        <h1 class="text-2xl font-bold text-green-600 mb-4">Exito</h1>
                        <p class="text-gray-600 mb-4">Pago relizado exitosamente.</p>
                    
                    </div>
                </body>
                </html>
            `);
        } else {
            return res.status(200).send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <script src="https://cdn.tailwindcss.com"></script>
                    <title>Not Processed</title>
                </head>
                <body class="bg-gray-100 flex items-center justify-center h-screen">
                    <div class="bg-white shadow-lg rounded-lg p-6 text-center max-w-md">
                        <h1 class="text-2xl font-bold text-yellow-600 mb-4">Not Processed</h1>
                        <p class="text-gray-600">AuthenticationStatus is not "Y". No external API call made.</p>
                    </div>
                </body>
                </html>
            `);
        }
    } catch (error) {
        console.error('Error in registerSale:', error.response?.data || error.message);
        return res.status(500).send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://cdn.tailwindcss.com"></script>
                <title>Error</title>
            </head>
            <body class="bg-gray-100 flex items-center justify-center h-screen">
                <div class="bg-white shadow-lg rounded-lg p-6 text-center max-w-md">
                    <h1 class="text-2xl font-bold text-red-600 mb-4">Error</h1>
                    <p class="text-gray-600 mb-4">Failed to process transaction or call external API</p>
                    <h2 class="text-lg font-semibold mb-2">Details:</h2>
                    <pre class="bg-gray-100 p-4 rounded-lg text-sm text-gray-800 overflow-auto">${error.response?.data || error.message}</pre>
                </div>
            </body>
            </html>
        `);
    }
});




// Endpoint to search by TransactionIdentifier
app.get('/search', async (req, res) => {
    try {
        const { TransactionIdentifier } = req.query;
        if (!TransactionIdentifier) {
            return res.status(400).send({ error: 'TransactionIdentifier is required' });
        }

        const transaction = await Transaction.findOne({ TransactionIdentifier });

        if (!transaction) {
            return res.status(404).send({ error: 'Transaction not found' });
        }

        res.status(200).send({
            message: 'Transaction retrieved successfully',
            data: transaction,
        });
    } catch (error) {
        console.error('Error retrieving transaction:', error);
        res.status(500).send({ error: 'Failed to retrieve transaction' });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
