document.addEventListener("DOMContentLoaded", function () {
  carregarProdutos(produtos);
  carregarCarrinho();
});

function carregarProdutos(listaDeProdutos) {
  const secaoProdutos = document.getElementById("produtos");
  listaDeProdutos.forEach(function (produto) {
    const artigo = criarProduto(produto);
    secaoProdutos.append(artigo);
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
  preco.textContent = "Custo total: " + produto.price + " €";

  const descricao = document.createElement("p");
  descricao.textContent = produto.description;

  const adicionarArtigo = document.createElement("button")
  adicionarArtigo.textContent = "+ Adicionar ao cesto"

  // ✅ Aqui é onde estava a faltar — associar o evento com o produto
  adicionarArtigo.addEventListener("click", function () {
    adicionarAoCarrinho(produto);
  });

  artigo.append(titulo, imagem, preco, descricao, adicionarArtigo);
  return artigo;
}

// ✅ Função para adicionar produto ao carrinho no localStorage
function adicionarAoCarrinho(produto) {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  carrinho.push(produto);
  localStorage.setItem("carrinho", JSON.stringify(carrinho));

  carregarCarrinho(); // ✅ Atualiza o carrinho na página
}

function carregarCarrinho() {
  const secaoCesto = document.getElementById("cesto");
  secaoCesto.innerHTML = ""; // Limpa antes de carregar

  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  let total = 0;

  carrinho.forEach(function (produto, index) {
    const artigo = criarItemCarrinho(produto, index);
    secaoCesto.append(artigo);

    total += Number(produto.price); // soma o preço
  });

  // Mostrar valor total
  const totalElemento = document.createElement("p");
  totalElemento.textContent = "Custo total: " + total.toFixed(2) + " €";
  totalElemento.style.fontWeight = "bold";
  totalElemento.style.marginTop = "1em";

  secaoCesto.appendChild(totalElemento);
}

function criarItemCarrinho(produto) {
  const artigo = document.createElement("article");

  const titulo = document.createElement("h3");
  titulo.textContent = produto.title;

  const imagem = document.createElement("img");
  imagem.src = produto.image;
  imagem.alt = produto.title;

  const preco = document.createElement("p");
  preco.textContent = "Preço: " + produto.price + " €";

  const butao = document.createElement("button");
  butao.textContent = "Remover cesto"

  butao.addEventListener("click", function () {
    removerDoCarrinho(produto);
  });

  artigo.append(titulo, imagem, preco, butao);
  return artigo;
}

function removerDoCarrinho(index) {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  carrinho.splice(index, 1); // remove só o produto do índice
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  carregarCarrinho(); // atualiza visualmente
}