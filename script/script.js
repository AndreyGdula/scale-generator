const inputWorkers = document.querySelector('input#workers')
const chipsContainer = document.querySelector('.chips-container')
const group = document.querySelector('div.group')
const groupContainer = document.querySelector('div.group-container')
const calendarCell = document.querySelectorAll('td.calendar-cell')
const table = document.querySelector('#calendar-table')
const alertWorkers = document.querySelector('div#alertWorkers')
const alertButton = document.querySelector('div#alertButton')
let workerList = []
let dayScale = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

inputWorkers.addEventListener('keydown', function(event) {
    alertWorkers.style.display = 'none'
    alertButton.style.display = 'none'
    if (event.key === 'Enter' || event.key === ',') {
        event.preventDefault()
        const name = inputWorkers.value.charAt(0).toUpperCase() + inputWorkers.value.trim().replace(',', '').slice(1).toLowerCase()
        if (name && !workerList.includes(name)) {
            createChip(name)
            inputWorkers.value = ''
            workerList.push(name)
        } else if (workerList.includes(name)) {
            alertWorkers.style.display = 'block'
            alertWorkers.textContent = 'Colaborador já foi inserido.'
            inputWorkers.value = ''
        }
    }
})

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
activeSortable(group)
document.querySelectorAll('td.calendar-cell').forEach(td => {
    activeSortable(td)
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

function createGroup() {
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
            }
        }
    })
}

function helpBox(helpId) {
    const help = document.querySelector(`div.help#${helpId}`)
    const isHidden = window.getComputedStyle(help).display === 'none'
    help.style.display = isHidden ? 'block' : 'none'
}

function removeDay(dayBtn) {
    const day = document.querySelector(`#${dayBtn}`)
    const btnIcon = day.children[0]
    const tdDesatived = day.parentElement

    const desativedColor = '#06242eff'
    const tdDesativedColor = '#b1b8bdff'

    if (btnIcon.innerHTML === 'check') {
        day.style.backgroundColor = desativedColor
        day.style.borderColor = desativedColor
        day.style.color = tdDesativedColor
        tdDesatived.style.borderColor = desativedColor
        tdDesatived.style.backgroundColor = tdDesativedColor
        btnIcon.innerHTML = 'close'
        dayScale = dayScale.filter(d => d !== dayBtn)

        let nextRow = tdDesatived.nextSibling
        while (nextRow && nextRow.classList && nextRow.classList.contains('extra-row')) {
            nextRow.style.backgroundColor = tdDesativedColor
            nextRow.querySelectorAll('td').forEach(td => {
                td.style.backgroundColor = tdDesativedColor
                td.style.borderColor = desativedColor
            })
            nextRow = nextRow.nextSibling
        }
    } else {
        day.style.backgroundColor = ''
        day.style.borderColor = ''
        day.style.color = ''
        tdDesatived.style.borderColor = ''
        tdDesatived.style.backgroundColor = ''
        btnIcon.innerHTML = 'check'
        dayScale.push(dayBtn)

        let nextRow = tdDesatived.nextSibling
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

function orderDays() {
    const dayOrder = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const days = Array.from(new Set(dayScale))
        .filter(d => dayOrder.includes(d))
        .sort((a,b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
    return days
}

function sortWorkers() { // Corrigir está função para evitar nomes conflitantes
    const days = orderDays()
    const result = []
    const groups = getRestrictionGroups()
    let workers = [...workerList]

    const groupMap = {}
    groups.forEach(group => {
        group.forEach(name => {
            groupMap[name] = group
        })
    })

    let dayIndex = 0
    while (workers.length > 0) {
        const day = days[dayIndex % days.length]
        if (!result[day]) result[day] = []

        const namesInDay = result[day]
        const candidates = workers.filter(name => {
            if (!groupMap[name]) return true
            return !namesInDay.some(n => groupMap[n] === groupMap[name])
        })
        if (candidates.length === 0) {
            dayIndex++
            continue
        }

        const sorted = Math.floor(Math.random() * candidates.length)
        const nameSorted = candidates[sorted]
        result[day].push(nameSorted)
        workers = workers.filter(n => n !== nameSorted)
        dayIndex++
    }
    return result
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

        const numExtras = Math.ceil((names.length - tds.length) / tds.length)
        tr.querySelector('th').rowSpan = numExtras + 1

        let extraIndex = tds.length
        while (extraIndex < names.length) {
            const extraRow = document.createElement('tr')
            const thNull = document.createElement('th')
            extraRow.className = 'extra-row'
            thNull.innerHTML = ''
            extraRow.appendChild(thNull)

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
            tr.parentNode.insertBefore(extraRow, tr.nextSibling)
        }

    })
}

function generateScale() {
    if (workerList.length === 0) {
        alertButton.style.display = 'block'
        alertButton.textContent = 'Adicione trabalhadores para gerar a escala'
        return
    } else if (dayScale.length === 0) {
        alertButton.style.display = 'block'
        alertButton.textContent = 'Selecione ao menos um dia para gerar a escala'
        return
    }
    const sort = sortWorkers()
    const tableFill = fillTable(sort)
}