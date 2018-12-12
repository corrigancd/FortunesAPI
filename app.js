const fs = require('fs');
const express = require('express'); // function that provides access to many libraries that express has available
const bodyParser = require('body-parser');


const app = express(); // calling the express app
const fortunes = require('./data/fortunes');

app.use(bodyParser.json()); //this allows our app to receive and use json data in our requests

                // (req,res) are parameters for the call back function that calls the fortune json file base
app.get('/fortunes', (req, res) => {
    res.json(fortunes); // returns the entire fortunes json object
});

app.get('/fortunes/random', (req, res) => {
   console.log('requesting random fortune');
   //const random_index = Math.floor(Math.random() * fortunes.length); // object with random index for fortune selection
   //const r_fortune = fortunes[random_index];

   // in-line option, this is good practice if the otherwise variables would only be used once
   res.json(fortunes[Math.floor(Math.random() * fortunes.length)]);
});

app.get('/fortunes/:id', (req,res) => {
//    console.log(req.params); //printing the object at specified index of array to console
    res.json(fortunes.find(f => f.id == req.params.id)); // returns fortunes object as json to the browser
});

// call this using a curl request in another terminal, the api below will be used
// curl -H "Content-Type: application/json" -X POST -d '{"message": "Hello", "lucky_number": "5", "spirit_animal": "Dog"}' http://localhost:3000/fortunes
// NOTE - IT MUST HAVE THE BACKSLASHES FOR WINDOWS -  curl -H "Content-Type: application/json" -X POST -d "{\"message\":\"Hello\",\"lucky_number\":5,\"spirit_animal\":\"Dog\"}" http://localhost:3000/fortunes

//helper function for writing to fortunes JSON file
const writeFortunes = json => {
    fs.writeFile('./data/fortunes.json', JSON.stringify(json), err => console.log(err));
}

app.post('/fortunes', (req,res) => {
    const {message, lucky_number, spirit_animal} = req.body;

    const fortune_ids = fortunes.map(f => f.id); //adding all ids to an array variable

    //const fortune = Was separate, but it is used just once so fortues.json object is added as inline
    const new_fortunes = fortunes.concat({    //Math.max selects the max array in the fortunes_id array variable
        id: (fortune_ids.length > 0 ? Math.max(...fortune_ids): 0 ) + 1, //ternary expression (if ? true:false). the +1 is to ensure that Id is always a unique number
        message,
        lucky_number,
        spirit_animal
    }); //concatenating the new object to the current one

    // writing the appended object to the fortunes.json file
    writeFortunes(new_fortunes);
    res.json(new_fortunes);
});

app.put('/fortunes/:id', (req,res) => {
    const id = req.params.id;
    const old_fortune = fortunes.find(f => f.id == id); // this is a reference to the original fortune object of the selected id

    //const {message, lucky_number, spirit_animal} = req.body; // shorthand for referencing params from request, not required as the array is specified below
    // the if statements indicate that the specified parameter must be present to continue updating the object at the specified id
    // if(message) {old_fortunes.message = message};
    // if(lucky_number) {old_fortunes.lucky_number = lucky_number};
    // if(spirit_animal) old_fortunes.spirit_animal = spirit_animal; // note the braces are removed from this one, to show that they are not necessary it it is all on the same line

    ['message', 'lucky_number', 'spirit_animal'].forEach(key => {
        if (req.body[key]) {old_fortune[key] = req.body[key]};
    });

    writeFortunes(fortunes);
    res.json(fortunes); //
});

app.delete('/fortunes/:id', (req,res) => {
    const id = req.params.id;
    const new_fortunes = fortunes.filter(f => f.id != id); // creates a new array which adds objects by id
    writeFortunes(new_fortunes);
    res.json(fortunes);
});

module.exports = app;