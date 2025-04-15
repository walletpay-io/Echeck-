const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

let paymentData = {
    sender: 'Benny',
    amount: 400,
    cardDetails: null
};

app.get('/api/payment', (req, res) => {
    res.json(paymentData);
});

app.post('/api/payment', (req, res) => {
    const { sender, amount } = req.body;
    if (sender) paymentData.sender = sender;
    if (amount) paymentData.amount = parseFloat(amount);
    res.json({ message: 'Payment details updated', data: paymentData });
});

app.post('/api/card-details', (req, res) => {
    const { name, cardNumber, expiry, cvv, zipCode } = req.body;
    paymentData.cardDetails = { name, cardNumber, expiry, cvv, zipCode };
    res.json({ message: 'Card details received', data: paymentData });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
