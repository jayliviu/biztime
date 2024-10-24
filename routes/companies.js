const db = require("../db");
const express = require("express");
const ExpressError = require("../expressError");
const slugify = require('slugify')
const router = express.Router();


router.get('/', async (req, res, next) => {
	try {

		const results = await db.query(`SELECT * FROM companies`)
		console.log(results.rows)

		if(results.rowCount === 0){
			return next(new ExpressError('Our records show there are no companies', 404))
		} else {
			return res.status(200).json({companies: results.rows})
		}
		
	} catch (error) {
		return next(error)
	}
});


router.get('/:code', async (req, res, next) => {
	try {
		
		const { code } = req.params
		const results = await db.query(`SELECT * FROM companies WHERE code = $1`, [code])
		console.log(results.rows)

		if(results.rowCount === 0){
			return new ExpressError(`We couldn't find a compnay in our records that matches that code`, 404)
		} else {
			const company = results.rows[0]
			return res.status(200).json({company})
		}

	} catch (error) {
		next(error)
	}
});


router.post('/', async (req, res, next) => {
	try {
		const { code, name, description } = req.body

		const slug = slugify(code, {
			lower: true,
			strict: true,
			remove: /[~'!@#*]/g,
			trim: true
		});

		const result = await db.query(`
			INSERT INTO companies (code, name, description)
			VALUES ($1, $2, $3)
			RETURNING *
		`, [slug, name, description]);

		if(result.rows.length === 0) {
			return next(new ExpressError('Check the data you tried inserting, something went wrong', 400))
		} else {
			return res.status(201).json({company: result.rows[0]})
		}

	} catch (error) {
		return next(error)
	}
});


router.put('/:code', async (req, res, next) => {
	try {

		const { code } = req.params
		const { name, description } = req.body

		const result = await db.query(`
			UPDATE companies
			SET name = $1, description = $2
			WHERE code = $3
			RETURNING *
		`, [name, description, code])
		
		if(result.rows.length === 0) {
			return next(new ExpressError(`Couldn't update company based on data you gave us`, 404))
		} else {
			return res.status(200).json({company: result.rows[0]})
		}

	} catch (error) {	
		return next(error)
	}
});


router.delete('/:code', async (req, res, next) => {
	try {
		const { code } = req.params
		const result = await db.query(`
			DELETE FROM companies
			WHERE code = $1
			RETURNING *
		`, [code])

		if(result.rows.length === 0) {
			return next(new ExpressError(`Could not delete the resource you provided us`, 404))
		} else {
			return res.json({status: 'deleted', company: result.rows[0]})
		}

	} catch (error) {
		return next(error)
	}
});

module.exports = router