const inputWorkers = document.querySelector('input#workers')
const chipsContainer = document.querySelector('.chips-container')
const group = document.querySelector('div.group')
const groupContainer = document.querySelector('div.group-container')
const calendarCell = document.querySelectorAll('td.calendar-cell')
const table = document.querySelector('#calendar-table')
const generateButton = document.querySelector('input.generate-btn')
const alertPopContainer = document.querySelector('div.alert-container')
const alertPop = document.querySelector('p#pop-up')
const btnAddGroup = document.querySelector('div.add-group')
let workerList = []
let dayScale = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

inputWorkers.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.key === ',') {
        generateButton.disabled = false
        event.preventDefault()
        const capitalize = inputWorkers.value
        const name = capitalizeNames(capitalize)
        if (name && !workerList.includes(name)) {
            createChip(name)
            inputWorkers.value = ''
            workerList.push(name)
        } else if (workerList.includes(name)) {
            showPopAlert('Colaborador já foi inserido.')
            inputWorkers.value = ''
        }
    }
})

function capitalizeNames(str) {
    return str
        .trim()
        .replace(',', '')
        .toLowerCase()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

function createChip(name) {
    const chip = document.createElement('div')
    chip.className = 'chip'
    chip.dataset.source = "true"

    const nameSpan = document.createElement('span')
    nameSpan.className = 'chip-name'
    nameSpan.textContent = name

    const deleteChip = document.createElement('span')
    deleteChip.className = 'delete-chip material-symbols-outlined'
    deleteChip.innerHTML = 'close'

    chip.appendChild(nameSpan)
    chip.appendChild(deleteChip)
    chipsContainer.appendChild(chip)
    activeDeleteChipFonte()
}

function activeSortable(el, isSource = false) {
    new Sortable(el, {
        group: isSource
            ? { name: 'restriction', pull: 'clone', put: false }
            : { name: 'restriction', pull: true, put: true },
        animation: 150,
        sort: !isSource,

        onAdd: function (evt) {
            togglePlaceholder(evt.to)
            const chip = evt.item
            const deleteChip = chip.querySelector('.delete-chip')
            if (deleteChip) {
                deleteChip.onclick = function () {
                    chip.remove()
                    togglePlaceholder(evt.to)
                }
            }
            activeDeleteChipFonte()
        },
        onRemove: function (evt) {
            togglePlaceholder(evt.from)
        },
    })
    togglePlaceholder(el)
}
activeSortable(chipsContainer, true)
new Sortable(btnAddGroup, {
    group: { name: 'restriction', pull: false, put: true },
    animation: 150,
    sort: false,
    onAdd: function(evt) {
        const chip = evt.item
        createGroup(chip)
    },
})
const tdCalendar = table.querySelectorAll('td.calendar-cell')
tdCalendar.forEach(td => {
    new Sortable(td, {
        group: { name: 'restriction', pull: true, put: true },
        animation: 150,
        sort: true,
        onAdd: function (evt) {
            const chip = evt.item
            const deleteChip = chip.querySelector('.delete-chip')
            if (deleteChip) {
                deleteChip.onclick = function () {
                    chip.remove()
                    togglePlaceholder(evt.to)
                }
            }
            activeDeleteChipFonte()
        }
    })
})


function togglePlaceholder(container) {
    const placeholder = container.querySelector('span.placeholder-restriction')
    if (!placeholder) return

    if (container.querySelectorAll('.chip').length > 0) {
        placeholder.style.display = 'none'
    } else {
        placeholder.style.display = 'block'
    }
}

function createGroup(chip = null) {
    const divGroup = document.createElement('div')
    const closeGroup = document.createElement('span')
    divGroup.className = 'group'
    divGroup.innerHTML = '<span class="placeholder-restriction">Arraste aqui</span>'
    groupContainer.appendChild(divGroup)

    closeGroup.className = 'close-group material-symbols-outlined'
    closeGroup.innerHTML = 'close'
    closeGroup.onclick = () => {
        divGroup.remove()
    }
    divGroup.appendChild(closeGroup)
    activeSortable(divGroup)

    if (chip) {
        divGroup.appendChild(chip)
        const deleteChip = chip.querySelector('.delete-chip')
        if (deleteChip) {
            deleteChip.onclick = function () {
                chip.remove()
                togglePlaceholder(divGroup)
            }
        }

        togglePlaceholder(divGroup)
        activeDeleteChipFonte()
    }
    return divGroup
}


// Função para ativar a funcionalidade de exclusão do chip fonte
function activeDeleteChipFonte() {
    document.querySelectorAll('.chips-container .chip').forEach(chip => {
        const deleteChip = chip.querySelector('.delete-chip')
        if (deleteChip) {
            const name = chip.querySelector('.chip-name')
                ? chip.querySelector('.chip-name').textContent
                : chip.textContent.replace('close', '')
            deleteChip.onclick = function () {
                document.querySelectorAll('.group .chip').forEach(clone => {
                    const cloneName = clone.querySelector('.chip-name')
                        ? clone.querySelector('.chip-name').textContent
                        : clone.textContent.replace('close', '')
                    if (cloneName === name) clone.remove()
                })
                workerList = workerList.filter(worker => worker !== name)
                chip.remove()
                generateButton.disabled = workerList.length === 0
            }
        }
    })
}

function helpBox(helpId) {
    const help = document.querySelector(`div.help#${helpId}`)
    const isHidden = window.getComputedStyle(help).display === 'none'
    help.style.display = isHidden ? 'block' : 'none'
}

function removeDay(dayId) {
    const contentDiv = document.querySelector(`#${dayId}`)   // agora é o div.th-content
    const th = contentDiv.closest('th')                      // pega o th pai
    const btnIcon = contentDiv.querySelector('.day-btn')
    const row = th.parentElement

    const desativedColor = '#06242eff'
    const tdDesativedColor = '#b1b8bdff'

    if (btnIcon.innerHTML === 'check') {
        th.style.backgroundColor = desativedColor
        th.style.borderColor = desativedColor
        th.style.color = tdDesativedColor
        row.style.borderColor = desativedColor
        row.style.backgroundColor = tdDesativedColor
        btnIcon.innerHTML = 'close'
        dayScale = dayScale.filter(d => d !== dayId)

        let nextRow = row.nextSibling
        while (nextRow && nextRow.classList && nextRow.classList.contains('extra-row')) {
            nextRow.style.backgroundColor = tdDesativedColor
            nextRow.querySelectorAll('td').forEach(td => {
                td.style.backgroundColor = tdDesativedColor
                td.style.borderColor = desativedColor
            })
            nextRow = nextRow.nextSibling
        }
    } else {
        th.style.backgroundColor = ''
        th.style.borderColor = ''
        th.style.color = ''
        row.style.borderColor = ''
        row.style.backgroundColor = ''
        btnIcon.innerHTML = 'check'
        dayScale.push(dayId)

        let nextRow = row.nextSibling
        while (nextRow && nextRow.classList && nextRow.classList.contains('extra-row')) {
            nextRow.style.backgroundColor = ''
            nextRow.querySelectorAll('td').forEach(td => {
                td.style.backgroundColor = ''
                td.style.borderColor = ''
            })
            nextRow = nextRow.nextSibling
        }
    }
}


function getRestrictionGroups() {
    const groups = []
    document.querySelectorAll('.group').forEach(groupDiv => {
        const chips = []
        groupDiv.querySelectorAll('.chip').forEach(chip => {
            const nameSpan = chip.querySelector('.chip-name')
            if (nameSpan) {
                chips.push(nameSpan.textContent)
            }
        })
        groups.push(chips)
    })
    return groups
}

function getCellNames() {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const fixedNames = {}

    days.forEach(day => {
        const tr = table.querySelector(`th#${day}`)?.parentElement
        if (!tr) {
            fixedNames[day] = []
            return
        }

        const chips = tr.querySelectorAll('.chip')
        const names = []
        chips.forEach(c => {
            const hasDelete = c.querySelector('.delete-chip')
            console.log("hasDelete: ", hasDelete)
            if (hasDelete) {
                const nameSpan = c.querySelector('.chip-name')
                if (nameSpan) {
                    names.push(nameSpan.textContent.trim())
                }
            }
        })
        fixedNames[day] = names
    })
    return fixedNames
}

function orderDays() {
    const dayOrder = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
    const days = Array.from(new Set(dayScale))
        .filter(d => dayOrder.includes(d))
        .sort((a,b) => dayOrder.indexOf(a) - dayOrder.indexOf(b))
    return days
}

function getRestrictionPairs() {
    const groups = getRestrictionGroups()
    const pairs = new Set()

    groups.forEach(group => {
        for (let i = 0; i < group.length; i++) {
            for (let j = i + 1; j < group.length; j++) {
                const a = group[i]
                const b = group[j]
                pairs.add([a, b].sort().join('|')) // Evita duplicatas
            }
        }
    })
    return pairs
}

function areCompatible(a, b, pairs) {
    return !pairs.has([a, b].sort().join('|'))
}

function sortWorkers(maxAttempts = 1000) {
    const days = orderDays()
    const restrictionPairs = getRestrictionPairs()
    const fixedNames = getCellNames()

    let attempt = 0
    let workers, result

    while (attempt < maxAttempts) {
        workers = [...workerList.filter(n => !Object.values(fixedNames).flat().includes(n))]
        result = {...fixedNames}
        let dayIndex = 0
        let failed = false

        while (workers.length > 0) {
            const day = days[dayIndex % days.length]
            if (!result[day]) result[day] = []

            const namesInDay = result[day]
            const candidates = workers.filter(name =>
                namesInDay.every(n => areCompatible(n, name, restrictionPairs))
            )

            if (candidates.length === 0) {
                failed = true
                break // Não conseguiu nesta tentativa, recomeça
            }

            const randomIndex = Math.floor(Math.random() * candidates.length)
            const nameSorted = candidates[randomIndex]

            result[day].push(nameSorted)
            workers = workers.filter(n => n !== nameSorted)
            dayIndex++
        }
        if (!failed) {
            return result // Caso consiga, retorna
        }
        attempt++
    }
    showPopAlert('Não foi possível gerar a escala com as restrições atuais.')
    return null
}

function fillTable(scale) {
    calendarCell.forEach(td => td.innerHTML = '')
    Array.from(table.querySelectorAll('.extra-row')).forEach(tr => tr.remove())
    Object.entries(scale).forEach(([day, names]) => {
        const tr = table.querySelector(`th#${day}`).parentElement
        const tds = Array.from(tr.querySelectorAll('td.calendar-cell'))
        
        names.forEach((name, i) => {
            if (i < tds.length) {
                tds[i].innerHTML = `<div class="chip"><span class="chip-name">${name}</span></div>`
            }
        })

        const extraNeeded = Math.max(0, Math.ceil((names.length - tds.length) / tds.length))
        tr.querySelector('th').rowSpan = Math.max(1, extraNeeded + 1)

        let extraIndex = tds.length
        let lastRow = tr
        while (extraIndex < names.length) {
            const extraRow = document.createElement('tr')
            extraRow.className = 'extra-row'

            for (let i = 0; i < tds.length; i++) {
                const td = document.createElement('td')
                td.className = 'calendar-cell'
                const nameExtra = names[extraIndex]
                if (nameExtra) {
                    td.innerHTML = `<div class="chip"><span class="chip-name">${nameExtra}</span></div>`
                }
                extraRow.appendChild(td)
                extraIndex++
            }
            lastRow.parentNode.insertBefore(extraRow, lastRow.nextSibling)
            lastRow = extraRow
        }
    })
}

function generateScale() {
    if (dayScale.length === 0) {
        showPopAlert('Selecione ao menos um dia para gerar a escala')
        return
    }
    const sort = sortWorkers()
    const tableFill = fillTable(sort)
}

function closePopAlert() {
    alertPopContainer.style.display = 'none'
    alertPop.textContent = ''
}

function showPopAlert(msg) {
    alertPopContainer.style.display = 'flex'
    alertPop.textContent = msg
}