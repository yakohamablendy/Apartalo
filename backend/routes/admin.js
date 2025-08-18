const express = require('express');
const router = express.Router();


const { getAllReservas, updateReservaStatus } = require('../controllers/adminController');


const { verifyToken, isAdmin } = require('../controllers/authController');

/**
 * @route  
 * @desc    
 * @access  



/**
 * @route  
 * @desc    
 * @access  
 */
router.put('/reservas/:id/estado', verifyToken, isAdmin, updateReservaStatus);

module.exports = router;