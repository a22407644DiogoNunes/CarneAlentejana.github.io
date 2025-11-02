let todosOsProdutos = [];

document.addEventListener("DOMContentLoaded", function () {
  fetch("https://deisishop.pythonanywhere.com/products/")
    .then(response => {
      if (!response.ok) throw new Error("Erro ao carregar produtos");
      return response.json();
    })
    .then(produtos => {
      todosOsProdutos = produtos;
      carregarProdutos(produtos);
      carregarCarrinho();
      configurarFiltros();
      criarBotaoFinalizarCompra(); // cria o botão
    })
    .catch(error => console.error("Ocorreu um erro:", error));
});

// ----------------- Produtos -----------------

function carregarProdutos(listaDeProdutos) {
  const secaoProdutos = document.getElementById("produtos");
  secaoProdutos.innerHTML = ""; // limpa antes de carregar novos
  listaDeProdutos.forEach(produto => {
    const artigo = criarProduto(produto);
    secaoProdutos.appendChild(artigo);
  });
}

function criarProduto(produto) {
  const artigo = document.createElement("article");

  const titulo = document.createElement("h2");
  titulo.textContent = produto.title;

  const imagem = document.createElement("img");
  imagem.src = produto.image;
  imagem.alt = produto.title;

  const preco = document.createElement("p");
  preco.textContent = "Preço: " + produto.price + " €";

  const descricao = document.createElement("p");
  descricao.textContent = produto.description;

  const adicionar = document.createElement("button");
  adicionar.textContent = "+ Adicionar ao cesto";
  adicionar.addEventListener("click", function () {
    adicionarAoCarrinho(produto);
  });

  artigo.append(titulo, imagem, preco, descricao, adicionar);
  return artigo;
}

// ----------------- Carrinho -----------------

function adicionarAoCarrinho(produto) {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  carrinho.push(produto);
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  carregarCarrinho();
}

function carregarCarrinho() {
  const secaoCesto = document.getElementById("cesto");
  secaoCesto.innerHTML = "";

  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  let total = 0;

  carrinho.forEach((produto, index) => {
    const artigo = document.createElement("article");

    const titulo = document.createElement("h3");
    titulo.textContent = produto.title;

    const imagem = document.createElement("img");
    imagem.src = produto.image;
    imagem.alt = produto.title;

    const preco = document.createElement("p");
    preco.textContent = "Preço: " + produto.price + " €";

    const botao = document.createElement("button");
    botao.textContent = "Remover";
    botao.addEventListener("click", function () {
      removerDoCarrinho(index);
    });

    artigo.append(titulo, imagem, preco, botao);
    secaoCesto.appendChild(artigo);

    total += Number(produto.price);
  });

  const secaoComprar = document.getElementById("compra");

  // Atualiza o total
  let totalElemento = secaoComprar.querySelector("#total-valor");
  if (!totalElemento) {
    totalElemento = document.createElement("p");
    totalElemento.id = "total-valor";
    totalElemento.style.fontWeight = "bold";
    secaoComprar.prepend(totalElemento); // coloca antes do botão
  }
  totalElemento.textContent = "Total: " + total.toFixed(2) + " €";
}

function removerDoCarrinho(index) {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  carrinho.splice(index, 1);
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  carregarCarrinho();
}

// ----------------- Filtros -----------------

function configurarFiltros() {
  const seletorCategoria = document.getElementById("filtro-categoria");
  const seletorOrdenar = document.getElementById("filtro-ordenar");
  const campoPesquisa = document.getElementById("pesquisa");

  function aplicarFiltros() {
    let filtrados = [...todosOsProdutos];

    // Filtro de categoria
    const categoria = seletorCategoria.value;
    if (categoria !== "todas") {
      filtrados = filtrados.filter(p =>
        p.category.toLowerCase().includes(categoria.toLowerCase())
      );
    }

    // Pesquisa por nome
    const pesquisa = campoPesquisa.value.toLowerCase();
    if (pesquisa) {
      filtrados = filtrados.filter(p =>
        p.title.toLowerCase().includes(pesquisa)
      );
    }

    // Ordenação
    if (seletorOrdenar.value === "crescente") {
      filtrados.sort((a, b) => a.price - b.price);
    } else if (seletorOrdenar.value === "decrescente") {
      filtrados.sort((a, b) => b.price - a.price);
    }

    carregarProdutos(filtrados);
  }

  seletorCategoria.addEventListener("change", aplicarFiltros);
  seletorOrdenar.addEventListener("change", aplicarFiltros);
  campoPesquisa.addEventListener("input", aplicarFiltros);
}

// ----------------- Finalizar Compra -----------------

function criarBotaoFinalizarCompra() {
  const secaoCompra = document.getElementById("compra");
  const btn = document.createElement("button");
  btn.id = "finalizar-btn";
  btn.textContent = "Finalizar Compra";
  secaoCompra.appendChild(btn);
  btn.addEventListener("click", finalizarCompra);
}

async function finalizarCompra() {
  const btn = document.getElementById("finalizar-btn");
  btn.disabled = true;
  btn.textContent = "A processar...";

  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

  if (carrinho.length === 0) {
    alert('O carrinho está vazio!');
    btn.disabled = false;
    btn.textContent = "Finalizar Compra";
    return;
  }

  const produtosSelecionados = carrinho.map(item => item.id);
  const student = document.getElementById('student-checkbox')?.checked || false;
  const coupon = document.getElementById('coupon-input')?.value || "";

  const body = { products: produtosSelecionados, student, coupon, name: "Cliente" };

  try {
    const resposta = await fetch('https://deisishop.pythonanywhere.com/buy/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await resposta.json();

    if (resposta.ok) {
      alert(`Total: €${data.totalCost}\nReferência: ${data.reference}\n${data.example}`);
      localStorage.setItem("carrinho", JSON.stringify([]));
      carregarCarrinho();
    } else {
      alert(`Erro: ${data.error}`);
    }

  } catch (erro) {
    console.error('Erro ao finalizar compra:', erro);
    alert("Ocorreu um erro ao tentar finalizar a compra.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Finalizar Compra";
  }
}