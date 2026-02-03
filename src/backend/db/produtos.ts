import pool from './connection';
import { entradaEstoque, saidaEstoque } from "./estoque_movimento";
import { checkPermissaoPorSlug } from './perms';

export interface Produto {
  CodigoProduto?: number;
  CodigoBarra?: string;
  NomeProduto: string;
  CodigoGrupo?: number | null;
  CodigoSubGrupo?: number | null;
  CodigoFabricante?: number | null;
  DataCadastro?: Date;
  UnidadeEmbalagem?: string;
  FracaoVenda?: number;
  NCM?: string;
  Eliminado?: number;
  IPI?: number;
  ReducaoIPI?: number;
  PisCofinsCST?: string;
  PisCofinsNatureza?: string;
  PisCofinsCSTEntrada?: string;
  CEST?: string;
  CodigoBeneficio?: string;
  EstoqueAtual?: number;
  PrecoVenda?: number;
}

/** 🔍 Verifica se o grupo existe */
async function grupoExiste(codigoGrupo?: number | null): Promise<boolean> {
  if (!codigoGrupo) return false;
  const [rows] = await pool.query('SELECT CodigoGrupo FROM produto_grupo WHERE CodigoGrupo = ?', [codigoGrupo]);
  return Array.isArray(rows) && rows.length > 0;
}

/** 🔍 Verifica se o subgrupo existe */
async function subgrupoExiste(codigoSubGrupo?: number | null): Promise<boolean> {
  if (!codigoSubGrupo) return false;
  const [rows] = await pool.query('SELECT CodigoSubGrupo FROM produto_sub_grupo WHERE CodigoSubGrupo = ?', [codigoSubGrupo]);
  return Array.isArray(rows) && rows.length > 0;
}

/** 🔍 Verifica se o fabricante existe */
async function fabricanteExiste(codigoFabricante?: number | null): Promise<boolean> {
  if (!codigoFabricante) return false;
  const [rows] = await pool.query('SELECT CodigoFabricante FROM produto_fabricante WHERE CodigoFabricante = ?', [codigoFabricante]);
  return Array.isArray(rows) && rows.length > 0;
}

/** 📦 Lista todos os produtos */
export async function listarProdutos(): Promise<Produto[]> {
  const [rows] = await pool.query<Produto[]>('SELECT * FROM produto');
  return rows;
}

/** 🧾 Cria novo produto (com validação de FK) */

export async function criarProduto(produto: Produto) {
  try {
    let codigoGrupoValido = await grupoExiste(produto.CodigoGrupo) ? produto.CodigoGrupo : null;
    let codigoSubGrupoValido = await subgrupoExiste(produto.CodigoSubGrupo) ? produto.CodigoSubGrupo : null;
    let codigoFabricanteValido = await fabricanteExiste(produto.CodigoFabricante) ? produto.CodigoFabricante : null;

    const usuario = global.usuarioLogado.id;

    await checkPermissaoPorSlug({
      usuario_id: usuario,
      slug: "produtos",
      acao: "usar",
    });



    const sql = `
      INSERT INTO produto (
        CodigoBarra, NomeProduto, CodigoGrupo, CodigoSubGrupo, CodigoFabricante,
        DataCadastro, UnidadeEmbalagem, FracaoVenda, NCM, Eliminado, IPI,
        ReducaoIPI, PisCofinsCST, PisCofinsNatureza, PisCofinsCSTEntrada,
        CEST, CodigoBeneficio, PrecoVenda
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result]: any = await pool.execute(sql, [
      produto.CodigoBarra ?? null,
      produto.NomeProduto ?? null,
      codigoGrupoValido,
      codigoSubGrupoValido,
      codigoFabricanteValido,
      new Date(),
      produto.UnidadeEmbalagem ?? null,
      produto.FracaoVenda ?? 1,
      produto.NCM ?? null,
      produto.Eliminado ?? 0,
      produto.IPI ?? 0,
      produto.ReducaoIPI ?? 0,
      produto.PisCofinsCST ?? null,
      produto.PisCofinsNatureza ?? null,
      produto.PisCofinsCSTEntrada ?? null,
      produto.CEST ?? null,
      produto.CodigoBeneficio ?? null,
      produto.PrecoVenda ?? 0
    ]);

    const novoId = result.insertId;
    console.log("📌 Produto criado ID:", novoId);

    // 📦 Se veio estoque inicial, registra movimentação
    if (produto.EstoqueAtual && produto.EstoqueAtual > 0) {
      await entradaEstoque({
        produto_id: novoId,
        origem: "compra",
        quantidade: produto.EstoqueAtual,
        custo_unitario: produto.PrecoVenda ?? 1
      });
    }

    console.log("✅ Produto cadastrado com movimentação correta!");
  } catch (error: any) {
    console.error("❌ Erro ao criar produto:", error);
    throw error
  }
}

export async function salvarProduto(produto: Produto) {
  try {
    if (!produto.CodigoProduto) return criarProduto(produto);

    const usuario = global.usuarioLogado.id;

    await checkPermissaoPorSlug({
      usuario_id: usuario,
      slug: "produtos",
      acao: "usar",
    });
    // 🔎 Buscar estoque atual no BD
    const [[antes]]: any = await pool.query(
      "SELECT EstoqueAtual, PrecoVenda FROM produto WHERE CodigoProduto = ?",
      [produto.CodigoProduto]
    );

    // 🧾 UPDATE sem alterar estoque
    const sql = `
      UPDATE produto SET
        CodigoBarra=?, NomeProduto=?, CodigoGrupo=?, CodigoSubGrupo=?, CodigoFabricante=?,
        UnidadeEmbalagem=?, FracaoVenda=?, NCM=?, Eliminado=?, IPI=?, ReducaoIPI=?, 
        PisCofinsCST=?, PisCofinsNatureza=?, PisCofinsCSTEntrada=?, CEST=?, CodigoBeneficio=?,
        PrecoVenda=?
      WHERE CodigoProduto=?
    `;
    await pool.execute(sql, [
      produto.CodigoBarra ?? null,
      produto.NomeProduto ?? null,
      produto.CodigoGrupo ?? null,
      produto.CodigoSubGrupo ?? null,
      produto.CodigoFabricante ?? null,
      produto.UnidadeEmbalagem ?? null,
      produto.FracaoVenda ?? 1,
      produto.NCM ?? null,
      produto.Eliminado ?? 0,
      produto.IPI ?? 0,
      produto.ReducaoIPI ?? 0,
      produto.PisCofinsCST ?? null,
      produto.PisCofinsNatureza ?? null,
      produto.PisCofinsCSTEntrada ?? null,
      produto.CEST ?? null,
      produto.CodigoBeneficio ?? null,
      produto.PrecoVenda ?? 0,
      produto.CodigoProduto
    ]);

    console.log("📝 Produto atualizado. Verificando estoque...");

    if (produto.EstoqueAtual != null && antes) {
      const delta = produto.EstoqueAtual - antes.EstoqueAtual;

      if (delta > 0) {
        await entradaEstoque({
          produto_id: produto.CodigoProduto,
          origem: "ajuste",
          quantidade: delta,
          custo_unitario: antes.PrecoVenda ?? 1,
          observacao: "Ajuste positivo via edição de produto"
        });
      } else if (delta < 0) {
        await saidaEstoque({
          produto_id: produto.CodigoProduto,
          origem: "ajuste",
          quantidade: Math.abs(delta),
          observacao: "Ajuste negativo via edição de produto"
        });
      }
    }

    console.log("✨ Estoque ajustado automaticamente!");
  } catch (error: any) {
    console.error("❌ Erro ao salvar produto:", error);
    throw error
  }
}

export async function atualizarGrupo({ id, nome, comissao, ativo }) {
  try {
    const usuario = global.usuarioLogado.id;

    await checkPermissaoPorSlug({
      usuario_id: usuario,
      slug: "produtos",
      acao: "usar",
    });

    const sql = `
    UPDATE produto_grupo SET
      NomeGrupo = ?,
      Comissao = ?,
      Ativo = ?
    WHERE CodigoGrupo = ?
  `;

    await pool.execute(sql, [
      nome ?? null,
      comissao ?? null,
      ativo ?? 1,
      id
    ]);
  } catch (error) {
    throw error
  }

}
export async function excluirGrupo(id) {
  try {

    const usuario = global.usuarioLogado.id;

    await checkPermissaoPorSlug({
      usuario_id: usuario,
      slug: "produtos",
      acao: "usar",
    });

    const sql = `DELETE FROM produto_grupo WHERE CodigoGrupo = ?`;
    await pool.execute(sql, [id]);
  } catch (error) {
    throw error

  }

}
export async function atualizarSubGrupo({ id, nome, CodigoGrupo }) {

  try {
    const usuario = global.usuarioLogado.id;

    await checkPermissaoPorSlug({
      usuario_id: usuario,
      slug: "produtos",
      acao: "usar",
    });
    const sql = `
    UPDATE produto_sub_grupo SET
      NomeSubGrupo = ?,
      CodigoGrupo = ?
    WHERE CodigoSubGrupo = ?
  `;

    await pool.execute(sql, [
      nome ?? null,
      CodigoGrupo ?? null,
      id
    ]);
  } catch (error) {
    throw error
  }

}

export async function excluirSubGrupo(id) {

  try {
    const usuario = global.usuarioLogado.id;

    await checkPermissaoPorSlug({
      usuario_id: usuario,
      slug: "produtos",
      acao: "usar",
    });
    const sql = `DELETE FROM produto_sub_grupo WHERE CodigoSubGrupo = ?`;
    await pool.execute(sql, [id]);

  } catch (error) {
    throw error
  }

}
