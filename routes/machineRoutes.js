const express = require('express');
const router = express.Router();
const machineController = require('../controller/machineController');

router.get('/aggregate', machineController.getMachineUtilization);

module.exports = router;
