var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",

    port: "3306",

    user: "root",

    password: "password",
    database: "bamazon"
});


connection.connect(function (err) {
    if (err) throw err;
    start();
});




function start() {
    connection.query("SELECT item_id, product_name, price FROM products", function (err, results) {
        if (err) throw err;
        for (var i = 0; i < results.length; i++) {
            console.log("product # ", results[i].item_id, results[i].product_name, "  $", results[i].price);
        }
        idSelect();
    });
};



function idSelect() {
    inquirer.prompt(
        {
            name: "idSelect",
            type: "input",
            message: "Type the ID of the item you would like to buy"
        }
    ).then(function (ans) {
        // console.log("the id selected", ans)
        var query = "SELECT item_id, product_name, price, stock_quantity FROM products WHERE ?";
        connection.query(query,
            {
                item_id: ans.idSelect
            },
            function (err, res) {
                if (err) throw err;
                console.log("You selected", res[0].product_name, "for $", res[0].price);

                inquirer.prompt({
                    type: "input",
                    name: "quantity",
                    message: "Type how much you would like of this item"

                }).then(function (ans) {
                    
                    console.log("You Selected", ans.quantity, "items");
                    var subtract = [res[0].stock_quantity - ans.quantity]

                    if (ans.quantity < res[0].stock_quantity + 1) {
                        // console.log("processing order", res[0].stock_quantity, "in stock")
                        connection.query(
                            "UPDATE products SET ? WHERE ?",
                            [
                                {
                                    stock_quantity: subtract
                                },
                                {
                                    item_id: ans.idSelect
                                }
                            ],
                            function (err) {
                                if (err) throw err;
                                // console.log("processed, now have ", subtract, "left in stock")

                                var totalCost = ans.quantity * res[0].price
                                console.log("Your total cost is ", totalCost, " Thanks for your service!")
                            })

                    } else {
                        console.log("Sorry, Insufficient Quantity")
                        // connection.end();
                    }

                });
            });
    });
};




