import pool from './connection.js';

/**
 * Lista todos os fornecedores
 */
export async function listarFornecedores() {
  const [rows] = await pool.query('SELECT * FROM fornecedores ORDER BY CodigoFornecedor DESC');
  return rows;
}

/**
 * Cria um novo fornecedor
 */
export async function criarFornecedor(fornecedor) {
  try {


    const usuario = global.usuarioLogado.id;

    await checkPermissaoPorSlug({
      usuario_id: usuario,
      slug: "fornecedor",
      acao: "usar",
    });


    const data = {
      nome: fornecedor.Nome || fornecedor.nome,
      nomefantasia: fornecedor.NomeFantasia || fornecedor.nomefantasia,
      cnpj: fornecedor.CNPJ || fornecedor.cnpj,
      endereco: fornecedor.ENDERECO || fornecedor.endereco,
      cidade: fornecedor.CIDADE || fornecedor.cidade,
      bairro: fornecedor.BAIRRO || fornecedor.bairro,
      ativo: fornecedor.ATIVO ? 1 : 0,
      pessoa: fornecedor.PESSOA || fornecedor.pessoa,
    };

    const [result] = await pool.query(
      `INSERT INTO fornecedores 
     (Nome, NomeFantasia, CNPJ, Endereco, Cidade, Bairro, Ativo, Pessoa)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.nome,
        data.nomefantasia,
        data.cnpj,
        data.endereco,
        data.cidade,
        data.bairro,
        data.ativo,
        data.pessoa,
      ]
    );

    return { codigoFornecedor: result.insertId };
  }
  catch (error) {
    throw error
  }
  // converte nomes de campos em letras minúsculas

}


/**
 * Atualiza um fornecedor existente
 */
export async function atualizarFornecedor({ CodigoFornecedor, Nome, NomeFantasia, CNPJ, Endereco, Cidade, Bairro, Ativo, Pessoa }) {
  const ativoValue = Ativo ? 1 : 0;

  await pool.query(
    `UPDATE fornecedores 
     SET Nome = ?, NomeFantasia = ?, CNPJ = ?, Endereco = ?, Cidade = ?, Bairro = ?, Ativo = ?, Pessoa = ?
     WHERE CodigoFornecedor = ?`,
    [Nome, NomeFantasia, CNPJ, Endereco, Cidade, Bairro, ativoValue, Pessoa, CodigoFornecedor]
  );

  return true;
}

/**
 * Exclui um fornecedor
 */
export async function deletarFornecedor(CodigoFornecedor) {
  await pool.query('DELETE FROM fornecedores WHERE CodigoFornecedor = ?', [CodigoFornecedor]);
  return true;
}
