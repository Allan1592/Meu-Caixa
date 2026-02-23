let transacoes = JSON.parse(localStorage.getItem('transacoes')) || [];
let idParaDeletar = null;
let idParaEditar = null;
let filtroTipoAtual = 'todos';

const hoje = new Date();
document.getElementById('dataVencimento').valueAsDate = hoje;
document.getElementById('mesFiltro').value = hoje.toISOString().substring(0, 7);

function adicionar() {
    const desc = document.getElementById('descricao').value;
    const val = document.getElementById('valor').value;
    const tip = document.getElementById('tipo').value;
    const dat = document.getElementById('dataVencimento').value;

    if (!desc || !val || !dat) return alert("Preencha tudo!");

    transacoes.push({ id: Date.now(), descricao: desc, valor: parseFloat(val), tipo: tip, data: dat });
    salvarERenderizar();
    document.getElementById('descricao').value = '';
    document.getElementById('valor').value = '';
}

// FUNÇÃO DO LÁPIS (EDITAR)
function editar(id) {
    idParaEditar = id;
    const item = transacoes.find(t => t.id === id);
    document.getElementById('editDescricao').value = item.descricao;
    document.getElementById('editValor').value = item.valor;
    document.getElementById('editData').value = item.data;
    document.getElementById('modalEdit').style.display = 'flex';
}

document.getElementById('btnConfirmarEdicao').onclick = function() {
    const item = transacoes.find(t => t.id === idParaEditar);
    item.descricao = document.getElementById('editDescricao').value;
    item.valor = parseFloat(document.getElementById('editValor').value);
    item.data = document.getElementById('editData').value;
    
    salvarERenderizar();
    fecharModal('modalEdit');
};

function deletar(id) {
    idParaDeletar = id;
    document.getElementById('modalConfirm').style.display = 'flex';
}

document.getElementById('btnConfirmarExclusao').onclick = function() {
    transacoes = transacoes.filter(t => t.id !== idParaDeletar);
    salvarERenderizar();
    fecharModal('modalConfirm');
};

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
    const filtroMes = document.getElementById('mesFiltro').value;
    const busca = document.getElementById('busca').value.toLowerCase();
    lista.innerHTML = '';
    let e = 0, s = 0;

    transacoes.filter(t => t.data.includes(filtroMes) && t.descricao.toLowerCase().includes(busca) && (filtroTipoAtual === 'todos' || t.tipo === filtroTipoAtual))
    .sort((a, b) => new Date(b.data) - new Date(a.data))
    .forEach(t => {
        if (t.tipo === 'receita') e += t.valor; else s += t.valor;
        const li = document.createElement('li');
        li.className = `item-lista item-${t.tipo}`;
        li.innerHTML = `
            <div>
                <strong>${t.descricao}</strong><br>
                <small>${t.data.split('-').reverse().join('/')}</small><br>
                <span class="${t.tipo === 'receita' ? 'verde' : 'vermelho'}">R$ ${t.valor.toFixed(2)}</span>
            </div>
            <div class="acoes">
                <span onclick="editar(${t.id})">✏️</span>
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
    body.setAttribute('data-theme', body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
}

function fazerBackup() {
    const dados = JSON.stringify(transacoes);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([dados], {type: 'text/plain'}));
    a.download = `backup_caixa.txt`;
    a.click();
}

renderizar();
