const { config } = require('dotenv')
const express = require('express');

config("./.env");

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

const BASE_URL = process.env.BASE_URL_API;
const ACCESS_KEY = process.env.ACCESS_KEY;
const MESSAGE = require('./config');


////// Helpers //////
async function fetchData(type, params) {
    let fullURL = `${BASE_URL}${type}?${new URLSearchParams(params)}`;
    console.log(fullURL);

    return fetch(fullURL)
        .then(res => res.json())
        .catch(err => {
            throw new Error("Error fetching data: " + err);
        })
}

////// Routes //////
app.get('/', (req, res) => {
    res.status(200).send('Hello World!');
});

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});


app.get('/check', (req, res) => {
    const phoneNumber = req.query.number;
    const countryCode = req.query.country_code;

    if (!phoneNumber || !countryCode) {
        return res.status(400).json({
            success: false,
            message: MESSAGE.MESSAGE_VALIDATION
        });
    }

    try {
        let fullData = fetchData("validate", {
            access_key: String(ACCESS_KEY),
            number: phoneNumber,
            country_code: countryCode,
            format: String(1)
        });

        fullData.then(data => {
            if (data.valid === false) {
                return res.status(404).json({
                    success: false,
                    message: MESSAGE.MESSAGE_INVALID_NUMBER,
                });
            }

            return res.json({
                success: true,
                valid: true,
                message: MESSAGE.MESSAGE_VALID_NUMBER,
                data: data
            });
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }

});



app.listen(port, () => {
    console.log(`APP is running on port ${port}`);
});