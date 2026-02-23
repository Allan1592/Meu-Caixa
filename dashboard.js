let transacoes = JSON.parse(localStorage.getItem('transacoes')) || [];
let idParaDeletar = null;
let filtroTipoAtual = 'todos';

// Configurar data e mês padrão
const hoje = new Date();
document.getElementById('mesFiltro').value = hoje.toISOString().substring(0, 7);
document.getElementById('dataVencimento').valueAsDate = hoje;

function adicionar() {
    const desc = document.getElementById('descricao').value;
    const valor = document.getElementById('valor').value;
    const tipo = document.getElementById('tipo').value;
    const data = document.getElementById('dataVencimento').value;

    if (!desc || !valor || !data) return alert("Preencha todos os campos!");

    const nova = {
        id: Date.now(),
        descricao: desc,
        valor: parseFloat(valor),
        tipo: tipo,
        data: data
    };

    transacoes.push(nova);
    salvar();
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
    salvar();
    fecharModal('modalConfirm');
    renderizar();
};

function fecharModal(id) {
    document.getElementById(id).style.display = 'none';
}

function salvar() {
    localStorage.setItem('transacoes', JSON.stringify(transacoes));
}

function renderizar() {
    const lista = document.getElementById('listaTransacoes');
    const filtroMes = document.getElementById('mesFiltro').value;
    const busca = document.getElementById('busca').value.toLowerCase();
    lista.innerHTML = '';

    let e = 0, s = 0;

    transacoes
    .filter(t => {
        const porMes = t.data.includes(filtroMes);
        const porBusca = t.descricao.toLowerCase().includes(busca);
        const porTipo = filtroTipoAtual === 'todos' || t.tipo === filtroTipoAtual;
        return porMes && porBusca && porTipo;
    })
    .sort((a, b) => new Date(b.data) - new Date(a.data))
    .forEach(t => {
        if (t.tipo === 'receita') e += t.valor; else s += t.valor;

        const li = document.createElement('li');
        li.className = `item-lista item-${t.tipo}`;
        const dataFormatada = t.data.split('-').reverse().join('/');
        li.innerHTML = `
            <div>
                <strong>${t.descricao}</strong> <br>
                <small>${dataFormatada}</small><br>
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
    const tema = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', tema);
}

function fazerBackup() {
    const dados = JSON.stringify(transacoes);
    const blob = new Blob([dados], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_caixa_${new Date().toLocaleDateString()}.txt`;
    a.click();
}

renderizar();
