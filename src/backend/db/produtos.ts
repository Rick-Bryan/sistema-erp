import pool from './connection';

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
    console.log("🧾 Dados recebidos:", produto);

    // ✅ Verifica se as FKs são válidas
    let codigoGrupoValido: number | null = null;
    let codigoSubGrupoValido: number | null = null;
    let codigoFabricanteValido: number | null = null;

    if (await grupoExiste(produto.CodigoGrupo)) {
      codigoGrupoValido = produto.CodigoGrupo!;
    }

    if (await subgrupoExiste(produto.CodigoSubGrupo)) {
      codigoSubGrupoValido = produto.CodigoSubGrupo!;
    }

    if (await fabricanteExiste(produto.CodigoFabricante)) {
      codigoFabricanteValido = produto.CodigoFabricante!;
    }

    console.log("✅ Grupo:", codigoGrupoValido, "| ✅ SubGrupo:", codigoSubGrupoValido, "| ✅ Fabricante:", codigoFabricanteValido);

    // 🧩 Query de inserção
    const sql = `
      INSERT INTO produto (
        CodigoBarra, NomeProduto, CodigoGrupo, CodigoSubGrupo, CodigoFabricante, DataCadastro,
        UnidadeEmbalagem, FracaoVenda, NCM, Eliminado, IPI, ReducaoIPI,
        PisCofinsCST, PisCofinsNatureza, PisCofinsCSTEntrada, CEST, CodigoBeneficio, EstoqueAtual,PrecoVenda
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
    `;

    await pool.execute(sql, [
      produto.CodigoBarra ?? null,
      produto.NomeProduto ?? null,
      codigoGrupoValido,
      codigoSubGrupoValido,
      codigoFabricanteValido,
      produto.DataCadastro ?? new Date(),
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
      produto.EstoqueAtual ?? 0,
      produto.PrecoVenda ?? 0,
    ]);

    console.log("✅ Produto cadastrado com sucesso!");
  } catch (error: any) {
    console.error("❌ Erro ao criar produto:", error);
    throw new Error(error.sqlMessage || "Erro ao cadastrar produto");
  }
}
export async function salvarProduto(produto: Produto) {
  try {
    if (produto.CodigoProduto) {
      // 🧾 UPDATE - Produto já existe
      const sql = `
        UPDATE produto SET
          CodigoBarra = ?,
          NomeProduto = ?,
          CodigoGrupo = ?,
          CodigoSubGrupo = ?,
          CodigoFabricante = ?,
          UnidadeEmbalagem = ?,
          FracaoVenda = ?,
          NCM = ?,
          Eliminado = ?,
          IPI = ?,
          ReducaoIPI = ?,
          PisCofinsCST = ?,
          PisCofinsNatureza = ?,
          PisCofinsCSTEntrada = ?,
          CEST = ?,
          CodigoBeneficio = ?,
          EstoqueAtual = ?,
          PrecoVenda = ?
        WHERE CodigoProduto = ?
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
        produto.EstoqueAtual ?? 0,
        produto.PrecoVenda ??0,
        produto.CodigoProduto
      ]);

      console.log("✅ Produto atualizado com sucesso!");
    } else {
      // 🧩 INSERT - Novo produto
      const sql = `
        INSERT INTO produto (
          CodigoBarra, NomeProduto, CodigoGrupo, CodigoSubGrupo, CodigoFabricante,
          DataCadastro, UnidadeEmbalagem, FracaoVenda, NCM, Eliminado, IPI,
          ReducaoIPI, PisCofinsCST, PisCofinsNatureza, PisCofinsCSTEntrada,
          CEST, CodigoBeneficio, EstoqueAtual,PrecoVenda
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await pool.execute(sql, [
        produto.CodigoBarra ?? null,
        produto.NomeProduto ?? null,
        produto.CodigoGrupo ?? null,
        produto.CodigoSubGrupo ?? null,
        produto.CodigoFabricante ?? null,
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
        produto.EstoqueAtual ?? 0,
        produto.PrecoVenda ?? 0
      ]);

      console.log("✅ Produto criado com sucesso!");
    }
  } catch (error: any) {
    console.error("❌ Erro ao salvar produto:", error);
    throw new Error(error.sqlMessage || "Erro ao salvar produto");
  }
}