// SEU OBJETO firebaseConfig DO CONSOLE DO FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyBdb71fwlcCt6vUGCY2eLmBc9cHtUG71jg",
    authDomain: "sistemapadaria-6c5dc.firebaseapp.com",
    projectId: "sistemapadaria-6c5dc",
    storageBucket: "sistemapadaria-6c5dc.firebasestorage.app",
    messagingSenderId: "603579567775",
    appId: "1:603579567775:web:1337850bb4e07a23005caa",
    measurementId: "G-2J5C2Z2R5E"
};

// Inicializa Firebase e Firestore
const app = firebase.initializeApp(firebaseConfig);
const db = app.firestore();

// -------- Funções de Utilidade --------
function formatarDataHora(isoString) {
    if (!isoString) return 'Data inválida';
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatarMoeda(valor) {
    if (typeof valor !== 'number') return 'R$ 0,00';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// -------- Usuários ---------
async function getUsuarios() {
    try {
        const snapshot = await db.collection("usuarios").get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.error("Erro ao buscar usuários:", e);
        return [];
    }
}

async function salvarUsuario(novoUsuario) {
    try {
        await db.collection("usuarios").add(novoUsuario);
        return true;
    } catch (e) {
        console.error("Erro ao salvar usuário:", e);
        return false;
    }
}

async function fazerCadastro() {
    const nome = document.getElementById("cadNome").value.trim();
    const email = document.getElementById("cadEmail").value.trim();
    const senha = document.getElementById("cadSenha").value.trim();

    if (!nome || !email || !senha) {
        mostrarMensagem("Preencha todos os campos!");
        return;
    }

    const usuarios = await getUsuarios();
    const jaExiste = usuarios.find(u => u.Email && u.Email.toLowerCase() === email.toLowerCase());

    if (jaExiste) {
        mostrarMensagem("Já existe um usuário com esse e-mail.");
        return;
    }

    const novoUsuario = { Nome: nome, Email: email, Senha: senha };
    const sucesso = await salvarUsuario(novoUsuario);
    if (sucesso) {
        mostrarMensagem("Cadastro realizado com sucesso! Agora faça login.");
        limparCamposCadastro();
    } else {
        mostrarMensagem("Erro ao salvar cadastro. Tente novamente.");
    }
}

async function fazerLogin() {
    const email = document.getElementById("loginEmail").value.trim();
    const senha = document.getElementById("loginSenha").value.trim();

    const usuarios = await getUsuarios();
    const usuario = usuarios.find(u => u.Email && u.Email.toLowerCase() === email.toLowerCase() && u.Senha === senha);

    if (!usuario) {
        mostrarMensagem("Email ou senha inválidos.");
        return;
    }

    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
    mostrarMensagem("Login feito com sucesso! Redirecionando...");
    setTimeout(() => { window.location.href = "dashboard.html"; }, 1000);
}

function mostrarMensagem(msg) {
    const el = document.getElementById("mensagem");
    const elCadastro = document.getElementById("mensagemCadastro");

    if (elCadastro && !document.querySelector('.cadastro-box').classList.contains('hidden')) {
        elCadastro.innerText = msg;
        setTimeout(() => { elCadastro.innerText = "", elCadastro.style.color = "red"; }, 4000);
    } else if (el) {
        el.innerText = msg;
        setTimeout(() => { el.innerText = ""; }, 4000);
    }
}

function limparCamposCadastro() {
    document.getElementById("cadNome").value = "";
    document.getElementById("cadEmail").value = "";
    document.getElementById("cadSenha").value = "";
}

// -------- LÓGICA DE VENDAS (CARRINHO) ---------
let pedidoAtual = JSON.parse(sessionStorage.getItem('pedidoAtual')) || [];

function adicionarItem() {
    const itemEl = document.getElementById("vendaItem");
    const unidadeEl = document.getElementById("vendaUnidade");
    const valorUnitarioEl = document.getElementById("vendaValor");

    const item = itemEl.value.trim();
    const unidade = parseInt(unidadeEl.value);
    const valorUnitario = parseFloat(valorUnitarioEl.value);

    if (!item || isNaN(unidade) || unidade <= 0 || isNaN(valorUnitario) || valorUnitario < 0) {
        mostrarMensagemVenda("Preencha os dados do item corretamente!");
        return;
    }

    pedidoAtual.push({
        nome: item,
        unidade: unidade,
        valorUnitario: valorUnitario
    });

    sessionStorage.setItem('pedidoAtual', JSON.stringify(pedidoAtual));
    itemEl.value = "";
    unidadeEl.value = "";
    valorUnitarioEl.value = "";
    itemEl.focus();
    atualizarVisualizacaoPedido();
}

function removerItem(index) {
    pedidoAtual.splice(index, 1);
    sessionStorage.setItem('pedidoAtual', JSON.stringify(pedidoAtual));
    atualizarVisualizacaoPedido();
}

function atualizarVisualizacaoPedido() {
    const listaItensEl = document.getElementById("listaItensPedido");
    const valorTotalEl = document.getElementById("valorTotalPedido");
    if (!listaItensEl || !valorTotalEl) return;

    listaItensEl.innerHTML = "";
    let valorTotalPedido = 0;

    if (pedidoAtual.length === 0) {
        listaItensEl.innerHTML = "<p>Nenhum item adicionado ainda.</p>";
    } else {
        pedidoAtual.forEach((item, index) => {
            const subtotal = item.unidade * item.valorUnitario;
            valorTotalPedido += subtotal;

            const itemDiv = document.createElement('div');
            itemDiv.classList.add('relatorio-item');
            itemDiv.style.display = 'flex';
            itemDiv.style.justifyContent = 'space-between';
            itemDiv.style.alignItems = 'center';
            itemDiv.innerHTML = `
                <div>
                    <p><strong>Item:</strong> ${item.nome} (${item.unidade}x ${formatarMoeda(item.valorUnitario)})</p>
                    <p><strong>Subtotal:</strong> ${formatarMoeda(subtotal)}</p>
                </div>
                <button onclick="removerItem(${index})" class="btn-text" style="color: red; margin: 0;">Remover</button>
            `;
            listaItensEl.appendChild(itemDiv);
        });
    }

    valorTotalEl.innerText = `Total: ${formatarMoeda(valorTotalPedido)}`;
}

async function finalizarVenda() {
    if (pedidoAtual.length === 0) {
        mostrarMensagemVenda("Adicione pelo menos um item ao pedido!");
        return;
    }

    const formaPagamento = document.getElementById("formaPagamento").value;
    if (!formaPagamento) {
        mostrarMensagemVenda("Selecione a forma de pagamento!");
        return;
    }

    const valorTotalPedido = pedidoAtual.reduce((total, item) => total + (item.unidade * item.valorUnitario), 0);
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    const vendaCompleta = {
        itens: pedidoAtual,
        valorTotal: valorTotalPedido,
        formaPagamento: formaPagamento,
        DataHora: new Date().toISOString(),
        UsuarioEmail: usuarioLogado ? usuarioLogado.Email : "desconhecido"
    };

    try {
        await db.collection("vendas").add(vendaCompleta);
        mostrarMensagemVenda("Venda registrada com sucesso!");
        gerarRecibo(vendaCompleta);

        pedidoAtual = [];
        sessionStorage.removeItem('pedidoAtual');
        atualizarVisualizacaoPedido();

    } catch (e) {
        mostrarMensagemVenda("Erro ao registrar venda. Tente novamente.");
        console.error("Erro ao salvar venda: ", e);
    }
}

function gerarRecibo(dadosVenda) {
    sessionStorage.setItem('dadosRecibo', JSON.stringify(dadosVenda));
    window.open('recibo.html', '_blank');
}

function mostrarMensagemVenda(msg) {
    const el = document.getElementById("mensagemVenda");
    if(!el) return;
    el.innerText = msg;
    el.style.color = msg.includes("sucesso") ? 'green' : 'red';
    setTimeout(() => { el.innerText = ""; }, 4000);
}

// -------- Despesas ---------
async function salvarDespesa(despesa) {
    try {
        await db.collection("despesas").add(despesa);
        return true;
    } catch (e) {
        console.error("Erro ao salvar despesa:", e);
        return false;
    }
}

async function registrarDespesa() {
    const descricao = document.getElementById("despesaDescricao").value.trim();
    const valor = parseFloat(document.getElementById("despesaValor").value);
    const categoria = document.getElementById("despesaCategoria").value;

    if (!descricao || isNaN(valor) || valor <= 0 || !categoria) {
        mostrarMensagemDespesa("Preencha todos os campos corretamente e selecione a categoria!");
        return;
    }

    const dataAgora = new Date().toISOString();
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    const despesa = {
        Descricao: descricao,
        Valor: valor,
        Categoria: categoria,
        DataHora: dataAgora,
        UsuarioEmail: usuarioLogado ? usuarioLogado.Email : "desconhecido"
    };

    const sucesso = await salvarDespesa(despesa);

    if (sucesso) {
        mostrarMensagemDespesa("Despesa registrada com sucesso!");
        limparCamposDespesa();
    } else {
        mostrarMensagemDespesa("Erro ao registrar despesa. Tente novamente.");
    }
}

function mostrarMensagemDespesa(msg) {
    const el = document.getElementById("mensagemDespesa");
    el.innerText = msg;
    setTimeout(() => { el.innerText = ""; }, 4000);
}

function limparCamposDespesa() {
    document.getElementById("despesaDescricao").value = "";
    document.getElementById("despesaValor").value = "";
    document.getElementById("despesaCategoria").value = "";
}

function sugerirCategoriaDespesa() {
    const descricaoInput = document.getElementById("despesaDescricao").value.toLowerCase();
    const categoriaSelect = document.getElementById("despesaCategoria");

    let categoriaSugerida = "";
    if (descricaoInput.includes("farinha") || descricaoInput.includes("trigo") || descricaoInput.includes("fermento") ||
        descricaoInput.includes("acucar") || descricaoInput.includes("ovo") || descricaoInput.includes("leite") ||
        descricaoInput.includes("chocolate") || descricaoInput.includes("manteiga")) {
        categoriaSugerida = "Ingredientes";
    } else if (descricaoInput.includes("aluguel") || descricaoInput.includes("locacao")) {
        categoriaSugerida = "Aluguel";
    } else if (descricaoInput.includes("salario") || descricaoInput.includes("funcionario") || descricaoInput.includes("pagamento")) {
        categoriaSugerida = "Salarios";
    } else if (descricaoInput.includes("agua") || descricaoInput.includes("luz") || descricaoInput.includes("energia") ||
               descricaoInput.includes("gas") || descricaoInput.includes("telefone") || descricaoInput.includes("internet")) {
        categoriaSugerida = "Contas de Consumo";
    } else if (descricaoInput.includes("manutencao") || descricaoInput.includes("reparo") || descricaoInput.includes("conserto")) {
        categoriaSugerida = "Manutencao";
    } else if (descricaoInput.includes("anuncio") || descricaoInput.includes("publicidade") || descricaoInput.includes("panfleto")) {
        categoriaSugerida = "Marketing";
    } else if (descricaoInput.includes("gasolina") || descricaoInput.includes("combustivel") || descricaoInput.includes("frete")) {
        categoriaSugerida = "Transporte";
    } else if (descricaoInput.includes("imposto") || descricaoInput.includes("taxa") || descricaoInput.includes("contribuicao")) {
        categoriaSugerida = "Impostos";
    }

    if (categoriaSugerida) {
        categoriaSelect.value = categoriaSugerida;
    }
}


// -------- Relatórios (LÓGICA ATUALIZADA) ---------
async function carregarRelatorios() {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuarioLogado) {
        window.location.href = "index.html";
        return;
    }

    const filtroPeriodo = document.getElementById("filtroPeriodo").value;
    const dataRelatorio = document.getElementById("dataRelatorio").value;

    // Carrega TODOS os dados do usuário do banco de dados
    const todasVendasUsuario = await db.collection("vendas").where("UsuarioEmail", "==", usuarioLogado.Email).get().then(snapshot =>
        snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    );
    const todasDespesasUsuario = await db.collection("despesas").where("UsuarioEmail", "==", usuarioLogado.Email).get().then(snapshot =>
        snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    );

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Filtra os dados com base no período selecionado
    const vendasPeriodoAtual = todasVendasUsuario.filter(item => {
        const itemDate = new Date(item.DataHora);
        itemDate.setHours(0, 0, 0, 0);

        switch (filtroPeriodo) {
            case 'total':
                return true;
            case 'dia':
                if (!dataRelatorio) return false;
                const dataFiltro = new Date(dataRelatorio);
                dataFiltro.setUTCHours(0,0,0,0);
                return itemDate.getTime() === dataFiltro.getTime();
            case 'semana':
                const inicioSemana = new Date(hoje);
                inicioSemana.setDate(hoje.getDate() - hoje.getDay());
                const fimSemana = new Date(inicioSemana);
                fimSemana.setDate(inicioSemana.getDate() + 6);
                return itemDate >= inicioSemana && itemDate <= fimSemana;
            case 'mes':
                return itemDate.getMonth() === hoje.getMonth() && itemDate.getFullYear() === hoje.getFullYear();
            case 'ano':
                return itemDate.getFullYear() === hoje.getFullYear();
            default:
                return true;
        }
    }).sort((a, b) => new Date(b.DataHora) - new Date(a.DataHora));

    const despesasPeriodoAtual = todasDespesasUsuario.filter(item => {
        const itemDate = new Date(item.DataHora);
        itemDate.setHours(0, 0, 0, 0);

         switch (filtroPeriodo) {
            case 'total':
                return true;
            case 'dia':
                 if (!dataRelatorio) return false;
                const dataFiltro = new Date(dataRelatorio);
                 dataFiltro.setUTCHours(0,0,0,0);
                return itemDate.getTime() === dataFiltro.getTime();
            case 'semana':
                const inicioSemana = new Date(hoje);
                inicioSemana.setDate(hoje.getDate() - hoje.getDay());
                const fimSemana = new Date(inicioSemana);
                fimSemana.setDate(inicioSemana.getDate() + 6);
                return itemDate >= inicioSemana && itemDate <= fimSemana;
            case 'mes':
                return itemDate.getMonth() === hoje.getMonth() && itemDate.getFullYear() === hoje.getFullYear();
            case 'ano':
                return itemDate.getFullYear() === hoje.getFullYear();
            default:
                return true;
        }
    }).sort((a, b) => new Date(b.DataHora) - new Date(a.DataHora));


    // ---- Geração de Relatórios Resumo e Detalhes ----
    const listaVendasEl = document.getElementById("listaVendas");
    listaVendasEl.innerHTML = '';
    
    // ** MUDANÇA AQUI: Usa o campo `valorTotal` da venda **
    const totalVendasValor = vendasPeriodoAtual.reduce((acc, venda) => acc + (venda.valorTotal || 0), 0);

    if (vendasPeriodoAtual.length === 0) {
        listaVendasEl.innerHTML = '<p>Nenhuma venda registrada neste período.</p>';
    } else {
        vendasPeriodoAtual.forEach(venda => {
            const vendaItemDiv = document.createElement('div');
            vendaItemDiv.classList.add('relatorio-item', 'card');

            // ** MUDANÇA AQUI: Cria a lista de itens da venda **
            const itensHtml = venda.itens && venda.itens.length > 0
                ? venda.itens.map(item => `
                    <p style="margin-left: 15px; border-left: 2px solid #ddd; padding-left: 10px;">
                        ${item.unidade}x ${item.nome} - Subtotal: ${formatarMoeda(item.unidade * item.valorUnitario)}
                    </p>
                `).join('')
                : '<p style="margin-left: 15px;">Nenhum item detalhado.</p>';

            // ** MUDANÇA AQUI: Monta o card da venda completa **
            vendaItemDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px;">
                    <div>
                        <p><strong>Data:</strong> ${formatarDataHora(venda.DataHora)}</p>
                        <p><strong>Pagamento:</strong> ${venda.formaPagamento || 'Não Informado'}</p>
                    </div>
                    <p style="font-size: 1.2em;"><strong>Total: ${formatarMoeda(venda.valorTotal)}</strong></p>
                </div>
                <div>
                    <p><strong>Itens do Pedido:</strong></p>
                    ${itensHtml}
                </div>
            `;
            listaVendasEl.appendChild(vendaItemDiv);
        });
    }

    const listaDespesasEl = document.getElementById("listaDespesas");
    listaDespesasEl.innerHTML = '';
    const totalDespesasValor = despesasPeriodoAtual.reduce((acc, despesa) => acc + (despesa.Valor || 0), 0);

    if (despesasPeriodoAtual.length === 0) {
        listaDespesasEl.innerHTML = '<p>Nenhuma despesa registrada neste período.</p>';
    } else {
        despesasPeriodoAtual.forEach(despesa => {
            const despesaItemDiv = document.createElement('div');
            despesaItemDiv.classList.add('relatorio-item', 'card');
            despesaItemDiv.innerHTML = `
                <p><strong>Descrição:</strong> ${despesa.Descricao}</p>
                <p><strong>Categoria:</strong> ${despesa.Categoria || 'Não Informada'}</p>
                <p><strong>Valor:</strong> ${formatarMoeda(despesa.Valor)}</p>
                <p><strong>Data/Hora:</strong> ${formatarDataHora(despesa.DataHora)}</p>
            `;
            listaDespesasEl.appendChild(despesaItemDiv);
        });
    }

    const balancoGeral = totalVendasValor - totalDespesasValor;

    document.getElementById("totalVendas").innerText = vendasPeriodoAtual.length;
    document.getElementById("valorTotalVendas").innerText = formatarMoeda(totalVendasValor);
    document.getElementById("totalDespesas").innerText = despesasPeriodoAtual.length;
    document.getElementById("valorTotalDespesas").innerText = formatarMoeda(totalDespesasValor);
    document.getElementById("balancoGeral").innerText = formatarMoeda(balancoGeral);

    const balancoEl = document.getElementById("balancoGeral");
    balancoEl.style.color = balancoGeral >= 0 ? 'green' : 'red';
}