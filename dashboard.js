let transacoes = JSON.parse(localStorage.getItem('transacoes')) || [];
let idParaDeletar = null;

// Configurar mês atual ao abrir
document.getElementById('mesFiltro').value = new Date().toISOString().substring(0, 7);

function adicionar() {
    const desc = document.getElementById('descricao').value;
    const valor = document.getElementById('valor').value;
    const tipo = document.getElementById('tipo').value;

    if (!desc || !valor) return alert("Preencha os campos!");

    const nova = {
        id: Date.now(),
        descricao: desc,
        valor: parseFloat(valor),
        tipo: tipo,
        data: new Date().toISOString()
    };

    transacoes.push(nova);
    salvar();
    document.getElementById('descricao').value = '';
    document.getElementById('valor').value = '';
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

    transacoes.filter(t => t.data.includes(filtroMes) && t.descricao.toLowerCase().includes(busca))
    .forEach(t => {
        if (t.tipo === 'receita') e += t.valor; else s += t.valor;

        const li = document.createElement('li');
        li.className = `item-lista item-${t.tipo}`;
        li.innerHTML = `
            <div>
                <strong>${t.descricao}</strong><br>
                <small class="${t.tipo === 'receita' ? 'verde' : 'vermelho'}">R$ ${t.valor.toFixed(2)}</small>
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
    alert("Dados copiados! (Simulação de backup)");
}

renderizar();
