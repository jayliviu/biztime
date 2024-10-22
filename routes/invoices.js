const db = require('../db')
const express = require('express')
const router = express.Router()
const expressError = require('../expressError')


router.get('/', async (req, res, next) => {
	try {

		const result = await db.query(`
			SELECT * FROM invoices
		`)

		if(result.rows.length === 0) {
			return next(new expressError(`There are no invoices to see`, 404))
		} else {
			return res.status(200).json({invoices: result.rows})
		}

	} catch (error) {
		return next(error)
	}
})


router.get('/:id', async (req, res, next) => {
	try {

		const { id } = req.params
		const result = await db.query(`
			SELECT * FROM invoices
			WHERE id = $1
		`, [id])

		if(result.rows.length === 0) {
			return next(new expressError(`Could not find the invoice you are looking for`, 404))
		} else {
			return res.status(200).json({invoice: result.rows[0]})
		}

	} catch (error) {
		return next(error)
	}
})


router.post('/', async (req, res, next) => {
	try {

		const { comp_code, amt } = req.body
		const result = await db.query(`
			INSERT INTO invoices (comp_code, amt)
			VALUES ($1, $2)
			RETURNING *
		`, [comp_code, amt])

		if(result.rows.length === 0) {
			return next(new expressError(`Could not add invoice, check data you sent us`, 404))
		} else {
			return res.status(201).json({invoice: result.rows[0]})
		}

	} catch (error) {
		return next(error)
	}
});


router.put('/:id', async (req, res, next) => {
	try {

		const { id } = req.params
		const { amt } = req.body
		const result = await db.query(`
			UPDATE invoices
			SET amt = $1
			WHERE id = $2
			RETURNING *
		`, [amt, id])

		if(result.rows.length === 0) {
			return next(new expressError(`Couldn't update invoice based on data you gave us`, 404))
		} else {
			return res.status(200).json({invoice: result.rows[0]})
		}

	} catch (error) {
		return next(error)
	}
});


router.delete('/:id', async (req, res, next) => {
	try {

		const { id } = req.params

		const result = await db.query(`
			DELETE FROM invoices
			WHERE id = $1
			RETURNING *
		`, [id])

		if(result.rows.length === 0) {
			return next(new expressError(`Couldn't delete that invoice, check if it exists and the data you sent us`, 404))
		} else {
			return res.status(200).json({status: 'deleted', invoice: result.rows[0]})
		}

	} catch (error) {
		return next(error)
	}
});


router.get('/companies/:code', async (req, res, next) => {
	try {

		const {code} = req.params

		const company = await db.query(`
			SELECT * FROM companies
			WHERE code = $1
		`, [code])

		if(company.rows.length === 0) {
			return next(new expressError(`Could not find the company you searched for`, 404))
		} else {
			const invoices = await db.query(`
				SELECT * FROM invoices
				WHERE comp_code = $1
			`, [code])
			if(invoices.rows.length === 0) {
				return res.status(200).json({company: company.rows[0], invoices: []})	
			} else {
				const arrOfInvoices = invoices.rows.map(invoice => {
					return Object.values(invoice)
				})
	
				return res.status(200).json({company: company.rows[0], invoices: arrOfInvoices})
			}
		}

	} catch(error) {
		return next(error)
	}
})

module.exports = router