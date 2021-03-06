const getMonthName = (month, style = 'long') => {
	const monthsInAYear = [
		{ shortname: 'Jan', longname: 'January' },
		{ shortname: 'Feb', longname: 'February' },
		{ shortname: 'Mar', longname: 'March' },
		{ shortname: 'Apr', longname: 'April' },
		{ shortname: 'May', longname: 'May' },
		{ shortname: 'Jun', longname: 'June' },
		{ shortname: 'Jul', longname: 'July' },
		{ shortname: 'Aug', longname: 'August' },
		{ shortname: 'Sep', longname: 'September' },
		{ shortname: 'Oct', longname: 'October' },
		{ shortname: 'Nov', longname: 'November' },
		{ shortname: 'Dec', longname: 'December' }
	]

	const m = monthsInAYear[month]
	if (style === 'long') return m.longname
	return m.shortname
}

const getMonthIndicatorText = (date) => {
	const year = date.getFullYear()
	const month = date.getMonth()
	const monthName = getMonthName(month)
	return `${monthName} ${year}`
}

const getMonthIndicatorDatetime = date => {
	const year = date.getFullYear()
	const month = date.getMonth()
	return `${year}-${month + 1}`
}

const getFirstDayOfMonth = date => {
	const firstDayOfMonth = new Date(date.setDate(1))
	return firstDayOfMonth.getDay()
}

const getNumDaysInMonth = date => {
	const year2 = date.getFullYear()
	const month = date.getMonth()
	const lastDayInMonth = new Date(year2, month + 1, 0)
	return lastDayInMonth.getDate()
}

const getDategridHTML = date => {
	const year = date.getFullYear()
	const month = date.getMonth()
	return Array.from({ length: getNumDaysInMonth(date) })
		.map((value, index) => {
			const day = index + 1
			const firstDayStyle = day === 1
				? `--firstDayOfMonth: ${getFirstDayOfMonth(date) + 1}"`
				: ''
			const tabIndex = firstDayStyle
				? 0
				: -1

			return `
        <button type="button" style="${firstDayStyle}" tabindex="${tabIndex}">
          <time datetime="${year}-${month + 1}-${day}">${day}</time>
        </button>
      `
		})
		.join('')
}

const createDatepicker = (date, dateField) => {
	const year = date.getFullYear()
	const month = date.getMonth()
	const datepicker = document.createElement('div')
	datepicker.classList.add('datepicker')
	datepicker.setAttribute('hidden', true)

	const buttonsHTML = `
    <div class="datepicker__buttons">
      <button type="button" class="datepicker__previous" type="button">
        <svg viewBox="0 0 20 20">
          <path fill="currentColor" d="M7.05 9.293L6.343 10 12 15.657l1.414-1.414L9.172 10l4.242-4.243L12 4.343z" /></svg>
        </svg>
      </button>
      <button type="button" class="datepicker__next">
        <svg viewBox="0 0 20 20">
          <path fill="currentColor" d="M12.95 10.707l.707-.707L8 4.343 6.586 5.757 10.828 10l-4.242 4.243L8 15.657l4.95-4.95z" />
        </svg>
      </button>
    </div>
  `

	const calendarHTML = `
    <div class="datepicker__calendar">
      <div class="datepicker__monthIndicator">
        <time datetime="${year}-${month + 1}">${getMonthIndicatorText(date)}</time>
      </div>
      <div class="datepicker__dayOfWeek">
        <div>Su</div>
        <div>Mo</div>
        <div>Tu</div>
        <div>We</div>
        <div>Th</div>
        <div>Fr</div>
        <div>Sa</div>
      </div>
      <div class="datepicker__date-grid">${getDategridHTML(date)}</div>
    </div>
  `

	datepicker.innerHTML = `
    ${buttonsHTML}
    ${calendarHTML}
  `

	const buttonsDiv = datepicker.querySelector('.datepicker__buttons')
	buttonsDiv.addEventListener('click', ev => {
		if (!ev.target.matches('button')) return

		const timeEl = datepicker.querySelector('.datepicker__monthIndicator').firstElementChild
		const datetime = timeEl.getAttribute('datetime')
		const currentDate = new Date(datetime)
		const year = currentDate.getFullYear()
		const month = currentDate.getMonth()

		const targetMonth = ev.target.matches('.datepicker__previous')
			? new Date(year, month - 1)
			: new Date(year, month + 1)

		// Update the year/month indicator
		timeEl.textContent = getMonthIndicatorText(targetMonth)
		timeEl.setAttribute('datetime', getMonthIndicatorDatetime(targetMonth))

		// Change the date grid
		const dategrid = datepicker.querySelector('.datepicker__date-grid')
		dategrid.innerHTML = getDategridHTML(targetMonth)
	})

	const dategrid = datepicker.querySelector('.datepicker__date-grid')
	dategrid.addEventListener('click', ev => {
		if (!ev.target.matches('button')) return
		const button = ev.target

		const timeEl = button.firstElementChild
		const datetime = timeEl.getAttribute('datetime')
		const selectedDate = new Date(datetime)

		const year = selectedDate.getFullYear()
		let month = selectedDate.getMonth() + 1
		let day = selectedDate.getDate()

		if (month < 10) month = '0' + month
		if (day < 10) day = '0' + day

		const formatted = `${day}/${month}/${year}`
		dateField.value = formatted

		// Highlight the selected button
		const buttons = [...button.parentElement.children]
		buttons.forEach(button => button.classList.remove('is-selected'))
		button.classList.add('is-selected')
	})

	// Finding a way to show/hide datepicker
	const showDatepicker = datepicker => {
		datepicker.removeAttribute('hidden')
	}

	const hideDatepicker = datepicker => {
		datepicker.setAttribute('hidden', true)
	}

	document.addEventListener('click', ev => {
		if (ev.target === dateField || ev.target.closest('.datepicker')) {
			showDatepicker(datepicker)
		} else {
			hideDatepicker(datepicker)
		}
	})

	document.addEventListener('focusin', ev => {
		if (ev.target === dateField || ev.target.closest('.datepicker')) {
			showDatepicker(datepicker)
		} else {
			hideDatepicker(datepicker)
		}
	})

	document.addEventListener('keydown', ev => {
		const key = ev.key
		const eventTarget = ev.target

		if (eventTarget === dateField) {
			// We only look for Tab key here because we want to change focus to datepicker
			if (key === 'Tab') {
				ev.preventDefault()
				datepicker.querySelector('button').focus()
			}
		}

		if (eventTarget.closest('.datepicker')) {
			const shiftPressed = ev.shiftKey
			if (key === 'Tab') {
				if (shiftPressed) {
					const previousButton = datepicker.querySelector('.datepicker__previous')
					if (eventTarget !== previousButton) return

					ev.preventDefault()
					dateField.focus()
				} else {
					if (!eventTarget.closest('.datepicker__date-grid')) return
					const focusables = [...document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
					const dateFieldIndex = focusables.findIndex(el => el === dateField)

					ev.preventDefault()
					focusables[dateFieldIndex + 1].focus()
				}
			}

			if (
				key === 'ArrowDown' ||
				key === 'ArrowUp' ||
				key === 'ArrowLeft' ||
				key === 'ArrowRight'
			) {
				const isDateButton = !!eventTarget.closest('.datepicker__date-grid')
				if (!isDateButton) {
					datepicker.querySelector('.datepicker__date-grid').querySelector('button').focus()
				} else {
					const datetime = eventTarget.firstElementChild.getAttribute('datetime')
					const highlightedDate = new Date(datetime)
					const year = highlightedDate.getFullYear()
					const month = highlightedDate.getMonth()
					const day = highlightedDate.getDate()

					let delta
					if (key === 'ArrowLeft') delta = -1
					if (key === 'ArrowRight') delta = 1
					if (key === 'ArrowUp') delta = -7
					if (key === 'ArrowDown') delta = 7

					const newHighlightedDate = new Date(year, month, day + delta)
					// Change selected date...Ugh
					// But this is good. I know what I need to do here.
				}
			}
		}
	})

	return datepicker
}

// Creating and Adding the Datepicker to the DOM
const date = new Date(2019, 1)
const form = document.querySelector('form')
const input = form.querySelector('input')
const datepicker = createDatepicker(date, input)

form.appendChild(datepicker)