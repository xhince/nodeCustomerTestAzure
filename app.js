'use strict';
//API
var express = require('express');
var app = express();
var http = require('http');
//var server = require('http').Server(app)
var port = process.env.PORT || 1337;

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })

//AZURE SQL
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/js'));

app.use(bodyParser.json());
app.use(urlencodedParser);

//app.use(express.static(__dirname)); bu hataya yol aciyordu index2.html

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
/*
app.get('/index2.html', function (req, res) {
    res.sendFile(__dirname + '/index2.html');
});
*/

/*
app.post('/', urlencodedParser, function (req, res) {
    console.log(req.body);
    res.render('', {qs:res.query});
});
*/
var config = {
    server: 'tessto.database.windows.net',  //update me
    authentication: {
        type: 'default',
        options: {
            userName: 'serveradmin', //update me
            password: 'yeterbeA1'  //update me
        }
    },
    options: {
        // If you are on Microsoft Azure, you need encryption:
        encrypt: true,
        database: 'DB'  //update me
    }
};

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var connection = new Connection(config);

connection.on('connect', function (err) {
    // If no error, then good to proceed.
    if (err) {
        console.log('Connection Error:' + err);
    } else {
        console.log("Connected");
        executeStatement();
    }
});
//SELECT * FROM customers FOR JSON AUTO;
function executeStatement() {

    app.get('/customers', function (req, res, next) {
        var request = new Request("SELECT * FROM customers;", function (err, result, fields) {
            if (err) {
                console.log(err);
            }
            /*console.log(result);
            const resultJson = JSON.parse(JSON.stringify(result));
            console.log(resultJson);*/
        });
        var result = "";
        request.on('row', function (columns) {
            columns.forEach(function (column) {
                if (column.value === null) {
                    console.log('NULL');
                } else {
                    result += column.value + " ";
                }
            });
            console.log(result);
            result = "";
        });
        request.on('done', function (rowCount, more) {
            console.log(rowCount + ' rows returned');
        });
        connection.execSql(request);
        res.send("Get Okeeeey");
    });

    app.post('/customers', function (req, res, next) {
        const response = req.body;
        console.log(response);
        var request = new Request("INSERT INTO customers(id, name, address) VALUES (@id, @name, @address);", function (err, result, fields) {
            if (err) {
                console.log(err);
            }
        });

        request.addParameter('id', TYPES.Int, parseInt(response.id));
        request.addParameter('name', TYPES.VarChar, response.name);
        request.addParameter('address', TYPES.VarChar, response.address);
        connection.execSql(request);
        res.send(" Post Okeeey");
    });

    app.put('/customers/:id', function (req, res, next) {
        const id = req.params.id;
        const response = req.body;
        console.log(id + "" + response);
        var request = new Request("UPDATE customers Set name=@name, address=@address where id=@id;", function (err, result, fields) {
            if (err) {
                console.log(err);
            }
        });
        request.addParameter('id', TYPES.Int, parseInt(id));
        request.addParameter('name', TYPES.VarChar, response.name);
        request.addParameter('address', TYPES.VarChar, response.address);
        connection.execSql(request);
        res.send(" Put Okeeey");
    });

    app.delete('/customers/:id', function (req, res, next) {
        const response = req.params.id;
        console.log(response);
        var request = new Request("DELETE FROM customers where id = @id;", function (err, result, fields) {
            if (err) {
                console.log(err);
            }
        });
        request.addParameter('id', TYPES.Int, parseInt(response));
        connection.execSql(request);
        res.send("Delete Okeeey");
    });




}
//server.listen(port);

app.listen(port, () => console.log(`Listening on port ${port}`));

/*http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('bitti');
}).listen(port);*/