let transacoes = JSON.parse(localStorage.getItem('caixa_pro_db')) || [];
let filtroTipoAtivo = 'todos';

const inputMes = document.getElementById('month-filter');
const inputData = document.getElementById('data-vencimento');
const inputBusca = document.getElementById('busca');
const listaUl = document.getElementById('lista');

const hoje = new Date();
const mesHoje = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
const diaHoje = hoje.toISOString().split('T')[0];

inputMes.value = mesHoje;
inputData.value = diaHoje;

if (localStorage.getItem('caixa_tema') === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

function alternarTema() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const novo = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', novo);
    localStorage.setItem('caixa_tema', novo);
}

function filtrarTipo(tipo, btn) {
    filtroTipoAtivo = tipo;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    atualizar();
}

function atualizar() {
    const mesRef = inputMes.value;
    const termoBusca = inputBusca.value.toLowerCase();
    listaUl.innerHTML = '';
    
    let saldoAnt = 0, entMes = 0, saiMes = 0;

    transacoes.sort((a, b) => new Date(b.data) - new Date(a.data));

    transacoes.forEach(t => {
        const mesT = t.data.substring(0, 7);
        if (mesT < mesRef) saldoAnt += (t.tipo === 'receita' ? t.valor : -t.valor);
        
        if (mesT === mesRef) {
            if (t.tipo === 'receita') entMes += t.valor; else saiMes += t.valor;

            const bateTipo = (filtroTipoAtivo === 'todos' || filtroTipoAtivo === t.tipo);
            const bateBusca = t.desc.toLowerCase().includes(termoBusca);
            if (bateTipo && bateBusca) renderizarItem(t);
        }
    });

    document.getElementById('saldo-anterior').innerText = formatarMoeda(saldoAnt);
    document.getElementById('entradas-mes').innerText = formatarMoeda(entMes);
    document.getElementById('saidas-mes').innerText = formatarMoeda(saiMes);
    document.getElementById('diferenca-mes').innerText = formatarMoeda(entMes - saiMes);
    document.getElementById('saldo-final').innerText = formatarMoeda(saldoAnt + (entMes - saiMes));
    document.getElementById('diferenca-mes').className = (entMes - saiMes) >= 0 ? 'verde' : 'vermelho';
    localStorage.setItem('caixa_pro_db', JSON.stringify(transacoes));
}

function renderizarItem(t) {
    const dataBR = t.data.split('-').reverse().join('/');
    const eHoje = t.data === diaHoje;
    const li = document.createElement('li');
    li.className = `item-lista ${t.tipo === 'receita' ? 'item-receita' : 'item-despesa'}`;
    li.innerHTML = `
        <div class="item-info">
            <b>${t.desc}${eHoje ? '<span class="badge-hoje">HOJE</span>' : ''}</b>
            <small>${dataBR} - ${formatarMoeda(t.valor)}</small>
        </div>
        <div class="acoes">
            <button class="btn-edit" onclick="prepararEdicao('${t.id}')">✏️</button>
            <button class="btn-del" onclick="remover('${t.id}')">🗑️</button>
        </div>
    `;
    listaUl.appendChild(li);
}

function salvar() {
    const idEd = document.getElementById('edit-id').value;
    const desc = document.getElementById('desc').value;
    const valor = parseFloat(document.getElementById('valor').value);
    const dataV = document.getElementById('data-vencimento').value;
    const tipo = document.getElementById('tipo').value;

    if (!desc || isNaN(valor) || !dataV) return alert("Preencha tudo!");

    if (idEd) {
        const i = transacoes.findIndex(t => t.id === idEd);
        transacoes[i] = { ...transacoes[i], desc, valor, tipo, data: dataV };
    } else {
        transacoes.push({ id: Date.now().toString(), desc, valor, tipo, data: dataV });
    }
    limparForm(); atualizar();
}

function prepararEdicao(id) {
    const t = transacoes.find(t => t.id === id);
    document.getElementById('edit-id').value = t.id;
    document.getElementById('desc').value = t.desc;
    document.getElementById('valor').value = t.valor;
    document.getElementById('data-vencimento').value = t.data;
    document.getElementById('tipo').value = t.tipo;
    document.getElementById('btn-salvar').innerText = "Atualizar";
    document.getElementById('btn-cancelar').style.display = "block";
    window.scrollTo({top: 0, behavior: 'smooth'});
}

function limparForm() {
    document.getElementById('edit-id').value = '';
    document.getElementById('desc').value = '';
    document.getElementById('valor').value = '';
    document.getElementById('data-vencimento').value = diaHoje;
    document.getElementById('btn-salvar').innerText = "Adicionar Lançamento";
    document.getElementById('btn-cancelar').style.display = "none";
}

function fazerBackup() {
    if (transacoes.length === 0) return alert("Sem dados.");
    let txt = "*BACKUP FINANÇAS*\n\n";
    transacoes.forEach(t => {
        const d = t.data.split('-').reverse().join('/');
        txt += `${d} - ${t.tipo === 'receita' ? '(+)' : '(-)'} ${t.desc}: R$ ${t.valor.toFixed(2)}\n`;
    });
    if (navigator.share) navigator.share({ title: 'Backup', text: txt });
    else { alert("Copiado!"); navigator.clipboard.writeText(txt); }
}

function remover(id) { if(confirm("Excluir?")) { transacoes = transacoes.filter(t => t.id !== id); atualizar(); } }
function limparTudo() { if(confirm("Apagar TUDO?")) { transacoes = []; localStorage.clear(); location.reload(); } }
function formatarMoeda(v) { return v.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }); }

inputMes.addEventListener('change', atualizar);
atualizar();
