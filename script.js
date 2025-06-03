// SEU OBJETO firebaseConfig DO CONSOLE DO FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyBdb71fwlcCt6vUGCY2eLmBc9cHtUG71jg",
    authDomain: "sistemapadaria-6c5dc.firebaseapp.com",
    projectId: "sistemapadaria-6c5dc",
    storageBucket: "sistemapadaria-6c5dc.firebasestorage.app",
    messagingSenderId: "603579567775",
    appId: "1:603579567775:web:1337850bb4e07a23005caa",
    measurementId: "G-2J5C2Z2R5E" // Opcional, se não quiser Analytics, pode remover
};

// Inicializa Firebase e Firestore
const app = firebase.initializeApp(firebaseConfig);
const db = app.firestore(); // Obtém a instância do Firestore Database

// -------- Usuários ---------

async function getUsuarios() {
    try {
        const snapshot = await db.collection("usuarios").get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return data;
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

    const novoUsuario = {
        Nome: nome,
        Email: email,
        Senha: senha
    };

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

    setTimeout(() => {
        window.location.href = "dashboard.html";
    }, 1000);
}

function mostrarMensagem(msg) {
    const el = document.getElementById("mensagem");
    const elCadastro = document.getElementById("mensagemCadastro");

    if (elCadastro && !elCadastro.classList.contains('hidden')) {
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

// -------- Vendas ---------

async function salvarVenda(venda) {
    try {
        await db.collection("vendas").add(venda);
        return true;
    } catch (e) {
        console.error("Erro ao salvar venda:", e);
        return false;
    }
}

async function registrarVenda() {
    const item = document.getElementById("vendaItem").value.trim();
    const unidade = parseInt(document.getElementById("vendaUnidade").value);
    const valorUnitario = parseFloat(document.getElementById("vendaValor").value);
    const formaPagamento = document.getElementById("formaPagamento").value;

    if (!item || isNaN(unidade) || unidade <= 0 || isNaN(valorUnitario) || valorUnitario <= 0 || !formaPagamento) {
        mostrarMensagemVenda("Preencha todos os campos corretamente e selecione a forma de pagamento!");
        return;
    }

    const dataAgora = new Date().toISOString();
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    const venda = {
        Item: item,
        Unidade: unidade,
        ValorUnitario: valorUnitario,
        FormaPagamento: formaPagamento,
        DataHora: dataAgora,
        UsuarioEmail: usuarioLogado ? usuarioLogado.Email : "desconhecido"
    };

    const sucesso = await salvarVenda(venda);

    if (sucesso) {
        mostrarMensagemVenda("Venda registrada com sucesso!");
        limparCamposVenda();
    } else {
        mostrarMensagemVenda("Erro ao registrar venda. Tente novamente.");
    }
}

function mostrarMensagemVenda(msg) {
    const el = document.getElementById("mensagemVenda");
    el.innerText = msg;
    setTimeout(() => { el.innerText = ""; }, 4000);
}

function limparCamposVenda() {
    document.getElementById("vendaItem").value = "";
    document.getElementById("vendaUnidade").value = "";
    document.getElementById("vendaValor").value = "";
    document.getElementById("formaPagamento").value = "";
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

// -------- Funções de IA Simples: Sugestão de Categoria de Despesa ---------

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
    } else {
        categoriaSugerida = "Outros";
    }

    const options = Array.from(categoriaSelect.options).map(option => option.value);
    if (options.includes(categoriaSugerida)) {
        categoriaSelect.value = categoriaSugerida;
    } else {
        categoriaSelect.value = "";
    }
}


// -------- Relatórios (MODIFICADO PARA FILTROS E TENDÊNCIAS) ---------

function formatarDataHora(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Função auxiliar para calcular o total de valor de uma lista de itens
function calcularTotalValor(itens) {
    return itens.reduce((total, item) => {
        if (item.Unidade && item.ValorUnitario) { // Vendas
            return total + (item.Unidade * item.ValorUnitario);
        } else if (item.Valor) { // Despesas
            return total + item.Valor;
        }
        return total;
    }, 0);
}

// Função para analisar tendências e previsão
// Agora recebe os dados JÁ FILTRADOS para o período atual (vendasPeriodoAtual, despesasPeriodoAtual)
// E os dados completos do usuário para cálculo do período anterior (todasVendas, todasDespesas)
function analisarTendenciasEPrevisao(vendasPeriodoAtual, despesasPeriodoAtual, todasVendas, todasDespesas, filtroPeriodo, dataSelecionada) {
    let textoTendenciaVendas = "Não há dados suficientes.";
    let textoTendenciaDespesas = "Não há dados suficientes.";
    let textoPrevisaoLucro = "Não há dados suficientes.";

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Função interna para obter o valor total de um período específico
    const obterValorDoPeriodo = (colecao, periodo, baseDate, dataEspecificaParam) => {
        const dadosDoPeriodo = colecao.filter(item => {
            const itemDate = new Date(item.DataHora);
            itemDate.setHours(0, 0, 0, 0);

            switch (periodo) {
                case 'dia':
                    const dataFiltro = new Date(dataEspecificaParam);
                    dataFiltro.setHours(0, 0, 0, 0);
                    return itemDate.getTime() === dataFiltro.getTime();
                case 'semana':
                    const inicioSemana = new Date(baseDate);
                    inicioSemana.setHours(0, 0, 0, 0);
                    const diaSemanaBase = inicioSemana.getDay();
                    inicioSemana.setDate(inicioSemana.getDate() - diaSemanaBase);

                    const fimSemana = new Date(inicioSemana);
                    fimSemana.setDate(inicioSemana.getDate() + 6);
                    fimSemana.setHours(23, 59, 59, 999);
                    return itemDate >= inicioSemana && itemDate <= fimSemana;
                case 'mes':
                    return itemDate.getMonth() === baseDate.getMonth() && itemDate.getFullYear() === baseDate.getFullYear();
                case 'ano':
                    return itemDate.getFullYear() === baseDate.getFullYear();
                default:
                    return false; // Não deve acontecer para períodos específicos
            }
        });
        return calcularTotalValor(dadosDoPeriodo);
    };

    // Obter o valor do período atual
    // Agora usando os arrays já filtrados passados como parâmetro
    let valorPeriodoAtualVendas = calcularTotalValor(vendasPeriodoAtual);
    let valorPeriodoAtualDespesas = calcularTotalValor(despesasPeriodoAtual);


    // Para tendências, precisamos do período anterior
    let valorPeriodoAnteriorVendas = 0;
    let valorPeriodoAnteriorDespesas = 0;

    if (filtroPeriodo !== 'total') { // Não faz sentido para "Total"
        let dataAnterior = new Date(dataSelecionada || hoje); // Usa a data selecionada ou hoje como base

        switch (filtroPeriodo) {
            case 'dia':
                dataAnterior.setDate(dataAnterior.getDate() - 1);
                break;
            case 'semana':
                dataAnterior.setDate(dataAnterior.getDate() - 7);
                break;
            case 'mes':
                dataAnterior.setMonth(dataAnterior.getMonth() - 1);
                break;
            case 'ano':
                dataAnterior.setFullYear(dataAnterior.getFullYear() - 1);
                break;
        }

        // Aqui, passamos 'todasVendas' e 'todasDespesas' para obter o período anterior,
        // pois a função `obterValorDoPeriodo` fará o filtro temporal
        valorPeriodoAnteriorVendas = obterValorDoPeriodo(todasVendas, filtroPeriodo, dataAnterior, dataAnterior.toISOString().split('T')[0]);
        valorPeriodoAnteriorDespesas = obterValorDoPeriodo(todasDespesas, filtroPeriodo, dataAnterior, dataAnterior.toISOString().split('T')[0]);
    }

    // Calcula Tendências
    if (valorPeriodoAnteriorVendas > 0) {
        const diffVendas = valorPeriodoAtualVendas - valorPeriodoAnteriorVendas;
        const percentVendas = (diffVendas / valorPeriodoAnteriorVendas) * 100;
        textoTendenciaVendas = `${formatarMoeda(diffVendas)} (${percentVendas.toFixed(2)}%) em relação ao período anterior.`;
        textoTendenciaVendas += (diffVendas >= 0 ? " (Crescendo 📈)" : " (Diminuindo 📉)");
    } else if (valorPeriodoAtualVendas > 0) {
        textoTendenciaVendas = `Primeiras vendas registradas neste período: ${formatarMoeda(valorPeriodoAtualVendas)}.`;
    }

    if (valorPeriodoAnteriorDespesas > 0) {
        const diffDespesas = valorPeriodoAtualDespesas - valorPeriodoAnteriorDespesas;
        const percentDespesas = (diffDespesas / valorPeriodoAnteriorDespesas) * 100;
        textoTendenciaDespesas = `${formatarMoeda(diffDespesas)} (${percentDespesas.toFixed(2)}%) em relação ao período anterior.`;
        textoTendenciaDespesas += (diffDespesas >= 0 ? " (Aumentando ⬆️)" : " (Diminuindo ⬇️)");
    } else if (valorPeriodoAtualDespesas > 0) {
        textoTendenciaDespesas = `Primeiras despesas registradas neste período: ${formatarMoeda(valorPeriodoAtualDespesas)}.`;
    }

    // Previsão Básica (Média dos 2 últimos períodos)
    // Isso é uma simplificação. Para uma previsão real, seria mais complexo.
    if (filtroPeriodo !== 'total') {
        if (valorPeriodoAnteriorVendas > 0 && valorPeriodoAnteriorDespesas > 0 && valorPeriodoAtualVendas > 0 && valorPeriodoAtualDespesas > 0) {
            const mediaVendas = (valorPeriodoAtualVendas + valorPeriodoAnteriorVendas) / 2;
            const mediaDespesas = (valorPeriodoAtualDespesas + valorPeriodoAnteriorDespesas) / 2;
            const previsaoLucroValor = mediaVendas - mediaDespesas;
            textoPrevisaoLucro = formatarMoeda(previsaoLucroValor);
            textoPrevisaoLucro += (previsaoLucroValor >= 0 ? " (Potencial de Lucro ✅)" : " (Potencial de Prejuízo ❌)");
        } else if (valorPeriodoAtualVendas > 0 || valorPeriodoAtualDespesas > 0) {
             textoPrevisaoLucro = "Mais dados necessários para uma previsão confiável.";
        }
    } else {
         textoPrevisaoLucro = "Previsão não aplicável para o filtro 'Total'.";
    }

    // Atualiza os elementos HTML
    document.getElementById("textoTendenciaVendas").innerText = textoTendenciaVendas;
    document.getElementById("textoTendenciaDespesas").innerText = textoTendenciaDespesas;
    document.getElementById("textoPrevisaoLucro").innerText = textoPrevisaoLucro;
}


async function carregarRelatorios() {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuarioLogado) {
        window.location.href = "index.html";
        return;
    }

    const filtroPeriodo = document.getElementById("filtroPeriodo").value;
    const dataRelatorio = document.getElementById("dataRelatorio").value; // 'YYYY-MM-DD'

    // Carrega TODOS os dados do usuário para a análise de tendências,
    // pois a análise precisa do histórico, não apenas do período atual
    const todasVendasUsuario = await db.collection("vendas").get().then(snapshot =>
        snapshot.docs.map(doc => doc.data()).filter(v => v.UsuarioEmail === usuarioLogado.Email).sort((a, b) => new Date(a.DataHora) - new Date(b.DataHora)) // Mais antigos primeiro
    );
    const todasDespesasUsuario = await db.collection("despesas").get().then(snapshot =>
        snapshot.docs.map(doc => doc.data()).filter(d => d.UsuarioEmail === usuarioLogado.Email).sort((a, b) => new Date(a.DataHora) - new Date(b.DataHora)) // Mais antigos primeiro
    );


    // Filtra os dados especificamente para o período SELECIONADO para exibição
    const vendasPeriodoAtual = todasVendasUsuario.filter(item => {
        const itemDate = new Date(item.DataHora);
        itemDate.setHours(0, 0, 0, 0);

        switch (filtroPeriodo) {
            case 'total':
                return true;
            case 'dia':
                const dataFiltro = new Date(dataRelatorio);
                dataFiltro.setHours(0, 0, 0, 0);
                return itemDate.getTime() === dataFiltro.getTime();
            case 'semana':
                const hojeSemana = new Date();
                hojeSemana.setHours(0, 0, 0, 0);
                const diaSemanaHoje = hojeSemana.getDay();
                const inicioSemanaHoje = new Date(hojeSemana.setDate(hojeSemana.getDate() - diaSemanaHoje));

                const fimSemanaHoje = new Date(inicioSemanaHoje);
                fimSemanaHoje.setDate(inicioSemanaHoje.getDate() + 6);
                fimSemanaHoje.setHours(23, 59, 59, 999);
                return itemDate >= inicioSemanaHoje && itemDate <= fimSemanaHoje;
            case 'mes':
                const hojeMes = new Date();
                return itemDate.getMonth() === hojeMes.getMonth() && itemDate.getFullYear() === hojeMes.getFullYear();
            case 'ano':
                const hojeAno = new Date();
                return itemDate.getFullYear() === hojeAno.getFullYear();
            default:
                return true;
        }
    }).sort((a, b) => new Date(b.DataHora) - new Date(a.DataHora)); // Ordena do mais recente ao mais antigo para exibição

    const despesasPeriodoAtual = todasDespesasUsuario.filter(item => {
        const itemDate = new Date(item.DataHora);
        itemDate.setHours(0, 0, 0, 0);

        switch (filtroPeriodo) {
            case 'total':
                return true;
            case 'dia':
                const dataFiltro = new Date(dataRelatorio);
                dataFiltro.setHours(0, 0, 0, 0);
                return itemDate.getTime() === dataFiltro.getTime();
            case 'semana':
                const hojeSemana = new Date();
                hojeSemana.setHours(0, 0, 0, 0);
                const diaSemanaHoje = hojeSemana.getDay();
                const inicioSemanaHoje = new Date(hojeSemana.setDate(hojeSemana.getDate() - diaSemanaHoje));

                const fimSemanaHoje = new Date(inicioSemanaHoje);
                fimSemanaHoje.setDate(inicioSemanaHoje.getDate() + 6);
                fimSemanaHoje.setHours(23, 59, 59, 999);
                return itemDate >= inicioSemanaHoje && itemDate <= fimSemanaHoje;
            case 'mes':
                const hojeMes = new Date();
                return itemDate.getMonth() === hojeMes.getMonth() && itemDate.getFullYear() === hojeMes.getFullYear();
            case 'ano':
                const hojeAno = new Date();
                return itemDate.getFullYear() === hojeAno.getFullYear();
            default:
                return true;
        }
    }).sort((a, b) => new Date(b.DataHora) - new Date(a.DataHora)); // Ordena do mais recente ao mais antigo para exibição


    // ---- Geração de Relatórios Resumo e Detalhes ----
    let totalVendasValor = calcularTotalValor(vendasPeriodoAtual);
    let totalDespesasValor = calcularTotalValor(despesasPeriodoAtual);

    const listaVendasEl = document.getElementById("listaVendas");
    listaVendasEl.innerHTML = '';

    if (vendasPeriodoAtual.length === 0) {
        listaVendasEl.innerHTML = '<p>Nenhuma venda registrada neste período.</p>';
    } else {
        vendasPeriodoAtual.forEach(venda => {
            const valorTotalItem = venda.Unidade * venda.ValorUnitario;
            const vendaItemDiv = document.createElement('div');
            vendaItemDiv.classList.add('relatorio-item', 'card');

            vendaItemDiv.innerHTML = `
                <p><strong>Item:</strong> ${venda.Item}</p>
                <p><strong>Quantidade:</strong> ${venda.Unidade}</p>
                <p><strong>Valor Unitário:</strong> ${formatarMoeda(venda.ValorUnitario)}</p>
                <p><strong>Valor Total:</strong> ${formatarMoeda(valorTotalItem)}</p>
                <p><strong>Forma de Pagamento:</strong> ${venda.FormaPagamento || 'Não Informado'}</p>
                <p><strong>Data/Hora:</strong> ${formatarDataHora(venda.DataHora)}</p>
            `;
            listaVendasEl.appendChild(vendaItemDiv);
        });
    }

    const listaDespesasEl = document.getElementById("listaDespesas");
    listaDespesasEl.innerHTML = '';

    if (despesasPeriodoAtual.length === 0) {
        listaDespesasEl.innerHTML = '<p>Nenhuma despesa registrada neste período.</p>';
    } else {
        // CORRIGIDO: Nome da variável de 'despesasPeriodasAtual' para 'despesasPeriodoAtual'
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

    // ---- CHAMADA PARA A ANÁLISE DE TENDÊNCIAS ----
    // Agora, passe os dados já filtrados do período atual para 'analisarTendenciasEPrevisao'
    analisarTendenciasEPrevisao(vendasPeriodoAtual, despesasPeriodoAtual, todasVendasUsuario, todasDespesasUsuario, filtroPeriodo, dataRelatorio || new Date().toISOString().split('T')[0]);
}