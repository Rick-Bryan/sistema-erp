import pool from './connection';
export interface Produto {
  CodigoProduto: number;
  CodigoBarra: string;
  NomeProduto: string;
  CodigoGrupo?: number;
  CodigoSubGrupo: number;
  CodigoFabricante?: number;
  DataCadastro: Date;
  UnidadeEmbalagem?: string;
  FracaoVenda: number;
  NCM: string;
  Eliminado: number;
  IPI: number;
  ReducaoIPI: number;
  PisCofinsCST?: string;
  PisCofinsNatureza?: string;
  PisCofinsCSTEntrada?: string;
  CEST?: string;
  CodigoBeneficio?: string;
  EstoqueAtual?: number,

}
export async function listarProdutos(): Promise<Produto[]> {
  const [rows] = await pool.query<Produto[]>('SELECT * FROM produto');
  return rows;
}
export async function criarProduto(produto: Produto) {
  const sql = `INSERT INTO produto 
  (CodigoBarra, NomeProduto, CodigoGrupo, CodigoSubGrupo, CodigoFabricante, DataCadastro,
   UnidadeEmbalagem, FracaoVenda, NCM, Eliminado, IPI, ReducaoIPI, PisCofinsCST, PisCofinsNatureza, 
   PisCofinsCSTEntrada, CEST, CodigoBeneficio, EstoqueAtual)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  await pool.execute(sql, [
    produto.CodigoBarra ?? null,
    produto.NomeProduto ?? null,
    produto.CodigoGrupo ?? null,
    produto.CodigoSubGrupo ?? null,
    produto.CodigoFabricante ?? null,
    produto.DataCadastro ?? null,
    produto.UnidadeEmbalagem ?? null,
    produto.FracaoVenda ?? null,
    produto.NCM ?? null,
    produto.Eliminado ?? null,
    produto.IPI ?? null,
    produto.ReducaoIPI ?? null,
    produto.PisCofinsCST ?? null,
    produto.PisCofinsNatureza ?? null,
    produto.PisCofinsCSTEntrada ?? null,
    produto.CEST ?? null,
    produto.CodigoBeneficio ?? null,
    produto.EstoqueAtual ?? 0,
  ]);

}

