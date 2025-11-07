import pool from './connection.js';

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
  const [result] = await pool.query(
    'INSERT INTO clientes (nome, email, telefone, endereco) VALUES (?, ?, ?, ?)',
    [nome, email, telefone, endereco]
  );

  return { id: result.insertId };
}

/**
 * Atualiza um cliente existente
 */
export async function atualizarCliente({ id, nome, email, telefone, endereco }) {
  await pool.query(
    'UPDATE clientes SET nome = ?, email = ?, telefone = ?, endereco = ? WHERE id = ?',
    [nome, email, telefone, endereco, id]
  );
  return true;
}

/**
 * Exclui um cliente
 */
export async function deletarCliente(id) {
  await pool.query('DELETE FROM clientes WHERE id = ?', [id]);
  return true;
}
