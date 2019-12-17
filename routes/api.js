const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
var CronJob = require('cron').CronJob;
//I used cache because this is a small exemple
//I could use redis as a seperit data storing mechanisme to also keep track of api usage !
var cache = require('memory-cache');

require('dotenv/config');


var newCache = new cache.Cache();

//Reset memory each day
new CronJob('0 0 * * * *', function () {
    newCache.clear()
}, null, true, 'America/Los_Angeles');

//Routes
//Justify
router.post('/justify', verifyToken, verifyTokenConsumption, (req, res) => {
    jwt.verify(req.token, process.env.secretKey, (err, authData) => {
        if (err) {
            console.log(err)
            res.sendStatus(403);
        } else {
            //Get message send by post
            str = req.body.message
            //Format data received
            data = dataFormat(str);
            //Get used Token
            const bearerHeader = req.headers['authorization'];
            token = getTokenFromHeader(bearerHeader);

            restWordsCount = newCache.get(token)
            newCache.put(token, restWordsCount - wordsCount(data))
            res.send(data);
        }
    })
});

//Auth
router.post('/token', (req, res) => {
    // Mock user
    const user = {
        email: req.body.email
    }
    // jwt token generate 
    jwt.sign({ user }, process.env.secretKey, (err, token) => {
        res.json({
            token
        });
    });
});



// FORMAT OF TOKEN
// Authorization: Bearer <access_token>

// Verify Token
function verifyToken(req, res, next) {
    // Get auth header value
    const bearerHeader = req.headers['authorization'];
    // Check if bearer is undefined
    if (typeof bearerHeader !== 'undefined') {
        // Split at the space
        const bearer = bearerHeader.split(' ');
        // Get token from array
        const bearerToken = bearer[1];
        // Set the token
        req.token = bearerToken;
        console.log(req.token)
        // Next middleware
        next();
    } else {
        // Forbidden
        res.sendStatus(403);
    }

}


//Verify words
function verifyTokenConsumption(req, res, next) {
    // Get auth header value
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        token = getTokenFromHeader(bearerHeader);
        //New token => add token and max words per token
        if (newCache.get(token) == null) {
            newCache.put(token, 80000);
        }
        //Old token => Check remaining words
        else {
            max = newCache.get(token);
            if (max < wordsCount(req.body.message)) {
                res.sendStatus(403);
            }
        }
        next();
    }
}
//Get token from header

function getTokenFromHeader(bearerHeader) {
    // Split at the space
    const bearer = bearerHeader.split(' ');
    // Get token from array
    const token = bearer[1];
    return token;
}

//Word count function

function wordsCount(input) {
    return input.split(' ').length;
}

//Formating data
function dataFormat(input) {
    output = "";
    paragraphs = input.split('\n')
    j = 0;
    for (j = 0; j < paragraphs.length; j++) {
        words = paragraphs[j].split(" ")
        aux = "";
        line = "";
        for (i = 0; i < words.length; i++) {
            if (aux.length < 80 && aux.length + words[i].length < 80) {
                if (aux == "") {
                    aux = words[i]
                } else {
                    aux = aux + " " + words[i];
                }
            } else {
                line = line + addSpaceBars(aux) + "\n"
                aux = words[i]
            }
        }
        line = line + aux
        spaceIndex = 0;

        if (output == "") {
            output = line;
        } else {
            output = output + "\n" + line;
        }
    }
    return output
}
//Add space bars
function addSpaceBars(input) {
    spaceIndex = 1;
    while (input.length < 80) {
        console.log(input.length + " space index" + spaceIndex);
        spaceIndex = input.indexOf(" ", spaceIndex + 2);
        input = input.slice(0, spaceIndex) + " " + input.slice(spaceIndex)
    }
    return input;
}

module.exports = router;