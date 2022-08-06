import { randomColor } from './utils.js'

const settingsWrapper = document.querySelector('.settings_wrapper')
const colInput = document.querySelector('.columns_input')
const rowInput = document.querySelector('.rows_input')
const valInput = document.querySelector('.values_input')
const btnCreate = document.querySelector('.btn_create')
const drawingWrapper = document.querySelector('.drawing_wrapper')
const drawingBoard = document.querySelector('.drawing_board')
let cells = []
const valuesContainer = document.querySelector('.values')
let colorPickers = []
let valuePickers = []
const btnCopy = document.querySelector('.btn_copy')

let state = {}

const create = () => {
	// CREATE STATE OBJECT
	state = {
		selectedValue: '1',
		drawing: false,
		matrixWidth: colInput.value,
		matrixHeight: rowInput.value,
		matrix: [],
		valueColorPairs: {},
	}

	for (let i = 0; i < state.matrixHeight; i++) {
		state.matrix.push([])
		for (let j = 0; j < state.matrixWidth; j++) {
			state.matrix[i].push(0)
		}
	}

	for (let i = 0; i < valInput.value; i++) {
		state.valueColorPairs[`${i}`] = `${randomColor(i)}`
	}

	// ADD EVENT LISTENERS TO DOCUMENT TO DETERMINE IF USER IS DRAWING
	document.addEventListener('mousedown', () => {
		state.drawing = true
	})
	document.addEventListener('mouseup', () => {
		state.drawing = false
	})

	// CREATE DRAWING BOARD
	drawingBoard.style.gridTemplateColumns = `repeat(${state.matrixWidth}, 1fr)`
	drawingBoard.style.gridTemplatRows = `repeat(${state.matrixHeight}, 1fr)`

	for (let i = 1; i <= state.matrixHeight * state.matrixWidth; i++) {
		const row = Math.ceil(i / state.matrixHeight) - 1
		const column =
			i % state.matrixWidth === 0
				? state.matrixWidth - 1
				: (i % state.matrixWidth) - 1

		const cell = document.createElement('div')
		cell.classList.add('drawing_board__cell')
		cell.setAttribute('data-row', row)
		cell.setAttribute('data-col', column)
		cells.push(cell)
		drawingBoard.append(cell)

		// ADD EVENT LISTENERS TO BOARD CELLS
		cell.addEventListener('mouseover', (e) => {
			if (state.drawing) {
				updateMatrixCell(
					e.target.dataset.row,
					e.target.dataset.col,
					state.selectedValue
				)
				updateCell(cell)
			}
		})
		cell.addEventListener('mousedown', (e) => {
			updateMatrixCell(
				e.target.dataset.row,
				e.target.dataset.col,
				state.selectedValue
			)
			updateCell(cell)
		})
		cell.addEventListener('dragstart', (e) => {
			e.preventDefault()
			return false
		})
	}
	updateDrawingBoard()

	// CREATE VALUES PANEL
	Object.values(state.valueColorPairs).forEach((value, key) => {
		const html = `<li data-number=${key} class="value">
	  					<div class="value__box">
						  <span class="value__val" contenteditable>${key}</span>
							<div class="value__color_container" style="background-color:${value};">
								<input type="color" class="value__color" value="${value}"></input>
							</div>
	  					</div>
  				   </li>`
		valuesContainer.insertAdjacentHTML('beforeend', html)
	})
	const values = [...valuesContainer.querySelectorAll('.value')]

	values['1'].classList.add('active_value')

	values.forEach((value) => {
		value.addEventListener('click', (e) => {
			state.selectedValue = value.dataset.number
			values.forEach((value) => {
				if (value.classList.contains('active_value')) {
					value.classList.remove('active_value')
				}
			})
			value.classList.add('active_value')
		})
	})

	colorPickers = [...valuesContainer.querySelectorAll('.value__color')]

	colorPickers.forEach((picker, idx) => {
		picker.addEventListener('change', () => {
			const preview = [
				...valuesContainer.querySelectorAll('.value__color_container'),
			][idx]
			preview.style.backgroundColor = picker.value

			state.valueColorPairs[state.selectedValue] = picker.value
			updateDrawingBoard()
		})
	})

	valuePickers = [...valuesContainer.querySelectorAll('.value__val')]

	valuePickers.forEach((picker, idx) => {
		let prewVal
		picker.addEventListener('focus', () => {
			prewVal = picker.innerText
		})
		picker.addEventListener('blur', () => {
			if (picker.innerText !== prewVal) {
				state.valueColorPairs[picker.innerText] = state.valueColorPairs[prewVal]
				delete state.valueColorPairs[prewVal]

				state.selectedValue = picker.innerText
				values[idx].dataset.number = picker.innerText

				updateMatrix(prewVal, picker.innerText)
				updateDrawingBoard()
			}
		})
	})

	settingsWrapper.classList.add('hidden')
	drawingWrapper.classList.remove('hidden')
}

// UPDATE METHODS
const updateCell = (cell) => {
	const row = cell.dataset.row
	const col = cell.dataset.col

	cell.innerHTML = `<p style="font-size: 1rem;user-select: none;pointer-events: none;">${state.matrix[row][col]}</p>`

	cell.style.backgroundColor =
		state.valueColorPairs[state.matrix[cell.dataset.row][cell.dataset.col]]
}

const updateMatrixCell = (row, col, value) => {
	state.matrix[row][col] = value
}

const updateMatrix = (oldVal, newVal) => {
	for (let i = 0; i < state.matrixHeight; i++) {
		for (let j = 0; j < state.matrixWidth; j++) {
			if (state.matrix[i][j].toString() === oldVal.toString()) {
				state.matrix[i][j] = newVal
			}
		}
	}
}

const updateDrawingBoard = () => {
	cells.forEach((cell) => {
		updateCell(cell)
	})
}

// EVENT LISTENERS
btnCreate.addEventListener('click', create)

btnCopy.addEventListener('click', () => {
	const matrix = state.matrix
	let string = '['
	matrix.forEach((row, i) => {
		if (i === matrix.length - 1) {
			string += `[${row.toString()}]`
		} else {
			string += `[${row.toString()}],\n`
		}
	})
	string += ']'
	navigator.clipboard.writeText(string)
})
