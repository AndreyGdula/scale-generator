/* ---------- HELPERS ---------- */
function shuffleArray(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function isConflict(worker, assignedForDay, groups) {
    // retorna true se para algum grupo que contenha 'worker' já exista membro alocado nesse dia
    for (const group of groups) {
        if (group.includes(worker)) {
            for (const member of assignedForDay) {
                if (group.includes(member)) return true;
            }
        }
    }
    return false;
}

function createScaleChip(name) {
    const chip = document.createElement('div');
    chip.className = 'chip';
    const nameSpan = document.createElement('span');
    nameSpan.className = 'chip-name';
    nameSpan.textContent = name;
    chip.appendChild(nameSpan);
    return chip;
}

/* ---------- LIMPAR CALENDÁRIO (remove linhas extras e limpa células) ---------- */
function clearCalendar() {
    const table = document.querySelector('#calendar-table');
    if (!table) return;

    // copia estática das linhas
    const rows = Array.from(table.querySelectorAll('tr'));
    rows.forEach(row => {
        const th = row.querySelector('th');

        // remover linhas que foram criadas como continuação (th sem id ou com classe day-continue)
        if (!th || !th.id || th.classList.contains('day-continue')) {
            row.remove();
            return;
        }

        // main header row: limpar conteúdo das tds e manter apenas 3 células visíveis
        const tds = Array.from(row.querySelectorAll('td.calendar-cell'));
        tds.forEach(td => td.innerHTML = '');

        // se houver mais de 3 cells (criados em uma geração anterior), remove os extras
        for (let i = tds.length - 1; i >= 3; i--) {
            tds[i].remove();
        }
    });
}

/* ---------- ADICIONAR TRABALHADORES PARA UM DIA (3 por linha; cria novas linhas abaixo) ---------- */
function addWorkersToDay(th, workers) {
    if (!th) return;
    const row = th.parentElement;
    const tableBody = row.parentElement; // tbody ou table
    const perRow = 3;
    let idx = 0;

    // Determinar nó antes do qual devemos inserir novas linhas: o próximo "main header" (próximo <tr> cujo <th> tem id)
    function nextMainHeaderAfter(originalRow) {
        let el = originalRow.nextElementSibling;
        while (el) {
            const elTh = el.querySelector('th');
            if (elTh && elTh.id) return el;
            el = el.nextElementSibling;
        }
        return null; // inserir no fim
    }
    const insertBeforeNode = nextMainHeaderAfter(row);

    while (idx < workers.length) {
        const chunk = workers.slice(idx, idx + perRow);
        let targetRow;

        if (idx === 0) {
            targetRow = row;
        } else {
            // cria nova linha de continuação
            targetRow = document.createElement('tr');

            const emptyTh = document.createElement('th');
            emptyTh.className = 'day-continue'; // marca como continuação
            emptyTh.textContent = ''; // vazio (estilizar via CSS se quiser)
            targetRow.appendChild(emptyTh);

            // inserir antes do próximo main header (ou no final)
            tableBody.insertBefore(targetRow, insertBeforeNode);
        }

        // garantir que targetRow tem pelo menos 'perRow' cells
        while (targetRow.querySelectorAll('td.calendar-cell').length < perRow) {
            const td = document.createElement('td');
            td.className = 'calendar-cell';
            // habilita Sortable nas novas células
            activeSortable(td);
            targetRow.appendChild(td);
        }

        // preenche as células disponíveis (apenas até chunk.length)
        const cells = Array.from(targetRow.querySelectorAll('td.calendar-cell'));
        chunk.forEach((name, i) => {
            const chip = createScaleChip(name);
            cells[i].appendChild(chip);
        });

        idx += perRow;
    }
}

/* ---------- RESOLVER ATRIBUIÇÃO (Backtracking com limite de tempo/operações) ---------- */
function solveAssignment(workers, days, groups, options = {}) {
    const timeLimitMs = options.timeLimitMs ?? 1500; // tempo máximo para tentar (ms)
    const opLimit = options.opLimit ?? 200000; // operações máximas
    const start = Date.now();
    let ops = 0;

    // Estrutura inicial de atribuição
    const assigned = {};
    days.forEach(d => assigned[d] = []);

    // Ordem de tentativa dos workers (embaralhada para variar)
    const workerOrder = shuffleArray(workers.slice());

    function canPlace(worker, day) {
        return !isConflict(worker, assigned[day], groups);
    }

    function backtrack(index) {
        if (Date.now() - start > timeLimitMs) return false;
        if (ops++ > opLimit) return false;
        if (index >= workerOrder.length) return true;

        const worker = workerOrder[index];
        // candidatos dias onde é possível colocar esse worker
        const candidates = days.filter(d => canPlace(worker, d));
        // ordenar candidatos por balanceamento (menos ocupados primeiro)
        candidates.sort((a,b) => assigned[a].length - assigned[b].length);

        for (const d of candidates) {
            assigned[d].push(worker);
            if (backtrack(index + 1)) return true;
            assigned[d].pop();
        }
        return false;
    }

    const ok = backtrack(0);
    return ok ? assigned : null;
}

/* ---------- FUNÇÃO PRINCIPAL: generateScale ---------- */
function generateScale() {
    if (workerList.length === 0) {
        alert('Insira ao menos um colaborador para gerar a escala.');
        return;
    }

    // Normaliza e ordena os dias
    const dayOrder = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const days = Array.from(new Set(dayScale))
        .filter(d => dayOrder.includes(d))
        .sort((a,b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));

    if (days.length === 0) {
        alert('Nenhum dia ativo para gerar a escala.');
        return;
    }

    const groups = getRestrictionGroups();
    const workers = workerList.slice();

    // limpar calendário antes de gerar (remove linhas extras, limpa células)
    clearCalendar();

    // tentar encontrar solução exata
    const assignment = solveAssignment(workers, days, groups, { timeLimitMs: 1500, opLimit: 200000 });

    if (!assignment) {
        alert('Não foi possível gerar a escala respeitando todas as restrições definidas. Reveja seus grupos/remoções de dias.');
        console.warn('Falha ao gerar escala com restrições. Workers:', workers, 'Days:', days, 'Groups:', groups);
        return;
    }

    // preenche a tabela de acordo com assignment
    for (const dayId of days) {
        const th = document.querySelector(`#${dayId}`);
        if (!th) continue;
        const assignedForDay = assignment[dayId] || [];
        addWorkersToDay(th, assignedForDay);
    }

    // opcional: log pra depurar
    console.log('Escala gerada com sucesso:', assignment);
}
