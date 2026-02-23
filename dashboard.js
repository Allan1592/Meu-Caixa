let transacoes = JSON.parse(localStorage.getItem('transacoes')) || [];
let idParaDeletar = null;
let filtroTipoAtual = 'todos';

// Configura data de hoje como padrão
const campoData = document.getElementById('dataVencimento');
const campoMes = document.getElementById('mesFiltro');
const hoje = new Date();
campoData.valueAsDate = hoje;
campoMes.value = hoje.toISOString().substring(0, 7);

function adicionar() {
    const desc = document.getElementById('descricao').value;
    const val = document.getElementById('valor').value;
    const tip = document.getElementById('tipo').value;
    const dat = document.getElementById('dataVencimento').value;

    if (!desc || !val || !dat) {
        alert("Por favor, preencha todos os campos!");
        return;
    }

    const nova = {
        id: Date.now(),
        descricao: desc,
        valor: parseFloat(val),
        tipo: tip,
        data: dat
    };

    transacoes.push(nova);
    localStorage.setItem('transacoes', JSON.stringify(transacoes));
    
    document.getElementById('descricao').value = '';
    document.getElementById('valor').value = '';
    renderizar();
}

function filtrarTipo(tipo, btn) {
    filtroTipoAtual = tipo;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderizar();
}

function deletar(id) {
    idParaDeletar = id;
    document.getElementById('modalConfirm').style.display = 'flex';
}

document.getElementById('btnConfirmarExclusao').onclick = function() {
    transacoes = transacoes.filter(t => t.id !== idParaDeletar);
    localStorage.setItem('transacoes', JSON.stringify(transacoes));
    fecharModal('modalConfirm');
    renderizar();
};

function fecharModal(id) {
    document.getElementById(id).style.display = 'none';
}

function renderizar() {
    const lista = document.getElementById('listaTransacoes');
    const filtroMes = document.getElementById('mesFiltro').value;
    const busca = document.getElementById('busca').value.toLowerCase();
    lista.innerHTML = '';

    let e = 0, s = 0;

    transacoes
    .filter(t => {
        const pMes = t.data.includes(filtroMes);
        const pBusca = t.descricao.toLowerCase().includes(busca);
        const pTipo = filtroTipoAtual === 'todos' || t.tipo === filtroTipoAtual;
        return pMes && pBusca && pTipo;
    })
    .sort((a, b) => new Date(b.data) - new Date(a.data))
    .forEach(t => {
        if (t.tipo === 'receita') e += t.valor; else s += t.valor;

        const dataBr = t.data.split('-').reverse().join('/');
        const li = document.createElement('li');
        li.className = `item-lista item-${t.tipo}`;
        li.innerHTML = `
            <div>
                <strong>${t.descricao}</strong><br>
                <small>${dataBr}</small><br>
                <span class="${t.tipo === 'receita' ? 'verde' : 'vermelho'}">R$ ${t.valor.toFixed(2)}</span>
            </div>
            <div class="acoes">
                <span onclick="deletar(${t.id})">🗑️</span>
            </div>
        `;
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
    const body = document.body;
    const atual = body.getAttribute('data-theme');
    body.setAttribute('data-theme', atual === 'dark' ? 'light' : 'dark');
}

function fazerBackup() {
    const dados = JSON.stringify(transacoes);
    const blob = new Blob([dados], {type: 'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `backup_caixa.txt`;
    a.click();
}

renderizar();
