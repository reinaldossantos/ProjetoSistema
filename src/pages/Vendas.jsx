import { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";

export default function Vendas() {
  const [vendas, setVendas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);

  const [clienteId, setClienteId] = useState("");
  const [produtoId, setProdutoId] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [desconto, setDesconto] = useState(0);
  const [total, setTotal] = useState(0);
  const [estoqueDisponivel, setEstoqueDisponivel] = useState(0);
  const [loading, setLoading] = useState(true);

  // 1. Carregar dados (usando useCallback para evitar sublinhados de erro)
  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {
      const [resVendas, resClientes, resProdutos] = await Promise.all([
        supabase
          .from("vendas")
          .select("*, clientes(nome), produtos(nome)")
          .order("id", { ascending: false }),
        supabase.from("clientes").select("id, nome").order("nome"),
        supabase
          .from("produtos")
          .select("id, nome, preco, estoque")
          .order("nome"),
      ]);
      setVendas(resVendas.data || []);
      setClientes(resClientes.data || []);
      setProdutos(resProdutos.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // 2. Lógica de Cálculo e Validação (Só valida se produtoId existir)
  useEffect(() => {
    const produto = produtos.find((p) => p.id === parseInt(produtoId));
    if (produto) {
      setEstoqueDisponivel(produto.estoque);
      const valorBruto = produto.preco * (parseInt(quantidade) || 0);
      const valorFinal = valorBruto - parseFloat(desconto || 0);
      setTotal(valorFinal > 0 ? valorFinal : 0);
    } else {
      setEstoqueDisponivel(0);
      setTotal(0);
    }
  }, [produtoId, quantidade, desconto, produtos]);

  async function registrarVenda(e) {
    e.preventDefault();

    if (parseInt(quantidade) > estoqueDisponivel) {
      alert(
        `Estoque insuficiente! Temos apenas ${estoqueDisponivel} unidades.`,
      );
      return;
    }

    const { error } = await supabase.from("vendas").insert([
      {
        cliente_id: clienteId,
        produto_id: parseInt(produtoId),
        quantidade: parseInt(quantidade),
        desconto: parseFloat(desconto || 0),
        total: total,
      },
    ]);

    if (!error) {
      setClienteId("");
      setProdutoId("");
      setDesconto(0);
      setQuantidade(1);
      carregarDados();
      alert("Venda registrada com sucesso!");
    } else {
      alert("Erro ao registrar: " + error.message);
    }
  }

  // Define se o campo deve mostrar erro visual
  const temErroEstoque = produtoId && quantidade > estoqueDisponivel;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-widest">
          Painel de Vendas
        </h3>
        <form
          onSubmit={registrarVenda}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          <select
            className="p-3 border rounded-lg bg-gray-50"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
          >
            <option value="">Cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>

          <select
            className="p-3 border rounded-lg bg-gray-50"
            value={produtoId}
            onChange={(e) => setProdutoId(e.target.value)}
          >
            <option value="">Selecionar Produto</option>
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>

          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
              Qtd {produtoId ? `(Estoque: ${estoqueDisponivel})` : ""}
            </label>
            <input
              type="number"
              className={`p-3 border rounded-lg outline-none transition-colors ${temErroEstoque ? "bg-red-50 border-red-500 text-red-700" : "bg-gray-50"}`}
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
              Desconto R$
            </label>
            <input
              type="number"
              className="p-3 border rounded-lg bg-gray-50"
              value={desconto}
              onChange={(e) => setDesconto(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
              Total
            </label>
            <div className="p-3 border rounded-lg bg-blue-600 text-white font-bold text-center">
              R$ {total.toFixed(2)}
            </div>
          </div>

          <button
            type="submit"
            disabled={!produtoId || temErroEstoque || total <= 0}
            className={`font-bold rounded-lg h-[50px] mt-auto transition-all ${
              !produtoId || temErroEstoque || total <= 0
                ? "bg-gray-300 cursor-not-allowed text-gray-400"
                : "bg-green-600 hover:bg-green-700 text-white shadow-lg"
            }`}
          >
            CONFIRMAR
          </button>
        </form>

        {temErroEstoque && (
          <p className="text-red-500 text-xs mt-2 font-bold animate-pulse">
            ⚠️ Atenção: Quantidade acima do estoque disponível!
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b text-slate-500 text-xs font-bold uppercase">
            <tr>
              <th className="p-4">Cliente</th>
              <th className="p-4">Produto</th>
              <th className="p-4 text-center">Qtd</th>
              <th className="p-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="p-10 text-center text-gray-400">
                  Carregando...
                </td>
              </tr>
            ) : (
              vendas.map((v) => (
                <tr key={v.id} className="border-b hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-700 uppercase">
                    {v.clientes?.nome}
                  </td>
                  <td className="p-4 text-slate-600 text-sm uppercase">
                    {v.produtos?.nome}
                  </td>
                  <td className="p-4 text-center text-slate-600">
                    {v.quantidade} un
                  </td>
                  <td className="p-4 text-right font-extrabold text-green-600">
                    R${" "}
                    {v.total?.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
