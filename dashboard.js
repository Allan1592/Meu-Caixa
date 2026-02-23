let transacoes = JSON.parse(localStorage.getItem('transacoes')) || [];
let filtroTipoAtual = 'todos';

const hoje = new Date();
document.getElementById('dataVencimento').valueAsDate = hoje;
document.getElementById('mesFiltro').value = hoje.toISOString().substring(0, 7);

function ajustarCamposRecorrencia() {
    const rec = document.getElementById('recorrencia').value;
    document.getElementById('divParcelas').style.display = (rec === 'parcelada') ? 'block' : 'none';
}

function adicionar() {
    const desc = document.getElementById('descricao').value;
    const val = document.getElementById('valor').value;
    const tip = document.getElementById('tipo').value;
    const dataBase = document.getElementById('dataVencimento').value;
    const rec = document.getElementById('recorrencia').value;
    const parcelas = parseInt(document.getElementById('numParcelas').value) || 1;

    if (!desc || !val || !dataBase) return alert("Preencha os campos!");

    let vezes = 1;
    if (rec === 'fixa') vezes = 24; // Projeta 2 anos de gastos fixos
    if (rec === 'parcelada') vezes = parcelas;

    for (let i = 0; i < vezes; i++) {
        let dt = new Date(dataBase + "T12:00:00");
        dt.setMonth(dt.getMonth() + i);
        let dFinal = (vezes > 1 && rec !== 'fixa') ? `${desc} (${i + 1}/${vezes})` : desc;
        
        transacoes.push({
            id: Date.now() + i,
            descricao: dFinal,
            valor: parseFloat(val),
            tipo: tip,
            data: dt.toISOString().split('T')[0]
        });
    }
    salvarERenderizar();
    document.getElementById('descricao').value = '';
    document.getElementById('valor').value = '';
}

function confirmarLimpeza(modo) {
    const msg = modo === 'mes' ? "Apagar todos os lançamentos DESTE MÊS?" : "Apagar ABSOLUTAMENTE TUDO?";
    document.getElementById('msgConfirm').innerText = msg;
    document.getElementById('modalConfirm').style.display = 'flex';
    document.getElementById('btnConfirmarAcao').onclick = () => {
        if (modo === 'mes') {
            const mes = document.getElementById('mesFiltro').value;
            transacoes = transacoes.filter(t => !t.data.includes(mes));
        } else {
            transacoes = [];
        }
        fecharModal('modalConfirm');
        salvarERenderizar();
    };
}

function deletar(id) {
    document.getElementById('msgConfirm').innerText = "Deseja excluir este item?";
    document.getElementById('modalConfirm').style.display = 'flex';
    document.getElementById('btnConfirmarAcao').onclick = () => {
        transacoes = transacoes.filter(t => t.id !== id);
        fecharModal('modalConfirm');
        salvarERenderizar();
    };
}

function editar(id) {
    const item = transacoes.find(t => t.id === id);
    document.getElementById('editDescricao').value = item.descricao;
    document.getElementById('editValor').value = item.valor;
    document.getElementById('editData').value = item.data;
    document.getElementById('modalEdit').style.display = 'flex';
    document.getElementById('btnConfirmarEdicao').onclick = () => {
        item.descricao = document.getElementById('editDescricao').value;
        item.valor = parseFloat(document.getElementById('editValor').value);
        item.data = document.getElementById('editData').value;
        fecharModal('modalEdit');
        salvarERenderizar();
    };
}

function filtrarTipo(tipo, btn) {
    filtroTipoAtual = tipo;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderizar();
}

function fecharModal(id) { document.getElementById(id).style.display = 'none'; }

function salvarERenderizar() {
    localStorage.setItem('transacoes', JSON.stringify(transacoes));
    renderizar();
}

function renderizar() {
    const lista = document.getElementById('listaTransacoes');
    const mes = document.getElementById('mesFiltro').value;
    const busca = document.getElementById('busca').value.toLowerCase();
    lista.innerHTML = '';
    let e = 0, s = 0;

    transacoes.filter(t => t.data.includes(mes) && t.descricao.toLowerCase().includes(busca) && (filtroTipoAtual === 'todos' || t.tipo === filtroTipoAtual))
    .sort((a, b) => new Date(b.data) - new Date(a.data))
    .forEach(t => {
        if (t.tipo === 'receita') e += t.valor; else s += t.valor;
        const li = document.createElement('li');
        li.className = `item-lista item-${t.tipo}`;
        li.innerHTML = `<div><strong>${t.descricao}</strong><br><small>${t.data.split('-').reverse().join('/')}</small><br><span class="${t.tipo==='receita'?'verde':'vermelho'}">R$ ${t.valor.toFixed(2)}</span></div>
        <div class="acoes"><span onclick="editar(${t.id})">✏️</span><span onclick="deletar(${t.id})">🗑️</span></div>`;
        lista.appendChild(li);
    });
    document.getElementById('resumoEntradas').innerText = `R$ ${e.toFixed(2)}`;
    document.getElementById('resumoSaidas').innerText = `R$ ${s.toFixed(2)}`;
    const saldo = e - s;
    const resSaldo = document.getElementById('resumoSaldo');
    resSaldo.innerText = `R$ ${saldo.toFixed(2)}`;
    resSaldo.className = saldo >= 0 ? 'verde' : 'vermelho';
}

function alternarTema() {
    const b = document.body;
    b.setAttribute('data-theme', b.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
}

function fazerBackup() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(transacoes)], {type: 'text/plain'}));
    a.download = `caixa_backup.txt`;
    a.click();
}
renderizar();
