let transacoes = JSON.parse(localStorage.getItem('transacoes')) || [];
let filtroTipoAtual = 'todos';
let idParaDeletar = null;
let idParaEditar = null;

// Inicialização: Configura as datas padrão ao abrir o app
const hoje = new Date();
document.getElementById('dataVencimento').valueAsDate = hoje;
document.getElementById('mesFiltro').value = hoje.toISOString().substring(0, 7);

// Mostra ou esconde o campo de número de parcelas
function ajustarCamposRecorrencia() {
    const rec = document.getElementById('recorrencia').value;
    document.getElementById('divParcelas').style.display = (rec === 'parcelada') ? 'block' : 'none';
}

// Adiciona novos lançamentos (Único, Fixo ou Parcelado)
function adicionar() {
    const desc = document.getElementById('descricao').value;
    const val = document.getElementById('valor').value;
    const tip = document.getElementById('tipo').value;
    const dataBase = document.getElementById('dataVencimento').value;
    const rec = document.getElementById('recorrencia').value;
    const parcelas = parseInt(document.getElementById('numParcelas').value) || 1;

    if (!desc || !val || !dataBase) {
        alert("Por favor, preencha a descrição, valor e data!");
        return;
    }

    let vezes = 1;
    if (rec === 'fixa') vezes = 24; // Projeta 2 anos para despesas fixas
    if (rec === 'parcelada') vezes = parcelas;

    const grupoId = vezes > 1 ? Date.now() : null; // Identificador para o grupo de parcelas

    for (let i = 0; i < vezes; i++) {
        let dt = new Date(dataBase + "T12:00:00");
        dt.setMonth(dt.getMonth() + i);
        
        // Se for parcelado, adiciona (1/12) ao nome. Se for fixo, mantém o nome limpo.
        let dFinal = (vezes > 1 && rec === 'parcelada') ? `${desc} (${i + 1}/${vezes})` : desc;
        
        transacoes.push({
            id: Date.now() + i + Math.random(),
            grupoId: grupoId,
            descricao: dFinal,
            valor: parseFloat(val),
            tipo: tip,
            data: dt.toISOString().split('T')[0]
        });
    }

    salvarERenderizar();
    
    // Limpa os campos do formulário
    document.getElementById('descricao').value = '';
    document.getElementById('valor').value = '';
    document.getElementById('recorrencia').value = 'unica';
    ajustarCamposRecorrencia();
}

// Gerencia a exclusão (Simples ou em Grupo)
function deletar(id) {
    const item = transacoes.find(t => t.id === id);
    const modal = document.getElementById('modalConfirm');
    const msg = document.getElementById('msgConfirm');
    const divSimples = document.getElementById('botoesExclusaoSimples');
    const divGrupo = document.getElementById('botoesExclusaoGrupo');

    idParaDeletar = id;
    modal.style.display = 'flex';

    if (item.grupoId) {
        msg.innerText = "Este item faz parte de um grupo. O que deseja fazer?";
        divSimples.style.display = 'none';
        divGrupo.style.display = 'flex';

        document.getElementById('btnExcluirUm').onclick = () => {
            transacoes = transacoes.filter(t => t.id !== idParaDeletar);
            finalizarExclusao();
        };

        document.getElementById('btnExcluirTodos').onclick = () => {
            transacoes = transacoes.filter(t => t.grupoId !== item.grupoId);
            finalizarExclusao();
        };
    } else {
        msg.innerText = "Deseja excluir este lançamento?";
        divSimples.style.display = 'flex';
        divGrupo.style.display = 'none';
        document.getElementById('btnConfirmarSimples').onclick = () => {
            transacoes = transacoes.filter(t => t.id !== idParaDeletar);
            finalizarExclusao();
        };
    }
}

function finalizarExclusao() {
    fecharModal('modalConfirm');
    salvarERenderizar();
}

// Limpeza em massa (Mês ou Tudo)
function confirmarLimpeza(modo) {
    const msg = modo === 'mes' ? "Apagar TODOS os lançamentos deste mês?" : "Zerar TODOS os dados do aplicativo?";
    document.getElementById('msgConfirm').innerText = msg;
    document.getElementById('botoesExclusaoSimples').style.display = 'flex';
    document.getElementById('botoesExclusaoGrupo').style.display = 'none';
    document.getElementById('modalConfirm').style.display = 'flex';
    
    document.getElementById('btnConfirmarSimples').onclick = () => {
        if (modo === 'mes') {
            const mes = document.getElementById('mesFiltro').value;
            transacoes = transacoes.filter(t => !t.data.includes(mes));
        } else {
            transacoes = [];
        }
        finalizarExclusao();
    };
}

// Edição de um lançamento específico
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
    if (item) {
        item.descricao = document.getElementById('editDescricao').value;
        item.valor = parseFloat(document.getElementById('editValor').value);
        item.data = document.getElementById('editData').value;
        salvarERenderizar();
    }
    fecharModal('modalEdit');
};

// Filtros, Fechar Modal e Temas
function filtrarTipo(tipo, btn) {
    filtroTipoAtual = tipo;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderizar();
}

function fecharModal(id) {
    document.getElementById(id).style.display = 'none';
}

function alternarTema() {
    const b = document.body;
    const novoTema = b.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    b.setAttribute('data-theme', novoTema);
}

// Salva no Banco de Dados local e atualiza a tela
function salvarERenderizar() {
    localStorage.setItem('transacoes', JSON.stringify(transacoes));
    renderizar();
}

function renderizar() {
    const lista = document.getElementById('listaTransacoes');
    const mesAtual = document.getElementById('mesFiltro').value;
    const busca = document.getElementById('busca').value.toLowerCase();
    lista.innerHTML = '';
    let e = 0, s = 0;

    transacoes.filter(t => {
        const pMes = t.data.includes(mesAtual);
        const pBusca = t.descricao.toLowerCase().includes(busca);
        const pTipo = filtroTipoAtual === 'todos' || t.tipo === filtroTipoAtual;
        return pMes && pBusca && pTipo;
    })
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

// Exportar Backup
function fazerBackup() {
    const dados = JSON.stringify(transacoes);
    const blob = new Blob([dados], {type: 'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `caixa_backup_${new Date().toLocaleDateString()}.txt`;
    a.click();
}

// Função Sair do App
function sairApp() {
    if (confirm("Deseja mesmo fechar o Meu Caixa?")) {
        // Tenta fechar de formas diferentes dependendo do ambiente
        window.close();
        if (navigator.app) {
            navigator.app.exitApp();
        }
    }
}

// Primeira renderização ao carregar
renderizar();
