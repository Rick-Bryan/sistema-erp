import pool from './connection.js';
import { checkPermissaoPorSlug } from './perms.js';
/**
 * Lista todos os clientes
 */
export async function listarClientes() {
  const [rows] = await pool.query('SELECT * FROM clientes ORDER BY id DESC');
  return rows;
}

/**
 * Cria um novo cliente
 */
export async function criarCliente({ nome, email, telefone, endereco }) {
  try {
    if (!global.usuarioLogado) {
      throw new Error("Sessão expirada");
    }

    const usuario = global.usuarioLogado.id;

    await checkPermissaoPorSlug({
      usuario_id: usuario,
      slug: "clientes",
      acao: "criar",
    });

    const [result] = await pool.query(
      "INSERT INTO clientes (nome, email, telefone, endereco) VALUES (?, ?, ?, ?)",
      [nome, email, telefone, endereco]
    );

    return { id: result.insertId };
  } catch (err) {
    console.error("Erro ao criar cliente:", err);
    throw err; // ✅ volta pro frontend
  }
}


/**
 * Atualiza um cliente existente
 */
export async function atualizarCliente({ id, nome, email, telefone, endereco }) {

  try {


    const usuario = global.usuarioLogado.id;

    await checkPermissaoPorSlug({
      usuario_id: usuario,
      slug: "clientes",
      acao: "editar",
    });

    await pool.query(
      'UPDATE clientes SET nome = ?, email = ?, telefone = ?, endereco = ? WHERE id = ?',
      [nome, email, telefone, endereco, id]
    );
 
  }
  catch (err) {
    throw err
  }

}

/**
 * Exclui um cliente
 */
export async function deletarCliente(id) {
  try {


    const usuario = global.usuarioLogado.id;

    await checkPermissaoPorSlug({
      usuario_id: usuario,
      slug: "clientes",
      acao: "excluir",
    });

    await pool.query('DELETE FROM clientes WHERE id = ?', [id]);

  }
  catch(err){
    throw err
  }
}
