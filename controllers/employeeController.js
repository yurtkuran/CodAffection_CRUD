const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');

// load employee schema
const Employee = require('../models/Employee.model');

// display employee form
router.get('/', (req, res) => {
    res.render('employee/addOrEdit', {
        viewTitle: 'Insert Employee'
    });
});

// add employee to database
router.post('/', (req,res) => {
    if (req.body._id == '')
        insertRecord(req,res);
    else
        updateRecord(req, res);
});

// list employees
router.get('/list', (req,res) => {
    Employee.find((err, employees) => {
        if (!err) {
            res.render('employee/list', {
                employees
            });
        } else {
            console.log('Error retrieving employee list: ' + err);
        }
    });
});

// lookup employee in database
router.get('/:id', (req, res) => {
    Employee.findById(req.params.id, (err, employee) => { 
        if (!err) {
            res.render("employee/addOrEdit", {
                viewTitle: "Update Employee",
                employee
            });
        }
     });
})

// delete employee
router.delete('/:id', (req, res) => {
    const _id = req.params.id;
    console.log('ID to be removed: ' + _id);

    Employee.findByIdAndDelete(_id, function (err) {
        if (!err) {
            console.log("Successful deletion");
            res.sendStatus(200);
        } else {
            console.log('Error in employee delete :' + err);
            res.sendStatus(500);
        }



        if (err) console.log(err);
        
    });

});

// add employee to database
const insertRecord = (req, res) => {
    const { _id, fullName, email, mobile, city } = req.body;
    const newEmployee = new Employee({
        fullName, 
        email, 
        mobile, 
        city
    });

    newEmployee.save((err, doc) => {
        if (!err) {
            res.redirect('employee/list')
        } else {

            // check for validation error
            if (err.name == 'ValidationError') {
                handleValidationError(err, req.body);
                res.render("employee/addOrEdit", {
                    viewTitle: "Insert Employee",
                    employee: req.body
                });
            } else {
                console.log('Error during record insertion: ' + err);
            }
        }
    });
}

// update existing employss
const updateRecord = (req, res) => {
    const filter = { _id: req.body._id };
    const update =  req.body;
    Employee.findOneAndUpdate(filter, update, {new: true, runValidators: true}, (err, doc) => {
        if (!err) {
            res.redirect('/employee/list');
        } else {
            // check for validation error
            if (err.name == 'ValidationError') {
                handleValidationError(err, req.body);
                res.render("employee/addOrEdit", {
                    viewTitle: "Update Employee",
                    employee: req.body
                });
            } else {
                console.log('Error during record update: ' + err);
            }
        }
    });
}

// process validation errors, store to body
const handleValidationError = (err, body) => {
    for (var field in err.errors) {
        switch (err.errors[field].path) {
            case 'fullName':
                body['fullNameError'] = err.errors[field].message;
                break;
            case 'email':
                body['emailError'] = err.errors[field].message;
                break;
            default:
                break;
        }
    }
}

module.exports = router;