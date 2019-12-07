const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');

// load employee schema
const Employee = require('../models/Employee.model');

// express validator middleware
const { check, validationResult } = require('express-validator');

// validation options
const employeeValidation = [
    check('fullName').not().isEmpty().withMessage('This is a required field.'),
    check('email').isEmail().withMessage('Invalid e-mail address'),
    check('city').not().isEmpty().withMessage('This is a required field.'),
    check('email').custom((email, { req }) => {

        // check if email exists in database
        return Employee.find({ email }).then(employee => {
            
            // email exists
            if (employee.length > 0) {

                // determine new or existing employee
                if (req.body._id == '') {                               // new employee
                    return Promise.reject('E-mail already in use');
                } else if (req.body._id != employee[0]._id) {           // existing employee
                    return Promise.reject('E-mail already in use');
                }
            
            }

        });
    }),
]

// display employee form
router.get('/', (req, res) => {
    res.render('employee/addOrEdit', {
        viewTitle: 'Insert Employee'
    });
});

// add employee to database
router.post('/', [

    //form validation
    employeeValidation

    ], (req,res) => {

    // process validation errors, if any
    const errors = validationResult(req).errors;

    if (errors === undefined || errors.length == 0) {
        // no errors, add to database and render list
        if (req.body._id == '')
            insertRecord(req, res);
        else
            updateRecord(req, res);
    } else {
        handleValidationError(errors, req.body);
        res.render("employee/addOrEdit", {
            viewTitle: "Insert Employee",
            employee: req.body
        });
    }

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
            if (err.name == 'ValidationError') {
                console.log('Validation error occured during database insert.');
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
            if (err.name == 'ValidationError') {
                console.log('Validation error occured during database update.');
            } else {
                console.log('Error during record update: ' + err);
            }
        }
    });
}

// process validation errors, store to body
const handleValidationError = (errors, body) => {

    errors.forEach(error => {
        body[error.param+'Error'] = error.msg;
    });

}

module.exports = router;